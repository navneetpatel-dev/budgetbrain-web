'use client';

import { LazyMotion } from 'framer-motion';
import type { ReactNode } from 'react';

// `features` as a function (not the imported value directly) is what actually makes this
// an async chunk — passing `domAnimation` itself here would statically import it into the
// main bundle and defeat the whole point. `strict` throws if any `motion.*` component is
// used anywhere in the tree instead of the `m` component this unlocks — every framer-motion
// usage in this app has been converted to `m` (see list-rows.tsx, BentoCard.tsx, etc.).
const loadDomAnimationFeatures = () => import('framer-motion').then((mod) => mod.domAnimation);

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadDomAnimationFeatures} strict>
      {children}
    </LazyMotion>
  );
}
