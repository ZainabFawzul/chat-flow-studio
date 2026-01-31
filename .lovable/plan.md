
# Functional Enhancements Plan

## Overview

This plan implements four functional changes:
1. Replace corner radius abbreviations (TL, TR, BR, BL) with full text (TOP LEFT, TOP RIGHT, etc.)
2. Add a typing indicator ("...") before contact messages appear
3. Allow customization of the start screen content in the theme
4. Make the Reset button optional via a theme toggle

---

## 1. Corner Radius Label Updates

**File: `src/components/builder/ThemeTab.tsx`**

Update the `corners` array in `BorderRadiusControl` to use full labels:

```typescript
const corners = [
  { key: "topLeft" as const, label: "TOP LEFT" },
  { key: "topRight" as const, label: "TOP RIGHT" },
  { key: "bottomRight" as const, label: "BOTTOM RIGHT" },
  { key: "bottomLeft" as const, label: "BOTTOM LEFT" },
];
```

Adjust layout to accommodate longer labels with a 2x2 grid instead of 4-column.

---

## 2. Typing Indicator for Contact Messages

**File: `src/components/builder/ChatPreview.tsx`**

Add state to track a "typing" phase before showing contact messages:

```typescript
const [isTyping, setIsTyping] = useState(false);
```

When a contact message is added:
1. Show a "..." bubble in the contact's style
2. After a short delay (e.g., 800-1200ms), replace with the actual message

This creates the illusion of a live chat where the contact is composing their response.

**File: `src/lib/exportZip.ts`**

Add the same typing indicator logic to the exported standalone HTML so the finalized interactive also shows the "..." bubble.

---

## 3. Start Screen Customization

**File: `src/types/scenario.ts`**

Add new fields to `ChatTheme`:

```typescript
export interface ChatTheme {
  // ... existing fields
  startScreenTitle: string;       // e.g., "Ready to Start"
  startScreenSubtitle: string;    // e.g., "Begin the conversation"
  startButtonText: string;        // e.g., "Start"
}
```

Update `DEFAULT_THEME`:

```typescript
startScreenTitle: "Ready to Start",
startScreenSubtitle: "Begin the conversation",
startButtonText: "Start",
```

**File: `src/components/builder/ThemeTab.tsx`**

Add a new "Start Screen" section with three text inputs:
- Title (e.g., "Ready to Start")
- Subtitle/description (e.g., "Click to begin your conversation")
- Button text (e.g., "Begin", "Start Conversation")

**File: `src/lib/exportZip.ts`**

Update the start screen HTML generation to use these theme values instead of hardcoded text.

**File: `src/context/ScenarioContext.tsx`**

Update the `migrateScenario` function to provide defaults for these new fields when loading legacy scenarios.

---

## 4. Optional Reset Button

**File: `src/types/scenario.ts`**

Add to `ChatTheme`:

```typescript
showResetButton: boolean;
```

Update `DEFAULT_THEME`:

```typescript
showResetButton: true,
```

**File: `src/components/builder/ThemeTab.tsx`**

Add a toggle switch in a new "Controls" section:

```text
+------------------------------------------+
| Controls                                  |
+------------------------------------------+
| Show Reset Button    [toggle switch]     |
+------------------------------------------+
```

**File: `src/components/builder/ChatPreview.tsx`**

Conditionally render the Reset button based on `theme.showResetButton`.

**File: `src/lib/exportZip.ts`**

Conditionally include the Reset button in the exported HTML based on the theme setting.

---

## Files to Create/Modify

| File | Action | Summary |
|------|--------|---------|
| `src/types/scenario.ts` | Modify | Add `startScreenTitle`, `startScreenSubtitle`, `startButtonText`, `showResetButton` to ChatTheme |
| `src/context/ScenarioContext.tsx` | Modify | Update `migrateScenario` for new theme fields |
| `src/components/builder/ThemeTab.tsx` | Modify | Full corner labels, Start Screen section, Controls section with Reset toggle |
| `src/components/builder/ChatPreview.tsx` | Modify | Typing indicator, conditional Reset button |
| `src/lib/exportZip.ts` | Modify | Typing indicator in exported JS, customizable start screen text, conditional Reset button |

---

## Technical Details

### Typing Indicator Logic (ChatPreview)

```typescript
// State
const [typingMessageId, setTypingMessageId] = useState<string | null>(null);

// When adding a contact message
const addContactMessage = (messageId: string, content: string) => {
  // Show typing indicator first
  setTypingMessageId(messageId);
  
  // After delay, show actual message
  setTimeout(() => {
    setChatHistory(prev => [...prev, { id: messageId, content, isUser: false }]);
    setTypingMessageId(null);
  }, 1000);
};
```

### Typing Bubble CSS

```css
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.4;
  animation: typingBounce 1.4s infinite;
}

@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}
```

### Start Screen Theme Section (ThemeTab)

```text
+------------------------------------------+
| Start Screen                              |
+------------------------------------------+
| Title                                     |
| [Ready to Start________________]          |
|                                           |
| Subtitle                                  |
| [Begin the conversation________]          |
|                                           |
| Button Text                               |
| [Start_________________________]          |
+------------------------------------------+
```

---

## Implementation Order

1. Update `scenario.ts` with new theme fields
2. Update `migrateScenario` in context for backwards compatibility
3. Update `ThemeTab.tsx`:
   - Change corner radius labels to full text
   - Add Start Screen section
   - Add Controls section with Reset toggle
4. Update `ChatPreview.tsx`:
   - Add typing indicator state and logic
   - Conditionally show Reset button
5. Update `exportZip.ts`:
   - Add typing indicator to exported JS
   - Use custom start screen text
   - Conditionally include Reset button
