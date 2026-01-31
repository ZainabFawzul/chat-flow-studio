/**
 * @file contrast.ts
 * @description WCAG 2.1 contrast ratio utilities for accessibility validation.
 *              Converts HSL to RGB and calculates luminance-based contrast ratios.
 * 
 * @dependencies None (pure functions)
 * @usage Import getContrastLevel, meetsWCAG_AA for color accessibility checks in ThemeTab
 */

// Convert HSL string (e.g., "214 100% 65%") to RGB
function hslToRgb(hsl: string): { r: number; g: number; b: number } {
  const parts = hsl.split(" ");
  const h = parseFloat(parts[0]) || 0;
  const s = parseFloat(parts[1]?.replace("%", "") || "0") / 100;
  const l = parseFloat(parts[2]?.replace("%", "") || "0") / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

// Calculate relative luminance per WCAG 2.1
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio between two HSL colors
export function getContrastRatio(hsl1: string, hsl2: string): number {
  const rgb1 = hslToRgb(hsl1);
  const rgb2 = hslToRgb(hsl2);

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

// WCAG 2.1 AA requires 4.5:1 for normal text, 3:1 for large text
export function meetsWCAG_AA(hsl1: string, hsl2: string, isLargeText = false): boolean {
  const ratio = getContrastRatio(hsl1, hsl2);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

// Get a human-readable contrast level
export function getContrastLevel(hsl1: string, hsl2: string): {
  ratio: number;
  level: "fail" | "aa-large" | "aa" | "aaa";
} {
  const ratio = getContrastRatio(hsl1, hsl2);
  
  if (ratio >= 7) return { ratio, level: "aaa" };
  if (ratio >= 4.5) return { ratio, level: "aa" };
  if (ratio >= 3) return { ratio, level: "aa-large" };
  return { ratio, level: "fail" };
}
