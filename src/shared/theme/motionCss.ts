import type { ThemeMotion } from './types';

/** Convert the shared easing tuple into a CSS `cubic-bezier(...)` string for plain CSS transitions. */
export function cubicBezier(easing: ThemeMotion['easing']): string {
  return `cubic-bezier(${easing.join(', ')})`;
}
