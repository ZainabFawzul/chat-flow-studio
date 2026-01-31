

# Accessibility Audit: Standalone Chat Export

## Summary

The current standalone HTML export has **significant accessibility gaps** when measured against the AtomicA11y chat criteria. This audit identifies issues and proposes fixes organized by priority.

---

## Current State Analysis

### What's Present
- Basic HTML structure with `lang="en"`
- Some `alt` attributes on avatar images
- Semantic `<button>` elements for controls
- Responsive viewport meta tag

### What's Missing (Critical Issues)

| Requirement | Current State | Status |
|-------------|---------------|--------|
| Chat purpose announced | No landmark, label, or heading | Missing |
| Controls have appropriate roles | Buttons exist but lack accessible names in some cases | Partial |
| Status changes announced (typing) | No ARIA live region | Missing |
| New message notifications | No live region announcements | Missing |
| Focus management | No focus handling after state changes | Missing |
| Text resize to 200% | Uses fixed `px` units | Partial |

---

## Detailed Findings & Fixes

### 1. Keyboard Navigation

**Issue:** Chat container and messages area lack proper focus management

**Fixes:**
- Add `tabindex="-1"` to chat messages container for programmatic focus
- Implement focus management: move focus to new messages or response options after state changes
- Add visible focus styles for all interactive elements (`:focus-visible` outlines)
- Ensure response option buttons receive focus when they appear

```text
+------------------+     +------------------+     +------------------+
|  User clicks     | --> |  Contact types   | --> |  Options appear  |
|  response option |     |  (typing shown)  |     |  focus moves to  |
|                  |     |                  |     |  first option    |
+------------------+     +------------------+     +------------------+
```

### 2. Screen Reader Support

**Issue:** No ARIA landmarks or live regions

**Fixes:**
- Wrap chat in `role="region"` with `aria-label="Chat with [contact name]"`
- Add `role="log"` and `aria-live="polite"` to messages container
- Add `aria-atomic="false"` so only new messages are announced
- Add hidden live region for status announcements ("Contact is typing...", "New message received")
- Add `role="status"` to typing indicator with screen-reader-only text
- Add `aria-label` to Reset button: `aria-label="Reset conversation"`

**Current HTML structure:**
```html
<div class="chat-container" id="app"></div>
```

**Proposed accessible structure:**
```html
<div class="chat-container" id="app" role="region" aria-label="Chat with Sarah">
  <header class="chat-header">...</header>
  <div class="chat-messages" role="log" aria-live="polite" aria-atomic="false">
    <!-- Messages with role="article" or semantic grouping -->
  </div>
  <div aria-live="assertive" class="sr-only" id="status-announcer"></div>
  <div class="response-options" role="group" aria-label="Response options">
    <!-- Option buttons -->
  </div>
</div>
```

### 3. Status Change Announcements

**Issue:** Typing indicator is purely visual - no screen reader announcement

**Fixes:**
- Add hidden live region: `<div aria-live="assertive" class="sr-only" id="status-announcer">`
- When typing starts: inject text "Contact is typing"
- When typing ends and message appears: inject "New message from [contact name]"
- Add `aria-hidden="true"` to decorative typing dots
- Include screen-reader-only text in the typing indicator bubble

### 4. Message Structure

**Issue:** Messages lack semantic structure for screen readers

**Fixes:**
- Wrap each message in element with clear sender identification
- Add `aria-label` to message bubbles: e.g., `aria-label="You said: Hello"` or `aria-label="Sarah said: Hi there"`
- Mark avatar images as decorative (`alt=""`) since sender is identified in message label
- Use `role="article"` or semantic grouping for message rows

### 5. Response Options

**Issue:** Options lack group labeling and focus management

**Fixes:**
- Wrap options in `role="group"` with `aria-label="Choose your response"`
- Remove visual-only "Choose a response" label or associate it with `aria-labelledby`
- Move focus to first option button when options appear
- Add focus trap within options area (optional enhancement)

### 6. Text Resize / Zoom Support

**Issue:** Fixed pixel values may not scale properly

**Fixes:**
- Change `font-size` in body from `px` to relative units that respect user preferences
- Use `rem` or `em` for spacing where appropriate
- Test with browser zoom at 200%
- Ensure container doesn't overflow and text remains readable

**CSS changes:**
```css
body {
  font-size: 1rem; /* Respects user's browser settings */
}

/* Or use clamp for flexibility */
body {
  font-size: clamp(14px, 1rem, 18px);
}
```

### 7. Visible Focus Indicators

**Issue:** No custom focus styles - relies on browser defaults

**Fixes:**
- Add explicit `:focus-visible` styles for all buttons
- Ensure focus ring has sufficient contrast (3:1 minimum)

```css
.option-btn:focus-visible,
.start-btn:focus-visible,
.reset-btn:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
```

### 8. Start Screen Accessibility

**Issue:** Start screen lacks proper heading structure

**Fixes:**
- Change `.start-title` from `<div>` to `<h1>` or `<h2>`
- Add `aria-label` to start button
- Ensure decorative play icon is hidden from screen readers

---

## Implementation Plan

### Phase 1: Critical Screen Reader Fixes
1. Add `role="region"` with `aria-label` to chat container
2. Add `role="log"` and `aria-live="polite"` to messages area
3. Create hidden status announcer div with `aria-live="assertive"`
4. Update `render()` function to populate status announcer on typing/new message
5. Add accessible labels to all buttons

### Phase 2: Focus Management
1. Add `tabindex="-1"` to messages container
2. Implement `focusElement()` helper function
3. After typing completes, focus the first response option (if any)
4. On reset, focus the start button

### Phase 3: Semantic Structure
1. Add `role="article"` or proper grouping to message rows
2. Add descriptive `aria-label` to each message bubble
3. Mark decorative elements with `aria-hidden="true"`
4. Change start title to proper heading element

### Phase 4: Text Resize & Focus Styles
1. Update font-size to use relative units
2. Add `:focus-visible` styles to all interactive elements
3. Test at 200% zoom

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/exportZip.ts` | Update `generateStandaloneHTML()` with all accessibility fixes |

---

## Technical Details

### Status Announcer Implementation
```javascript
function announceStatus(message) {
  const announcer = document.getElementById('status-announcer');
  if (announcer) {
    announcer.textContent = '';
    setTimeout(() => { announcer.textContent = message; }, 50);
  }
}

// Usage in addContactMessage:
function addContactMessage(messageId, content, callback) {
  isTyping = true;
  announceStatus(theme.contactName + ' is typing');
  render();
  
  setTimeout(function() {
    chatHistory.push({ id: messageId, content: content, isUser: false });
    isTyping = false;
    announceStatus('New message from ' + theme.contactName);
    if (callback) callback();
    render();
    // Focus first option if available
    const firstOption = document.querySelector('.option-btn');
    if (firstOption) firstOption.focus();
  }, 1000);
}
```

### Screen Reader Only CSS Class
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## Testing Checklist (Post-Implementation)

- [ ] Tab through all controls - focus order is logical
- [ ] Screen reader announces chat purpose when entering
- [ ] Screen reader announces "typing" status
- [ ] Screen reader announces new messages
- [ ] Response options are announced as a group
- [ ] Reset button is announced with clear purpose
- [ ] Zoom to 200% - no content loss or overflow
- [ ] Focus indicator visible on all buttons
- [ ] Start button announces its purpose

