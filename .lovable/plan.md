
# Fix: Cursor Jump Bug in Message Textarea

## Root Cause Analysis

After tracing the full data flow, there are **three separate issues** working together to cause the cursor jump. All three must be fixed:

### Issue 1: React's Controlled Input Re-render Cycle

When the user types a character, the following cascade happens:

```text
1. onChange fires -> updateMessage(id, newValue)
2. Reducer creates new state (new scenario object)
3. ScenarioContext re-renders all consumers
4. FlowCanvas re-renders -> useMemo creates new nodes with new data objects
5. React Flow re-renders MessageFlowNodeComponent with new message.content
6. React sets the new "value" on the textarea -> CURSOR JUMPS TO END
7. useEffect fires to restore cursor... but may be too late
```

The core problem is that `updateMessage` goes through a global reducer, which triggers a full re-render chain across the entire app. By the time React reconciles the textarea with the new `value` prop, the browser resets the cursor position. The `useEffect` to restore the cursor runs after paint, but React Flow's internal update cycle can interfere with timing.

**Fix**: Use **local state as a buffer** for the textarea value. The component will maintain its own `localContent` state for immediate, uninterrupted typing. Changes will be flushed to the global context, but incoming prop changes (from undo/redo or external edits) will only sync back when the textarea is not actively being edited.

### Issue 2: autoResizeTextarea Sets Height to 0px

The current auto-resize function does this:
```
el.style.height = '0px';          // TEXTAREA COLLAPSES
el.style.height = scrollHeight;   // TEXTAREA EXPANDS
```

Setting height to `0px` causes a full layout reflow. The browser recalculates the element's geometry, which can disrupt cursor tracking and cause visual flicker even within a single frame.

**Fix**: Use `requestAnimationFrame` and measure `scrollHeight` by temporarily setting `height = '0px'` only inside a rAF callback, or better yet, avoid the 0px trick entirely by comparing the current `scrollHeight` against the current height and only adjusting upward. For shrinking cases, a brief check can be done.

### Issue 3: The Textarea ref Callback Runs on Every Render

```jsx
ref={(el) => {
  textareaRef.current = el;
  if (el) {
    el.style.height = '0px';     // THIS RUNS EVERY RENDER
    el.style.height = `${Math.max(60, el.scrollHeight)}px`;
  }
}}
```

This inline ref callback executes on every render of the component, collapsing and re-expanding the textarea each time. Combined with React Flow's re-renders, this amplifies the layout disruption.

**Fix**: Move the initial sizing into a `useEffect` that only runs on mount, and use a stable ref (not an inline callback that recreates every render).

---

## Implementation Plan

### Step 1: Add Local State Buffer for Textarea

In `MessageFlowNode.tsx`:
- Add `const [localContent, setLocalContent] = useState(message.content)` 
- Sync from props to local state only when: (a) the message ID changes, or (b) the content changes while the textarea is NOT focused (i.e., an external change like undo)
- On `onChange`, update `localContent` immediately (no cursor issues) and call `updateMessage` to flush to context
- Remove `cursorPosRef` and the cursor-restore `useEffect` entirely -- they are no longer needed since React won't fight with local state

### Step 2: Fix Auto-resize Without Layout Thrashing

- Replace the `height = '0px'` trick with a safer approach:
  - Set `height = 'auto'` then read `scrollHeight`, then set the final height -- but do this in a way that doesn't affect cursor
  - Or use `el.scrollHeight` directly after temporarily unsetting `height` via `requestAnimationFrame`
- Better approach: Only auto-resize needs to handle two cases: growing (content got longer) and shrinking (content got shorter via delete). For growing, just check if `scrollHeight > clientHeight` and expand. For shrinking, temporarily set to a min height, read scrollHeight, then set final.

### Step 3: Fix the Ref Callback

- Switch from an inline ref callback to `useEffect` + stable `textareaRef` for initial sizing
- Only run height calculation on mount, not on every render

### Step 4: Remove Unnecessary Re-render Triggers

- Since local state handles the typing, the component won't need to re-render from context changes during active typing
- The `useEffect` for auto-resize on `message.content` change will still work for external updates

---

## Technical Details

### Files to Modify

**`src/components/builder/MessageFlowNode.tsx`**:
- Add `localContent` state initialized from `message.content`
- Add `isFocusedRef` to track if textarea is actively being edited
- Add `useEffect` to sync `message.content` -> `localContent` when content changes externally (while not focused)
- Update `Textarea` to use `value={localContent}` and `onChange` that sets local state + calls `updateMessage`
- Add `onFocus`/`onBlur` handlers to manage `isFocusedRef`
- Rewrite `autoResizeTextarea` to avoid the `height = '0px'` trick
- Replace inline ref callback with a stable ref + mount effect
- Remove `cursorPosRef` and cursor restoration `useEffect`

### What This Achieves
- Typing is fully local -- no cursor interference from React re-renders
- Auto-resize doesn't cause layout thrashing
- External changes (undo, import) still sync correctly
- No performance regression since local state updates are lightweight
