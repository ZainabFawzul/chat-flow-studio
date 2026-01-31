/**
 * @file setup.ts
 * @description Test environment setup with DOM mocks for matchMedia
 * 
 * @dependencies @testing-library/jest-dom
 * @usage Referenced in vitest.config.ts setupFiles
 */

import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
