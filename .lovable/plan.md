
# Conditional Variables & Click-to-Connect Implementation

## Overview

This plan implements three features for the flowchart builder:
1. **Link button** on response options for click-to-connect (alternative to drag-and-drop)
2. **Variables panel** inside the canvas for managing boolean conditional variables
3. **Visual indicators** on responses that set or require variables

---

## 1. Data Model Updates

**File: `src/types/scenario.ts`**

Add new types for variables and conditions:

```typescript
// New types to add
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

Update existing types:

```typescript
export interface ResponseOption {
  id: string;
  text: string;
  nextMessageId: string | null;
  setsVariable?: VariableAssignment;  // NEW: When chosen, set this variable
  condition?: VariableCondition;       // NEW: Only show if condition is met
}

export interface ChatMessage {
  // ... existing fields
  condition?: VariableCondition;  // NEW: Message only shown if condition is met
}

export interface ScenarioData {
  // ... existing fields
  variables: Record<string, ScenarioVariable>;  // NEW
}
```

Update factory functions to include variables in empty scenario.

---

## 2. Context Updates

**File: `src/context/ScenarioContext.tsx`**

### New Action Types
```typescript
| { type: "ADD_VARIABLE"; payload: { name: string } }
| { type: "UPDATE_VARIABLE"; payload: { id: string; name: string } }
| { type: "DELETE_VARIABLE"; payload: string }
| { type: "SET_RESPONSE_VARIABLE_ASSIGNMENT"; payload: { messageId: string; optionId: string; assignment: VariableAssignment | null } }
| { type: "SET_RESPONSE_CONDITION"; payload: { messageId: string; optionId: string; condition: VariableCondition | null } }
| { type: "SET_MESSAGE_CONDITION"; payload: { messageId: string; condition: VariableCondition | null } }
| { type: "START_CONNECTION"; payload: { sourceMessageId: string; optionId: string } }
| { type: "CANCEL_CONNECTION" }
| { type: "COMPLETE_CONNECTION"; payload: { targetMessageId: string } }
```

### New State
Add `pendingConnection` state for click-to-connect:
```typescript
interface PendingConnection {
  sourceMessageId: string;
  optionId: string;
}

// Add to context type
pendingConnection: PendingConnection | null;
startConnection: (sourceMessageId: string, optionId: string) => void;
cancelConnection: () => void;
completeConnection: (targetMessageId: string) => void;
```

### New Context Methods
- `addVariable(name: string)` - Create a new boolean variable
- `updateVariable(id: string, name: string)` - Rename a variable
- `deleteVariable(id: string)` - Remove variable and clear all references
- `setResponseVariableAssignment(messageId, optionId, assignment)` - Set/clear what a response sets
- `setResponseCondition(messageId, optionId, condition)` - Set/clear condition on response
- `setMessageCondition(messageId, condition)` - Set/clear condition on message
- `startConnection(sourceMessageId, optionId)` - Begin click-to-connect mode
- `cancelConnection()` - Exit connection mode
- `completeConnection(targetMessageId)` - Complete the connection

---

## 3. Variables Panel Component

**New File: `src/components/builder/VariablesPanel.tsx`**

A collapsible panel in the canvas toolbar area for managing scenario variables:

```text
+------------------------------------------+
| Variables                          [+ Add] |
+------------------------------------------+
| [x] interested                    [trash] |
| [x] has_pricing                   [trash] |
| [x] is_qualified                  [trash] |
+------------------------------------------+
| + New variable name...            [Add]   |
+------------------------------------------+
```

Features:
- List all scenario variables with their names
- Add new variable with inline input
- Delete variable (with confirmation if in use)
- Collapsible to save space

---

## 4. Canvas Toolbar Updates

**File: `src/components/builder/CanvasToolbar.tsx`**

Add the VariablesPanel as a popover/collapsible section in the toolbar, accessible via a "Variables" button with a `ToggleLeft` icon.

---

## 5. Message Flow Node Updates

**File: `src/components/builder/MessageFlowNode.tsx`**

### Add Link Button to Response Options
Currently responses have Unlink and Delete buttons. Add a Link button (Link2 icon) that:
- Only shows when the option is NOT connected (`!option.nextMessageId`)
- Clicking starts connection mode via `startConnection(messageId, optionId)`

### Visual Indicators for Variables
Add icons/badges to responses that have variable features:

```text
Response option row:
+-------------------------------------------------------+
| [1] "Yes, I'm interested"  [⚡] [👁]  [🔗] [✕] [🗑]   |
+-------------------------------------------------------+
```

- **⚡ (Zap icon)**: Shows if response sets a variable - tooltip shows "Sets: variableName = true/false"
- **👁 (Eye icon)**: Shows if response has a condition - tooltip shows "Requires: variableName = true/false"
- **🔗 (Link icon)**: Click to start connection mode (only when unconnected)
- **✕ (Unlink icon)**: Disconnect (only when connected)
- **🗑 (Trash icon)**: Delete response

### Connection Mode Visual Feedback
When `pendingConnection` is active:
- The source response option shows a pulsing/highlighted border
- Other message node headers show a "Click to connect" indicator
- Clicking a message header completes the connection

### Message Header Condition Badge
If a message has a condition, show a small badge in the header:
```text
| [3] Message | 👁 If: variableName |
```

---

## 6. Flow Canvas Updates

**File: `src/components/builder/FlowCanvas.tsx`**

- Pass `pendingConnection` state to nodes via data
- Handle Escape key to cancel connection mode
- Show a connection mode banner/toast when active:
  "Connecting response — Click a message node or press Escape to cancel"

---

## Files to Create/Modify

| File | Action | Summary |
|------|--------|---------|
| `src/types/scenario.ts` | Modify | Add Variable types, update ResponseOption, ChatMessage, ScenarioData |
| `src/context/ScenarioContext.tsx` | Modify | Add variable actions, pendingConnection state, new methods |
| `src/components/builder/VariablesPanel.tsx` | Create | Variable management UI panel |
| `src/components/builder/CanvasToolbar.tsx` | Modify | Add Variables button with popover |
| `src/components/builder/MessageFlowNode.tsx` | Modify | Add Link button, variable indicators, connection mode handling |
| `src/components/builder/FlowCanvas.tsx` | Modify | Pass pendingConnection, Escape handler, connection banner |

---

## Implementation Order

1. **Phase 1: Data Model** - Update types in `scenario.ts`
2. **Phase 2: Context** - Add all new actions and state to context
3. **Phase 3: Variables Panel** - Create panel and add to toolbar
4. **Phase 4: Response Link Button** - Add click-to-connect to MessageFlowNode
5. **Phase 5: Variable Indicators** - Add visual badges for conditions/assignments
6. **Phase 6: Connection Mode UX** - Escape key, banner, visual feedback

---

## Visual Examples

### Response with Link Button (not connected):
```text
[1] "Tell me more"    [🔗 Link] [🗑]
```

### Response with Connection + Variables:
```text
[2] "Yes, I'm interested"  ⚡Sets: interested  [Unlink] [🗑]
```

### Response with Condition:
```text
[3] "Show me pricing"  👁Needs: interested  [🔗 Link] [🗑]
```

### Connection Mode Active:
```text
Banner: "🔗 Connecting 'Tell me more' — Click a message or Escape"

All message headers show clickable indicator
Source response has pulsing blue border
```
