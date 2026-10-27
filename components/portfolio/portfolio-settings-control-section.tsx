'use client';

import type { ReactNode } from 'react';
import { NpCollapsibleSection } from './portfolio-nav-panel-ui';

/** Presentation-only wrapper: children keep their values, handlers and conditional rendering. */
export function SettingsControlSection({title,className,children}:{title:string;className?:string;children:ReactNode}) {
  return <NpCollapsibleSection title={title}>
    <div className={className}>{children}</div>
  </NpCollapsibleSection>;
}
