'use client';

import type { ReactNode } from 'react';
import { useNotificationHighlight } from '@/hooks/useNotificationHighlight';
import { notificationTargetElementId } from '@/lib/notification-highlight';

type Props = {
  id: string;
  ready?: boolean;
  alsoMatch?: string[];
  className?: string;
  children: ReactNode;
};

export function NotificationHighlightTarget({
  id,
  ready = true,
  alsoMatch = [],
  className = '',
  children,
}: Props) {
  const active = useNotificationHighlight(id, ready, alsoMatch);

  return (
    <div
      id={notificationTargetElementId(id)}
      className={`relative scroll-mt-24 rounded-2xl ${active ? 'notification-highlight-ring' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
