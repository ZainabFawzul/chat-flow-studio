

# Miro-Style Flowchart Builder - Implementation Plan

## Overview

Replace the current nested tree view with a visual flowchart canvas (similar to Miro/Figma) that displays conversation nodes and their connections spatially. The design prioritizes accessibility by supporting both drag-and-drop AND click-to-place interactions.

---

## Architecture Changes

### New Layout Structure

```text
+--------------------------------------------------+
|                    Top Bar                        |
+--------------------------------------------------+
|                          |                        |
|   LEFT PANEL (60%)       |   RIGHT PANEL (40%)   |
|   +-----------------+    |                        |
|   | [Theme][Canvas] |    |   Chat Preview        |
|   +-----------------+    |   (Live simulation)   |
|   |                 |    |                        |
|   | Tab: Theme      |    |   Shows conversation  |
|   | - Colors        |    |   flow as user would  |
|   | - Contact info  |    |   experience it       |
|   |                 |    |                        |
|   | Tab: Canvas     |    |                        |
|   | +------+        |    |                        |
|   | | Node |------> |    |                        |
|   | +------+        |    |                        |
|   |      \          |    |                        |
|   |       +------+  |    |                        |
|   |       | Node |  |    |                        |
|   |       +------+  |    |                        |
|   |                 |    |                        |
|   | [Expand ⛶]      |    |                        |
|   +-----------------+    |                        |
+--------------------------------------------------+
```

The layout keeps the familiar split-panel structure:
- **Left Panel (60%)**: Contains tabs for Theme settings and the new Flowchart Canvas
- **Right Panel (40%)**: Chat Preview showing the live conversation simulation
- **Expand Mode**: Canvas tab can expand to full-screen for complex scenario building

---

## Phase 1: Data Model Updates

### Add Position Data to Messages

Extend `ChatMessage` type to include canvas position:

```typescript
interface NodePosition {
  x: number;
  y: number;
}

interface ChatMessage {
  id: string;
  content: string;
  isEndpoint: boolean;
  responseOptions: ResponseOption[];
  position: NodePosition; // NEW: Canvas coordinates
}
```

### Add Canvas State

```typescript
interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
  selectedNodeId: string | null;
  connectionMode: {
    active: boolean;
    sourceNodeId: string | null;
    sourceOptionId: string | null;
  };
}
```

---

## Phase 2: React Flow Integration

### Library Choice: @xyflow/react

React Flow (xyflow) is the industry standard for flowchart builders with:
- Built-in accessibility features (ARIA labels, keyboard navigation)
- Click-to-connect alternative to drag-and-drop
- Minimap for navigation
- Zoom controls with keyboard shortcuts
- Custom node support

### Core Components

1. **FlowCanvas.tsx** - Main canvas wrapper with React Flow
2. **MessageFlowNode.tsx** - Custom node component for chat messages
3. **ResponseEdge.tsx** - Custom edge showing response option text
4. **CanvasControls.tsx** - Zoom, fit view, minimap toggle
5. **NodeToolbar.tsx** - Actions when a node is selected

---

## Phase 3: Custom Node Design

### Message Node Visual

```text
+----------------------------------------+
| [Avatar] Contact Message     [Actions] |
+----------------------------------------+
|                                        |
|  "Hello! How can I help you today?"    |
|                                        |
+----------------------------------------+
| Response Options:                      |
| [1] "Tell me more"           ○------->|
| [2] "I need help"            ○------->|
| [3] "Goodbye"                ○------->|
| [+ Add response]                       |
+----------------------------------------+
```

### Node Features
- Inline text editing (click to edit message content)
- Response options listed with connection handles
- Visual status indicators (endpoint, incomplete)
- Compact/expanded view toggle

---

## Phase 4: Accessible Connection System

### Two Methods to Connect Nodes

**Method 1: Click-to-Connect (Primary - Accessible)**
1. Click "Connect" button on a response option
2. Node enters "connection mode" - visual indicator shows
3. Click on target canvas area OR existing node
4. If clicking empty space: creates new node at that position
5. If clicking existing node: connects to that node
6. Press Escape to cancel

**Method 2: Drag-and-Drop (Secondary)**
- Drag from response option handle to target
- Traditional flowchart interaction for power users

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move between nodes |
| Enter | Select/edit node |
| Arrow keys | Navigate between nodes spatially |
| C | Start connection from selected response |
| Escape | Cancel connection / deselect |
| Delete | Delete selected node (with confirmation) |
| +/- | Zoom in/out |
| 0 | Reset zoom to 100% |
| F | Fit all nodes in view |

---

## Phase 5: Canvas Features

### Toolbar Controls

```text
+---------------------------------------------------+
| [+ Add Node] [Zoom -] 100% [Zoom +] [Fit] [Grid]  |
+---------------------------------------------------+
```

### Minimap
- Shows entire flowchart overview
- Click to navigate
- Keyboard accessible

### Grid/Snap
- Optional grid overlay
- Snap-to-grid for neat alignment
- Toggle via toolbar

---

## Phase 6: Tab-Based Canvas Integration

### Layout Structure

**Left Panel (60% width)**
- Tab 1: **Theme** - Existing theme configuration
- Tab 2: **Canvas** - New flowchart builder (replaces Messages tab)
- Expand button to make canvas full-screen

**Right Panel (40% width)**
- Chat Preview (unchanged)
- Shows live conversation simulation

### Canvas Tab Features
- Full flowchart builder within the tab
- "Expand" button in toolbar to go full-screen
- Press Escape or click "Exit" to return to split view
- Keyboard shortcut: `E` to toggle expand mode

### Expanded Mode
```text
+--------------------------------------------------+
|  [Exit ✕] [+ Add Node] [Zoom] [Fit] [Grid]       |
+--------------------------------------------------+
|                                                  |
|              FULL-SCREEN CANVAS                  |
|                                                  |
|   +------+        +------+        +------+       |
|   | Node |------->| Node |------->| Node |       |
|   +------+        +------+        +------+       |
|                                                  |
+--------------------------------------------------+
```

---

## Phase 7: Visual Enhancements

### Connection Lines
- Smooth bezier curves between nodes
- Animated flow direction indicator
- Response text shown on edge label
- Color-coded by status

### Node States
- **Default**: Clean white card
- **Selected**: Primary border, subtle shadow
- **Hover**: Slight elevation
- **Connecting**: Pulsing border animation
- **Incomplete**: Warning badge
- **Endpoint**: Success indicator

### Canvas Background
- Subtle dot grid pattern
- Adjustable via settings

---

## Phase 8: Accessibility Compliance

### WCAG 2.1 AA Requirements

1. **Focus Indicators**
   - Visible 2px focus ring on all interactive elements
   - High contrast (3:1 ratio minimum)

2. **Screen Reader Support**
   - Live region announcements for actions
   - Descriptive ARIA labels for all nodes and connections
   - Tree/graph structure communicated properly

3. **Keyboard Operability**
   - All actions achievable without mouse
   - No keyboard traps
   - Focus order follows visual flow

4. **Reduced Motion**
   - Respect `prefers-reduced-motion`
   - Skip animations for users who prefer it

---

## Implementation Order

### Step 1: Install React Flow
- Add `@xyflow/react` dependency
- Set up basic canvas with existing data

### Step 2: Create Custom Node Component
- Design MessageFlowNode with inline editing
- Style to match current design system

### Step 3: Implement Click-to-Connect
- Connection mode state management
- Visual feedback during connection
- Keyboard alternative to drag handles

### Step 4: Update Context for Positions
- Add position data to message type
- Auto-layout for imported scenarios
- Save/restore positions

### Step 5: Add Canvas Controls
- Zoom, pan, fit view
- Minimap
- Grid toggle

### Step 6: Reorganize Panels
- Create bottom drawer system
- Move Theme and Preview into drawers
- Add keyboard shortcuts

### Step 7: Polish Accessibility
- Full keyboard navigation audit
- Screen reader testing
- Focus management

---

## Technical Details

### Dependencies to Add
```json
{
  "@xyflow/react": "^12.x"
}
```

### File Structure
```text
src/components/builder/
├── BuilderLayout.tsx      (Updated: 60/40 split)
├── LeftPanel.tsx          (Updated: Theme + Canvas tabs)
├── FlowCanvas.tsx         (NEW: main canvas component)
├── MessageFlowNode.tsx    (NEW: custom node)
├── ResponseEdge.tsx       (NEW: custom edge)
├── CanvasControls.tsx     (NEW: zoom, fit, grid toolbar)
├── CanvasToolbar.tsx      (NEW: add node, expand button)
├── ThemeTab.tsx           (Existing: theme settings)
├── ChatPreview.tsx        (Existing: right panel preview)
└── ...existing files
```

### Context Updates
```typescript
// New actions for ScenarioContext
| { type: "UPDATE_NODE_POSITION"; payload: { id: string; position: NodePosition } }
| { type: "BATCH_UPDATE_POSITIONS"; payload: Record<string, NodePosition> }
| { type: "CONNECT_NODES"; payload: { sourceId: string; optionId: string; targetId: string } }
| { type: "ADD_NODE_AT_POSITION"; payload: { content: string; position: NodePosition } }
```

---

## Migration Strategy

### Handling Existing Data
- Scenarios without position data get auto-layout
- Tree structure converted to left-to-right flow
- Dagre algorithm for automatic positioning

### Backward Compatibility
- Export format remains compatible
- Position data optional in JSON
- Import auto-positions if missing

