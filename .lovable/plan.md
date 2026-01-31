# Workflow Builder: Conditional Variables & Click-to-Connect

## Overview

This plan adds two major features to the workflow builder:
1. **Conditional Variables** - Boolean flags that responses can set and that responses/messages can require
2. **Click-to-Connect** - An alternative to drag-and-drop for connecting responses to messages

---

## Feature 1: Conditional Variables

### Data Model Changes

**File: `src/types/scenario.ts`**

Add new types:
```typescript
export interface ScenarioVariable {
  id: string;
  name: string;
  defaultValue: boolean;
}

export interface VariableCondition {
  variableId: string;
  requiredValue: boolean;
}

export interface VariableAssignment {
  variableId: string;
  value: boolean;
}
```

Update `ResponseOption`:
```typescript
export interface ResponseOption {
  id: string;
  text: string;
  nextMessageId: string | null;
  setsVariable?: VariableAssignment;  // NEW: When chosen, set this variable
  condition?: VariableCondition;       // NEW: Only show if condition is met
}
```

Update `ChatMessage`:
```typescript
export interface ChatMessage {
  id: string;
  content: string;
  isEndpoint: boolean;
  responseOptions: ResponseOption[];
  position: NodePosition;
  condition?: VariableCondition;  // NEW: Message only shown if condition is met
}
```

Update `ScenarioData`:
```typescript
export interface ScenarioData {
  // ... existing fields
  variables: Record<string, ScenarioVariable>;  // NEW
}
```

### Context Changes

**File: `src/context/ScenarioContext.tsx`**

Add new actions:
- `ADD_VARIABLE` - Create a new boolean variable
- `UPDATE_VARIABLE` - Rename a variable
- `DELETE_VARIABLE` - Remove a variable (and clear references)
- `SET_RESPONSE_VARIABLE_ASSIGNMENT` - Set what variable a response sets when chosen
- `CLEAR_RESPONSE_VARIABLE_ASSIGNMENT` - Remove variable assignment from response
- `SET_RESPONSE_CONDITION` - Set condition on a response
- `CLEAR_RESPONSE_CONDITION` - Remove condition from response
- `SET_MESSAGE_CONDITION` - Set condition on a message
- `CLEAR_MESSAGE_CONDITION` - Remove condition from message

### UI Components

**New File: `src/components/builder/VariablesPanel.tsx`**

A panel in the Canvas toolbar to manage variables:
- List all scenario variables
- Add new variable with name input
- Delete variables
- Shows where each variable is used

**Update: `src/components/builder/MessageFlowNode.tsx`**

For each response option, add:
- Dropdown to set "When chosen, set [variable] to [true/false]"
- Dropdown to set "Show only if [variable] is [true/false]"

For the message itself, add:
- Optional condition badge in header
- Dropdown to set message condition

### Visual Indicators

- Response with condition: Show a small filter/condition icon
- Response that sets variable: Show a small toggle/variable icon
- Message with condition: Show condition badge in header
- Conditional elements use a subtle accent color to distinguish them

---

## Feature 2: Click-to-Connect

### State Management

**File: `src/context/ScenarioContext.tsx`**

Add connection mode state:
```typescript
interface PendingConnection {
  sourceMessageId: string;
  optionId: string;
}

// Add to context:
pendingConnection: PendingConnection | null;
startConnection: (sourceMessageId: string, optionId: string) => void;
cancelConnection: () => void;
completeConnection: (targetMessageId: string) => void;
```

### UI Flow

1. **Start Connection**: User clicks a "link" button on a response option
2. **Visual Feedback**: 
   - The source response highlights with a pulsing border
   - A toast/banner appears: "Click a message to connect, or press Escape to cancel"
   - All message nodes show a clickable target indicator
3. **Complete Connection**: User clicks on any message node header
4. **Cancel**: User presses Escape or clicks the cancel button

### Component Changes

**Update: `src/components/builder/MessageFlowNode.tsx`**

- Add "Link" button next to each response option (appears alongside existing Unlink button)
- When `pendingConnection` is set and matches this option, show highlighted state
- When `pendingConnection` is set and this is a different message, show "click to connect" target indicator in header
- Handle click on header to complete connection

**Update: `src/components/builder/FlowCanvas.tsx`**

- Pass `pendingConnection` state down to nodes
- Handle Escape key to cancel connection
- Show connection mode indicator/toast

---

## Files to Create/Modify

| File | Action | Changes |
|------|--------|---------|
| `src/types/scenario.ts` | Modify | Add Variable types, update ResponseOption, ChatMessage, ScenarioData |
| `src/context/ScenarioContext.tsx` | Modify | Add variable actions, connection mode state |
| `src/components/builder/VariablesPanel.tsx` | Create | Variable management UI |
| `src/components/builder/MessageFlowNode.tsx` | Modify | Add condition/variable UI, click-to-connect handling |
| `src/components/builder/FlowCanvas.tsx` | Modify | Connection mode state, Escape key handler |
| `src/components/builder/CanvasToolbar.tsx` | Modify | Add Variables button/panel |

---

## Implementation Order

1. **Phase 1: Data Model** - Update types and context
2. **Phase 2: Variables UI** - Create VariablesPanel, add to toolbar
3. **Phase 3: Condition UI** - Add condition/assignment UI to nodes
4. **Phase 4: Click-to-Connect** - Implement connection mode

---

## Visual Mockup

### Response Option with Conditions:
```
┌─────────────────────────────────────────────┐
│ [1] "Yes, I'm interested"                   │
│     ⚡ Sets: interested = true              │
│     🔗 ✕                                    │
├─────────────────────────────────────────────┤
│ [2] "Tell me more about pricing"            │
│     👁 Requires: interested = true          │
│     🔗 ✕                                    │
└─────────────────────────────────────────────┘
```

### Message with Condition:
```
┌─────────────────────────────────────────────┐
│ [3] Message  │ 👁 If: interested = true     │
├─────────────────────────────────────────────┤
│ ...                                         │
└─────────────────────────────────────────────┘
```

### Click-to-Connect Mode:
```
Banner: "🔗 Connecting response 'Yes, I'm interested' — Click a message or press Escape"

All message headers show: "Click to connect →"
```
