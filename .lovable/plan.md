

## Expand Onboarding Walkthrough

### Overview
Add four new tutorial steps to the onboarding walkthrough that teach users how to work with message nodes on the canvas:
1. **Message Card Layout** - Explain the structure of a message node
2. **Adding Responses** - Show how to add response options to messages
3. **Adding Triggers** - Explain variable triggers on response options
4. **Linking Responses** - Demonstrate how to connect responses to other messages

### Changes Required

#### 1. Add `data-walkthrough` Attributes to Target Elements

**File: `src/components/builder/MessageFlowNode.tsx`**

Add data attributes to enable spotlight targeting:

- Add `data-walkthrough="message-card"` to the main message node container (the root `div`)
- Add `data-walkthrough="response-options-section"` to the response options section wrapper
- Add `data-walkthrough="add-response-input"` to the "Add new option" input area

**File: `src/components/builder/ResponseOptionRow.tsx`**

- Add `data-walkthrough="trigger-button"` to the variable configuration button (Zap icon popover trigger)
- Add `data-walkthrough="link-button"` to the Link button

#### 2. Update Walkthrough Steps Configuration

**File: `src/hooks/use-walkthrough.ts`**

Insert new steps after the current "canvas" step (which introduces variables and expand buttons). The new step order will be:

```text
1. Theme Tab (existing)
2. Canvas (existing - with sub-steps for variables & expand)
3. Message Card Layout (NEW)
4. Adding Responses (NEW)
5. Adding Triggers (NEW)
6. Linking Responses (NEW)
7. Save Your Work (existing)
8. Download (existing)
```

New steps configuration:

```typescript
{
  id: "message-card",
  target: "message-card",
  title: "Message Card",
  description: "Each card represents a message from the contact. The header shows the message number and controls. Edit the message text in the content area below.",
  switchToTab: "canvas",
},
{
  id: "add-responses",
  target: "add-response-input",
  title: "Add Responses",
  description: "Add response options that learners can choose. Type a response and click 'Add' or press Enter. Each message needs at least one response option to continue the conversation.",
  switchToTab: "canvas",
},
{
  id: "add-triggers",
  target: "trigger-button",
  title: "Add Triggers",
  description: "Triggers let you set or check variables when a response is chosen. Use triggers to create conditional logic and branching paths based on learner choices.",
  switchToTab: "canvas",
},
{
  id: "link-responses",
  target: "link-button",
  title: "Link Responses",
  description: "Connect response options to other message nodes. Click the link icon, then select the target message to create the connection. This defines where the conversation goes next.",
  switchToTab: "canvas",
},
```

#### 3. Update Progress Index Calculation

**File: `src/components/builder/OnboardingWalkthrough.tsx`**

The `getProgressIndex` function has hardcoded step calculations. Update it to dynamically calculate progress based on the `WALKTHROUGH_STEPS` array from the hook rather than hardcoded indices.

Replace the static calculation with:

```typescript
const getProgressIndex = useCallback(() => {
  let index = 0;
  for (let i = 0; i < currentStep; i++) {
    index += 1; // Main step
    const step = WALKTHROUGH_STEPS[i];
    if (step.subSteps) {
      index += step.subSteps.length;
    }
  }
  if (currentSubStep >= 0) {
    index += currentSubStep + 1;
  }
  return index;
}, [currentStep, currentSubStep]);
```

This will need to import `WALKTHROUGH_STEPS` from the hook file.

---

### Technical Details

**Element Targeting Strategy:**
The walkthrough uses `data-walkthrough` attributes and `document.querySelector` to find spotlight targets. For the new steps:
- `message-card` - Targets the first message node on canvas
- `add-response-input` - Targets the dashed input area at the bottom of a message card
- `trigger-button` - Targets the Zap icon button on a response option row
- `link-button` - Targets the Link icon button on response options

**Prerequisite:** These elements only exist when there is at least one message on the canvas with at least one response option. Since the walkthrough starts on a fresh canvas, the user may need to have created content first. Consider adding a note in the "Canvas" step description encouraging the user to add a message before proceeding.

**Alternative Approach:** If the elements don't exist yet, the spotlight will fail gracefully (already handled in the existing code). The walkthrough could be enhanced to auto-create a demo message, but that would be a larger change.

**Total Steps After Change:** 
- Before: 6 steps (Theme + Canvas main + 2 sub + Save + Finalize)
- After: 10 steps (Theme + Canvas main + 2 sub + 4 new + Save + Finalize)

