'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import {
  CREATOR_APP_ROLE_CHANGED_EVENT,
  DEFAULT_CREATOR_APP_ROLE,
  normalizeCreatorAppRole,
  type CreatorAppRole,
} from '@/lib/creator-app-role';
import type { CreatorProfileDto } from '@/types/ecosystem';

/**
 * Shared across sidebar / header / shell so nav gating does not flash on route changes.
 * `undefined` = not loaded yet for the current user key.
 */
let sharedUserKey: string | null = null;
let sharedAppRole: CreatorAppRole | null | undefined = undefined;
let sharedReady = false;
let inFlight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notifyCreatorAppRoleListeners() {
  listeners.forEach((listener) => listener());
}

function setSharedState(next: {
  userKey: string | null;
  appRole: CreatorAppRole | null | undefined;
  ready: boolean;
}) {
  sharedUserKey = next.userKey;
  sharedAppRole = next.appRole;
  sharedReady = next.ready;
  notifyCreatorAppRoleListeners();
}

function loadCreatorAppRole(userKey: string): Promise<void> {
  if (inFlight && sharedUserKey === userKey) return inFlight;

  inFlight = api
    .get<CreatorProfileDto>('/api/creator/profile')
    .then((res) => {
      if (sharedUserKey !== userKey) return;
      setSharedState({
        userKey,
        appRole: normalizeCreatorAppRole(res.data.appRole),
        ready: true,
      });
    })
    .catch(() => {
      if (sharedUserKey !== userKey) return;
      setSharedState({
        userKey,
        appRole: DEFAULT_CREATOR_APP_ROLE,
        ready: true,
      });
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

/**
 * Loads the creator app role used for UX gating (e.g. Service Provider nav).
 * Non-creators resolve to null; creators default to GENERAL_MEMBER when unset.
 */
export function useCreatorAppRole() {
  const { user, hasRole, isLoading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  const isCreator = Boolean(userId && hasRole('ROLE_CREATOR'));
  const userKey = isCreator && userId ? userId : null;

  const [, setTick] = useState(0);
  const rerender = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    listeners.add(rerender);
    return () => {
      listeners.delete(rerender);
    };
  }, [rerender]);

  useEffect(() => {
    if (authLoading) return;

    if (!userKey) {
      if (sharedUserKey !== null || sharedAppRole !== null || !sharedReady) {
        setSharedState({ userKey: null, appRole: null, ready: true });
      }
      return;
    }

    // Same user already resolved — keep current role (no ready flicker).
    if (sharedUserKey === userKey && sharedReady && sharedAppRole !== undefined) {
      return;
    }

    // Keep previous role visible while first fetch for this user runs.
    const keepRole =
      sharedUserKey === userKey && sharedAppRole !== undefined ? sharedAppRole : undefined;
    setSharedState({
      userKey,
      appRole: keepRole,
      ready: keepRole !== undefined,
    });

    void loadCreatorAppRole(userKey);
  }, [authLoading, userKey]);

  useEffect(() => {
    const onRoleChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ appRole?: unknown }>).detail;
      if (!userKey) return;
      if (detail?.appRole != null) {
        setSharedState({
          userKey,
          appRole: normalizeCreatorAppRole(detail.appRole),
          ready: true,
        });
        return;
      }
      // Force refresh without clearing the current role.
      void loadCreatorAppRole(userKey);
    };

    window.addEventListener(CREATOR_APP_ROLE_CHANGED_EVENT, onRoleChanged);
    return () => {
      window.removeEventListener(CREATOR_APP_ROLE_CHANGED_EVENT, onRoleChanged);
    };
  }, [userKey]);

  const appRole =
    sharedUserKey === userKey
      ? (sharedAppRole === undefined ? null : sharedAppRole)
      : null;
  const ready = !authLoading && (userKey ? sharedUserKey === userKey && sharedReady : sharedReady);

  return { appRole, ready };
}
