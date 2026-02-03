
## Add Page Footer

### Overview
Add a footer to the main page with attribution text and a LinkedIn link for feature suggestions.

### Changes

**File: `src/components/builder/BuilderLayout.tsx`**

Add a `<footer>` element after the `<main>` section and before the `OnboardingWalkthrough` component:

```tsx
<footer className="flex items-center justify-center py-2 px-4 border-t border-border/50 bg-background text-sm text-muted-foreground">
  <p>
    Made with love by Zainab Fawzul. If you'd like to suggest a feature,{' '}
    <a 
      href="https://www.linkedin.com/in/zainab-fawzul" 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-primary hover:underline"
    >
      reach out!
    </a>
  </p>
</footer>
```

### Technical Details
- The footer will be placed at the bottom of the flex column layout
- Uses existing Tailwind classes to match the app's design system
- Link opens in a new tab with proper security attributes (`noopener noreferrer`)
- Subtle styling with muted text and a top border separator
- The `flex-1` on `<main>` ensures the footer stays at the bottom while the main content fills available space
