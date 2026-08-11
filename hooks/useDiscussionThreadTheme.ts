'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  DISCUSSION_THREAD_PATTERN_CHANGED,
  DISCUSSION_THREAD_PATTERNS,
  getDiscussionThreadPatternClass,
  readStoredDiscussionThreadPattern,
  storeDiscussionThreadPattern,
  type DiscussionThreadPatternId,
} from '@/lib/discussion-thread-theme';

export function useDiscussionThreadTheme() {
  const [patternId, setPatternIdState] = useState<DiscussionThreadPatternId>('bubbles');

  useEffect(() => {
    setPatternIdState(readStoredDiscussionThreadPattern());
  }, []);

  useEffect(() => {
    const onPatternChanged = (event: Event) => {
      const detail = (event as CustomEvent<DiscussionThreadPatternId>).detail;
      if (detail) setPatternIdState(detail);
    };
    window.addEventListener(DISCUSSION_THREAD_PATTERN_CHANGED, onPatternChanged);
    return () => window.removeEventListener(DISCUSSION_THREAD_PATTERN_CHANGED, onPatternChanged);
  }, []);

  const setPatternId = useCallback((next: DiscussionThreadPatternId) => {
    setPatternIdState(next);
    storeDiscussionThreadPattern(next);
  }, []);

  return {
    patternId,
    patternClass: getDiscussionThreadPatternClass(patternId),
    patterns: DISCUSSION_THREAD_PATTERNS,
    setPatternId,
  };
}
