
# Plan: Enable Multiple Incoming Connections (Node Reuse)

## Overview
The current data model already supports multiple response options pointing to the same target message. However, the **delete logic** incorrectly removes messages that still have other incoming connections. This plan fixes the deletion behavior to properly support reusable message nodes.

## Problem Analysis

Currently, when you delete a message or response option, the system recursively deletes all connected "child" messages. This assumption breaks when a message has multiple incoming connections:

```text
Current (broken) behavior:

  Message A ─────┐
       │        │
       ▼        ▼
  Option 1 ──► Message C  ◄── Option 2
                                │
                                │
                          Message B

If you delete Option 1 from Message A:
→ Message C gets deleted (WRONG - B still points to it!)
```

## Solution

Before recursively deleting a child message, check if it has **other incoming connections** from messages that aren't being deleted. Only delete a message if it becomes "orphaned."

---

## Technical Changes

### File: `src/context/ScenarioContext.tsx`

**Change 1: Create helper function to count incoming connections**

Add a utility function at the top of the reducer or before it:

```typescript
function countIncomingConnections(
  messages: Record<string, ChatMessage>,
  targetId: string,
  excludeMessageIds: Set<string> = new Set()
): number {
  let count = 0;
  Object.entries(messages).forEach(([msgId, msg]) => {
    if (excludeMessageIds.has(msgId)) return;
    msg.responseOptions.forEach((opt) => {
      if (opt.nextMessageId === targetId) count++;
    });
  });
  return count;
}
```

**Change 2: Update DELETE_MESSAGE reducer (lines 165-197)**

Replace the recursive deletion logic to only delete messages that have no other incoming connections:

```typescript
case "DELETE_MESSAGE": {
  const messageId = action.payload;
  const newMessages = { ...state.messages };
  const deletedIds = new Set<string>();
  
  // Recursively delete messages that have no other incoming connections
  const deleteIfOrphaned = (id: string) => {
    const message = newMessages[id];
    if (!message || deletedIds.has(id)) return;
    
    // Mark this message as "being deleted" for reference counting
    deletedIds.add(id);
    delete newMessages[id];
    
    // Check each child - only delete if it has no other incoming connections
    message.responseOptions.forEach((opt) => {
      if (opt.nextMessageId && newMessages[opt.nextMessageId]) {
        const otherConnections = countIncomingConnections(
          newMessages, 
          opt.nextMessageId,
          deletedIds
        );
        if (otherConnections === 0) {
          deleteIfOrphaned(opt.nextMessageId);
        }
      }
    });
  };
  
  deleteIfOrphaned(messageId);
  
  // Update any remaining parent references to deleted messages
  Object.values(newMessages).forEach((msg) => {
    msg.responseOptions = msg.responseOptions.map((opt) =>
      deletedIds.has(opt.nextMessageId || '') 
        ? { ...opt, nextMessageId: null } 
        : opt
    );
  });
  
  return {
    ...state,
    messages: newMessages,
    rootMessageId: deletedIds.has(state.rootMessageId || '') ? null : state.rootMessageId,
    updatedAt: now,
  };
}
```

**Change 3: Update DELETE_RESPONSE_OPTION reducer (lines 247-279)**

Similar fix - only delete the connected message if it has no other incoming connections:

```typescript
case "DELETE_RESPONSE_OPTION": {
  const { messageId, optionId } = action.payload;
  if (!state.messages[messageId]) return state;
  
  const option = state.messages[messageId].responseOptions.find((o) => o.id === optionId);
  const newMessages = { ...state.messages };
  
  // Remove the option first
  newMessages[messageId] = {
    ...newMessages[messageId],
    responseOptions: newMessages[messageId].responseOptions.filter((o) => o.id !== optionId),
  };
  
  // Only delete the follow-up chain if the target has no other incoming connections
  if (option?.nextMessageId && newMessages[option.nextMessageId]) {
    const deletedIds = new Set<string>();
    
    const deleteIfOrphaned = (id: string) => {
      const message = newMessages[id];
      if (!message || deletedIds.has(id)) return;
      
      const otherConnections = countIncomingConnections(newMessages, id, deletedIds);
      if (otherConnections > 0) return; // Has other parents, don't delete
      
      deletedIds.add(id);
      delete newMessages[id];
      
      message.responseOptions.forEach((opt) => {
        if (opt.nextMessageId && newMessages[opt.nextMessageId]) {
          deleteIfOrphaned(opt.nextMessageId);
        }
      });
    };
    
    deleteIfOrphaned(option.nextMessageId);
  }
  
  return {
    ...state,
    messages: newMessages,
    updatedAt: now,
  };
}
```

**Change 4: Update DISCONNECT_OPTION to NOT delete (optional enhancement)**

Currently disconnecting just sets `nextMessageId` to null - this is correct and doesn't need changes.

---

## Visual Behavior After Fix

```text
After fix:

  Message A ─────┐
       │        │
       ▼        ▼
  Option 1 ──► Message C  ◄── Option 2
                                │
                                │
                          Message B

If you delete Option 1 from Message A:
→ Connection removed, but Message C remains (B still points to it) ✓

If you then delete Option 2 from Message B:
→ Message C is now orphaned, so it gets deleted ✓
```

---

## Summary

| File | Change |
|------|--------|
| `ScenarioContext.tsx` | Add `countIncomingConnections` helper function |
| `ScenarioContext.tsx` | Update `DELETE_MESSAGE` to check for other incoming connections |
| `ScenarioContext.tsx` | Update `DELETE_RESPONSE_OPTION` to check for other incoming connections |

**Total: 1 file, ~60 lines changed**

---

## Result
- Messages with multiple incoming connections will not be incorrectly deleted
- Users can create converging paths where multiple responses lead to the same message
- The visual flow canvas will correctly show multiple edges pointing to reused nodes
