import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Run cleanup after each UI test
afterEach(() => {
  cleanup();
});

// Mock for Radix UI requirements in jsdom
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // Deprecated
    removeListener: () => {}, // Deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Radix Dialog / Popover require PointerEvent
if (typeof window !== "undefined" && !window.PointerEvent) {
  class PointerEvent extends Event {
    pointerId = 1;
    pointerType = "mouse";
    isPrimary = true;
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      Object.assign(this, params);
    }
  }
  window.PointerEvent = PointerEvent as unknown as typeof window.PointerEvent;
}
