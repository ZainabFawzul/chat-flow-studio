
# Plan: Responsive Two-Column Grid for Theme Tab

## Problem
The Theme tab cards stretch too wide on larger screens, making the layout feel sprawling. Centering is not accessible as it creates inconsistent content positioning.

## Solution
Convert the single-column layout to a responsive CSS Grid that displays:
- **1 column** on smaller screens (default, below 768px)
- **2 columns** on larger screens (768px and above)

Cards will naturally flow into the grid, with some cards spanning full width when their content benefits from more space.

## Current Sections (6 total)
1. Contact Info (compact)
2. Start Screen (medium)
3. Your Messages (medium)
4. Contact Messages (medium)
5. Response Panel (larger, more controls)
6. Settings (compact)

## Layout Strategy

```text
Small screens (<768px):        Large screens (≥768px):
┌─────────────────────┐        ┌──────────────┬──────────────┐
│ Contact Info        │        │ Contact Info │ Start Screen │
├─────────────────────┤        ├──────────────┼──────────────┤
│ Start Screen        │        │ Your Messages│Contact Msgs  │
├─────────────────────┤        ├──────────────┴──────────────┤
│ Your Messages       │        │ Response Panel (full width) │
├─────────────────────┤        ├─────────────────────────────┤
│ Contact Messages    │        │ Settings (full width)       │
├─────────────────────┤        └─────────────────────────────┘
│ Response Panel      │
├─────────────────────┤
│ Settings            │
└─────────────────────┘
```

## Technical Changes

### File: `src/components/builder/ThemeTab.tsx`

**Change 1: Update container class (line 131)**

Current:
```tsx
<div className="flex flex-col gap-4 p-4">
```

Updated:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
```

**Change 2: Add full-width span to larger sections**

Response Panel section (line 341) - add wrapper or className:
```tsx
<div className="md:col-span-2">
  <Section icon={...} title="Response Panel" ...>
```

Settings section (line 462) - add wrapper:
```tsx
<div className="md:col-span-2">
  <Section icon={...} title="Settings" ...>
```

## Why This Works
- **Accessible**: Content stays left-aligned, predictable reading flow
- **Responsive**: Adapts to screen size without breaking
- **Balanced**: Pairs similar sections (Messages together, info together)
- **Flexible**: Larger sections span full width when they need more room

## Summary

| File | Changes |
|------|---------|
| `ThemeTab.tsx` | Change container to CSS Grid, add `md:col-span-2` to Response Panel and Settings sections |

**Total: 1 file, 3 small changes**
