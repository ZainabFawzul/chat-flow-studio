

# Flowchart Builder UI Improvements

## Overview

This plan addresses four UI improvements to the flowchart builder: removing the minimap, reordering tabs, making connection lines more visible, and adding node numbers for easier reference.

---

## Changes Summary

### 1. Remove MiniMap from FlowCanvas
**File:** `src/components/builder/FlowCanvas.tsx`

Remove the MiniMap component entirely from the ReactFlow canvas.

```typescript
// REMOVE this block (lines 145-151):
<MiniMap
  className="bg-card border border-border rounded-xl shadow-lg !bottom-4 !right-4"
  nodeColor="#3b82f6"
  maskColor="hsl(var(--background) / 0.8)"
  pannable
  zoomable
/>
```

Also remove the unused `MiniMap` import.

---

### 2. Reorder Tabs: Theme First, Canvas Second (No Icons)
**File:** `src/components/builder/LeftPanel.tsx`

- Change `defaultValue` from "canvas" to "theme"
- Swap the tab order so Theme comes first
- Remove the icon imports and icon elements from both tabs

```typescript
// Updated tabs structure:
<Tabs defaultValue="theme" className="flex h-full flex-col">
  <TabsList>
    <TabsTrigger value="theme">Theme</TabsTrigger>
    <TabsTrigger value="canvas">Canvas</TabsTrigger>
  </TabsList>
  
  <TabsContent value="theme">...</TabsContent>
  <TabsContent value="canvas">...</TabsContent>
</Tabs>
```

---

### 3. Make Flowchart Lines Thicker and More Visible
**File:** `src/components/builder/ResponseEdge.tsx`

Increase stroke width and use a more visible color:

```typescript
// Current (faint):
stroke: selected ? "hsl(var(--primary))" : "hsl(var(--border))",
strokeWidth: selected ? 2 : 1.5,

// Updated (bold and visible):
stroke: selected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
strokeWidth: selected ? 3 : 2.5,
```

This changes the default edge color from `--border` (very light gray) to `--muted-foreground` (darker gray that's clearly visible).

---

### 4. Add Node Numbers to Each Message Block
**File:** `src/components/builder/MessageFlowNode.tsx`

Add a node number passed from FlowCanvas to help users reference specific message blocks.

**A) Update FlowCanvas to pass node index:**
```typescript
// In the nodes useMemo, add nodeNumber to data:
data: {
  message,
  isRoot: message.id === scenario.rootMessageId,
  nodeNumber: index + 1,  // 1-based numbering
},
```

**B) Update MessageFlowNode to display node number:**
```typescript
// In the header, show node number prominently:
<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
  {nodeNumber}
</div>
<span className="text-xs font-medium text-muted-foreground">
  {isRoot ? "Start" : "Message"}
</span>
```

The node number badge will be:
- Solid primary color background (blue)
- White text for contrast
- Bold font weight
- Shown before the "Start" or "Message" label

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/builder/FlowCanvas.tsx` | Remove MiniMap, add nodeNumber to data |
| `src/components/builder/LeftPanel.tsx` | Reorder tabs, remove icons |
| `src/components/builder/ResponseEdge.tsx` | Increase stroke width and visibility |
| `src/components/builder/MessageFlowNode.tsx` | Display node number in header |

---

## Visual Result

### Before:
- MiniMap in bottom-right corner
- Canvas tab first with GitBranch icon
- Faint gray connection lines (1.5px)
- No node numbers

### After:
- No MiniMap
- Theme tab first (no icons on either tab)
- Bold visible connection lines (2.5px in darker gray)
- Each node shows a numbered badge (1, 2, 3...) in the header

