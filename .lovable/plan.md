
# Plan: Add Documentation Comments to All Project Files

## Overview
This plan adds a documentation header comment at the beginning of every file in the project. Each comment will describe what the file does, what it configures, and what dependencies it requires.

## Comment Format
Each file will receive a multi-line comment at the very top following this structure:

```typescript
/**
 * @file [filename]
 * @description [Brief description of what the file does]
 * 
 * @dependencies [List of key external/internal dependencies]
 * @usage [How/where this file is used]
 */
```

---

## Files to Update

### Root Configuration Files (7 files)

| File | Description |
|------|-------------|
| `vite.config.ts` | Vite build configuration with React SWC plugin, dev server settings, and path aliases |
| `vitest.config.ts` | Vitest test runner configuration with jsdom environment and test file patterns |
| `tailwind.config.ts` | Tailwind CSS configuration with custom colors, animations, and theme extensions |
| `tsconfig.json` | Root TypeScript configuration that references app and node configs |
| `tsconfig.app.json` | TypeScript config for app source files with path aliases |
| `tsconfig.node.json` | TypeScript config for Node.js tooling files |
| `eslint.config.js` | ESLint configuration for code linting rules |
| `postcss.config.js` | PostCSS configuration for Tailwind CSS processing |
| `components.json` | shadcn/ui configuration for component generation |

### Source Entry Files (3 files)

| File | Description |
|------|-------------|
| `src/main.tsx` | Application entry point; mounts React app to DOM |
| `src/App.tsx` | Root component; sets up providers (Query, Tooltip, Scenario), routing, and toasters |
| `src/vite-env.d.ts` | Vite environment type declarations |

### Pages (2 files)

| File | Description |
|------|-------------|
| `src/pages/Index.tsx` | Main page component; renders the BuilderLayout |
| `src/pages/NotFound.tsx` | 404 error page for unmatched routes |

### Context (1 file)

| File | Description |
|------|-------------|
| `src/context/ScenarioContext.tsx` | Global state management for scenarios using React Context and useReducer; handles messages, themes, variables, and connections |

### Types (1 file)

| File | Description |
|------|-------------|
| `src/types/scenario.ts` | TypeScript type definitions for scenario data structures including ChatMessage, ChatTheme, ResponseOption, and variables |

### Library/Utils (3 files)

| File | Description |
|------|-------------|
| `src/lib/utils.ts` | Utility functions including cn() for className merging |
| `src/lib/contrast.ts` | WCAG 2.1 contrast ratio utilities for accessibility validation |
| `src/lib/exportZip.ts` | ZIP export functionality to generate standalone HTML chat scenarios |

### Hooks (2 files)

| File | Description |
|------|-------------|
| `src/hooks/use-toast.ts` | Toast notification state management hook with add/dismiss/update actions |
| `src/hooks/use-mobile.tsx` | Responsive hook to detect mobile viewport breakpoint |

### Builder Components (14 files)

| File | Description |
|------|-------------|
| `src/components/builder/BuilderLayout.tsx` | Main builder layout; composes TopBar, LeftPanel, and ChatPreview |
| `src/components/builder/TopBar.tsx` | Header bar with app branding, import/export buttons, and finalize dialog |
| `src/components/builder/LeftPanel.tsx` | Left sidebar with Theme/Canvas tabs navigation |
| `src/components/builder/ThemeTab.tsx` | Theme customization panel for colors, typography, and styling |
| `src/components/builder/FlowCanvas.tsx` | React Flow canvas for visual node-based message editing |
| `src/components/builder/MessageFlowNode.tsx` | Individual message node component for the flow canvas |
| `src/components/builder/ResponseOptionRow.tsx` | Response option UI with variable assignments and conditions |
| `src/components/builder/ResponseEdge.tsx` | Custom edge component for connecting nodes in React Flow |
| `src/components/builder/ChatPreview.tsx` | Live chat preview panel showing conversation simulation |
| `src/components/builder/MessagesTab.tsx` | Tree-based message editing view (alternative to canvas) |
| `src/components/builder/MessageNode.tsx` | Recursive message component for tree view |
| `src/components/builder/CanvasToolbar.tsx` | Canvas toolbar with add node, variables, reset, and help buttons |
| `src/components/builder/VariablesPanel.tsx` | Floating panel for creating and managing variables |
| `src/components/builder/FloatingPanel.tsx` | Reusable draggable floating panel component |

### Other Components (1 file)

| File | Description |
|------|-------------|
| `src/components/NavLink.tsx` | Wrapper for React Router NavLink with conditional className support |

### UI Components (50 files)
All shadcn/ui component files in `src/components/ui/` will receive a brief comment identifying them as shadcn/ui primitives:

```typescript
/**
 * @file button.tsx
 * @description shadcn/ui Button component - A styled button with multiple variants
 * 
 * @see https://ui.shadcn.com/docs/components/button
 */
```

### Test Files (2 files)

| File | Description |
|------|-------------|
| `src/test/setup.ts` | Test environment setup with DOM mocks |
| `src/test/example.test.ts` | Example test file demonstrating Vitest usage |

### CSS Files (2 files)

| File | Description |
|------|-------------|
| `src/index.css` | Global CSS with Tailwind directives and CSS variables for theming |
| `src/App.css` | Application-specific CSS styles |

---

## Technical Details

### Comment Style by File Type

**TypeScript/JavaScript files (`.ts`, `.tsx`, `.js`):**
```typescript
/**
 * @file filename.tsx
 * @description Brief description
 * 
 * @dependencies List of key imports
 * @usage Where/how this file is used
 */
```

**CSS files (`.css`):**
```css
/**
 * @file filename.css
 * @description Brief description
 */
```

**JSON files (`tsconfig.json`, `components.json`):**
JSON doesn't support comments, so these will be skipped or documented in a separate README if needed.

---

## Implementation Order

1. **Core files first** - Entry points and configuration
2. **Context and types** - Foundation layer
3. **Utility libraries** - Shared helpers
4. **Builder components** - Main application features
5. **UI components** - shadcn/ui primitives (batch update)
6. **Remaining files** - Hooks, pages, tests

---

## File Count Summary

| Category | Count |
|----------|-------|
| Configuration files | 7 |
| Source entry files | 3 |
| Pages | 2 |
| Context | 1 |
| Types | 1 |
| Library/Utils | 3 |
| Hooks | 2 |
| Builder components | 14 |
| Other components | 1 |
| UI components | 50 |
| Test files | 2 |
| CSS files | 2 |
| **Total** | **88 files** |

*Note: JSON config files will be documented via inline comments where supported, or skipped where not possible.*
