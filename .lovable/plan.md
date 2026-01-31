

# Chat Scenario Builder - Implementation Plan

## Overview
A web-based tool for instructional designers to create branching conversation scenarios styled as mobile chat interfaces, featuring a structured tree view builder, theme customization, live preview, and export functionality.

---

## Phase 1: Core Layout & Design System

### Builder Interface Layout
- **Left Panel (40%):** Tabbed interface with "Theme" and "Messages" tabs
- **Right Panel (60%):** Live chat preview showing the scenario as users build it
- **Top Bar:** App title, Import button, Export button (ZIP download)

### Design System Implementation
- Notion-inspired minimal aesthetic with your specified color palette
- Clean typography using system fonts
- Consistent spacing system (4/8/16/24/32/48px)
- Subtle shadows and borders for panel separation

---

## Phase 2: Theme Configuration Tab

### Chat Appearance Settings
- **Contact Name:** Name displayed at top of chat and in message bubbles
- **Contact Avatar:** Optional image upload or initials fallback
- **Sender Bubble Colors:** Background and text color pickers
- **Receiver Bubble Colors:** Background and text color pickers
- **Chat Background:** Color or subtle pattern options
- **Font Settings:** Font size slider and font family selection

### Visual Feedback
All theme changes instantly reflect in the live preview panel

---

## Phase 3: Message Builder (Structured Tree View)

### Tree Structure Design
- **Root Level:** Starting message from the contact
- **Expandable Nodes:** Each message can expand to show:
  - Response options (what the user can choose)
  - Next message that follows each choice
- **Visual Hierarchy:** Indentation and connecting lines show conversation flow
- **Unlimited Depth:** Branches can go as deep as needed

### Message Node Features
- **Message Content:** Text area for the contact's message
- **Response Options:** Add 2-4 clickable response choices
- **End Conversation:** Mark a node as a conversation endpoint
- **Reorder:** Drag handles to reorder response options
- **Delete:** Remove nodes with confirmation for branches with children

### Branching Logic
- Each response option leads to a new message from the contact
- "Dead ends" can be marked as conversation conclusions
- Visual indicators show which branches are complete vs. need content

---

## Phase 4: Live Preview Panel

### Chat Interface Display
- Clean chat panel (no phone mockup frame)
- Realistic message bubbles with proper styling
- Shows messages appearing in sequence
- Response options displayed as clickable buttons
- "Play through" button to test the full conversation flow

### Interactive Testing
- Click through response options to preview paths
- Reset button to start over
- Shows current path highlighted in the tree view

---

## Phase 5: Import/Export System

### Export Functionality
- **JSON Export:** Save project state for later editing
- **ZIP Package Export:** 
  - Standalone HTML file with embedded CSS/JS
  - Separate JSON data file for reference
  - Works offline - all assets inline
  - Compatible with Articulate Rise Code Blocks

### Import Functionality
- Upload previously exported JSON to continue editing
- Validation to ensure file format is correct
- Error messages for invalid files

---

## Phase 6: Accessibility (WCAG 2.1 AA)

### Keyboard Navigation
- Full tab navigation through all controls
- Arrow keys for tree navigation
- Enter/Space to activate buttons and expand nodes
- Escape to close modals/dropdowns
- Visible focus indicators throughout

### Screen Reader Support
- Proper ARIA labels on all interactive elements
- Live regions for dynamic content updates
- Semantic heading structure
- Status announcements for actions (saved, exported, etc.)

### Visual Accessibility
- Color contrast ratios meeting AA standards
- Focus indicators visible in all color modes
- Text sizing respects browser zoom
- No information conveyed by color alone

---

## User Experience Flow

1. **Start:** User lands on builder with empty canvas and sample theme
2. **Configure Theme:** Set colors, contact name, and fonts in Theme tab
3. **Build Messages:** Switch to Messages tab, add first message
4. **Add Responses:** Create response options for user to choose
5. **Branch Out:** Add follow-up messages for each response
6. **Preview:** Test conversation flow in live preview
7. **Export:** Download as ZIP for Articulate Rise embedding
8. **Save Work:** Export JSON to continue later

---

## Technical Approach

- React with TypeScript for type safety
- State management for complex branching data structure
- Local storage auto-save as backup
- Client-side ZIP generation for exports
- No backend needed - fully client-side application

