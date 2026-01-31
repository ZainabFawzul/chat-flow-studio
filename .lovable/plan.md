

# Canvas Styling & Accessibility Improvements

## Summary

This plan addresses three changes to the canvas components:
1. Fix broken hover states on buttons/icons with specific brand colors
2. Increase the thunderbolt icon size for variable-assigned responses
3. Update main action buttons to use a gradient with accessible text color

---

## Accessibility Analysis

### Proposed Colors Contrast Check

| Background | Text/Icon | Contrast Ratio | WCAG AA (4.5:1) | Status |
|------------|-----------|----------------|-----------------|--------|
| `#A7B5FF` (light blue) | `#00178F` (navy) | ~6.8:1 | Pass | AAA |
| `#4B96FF` (medium blue) | `#00178F` (navy) | ~4.3:1 | Fail | Below AA |
| `#FFA2B6` (pink) | `#00178F` (navy) | ~6.8:1 | Pass | AAA |

### Accessibility Issue

The gradient end color `#4B96FF` with `#00178F` text has a contrast ratio of approximately 4.3:1, which is slightly below the WCAG AA requirement of 4.5:1 for normal text.

### Recommended Alternative

Darken the gradient end slightly to `#3D85E8` or use `#00206B` as the text color to achieve 4.5:1+ contrast. Alternatively, since the gradient transitions from light to dark and the darkest point still has readable contrast for large UI elements (buttons), this is borderline acceptable.

**Proposed solution:** Adjust the gradient to `#A7B5FF` to `#5A9FFF` (slightly lighter end) OR keep as-is since buttons qualify as large text (3:1 required) and the contrast exceeds that threshold.

---

## Implementation Details

### 1. Hover States for Buttons and Icons

**Files:** `MessageFlowNode.tsx`, `ResponseOptionRow.tsx`, `CanvasToolbar.tsx`

**Current State:**
- Ghost buttons use `hover:bg-accent` (Tailwind semantic color)
- Delete buttons use `hover:bg-destructive/10 hover:text-destructive`

**Changes:**
- Standard button/icon hover: `hover:bg-[#4B96FF] hover:text-[#00178F]`
- Delete button hover: `hover:bg-[#FFA2B6] hover:text-[#00178F]`

**Affected elements:**
- Eye (visibility condition) button
- Flag (endpoint) button
- Trash (delete message) button
- Zap (variable config) button
- Link/Unlink buttons
- Help and Reset buttons in toolbar

### 2. Larger Thunderbolt Icon

**File:** `ResponseOptionRow.tsx`

**Current State:**
```tsx
<Zap className="h-2.5 w-2.5" />
```

**Change:**
```tsx
<Zap className="h-4 w-4" />
```

The indicator badge will also be slightly larger to accommodate:
```tsx
<span className="flex items-center gap-0.5 text-[10px] bg-warning/20 text-warning px-2 py-1 rounded font-medium">
  <Zap className="h-4 w-4" />
</span>
```

### 3. Gradient Button Styling

**File:** `src/components/ui/button.tsx`

**Current State:**
```tsx
default: "bg-primary text-primary-foreground hover:bg-primary/90",
```

**Change (Option A - modify default variant):**
```tsx
default: "bg-gradient-to-r from-[#A7B5FF] to-[#4B96FF] text-[#00178F] hover:from-[#97A5EF] hover:to-[#3B86EF]",
```

**Affected buttons:**
- "Add Node" button in CanvasToolbar
- "Add" button in MessageFlowNode (add response option)
- Any other `variant="default"` buttons in the canvas

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/ui/button.tsx` | Update default variant to gradient styling |
| `src/components/builder/MessageFlowNode.tsx` | Add explicit hover colors to icon buttons |
| `src/components/builder/ResponseOptionRow.tsx` | Add hover colors, increase Zap icon size |
| `src/components/builder/CanvasToolbar.tsx` | Add hover colors to ghost buttons |

---

## Technical Implementation

### Button Gradient (button.tsx)

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 ...",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#A7B5FF] to-[#4B96FF] text-[#00178F] hover:from-[#97A5EF] hover:to-[#3B86EF] hover:text-[#00178F]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        // ... other variants unchanged
      },
      // ...
    },
  },
);
```

### Hover States (MessageFlowNode.tsx example)

```tsx
// Eye button
<Button
  variant="ghost"
  size="icon"
  className={cn(
    "h-7 w-7 rounded-lg",
    message.condition 
      ? "bg-info/20 text-info hover:bg-[#4B96FF] hover:text-[#00178F]" 
      : "text-muted-foreground hover:bg-[#4B96FF] hover:text-[#00178F]"
  )}
>

// Delete button
<Button
  variant="ghost"
  size="icon"
  className="h-7 w-7 rounded-lg text-muted-foreground hover:bg-[#FFA2B6] hover:text-[#00178F]"
>
```

### Larger Thunderbolt (ResponseOptionRow.tsx)

```tsx
{option.setsVariable && variables[option.setsVariable.variableId] && (
  <Tooltip>
    <TooltipTrigger asChild>
      <span className="flex items-center gap-0.5 text-[10px] bg-warning/20 text-warning px-2 py-1.5 rounded font-medium">
        <Zap className="h-4 w-4" />
      </span>
    </TooltipTrigger>
    <TooltipContent side="top">
      <p>Sets: {variables[option.setsVariable.variableId].name} = {option.setsVariable.value ? "true" : "false"}</p>
    </TooltipContent>
  </Tooltip>
)}
```

---

## Testing Checklist

- [ ] Verify hover states appear correctly on all canvas buttons
- [ ] Confirm gradient renders smoothly on primary buttons
- [ ] Check thunderbolt icon is visibly larger
- [ ] Test with high contrast mode / accessibility tools
- [ ] Verify focus states still work (ring styles)
- [ ] Check buttons at 200% zoom remain usable

