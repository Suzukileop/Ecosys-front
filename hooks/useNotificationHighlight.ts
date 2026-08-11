'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { isHighlightTarget, notificationTargetElementId } from '@/lib/notification-highlight';

const SCROLL_DELAY_MS = 450;
const HIGHLIGHT_DURATION_MS = 4200;

export function useNotificationHighlight(
  targetId: string,
  ready = true,
  alsoMatch: string[] = [],
) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const highlight = searchParams.get('highlight');
  const matched = isHighlightTarget(highlight, targetId, alsoMatch);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!ready || !matched) {
      setActive(false);
      return;
    }

    const elementId = notificationTargetElementId(targetId);
    let scrollTimer: ReturnType<typeof setTimeout> | undefined;
    let endTimer: ReturnType<typeof setTimeout> | undefined;

    const run = () => {
      const el = document.getElementById(elementId);
      if (!el) {
        scrollTimer = setTimeout(run, 120);
        return;
      }

      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      setActive(true);

      endTimer = setTimeout(() => {
        setActive(false);
        const params = new URLSearchParams(searchParams.toString());
        params.delete('highlight');
        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      }, HIGHLIGHT_DURATION_MS);
    };

    scrollTimer = setTimeout(run, SCROLL_DELAY_MS);

    return () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      if (endTimer) clearTimeout(endTimer);
    };
  }, [ready, matched, targetId, pathname, router, searchParams]);

  return active;
}
