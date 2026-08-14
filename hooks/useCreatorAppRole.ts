'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import {
  DEFAULT_CREATOR_APP_ROLE,
  normalizeCreatorAppRole,
  type CreatorAppRole,
} from '@/lib/creator-app-role';
import type { CreatorProfileDto } from '@/types/ecosystem';

/**
 * Loads the creator app role used for UX gating (e.g. Service Provider nav).
 * Non-creators resolve to null; creators default to GENERAL_MEMBER when unset.
 */
export function useCreatorAppRole() {
  const { user, hasRole, isLoading: authLoading } = useAuth();
  const [appRole, setAppRole] = useState<CreatorAppRole | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user || !hasRole('ROLE_CREATOR')) {
      setAppRole(null);
      setReady(true);
      return;
    }

    let cancelled = false;
    setReady(false);

    api
      .get<CreatorProfileDto>('/api/creator/profile')
      .then((res) => {
        if (cancelled) return;
        setAppRole(normalizeCreatorAppRole(res.data.appRole));
      })
      .catch(() => {
        if (cancelled) return;
        setAppRole(DEFAULT_CREATOR_APP_ROLE);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, hasRole]);

  return { appRole, ready };
}
