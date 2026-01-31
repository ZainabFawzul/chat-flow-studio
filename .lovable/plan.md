

# Accessibility Audit: Chat Scenario Builder (AtomicA11y Landmarks & Page Structure)

## Summary

The Chat Scenario Builder has **partial landmark compliance** with several gaps that need addressing to meet the AtomicA11y criteria for headers, footers, main landmarks, navigation, regions, and page structure.

---

## Current State Analysis

### What's Present

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| **Banner landmark** | `<header role="banner">` in TopBar.tsx | ✅ Present |
| **Main landmark** | `<main>` in BuilderLayout.tsx | ✅ Present |
| **Navigation landmark** | `<nav aria-label="Main actions">` in TopBar.tsx | ✅ Present |
| **Region landmarks** | `<aside aria-label="Builder panel">` in LeftPanel.tsx, sections with `aria-labelledby` in ThemeTab.tsx | ✅ Present |
| **Page title** | "Chat Scenario Builder" in index.html | ✅ Present |
| **Focus-visible styles** | Global CSS in index.css | ✅ Present |
| **Proper heading hierarchy** | `<h1>` in TopBar, `<h2>` in sections | ✅ Present |

### What's Missing or Needs Improvement

| Requirement | Current State | Status |
|-------------|---------------|--------|
| **Footer/Contentinfo landmark** | No footer present in the application | ❌ N/A (no footer needed) |
| **Main landmark has `aria-label`** | Has label `aria-label="Chat preview"` but this limits the main to just the preview | ⚠️ Review needed |
| **Only one banner** | Correct - only one header with `role="banner"` | ✅ OK |
| **Only one main** | Correct - only one `<main>` | ✅ OK |
| **Multiple navigations labeled** | Only one nav present, correctly labeled | ✅ OK |
| **ChatPreview header nested** | Has `<header>` inside `<main>` (chat header) - nested correctly as it's not `role="banner"` | ✅ OK |
| **Text resizes to 200%** | Uses some fixed `px` values, but most are relative or Tailwind-based | ⚠️ Needs testing |
| **400% zoom without horizontal scroll** | Not tested - layout may break at extreme zoom | ⚠️ Needs testing |
| **Orientation support** | Flexbox layout should work, but min-width constraints may cause issues | ⚠️ Needs testing |

---

## Detailed Findings & Recommended Fixes

### 1. Banner/Header Landmark ✅ Mostly Compliant

**Current Implementation (TopBar.tsx line 112):**
```tsx
<header className="..." role="banner">
```

**Assessment:**
- ✅ Uses semantic `<header>` with explicit `role="banner"`
- ✅ Does not have a name (correct - only one banner)
- ✅ Controls inside receive focus via Tab, header itself does not
- ❌ The `role="banner"` is redundant when using `<header>` as a direct child of `<body>` (but harmless)

**Recommended Fix:**
- Remove redundant `role="banner"` since `<header>` is already a direct child of the document and automatically maps to banner role.

---

### 2. Main Landmark ⚠️ Needs Adjustment

**Current Implementation (BuilderLayout.tsx line 18):**
```tsx
<main className="w-2/5 min-w-[320px] overflow-hidden" aria-label="Chat preview">
```

**Issues:**
- The `<main>` only wraps the Chat Preview panel (right side), but semantically the "main content" of a builder app should include the builder panel too
- The `aria-label="Chat preview"` is too specific and doesn't describe the full main content

**Recommended Fix:**
- Move `<main>` to wrap both the left panel and right panel, OR
- Keep current structure but remove the `aria-label` (only one main, so no label needed)

**Option A - Remove label (simpler):**
```tsx
<main className="w-2/5 min-w-[320px] overflow-hidden">
```

**Option B - Restructure (better semantics):**
```tsx
<main className="flex flex-1 overflow-hidden">
  <aside className="w-3/5 min-w-[480px] border-r" aria-label="Builder panel">
    <LeftPanel />
  </aside>
  <section className="w-2/5 min-w-[320px]" aria-label="Chat preview">
    <ChatPreview />
  </section>
</main>
```

---

### 3. Navigation Landmark ✅ Compliant

**Current Implementation (TopBar.tsx line 125):**
```tsx
<nav className="flex items-center gap-3" aria-label="Main actions">
```

**Assessment:**
- ✅ Uses semantic `<nav>` element
- ✅ Has descriptive `aria-label` for its purpose
- ✅ Only one navigation landmark (no conflicts)
- ✅ Buttons inside are focusable, nav itself is not

---

### 4. Region/Section Landmarks ✅ Mostly Compliant

**Current Implementation (LeftPanel.tsx line 19):**
```tsx
<aside className="..." aria-label="Builder panel">
```

**ThemeTab.tsx Section component (line 82):**
```tsx
<section aria-labelledby={id} className="...">
  <h2 id={id}>{title}</h2>
```

**Assessment:**
- ✅ `<aside>` correctly used for complementary content
- ✅ Sections have `aria-labelledby` pointing to heading IDs
- ✅ Each section has a unique, descriptive heading

---

### 5. Footer/Contentinfo Landmark - N/A

**Assessment:**
- The application has no footer, which is acceptable
- No contentinfo landmark is required if there's no footer content

---

### 6. Page Structure ⚠️ Minor Issues

**Current Implementation (index.html):**
```html
<title>Chat Scenario Builder</title>
```

**Assessment:**
- ✅ Unique, descriptive title
- ✅ `<html lang="en">` present
- ⚠️ No skip links for keyboard users to jump to main content

**Recommended Fix - Add skip link:**
```tsx
// In BuilderLayout.tsx, at the top of the component
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-card focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg">
  Skip to main content
</a>
```

---

### 7. Text Resize & Zoom Support ⚠️ Needs Verification

**Current Implementation:**
- Uses Tailwind CSS with `px` and `rem` units
- Fixed minimum widths on panels: `min-w-[480px]` and `min-w-[320px]`

**Potential Issues:**
- Fixed `px` font sizes in some places (`fontSize: ${theme.fontSize}px`)
- Fixed minimum widths may cause horizontal scrolling at high zoom
- Panel layout may not adapt well at 400% zoom

**Recommended Fixes:**

1. **Use rem for font sizes where possible:**
```tsx
// Instead of:
fontSize: `${theme.fontSize}px`

// Consider storing as rem or using a base conversion:
fontSize: `${theme.fontSize / 16}rem`
```

2. **Make minimum widths responsive:**
```tsx
// Consider using clamp or responsive breakpoints
className="w-3/5 min-w-0 lg:min-w-[480px]"
```

3. **Test at 200% text size and 400% zoom**

---

### 8. Keyboard Navigation ✅ Compliant

**Assessment:**
- ✅ All interactive elements (buttons, inputs, tabs) receive focus
- ✅ Focus-visible styles defined globally in index.css
- ✅ Tab order follows visual layout
- ✅ Landmarks themselves don't receive focus

---

### 9. ChatPreview Internal Header ✅ Correct

**Current Implementation (ChatPreview.tsx line 177):**
```tsx
<header className="flex items-center gap-4 ...">
```

**Assessment:**
- ✅ This is NOT a banner because it's nested inside `<main>`
- ✅ Correctly uses `<header>` semantically for the chat header section
- ✅ Does not conflict with the page-level banner

---

## Implementation Plan

### Phase 1: Quick Fixes (Low Effort)

1. **Remove redundant `role="banner"`** from TopBar.tsx
2. **Remove or adjust `aria-label`** from main element in BuilderLayout.tsx
3. **Add skip link** for keyboard users

### Phase 2: Structural Improvements (Medium Effort)

1. **Restructure main landmark** to wrap both panels with proper child landmarks
2. **Review heading hierarchy** in all components to ensure logical structure

### Phase 3: Responsive Accessibility (Testing Required)

1. **Test at 200% text size** - verify no content loss
2. **Test at 400% browser zoom** - verify no horizontal scrolling required
3. **Test landscape/portrait** on mobile devices
4. **Adjust min-width values** if they cause zoom issues

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/builder/BuilderLayout.tsx` | Restructure landmarks, add skip link |
| `src/components/builder/TopBar.tsx` | Remove redundant `role="banner"` |
| `src/components/builder/ChatPreview.tsx` | Minor - adjust nested header if needed |

---

## Technical Details

### Skip Link Implementation
```tsx
// BuilderLayout.tsx
export function BuilderLayout() {
  return (
    <ScenarioProvider>
      <div className="flex h-screen flex-col bg-background">
        {/* Skip Link */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-card focus:px-4 focus:py-2 focus:rounded-xl focus:shadow-lg focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>
        
        <TopBar />
        <main id="main-content" className="flex flex-1 overflow-hidden">
          {/* ... panels ... */}
        </main>
      </div>
    </ScenarioProvider>
  );
}
```

### Revised Landmark Structure
```text
+------------------------------------------+
| <header> (banner)                        |
|   <nav aria-label="Main actions">        |
+------------------------------------------+
| <main id="main-content">                 |
|   +------------------+------------------+|
|   | <aside>          | <section>        ||
|   | Builder panel    | Chat preview     ||
|   +------------------+------------------+|
+------------------------------------------+
```

---

## Testing Checklist (Post-Implementation)

- [ ] Screen reader announces banner landmark on page load
- [ ] Screen reader can navigate to main landmark via shortcuts
- [ ] Navigation landmark is discoverable with clear purpose
- [ ] Regions (aside, sections) are labeled and discoverable
- [ ] Skip link appears on focus and works correctly
- [ ] Tab moves focus through controls in logical order
- [ ] No landmark receives focus itself
- [ ] Text resizes to 200% without losing information
- [ ] Page zooms to 400% without horizontal scrolling
- [ ] Content accessible in both orientations

---

## Priority Recommendation

| Priority | Item | Effort |
|----------|------|--------|
| 1 | Add skip link | Low |
| 2 | Remove redundant `role="banner"` | Low |
| 3 | Adjust main landmark aria-label | Low |
| 4 | Test 200% text resize | Low (testing) |
| 5 | Test 400% zoom behavior | Low (testing) |
| 6 | Restructure landmarks (optional) | Medium |

