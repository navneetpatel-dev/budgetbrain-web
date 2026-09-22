'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

/** Animate a number from previous value to target. Skips when reduced motion is on. */
export function useCountUp(target: number, durationMs = 700): number {
  const reducedMotion = useReducedMotion();
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef(0);

  useEffect(() => {
    if (reducedMotion || !Number.isFinite(target)) {
      setValue(target);
      fromRef.current = target;
      return;
    }

    const from = fromRef.current;
    const start = performance.now();
    cancelAnimationFrame(rafRef.current);

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - t) ** 3;
      setValue(from + (target - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, durationMs, reducedMotion]);

  return value;
}