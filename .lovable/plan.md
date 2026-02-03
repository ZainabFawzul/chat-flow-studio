
# Plan: Fix Toolbar Focus Order in Canvas

## Problem
When users Tab into the Canvas tab, focus goes to the React Flow zoom controls (+/-) before reaching the toolbar (New Message, Variables, etc.). The toolbar should be the **first** focusable element.

## Root Cause
The `<Controls>` component from React Flow is rendered inside `<ReactFlow>` and contains focusable buttons. Even though the toolbar Panel is in the code, the Controls component's buttons appear earlier in the DOM's focus order.

## Solution
Restructure the FlowCanvas layout to ensure the toolbar appears first in the DOM focus order.

---

## Technical Implementation

### File: `src/components/builder/FlowCanvas.tsx`

**Changes:**

1. **Move toolbar outside ReactFlow** - Render the `CanvasToolbar` as a sibling element **before** the `ReactFlow` component, using absolute positioning to maintain visual placement

2. **Remove Controls from tab order** - Add CSS or wrapper to set `tabIndex={-1}` on the Controls buttons so zoom controls are mouse-only (optional for accessibility)

3. **Restructure container** - Use a relative container with the toolbar absolutely positioned, ensuring correct DOM order

**Updated structure:**
```text
<div ref={containerRef} className="relative h-full">
  
  <!-- FIRST in DOM = First in focus order -->
  <div className="absolute top-4 left-4 z-10">
    <CanvasToolbar />
  </div>
  
  <div className="absolute top-4 right-4 z-10">
    <Button (expand/collapse) />
  </div>
  
  <!-- ReactFlow fills the container -->
  <ReactFlow tabIndex={-1}>
    <Background />
    <Controls /> <!-- Now AFTER toolbar in DOM -->
    <!-- Connection banner stays inside for positioning -->
  </ReactFlow>
  
</div>
```

4. **Update Controls accessibility** - Add a className or style to set the controls buttons to `tabIndex={-1}` so they don't interfere with keyboard navigation, or hide them for keyboard users since zoom can be done with mouse/touchpad

---

## Focus Order After Fix

1. Tab trigger: Theme → Canvas (manual activation)
2. Enter Canvas tab
3. **New Message button** (toolbar - first focus)
4. **Variables button** (toolbar)
5. **Reset button** (toolbar)
6. **Expand/Fullscreen button**
7. **Message nodes** (cycle through)
8. Enter on a node to edit its contents

---

## Screen Reader Guidance
- The toolbar container already has `aria-label` explaining navigation
- Message nodes have instructions about pressing Enter to edit
