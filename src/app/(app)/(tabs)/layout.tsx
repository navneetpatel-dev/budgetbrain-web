'use client';

import React from 'react';
import { TabLayout } from '@/shared/containers/TabLayout';

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return <TabLayout>{children}</TabLayout>;
}
