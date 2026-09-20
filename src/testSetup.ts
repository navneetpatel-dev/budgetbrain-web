import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});

const { window } = dom;

const globalAny = globalThis as unknown as Record<string, unknown>;
globalAny.window = window;
globalAny.document = window.document;
// Node 21+ ships a built-in read-only `globalThis.navigator` getter — must be redefined,
// not assigned, or the assignment throws "Cannot set property navigator".
Object.defineProperty(globalThis, 'navigator', {
  value: window.navigator,
  configurable: true,
  writable: true,
});
globalAny.HTMLElement = window.HTMLElement;
globalAny.Element = window.Element;
globalAny.Node = window.Node;
globalAny.getComputedStyle = window.getComputedStyle;

if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList;
}
globalAny.matchMedia = window.matchMedia;
