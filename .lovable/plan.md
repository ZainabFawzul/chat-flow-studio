
# Variable Type Placeholders - Locked Functionality

## Summary

Add a type selector interface to the Variables panel that shows three variable types: Boolean (current functionality), Text Matching, and Number. The Text and Number types will be visible but locked with a "Coming Soon" indicator.

---

## Design Approach

### Type Selection UI

When adding a new variable, users will see a segmented control or radio group to select the type before entering the name. The interface will clearly indicate which types are available now vs coming soon.

```text
+------------------------------------------+
| Conditional Variables                    |
| Boolean flags that control...            |
+------------------------------------------+
| Type:                                    |
| [True/False]  [Text*]  [Number*]         |
|               * Coming Soon              |
+------------------------------------------+
| [Existing variables list...]             |
+------------------------------------------+
| [Name input]  [Add]                      |
+------------------------------------------+
```

### Variable Type Icons

- **True/False (Boolean)**: `ToggleLeft` icon (current)
- **Text Matching**: `Type` or `ALargeSmall` icon
- **Number**: `Hash` icon

### Locked State Visual Treatment

Locked variable types will have:
- A small lock icon overlay or badge
- Reduced opacity (50%)
- "Coming soon" tooltip on hover
- Non-interactive (cursor-not-allowed)
- A subtle "Coming Soon" badge next to the type name

---

## Implementation Details

### 1. Add Variable Type Enum

**File:** `src/types/scenario.ts`

Add a type discriminator to the variable system (prepared for future use):

```typescript
export type VariableType = "boolean" | "text" | "number";

export interface ScenarioVariable {
  id: string;
  name: string;
  type: VariableType; // New field
  defaultValue: boolean; // Will become union type later
}

// Update createVariable to default to "boolean"
export const createVariable = (name: string, type: VariableType = "boolean"): ScenarioVariable => ({
  id: crypto.randomUUID(),
  name,
  type,
  defaultValue: false,
});
```

### 2. Update VariablesPanel UI

**File:** `src/components/builder/VariablesPanel.tsx`

**Changes:**
- Add imports for new icons: `Lock`, `Type`, `Hash` from lucide-react
- Add a type selector section with three options
- Disable Text and Number options with locked styling
- Show a "Coming Soon" badge on locked types
- Display variable type icon based on the variable's type field

**New Type Selector Component (inline):**

```tsx
const VARIABLE_TYPES = [
  { id: "boolean", label: "True/False", icon: ToggleLeft, locked: false },
  { id: "text", label: "Text", icon: Type, locked: true },
  { id: "number", label: "Number", icon: Hash, locked: true },
] as const;

// State for selected type
const [selectedType, setSelectedType] = useState<"boolean" | "text" | "number">("boolean");
```

**Type Selector UI:**

```tsx
<div className="p-3 border-b border-border">
  <div className="text-xs text-muted-foreground mb-2">Variable Type</div>
  <div className="flex gap-1">
    {VARIABLE_TYPES.map((vt) => (
      <button
        key={vt.id}
        onClick={() => !vt.locked && setSelectedType(vt.id)}
        disabled={vt.locked}
        className={cn(
          "flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors",
          selectedType === vt.id && !vt.locked
            ? "bg-primary/20 text-primary"
            : vt.locked
            ? "opacity-50 cursor-not-allowed text-muted-foreground"
            : "hover:bg-secondary text-muted-foreground"
        )}
      >
        <vt.icon className="h-3 w-3" />
        {vt.label}
        {vt.locked && <Lock className="h-2.5 w-2.5 ml-0.5" />}
      </button>
    ))}
  </div>
  <div className="text-[10px] text-muted-foreground mt-1.5 text-center">
    Text and Number types coming soon
  </div>
</div>
```

### 3. Update Variable List Display

Each variable in the list will show its type icon:

```tsx
// Get icon based on variable type
const getVariableIcon = (type: VariableType = "boolean") => {
  switch (type) {
    case "text": return Type;
    case "number": return Hash;
    default: return ToggleLeft;
  }
};

// In the variable row
const VariableIcon = getVariableIcon(variable.type);
<VariableIcon className="h-3 w-3" />
```

### 4. Migration for Existing Variables

**File:** `src/context/ScenarioContext.tsx`

Update the `migrateScenario` function to add `type: "boolean"` to any existing variables that lack the field:

```typescript
// Inside migrateScenario
const migratedVariables: Record<string, ScenarioVariable> = {};
Object.entries(scenario.variables ?? {}).forEach(([id, variable]) => {
  migratedVariables[id] = {
    ...variable,
    type: (variable as any).type ?? "boolean",
  };
});
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/types/scenario.ts` | Add `VariableType` type, add `type` field to `ScenarioVariable`, update `createVariable` |
| `src/components/builder/VariablesPanel.tsx` | Add type selector UI with locked states, add new icons, display type icons on variables |
| `src/context/ScenarioContext.tsx` | Add migration logic for existing variables without type field |

---

## Accessibility Considerations

- Locked buttons use `disabled` attribute for screen readers
- Tooltip on locked types explains "Coming soon"
- Clear visual distinction between active and locked states
- Lock icon provides visual indicator even without color

---

## Visual Summary

**Type Selector States:**
- **Active (Boolean)**: Highlighted background, primary color
- **Locked (Text/Number)**: 50% opacity, lock icon, non-clickable

**Variable List:**
- Each variable shows its type icon (Toggle, Type, or Hash)
- Future Text/Number variables will show their respective icons

---

## Testing Checklist

- [ ] Boolean variables can still be created normally
- [ ] Text and Number type buttons are visually distinct and non-clickable
- [ ] Existing scenarios load correctly with migrated boolean type
- [ ] Tooltips display correctly on locked types
- [ ] Hover states follow the established color palette
