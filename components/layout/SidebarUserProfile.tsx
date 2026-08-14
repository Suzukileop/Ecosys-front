'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import api from '@/lib/api';
import type { CreatorProfileDto } from '@/types/ecosystem';

type SidebarUserProfileProps = {
  collapsed: boolean;
};

/** Fixed block height so collapse never shifts the nav below.
 *  pl-3 centers the lg avatar (3rem) inside the 4.5rem collapsed rail.
 */
const PROFILE_BLOCK_CLASS =
  'flex h-[5.5rem] w-full shrink-0 items-center gap-3 overflow-hidden rounded-2xl py-3 pl-3 pr-3 transition hover:bg-neutral-100 dark:hover:bg-white/10';

export function SidebarUserProfile({ collapsed }: SidebarUserProfileProps) {
  const { user, hasRole } = useAuth();
  const [specialite, setSpecialite] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !hasRole('ROLE_CREATOR')) {
      setSpecialite(null);
      return;
    }

    let cancelled = false;
    api
      .get<CreatorProfileDto>('/api/creator/profile')
      .then((res) => {
        if (!cancelled) setSpecialite(res.data.specialite?.trim() || null);
      })
      .catch(() => {
        if (!cancelled) setSpecialite(null);
      });

    return () => {
      cancelled = true;
    };
  }, [user, hasRole]);

  if (!user) return null;

  return (
    <Link
      href={hasRole('ROLE_CREATOR') ? '/dashboard/creator' : '/dashboard/home'}
      title={collapsed ? user.fullName : undefined}
      aria-label="My Profile"
      className={PROFILE_BLOCK_CLASS}
    >
      <Avatar name={user.fullName} avatarUrl={user.avatarUrl} size="lg" tone="muted" />
      <div
        className={`min-w-0 flex-1 space-y-0.5 overflow-hidden transition-opacity duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          collapsed ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
        aria-hidden={collapsed}
      >
        <p className="truncate text-sm font-semibold text-black dark:text-white">{user.fullName}</p>
        {specialite ? (
          <p className="truncate text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {specialite}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
