'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { NOTIFICATION_TARGET, notificationContentTargetId } from '@/lib/notification-highlight';

const SCROLL_DELAY_MS = 500;
const HIGHLIGHT_DURATION_MS = 4200;
const RETRY_MS = 150;
const MAX_WAIT_MS = 45_000;

/** Scroll + encadrement d'un poster de contenu agent (CONTENT_DELIVERED). */
export function useNotificationContentHighlight(contentId: string | null, ready = true) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const highlight = searchParams.get('highlight');
  const paramContentId = searchParams.get('contentId');
  const targetId = contentId ?? paramContentId;
  const matched =
    ready &&
    !!targetId &&
    highlight === NOTIFICATION_TARGET.CONTENT_ITEM &&
    (!contentId || contentId === paramContentId);

  const [activeContentId, setActiveContentId] = useState<string | null>(null);

  useEffect(() => {
    if (!matched || !targetId) {
      setActiveContentId(null);
      return;
    }

    const elementId = notificationContentTargetId(targetId);
    let scrollTimer: ReturnType<typeof setTimeout> | undefined;
    let endTimer: ReturnType<typeof setTimeout> | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    const startedAt = Date.now();

    const clearHighlightParams = () => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('highlight');
      params.delete('contentId');
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    };

    const run = () => {
      const el = document.getElementById(elementId);
      if (!el) {
        if (Date.now() - startedAt < MAX_WAIT_MS) {
          retryTimer = setTimeout(run, RETRY_MS);
        }
        return;
      }

      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      setActiveContentId(targetId);

      endTimer = setTimeout(() => {
        setActiveContentId(null);
        clearHighlightParams();
      }, HIGHLIGHT_DURATION_MS);
    };

    scrollTimer = setTimeout(run, SCROLL_DELAY_MS);

    return () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      if (endTimer) clearTimeout(endTimer);
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [matched, targetId, pathname, router, searchParams, contentId, ready]);

  return activeContentId;
}
