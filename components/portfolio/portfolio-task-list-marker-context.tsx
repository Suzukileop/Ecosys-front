'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { TaskListMarkerGlobalSettings } from '@/components/portfolio/portfolio-list-marker';

const PortfolioTaskListMarkerContext = createContext<TaskListMarkerGlobalSettings | null>(null);

export function PortfolioTaskListMarkerProvider({
  value,
  children,
}: {
  value: TaskListMarkerGlobalSettings | null | undefined;
  children: ReactNode;
}) {
  return (
    <PortfolioTaskListMarkerContext.Provider value={value ?? null}>
      {children}
    </PortfolioTaskListMarkerContext.Provider>
  );
}

export function usePortfolioTaskListMarkerGlobal(): TaskListMarkerGlobalSettings | null {
  return useContext(PortfolioTaskListMarkerContext);
}
