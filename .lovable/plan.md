
# Onboarding Walkthrough Implementation Plan

## Overview
Add a step-by-step guided walkthrough for first-time users that highlights key sections of the builder interface. The walkthrough will use a spotlight/highlight effect to focus on specific elements while darkening the rest of the screen.

---

## Walkthrough Steps

| Step | Highlighted Area | Message |
|------|------------------|---------|
| 1 | Theme Tab | "Use the **Theme tab** to configure the appearance of your chat scenario." |
| 2 | Canvas Tab | "The **Canvas** is where you can build and connect messages." |
| 2a | Variables Button (within Canvas) | "You can add **variables** and create conditional branches." |
| 2b | Expand Button (within Canvas) | "You can also **expand the canvas** for focused building." |
| 3 | Import/Export Buttons | "Your work will **not be saved**. Be sure to export your scenario and re-import it to continue building where you left off." |
| 4 | Finalize Button | "When you're ready, **download** the complete chat scenario." |

---

## Technical Approach

### New Files to Create

1. **`src/components/builder/OnboardingWalkthrough.tsx`**
   - Main component that renders the overlay and step content
   - Manages step progression state
   - Calculates and positions the spotlight cutout based on target element
   - Uses `data-walkthrough-*` attributes to find target elements

2. **`src/hooks/use-walkthrough.ts`**
   - Custom hook for managing walkthrough state
   - Checks localStorage to determine if user has seen the walkthrough
   - Provides `startWalkthrough()`, `nextStep()`, `skipWalkthrough()`, `completeWalkthrough()`
   - Persists completion state to localStorage (`chatScenarioWalkthroughComplete`)

### Files to Modify

1. **`src/components/builder/BuilderLayout.tsx`**
   - Import and render `OnboardingWalkthrough` component
   - Start walkthrough on first load if not previously completed

2. **`src/components/builder/LeftPanel.tsx`**
   - Add `data-walkthrough="theme-tab"` attribute to Theme tab trigger
   - Add `data-walkthrough="canvas-tab"` attribute to Canvas tab trigger
   - Handle programmatic tab switching when walkthrough step changes

3. **`src/components/builder/FlowCanvas.tsx`**
   - Add `data-walkthrough="expand-button"` to the expand/minimize button

4. **`src/components/builder/CanvasToolbar.tsx`**
   - Add `data-walkthrough="variables-button"` to the VariablesTrigger button

5. **`src/components/builder/TopBar.tsx`**
   - Add `data-walkthrough="import-export"` wrapper around Import/Export buttons
   - Add `data-walkthrough="finalize-button"` to Finalize button

---

## Component Design

### OnboardingWalkthrough Component

```text
┌──────────────────────────────────────────────────────────┐
│               DARKENED OVERLAY (z-50)                    │
│                                                          │
│    ┌────────────────────────────┐                        │
│    │                            │ ← Spotlight cutout     │
│    │   [Highlighted Element]    │   (transparent area)   │
│    │                            │                        │
│    └────────────────────────────┘                        │
│                                                          │
│         ┌──────────────────────────────────┐             │
│         │  Step Title                       │            │
│         │  Description text explaining      │            │
│         │  the highlighted feature.         │            │
│         │                                   │            │
│         │  [Skip]              [Next →]     │            │
│         │        ○ ○ ● ○                    │            │
│         └──────────────────────────────────┘             │
│                    ↑ Tooltip positioned near element     │
└──────────────────────────────────────────────────────────┘
```

### Key Features

- **Spotlight Effect**: Uses CSS `clip-path` or SVG mask to create a cutout around the highlighted element
- **Smooth Transitions**: Animate between steps using CSS transitions
- **Auto-positioning**: Tooltip automatically positions relative to highlighted element (above/below/left/right based on available space)
- **Keyboard Support**: Escape to skip, Enter/Arrow keys to navigate
- **Step Indicators**: Progress dots showing current position
- **Skip Button**: Always visible to allow users to exit early
- **Responsive**: Works on different screen sizes

---

## State Management

### Walkthrough Hook Interface

```typescript
interface WalkthroughStep {
  id: string;
  target: string; // data-walkthrough attribute value
  title: string;
  description: string;
  switchToTab?: 'theme' | 'canvas'; // For steps requiring tab switch
  subSteps?: { target: string; description: string }[];
}

interface UseWalkthroughReturn {
  isActive: boolean;
  currentStep: number;
  currentSubStep: number;
  steps: WalkthroughStep[];
  startWalkthrough: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skipWalkthrough: () => void;
  completeWalkthrough: () => void;
  hasCompletedWalkthrough: boolean;
}
```

### Step Definitions

```typescript
const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    id: 'theme',
    target: 'theme-tab',
    title: 'Theme Tab',
    description: 'Use the Theme tab to configure the appearance of your chat scenario.',
    switchToTab: 'theme',
  },
  {
    id: 'canvas',
    target: 'canvas-tab',
    title: 'Canvas',
    description: 'The Canvas is where you can build and connect messages.',
    switchToTab: 'canvas',
    subSteps: [
      { target: 'variables-button', description: 'You can add variables and create conditional branches.' },
      { target: 'expand-button', description: 'You can also expand the canvas for focused building.' },
    ],
  },
  {
    id: 'save-work',
    target: 'import-export',
    title: 'Save Your Work',
    description: "Your work will not be saved. Be sure to export your scenario and re-import it to continue building where you left off.",
  },
  {
    id: 'finalize',
    target: 'finalize-button',
    title: 'Download',
    description: 'When you\'re ready, download the complete chat scenario.',
  },
];
```

---

## CSS Styling

### Overlay with Spotlight Cutout

The spotlight effect will be achieved using an SVG mask or CSS `clip-path`:

```css
.walkthrough-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  pointer-events: auto;
}

.walkthrough-spotlight {
  /* Uses SVG mask to create transparent hole */
  mask: url(#spotlight-mask);
  -webkit-mask: url(#spotlight-mask);
  background: rgba(0, 0, 0, 0.75);
}

.walkthrough-tooltip {
  position: absolute;
  z-index: 51;
  max-width: 320px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  padding: 20px;
}
```

---

## Implementation Order

1. Create `use-walkthrough.ts` hook with state management and localStorage persistence
2. Create `OnboardingWalkthrough.tsx` component with overlay and tooltip
3. Add `data-walkthrough` attributes to target elements in existing components
4. Integrate walkthrough into `BuilderLayout.tsx`
5. Add tab switching coordination between LeftPanel and walkthrough
6. Test all steps and transitions
7. Add keyboard navigation and accessibility features

---

## Accessibility Considerations

- **ARIA**: Use `role="dialog"` and `aria-modal="true"` for the walkthrough overlay
- **Focus Management**: Trap focus within the tooltip during walkthrough
- **Keyboard**: Support Escape to skip, Tab for navigation within tooltip
- **Screen Readers**: Announce step changes with `aria-live` region
- **Reduced Motion**: Respect `prefers-reduced-motion` for animations

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| User resizes window during walkthrough | Recalculate spotlight position on resize |
| Target element not visible | Scroll element into view before highlighting |
| Canvas is expanded | Exit expanded mode when switching away from canvas step |
| User clicks outside spotlight | No action (overlay blocks clicks) |
| localStorage not available | Fallback to showing walkthrough every time |

---

## File Changes Summary

| File | Change Type |
|------|-------------|
| `src/hooks/use-walkthrough.ts` | Create new |
| `src/components/builder/OnboardingWalkthrough.tsx` | Create new |
| `src/components/builder/BuilderLayout.tsx` | Modify |
| `src/components/builder/LeftPanel.tsx` | Modify |
| `src/components/builder/TopBar.tsx` | Modify |
| `src/components/builder/FlowCanvas.tsx` | Modify |
| `src/components/builder/CanvasToolbar.tsx` | Modify |
