import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Polyfill for IntersectionObserver which is missing in JSDOM
class IntersectionObserverMock {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  takeRecords = vi.fn();
}

window.IntersectionObserver = IntersectionObserverMock as any;
global.IntersectionObserver = IntersectionObserverMock as any;

// Polyfill for ResizeObserver which is also often missing
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

window.ResizeObserver = ResizeObserverMock as any;
global.ResizeObserver = ResizeObserverMock as any;

// Mock matchMedia which is used by many UI components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});


