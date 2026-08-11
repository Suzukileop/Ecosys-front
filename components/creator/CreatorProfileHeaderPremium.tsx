'use client';

import Link from 'next/link';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  CREATOR_PROFILE_SUBSCRIBERS_LABEL,
  CREATOR_PROFILE_VISITS_LABEL,
  type CreatorProfileHeaderProps,
} from '@/components/creator/creator-profile-header-types';
import { coverImageObjectPosition } from '@/lib/creator-profile-cover';

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l2.9 6.26 6.84.99-4.95 4.82 1.17 6.82L12 17.77l-6.12 2.12 1.17-6.82L2.26 9.25l6.84-.99L12 2z" />
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M5 16l-1-9 4.5 3L12 4l3.5 6L20 7l-1 9H5zm0 2h14v2H5v-2z" />
    </svg>
  );
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function PremiumAvatar({
  fullName,
  avatarUrl,
  editable,
  uploadingAvatar,
  onAvatarPick,
  variant,
}: {
  fullName: string;
  avatarUrl: string | null;
  editable?: boolean;
  uploadingAvatar?: boolean;
  onAvatarPick?: () => void;
  variant: 'gold' | 'aurora';
}) {
  const inner = avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600 to-cyan-500 text-2xl font-bold text-white">
      {initials(fullName)}
    </div>
  );

  const ringClass =
    variant === 'gold'
      ? 'from-amber-200 via-yellow-400 to-amber-700'
      : 'from-violet-400 via-fuchsia-400 to-cyan-400';

  const avatar = (
    <div className="relative h-24 w-24 sm:h-28 sm:w-28">
      <div
        className={`absolute -inset-1 rounded-full bg-gradient-to-r ${ringClass} opacity-80 blur-md animate-vip-glow-pulse`}
        aria-hidden
      />
      <div
        className={`absolute -inset-0.5 animate-spin-slow rounded-full bg-gradient-to-r ${ringClass}`}
        aria-hidden
      />
      <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-white/20 bg-neutral-900 p-0.5 shadow-2xl">
        <div className="h-full w-full overflow-hidden rounded-full">{inner}</div>
      </div>
    </div>
  );

  if (!editable) return <div className="shrink-0 motion-reduce:animate-none animate-vip-float">{avatar}</div>;

  return (
    <div className="shrink-0 motion-reduce:animate-none animate-vip-float">
      <button
        type="button"
        onClick={onAvatarPick}
        disabled={uploadingAvatar}
        className="group relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        aria-label="Change profile photo"
      >
        {avatar}
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition group-hover:bg-black/40">
          <CameraIcon className="h-7 w-7 text-white opacity-0 transition group-hover:opacity-100" />
        </span>
        {uploadingAvatar && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <LoadingSpinner size="sm" />
          </span>
        )}
      </button>
    </div>
  );
}

function StatPill({
  value,
  label,
  variant,
  href,
}: {
  value: number;
  label: string;
  variant: 'gold' | 'aurora';
  href?: string;
}) {
  const base =
    variant === 'gold'
      ? 'border-amber-500/25 bg-amber-500/10 text-amber-100'
      : 'border-white/15 bg-white/10 text-white backdrop-blur-md';

  const inner = (
    <>
      <p className="text-base font-bold tabular-nums sm:text-lg">{value.toLocaleString()}</p>
      <p className="text-[9px] font-semibold uppercase tracking-[0.2em] opacity-70">{label}</p>
    </>
  );

  const className = `rounded-2xl border px-3 py-2 text-center transition ${base}${
    href ? ' hover:border-orange-400/40 hover:bg-orange-500/10' : ''
  }`;

  if (href) {
    return (
      <Link href={href} className={`group block ${className}`}>
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}

function CoverEditButton({ onCoverPick, uploadingCover }: { onCoverPick?: () => void; uploadingCover?: boolean }) {
  if (!onCoverPick) return null;
  return (
    <button
      type="button"
      onClick={onCoverPick}
      disabled={uploadingCover}
      className="absolute bottom-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition hover:bg-black/70 disabled:opacity-60"
      aria-label="Change cover image"
    >
      <CameraIcon className="h-5 w-5" />
    </button>
  );
}

function VipBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-amber-200 shadow-lg shadow-amber-500/20">
      <CrownIcon className="h-3 w-3 text-amber-300" />
      {label}
    </span>
  );
}

export function VipGoldHeader(props: CreatorProfileHeaderProps) {
  const bioPreview = props.bio?.trim() || null;

  return (
    <div className="relative overflow-hidden rounded-3xl p-[2px] shadow-2xl shadow-amber-900/30">
      <div
        className="absolute inset-0 animate-vip-border-flow bg-[length:200%_200%] bg-gradient-to-r from-amber-700 via-yellow-300 to-amber-600"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-[22px] bg-neutral-950 text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -left-1/4 top-0 h-40 w-40 rounded-full bg-amber-500/20 blur-3xl animate-orb-1" />
          <div className="absolute -right-1/4 bottom-0 h-48 w-48 rounded-full bg-yellow-600/15 blur-3xl animate-orb-2" />
        </div>

        <div className="relative h-44 overflow-hidden sm:h-52">
          {props.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={props.coverUrl}
              alt=""
              className="absolute inset-0 h-full w-full scale-105 object-cover transition-transform duration-[8s] ease-out hover:scale-110"
              style={{ objectPosition: coverImageObjectPosition(props.coverObjectPositionY) }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-amber-900/40 via-neutral-950 to-black" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 via-transparent to-neutral-950/40" />
          {props.uploadingCover && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
              <LoadingSpinner size="md" />
            </div>
          )}
          {props.editable && (
            <CoverEditButton onCoverPick={props.onCoverPick} uploadingCover={props.uploadingCover} />
          )}
          <div className="absolute left-5 top-5 z-10">
            <VipBadge label="VIP Gold" />
          </div>
        </div>

        <div className="relative -mt-14 px-5 pb-6 sm:px-7 sm:pb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              <PremiumAvatar
                fullName={props.fullName}
                avatarUrl={props.avatarUrl}
                editable={props.editable}
                uploadingAvatar={props.uploadingAvatar}
                onAvatarPick={props.onAvatarPick}
                variant="gold"
              />
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-400 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
                    {props.fullName}
                  </h1>
                  {props.isVerified && (
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-amber-200/60">{props.handle}</p>
                {props.specialite && (
                  <span className="inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-200">
                    {props.specialite}
                  </span>
                )}
                {bioPreview && <p className="max-w-xl text-sm italic text-neutral-400">{bioPreview}</p>}
                {props.locationLabel && (
                  <p className="flex items-center gap-1.5 text-sm text-neutral-500">
                    <PinIcon className="h-4 w-4 text-amber-500/80" />
                    {props.locationLabel}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end">
              <div className="grid grid-cols-3 gap-2">
                <StatPill value={props.followerCount} label={CREATOR_PROFILE_SUBSCRIBERS_LABEL} variant="gold" href={props.profileSubscribersHref} />
                <StatPill value={props.productCount} label="Products" variant="gold" />
                <StatPill value={props.profileVisits} label={CREATOR_PROFILE_VISITS_LABEL} variant="gold" href={props.profileVisitsHref} />
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {props.trailingActions}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VipAuroraHeader(props: CreatorProfileHeaderProps) {
  const bioPreview = props.bio?.trim()
    ? props.bio.trim().length > 140
      ? `${props.bio.trim().slice(0, 140)}…`
      : props.bio.trim()
    : null;

  return (
    <div className="relative overflow-hidden rounded-3xl p-[1.5px] shadow-2xl shadow-violet-900/50">
      <div
        className="pointer-events-none absolute inset-0 animate-vip-border-flow bg-[length:220%_220%] bg-gradient-to-r from-violet-500/80 via-cyan-400/80 to-fuchsia-500/80"
        aria-hidden
      />

      <div className="relative overflow-hidden rounded-[22px] bg-[#050510]">
        {/* Full-width cover hero */}
        <div className="relative h-48 overflow-hidden sm:h-56 md:h-64">
          {props.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={props.coverUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[10s] ease-out hover:scale-105 motion-reduce:transition-none"
              style={{ objectPosition: coverImageObjectPosition(props.coverObjectPositionY) }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-[#0a0a1a] to-cyan-950" />
          )}

          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute -left-1/4 top-0 h-full w-2/3 rounded-full bg-violet-600/40 blur-[60px] motion-reduce:animate-none animate-vip-aurora" />
            <div className="absolute -right-1/4 bottom-0 h-full w-2/3 rounded-full bg-cyan-500/30 blur-[70px] motion-reduce:animate-none animate-vip-aurora [animation-delay:2s]" />
            <div className="absolute left-1/4 top-1/4 h-2/3 w-1/2 rounded-full bg-fuchsia-500/20 blur-[50px] motion-reduce:animate-none animate-vip-aurora [animation-delay:4s]" />
          </div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050510] via-[#050510]/50 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#050510]/70 via-transparent to-[#050510]/30" />

          {props.uploadingCover && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
              <LoadingSpinner size="md" />
            </div>
          )}

          <div className="absolute left-5 top-5 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-black/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-100 shadow-lg shadow-cyan-500/20 backdrop-blur-md">
              <span className="h-1.5 w-1.5 motion-reduce:animate-none animate-pulse rounded-full bg-cyan-300" />
              VIP Aurora
            </span>
          </div>

          {props.editable && (
            <CoverEditButton onCoverPick={props.onCoverPick} uploadingCover={props.uploadingCover} />
          )}
        </div>

        {/* Glass panel — overlaps cover, no side strip */}
        <div className="relative -mt-12 px-4 pb-5 sm:px-6 sm:pb-6">
          <div className="rounded-2xl border border-white/15 bg-[#050510]/80 p-4 shadow-xl shadow-violet-900/25 backdrop-blur-xl sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <PremiumAvatar
                  fullName={props.fullName}
                  avatarUrl={props.avatarUrl}
                  editable={props.editable}
                  uploadingAvatar={props.uploadingAvatar}
                  onAvatarPick={props.onAvatarPick}
                  variant="aurora"
                />
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="bg-gradient-to-r from-white via-violet-100 to-cyan-200 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
                      {props.fullName}
                    </h1>
                    {props.isVerified && (
                      <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                        Verified
                      </span>
                    )}
                    {props.averageRating != null && props.averageRating > 0 && (
                      <span className="text-sm font-semibold text-amber-300">★ {props.averageRating.toFixed(1)}</span>
                    )}
                  </div>
                  <p className="font-mono text-sm text-violet-200/75">{props.handle}</p>
                  {props.specialite && (
                    <span className="inline-block rounded-lg border border-fuchsia-400/30 bg-fuchsia-500/15 px-2.5 py-1 text-xs font-medium text-fuchsia-100">
                      {props.specialite}
                    </span>
                  )}
                  {bioPreview && (
                    <p className="max-w-xl text-sm leading-relaxed text-white/75">{bioPreview}</p>
                  )}
                  {props.locationLabel && (
                    <p className="flex items-center gap-1.5 text-sm text-white/50">
                      <PinIcon className="h-4 w-4 text-cyan-400/80" />
                      {props.locationLabel}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:items-end">
                <div className="grid grid-cols-3 gap-2 sm:min-w-[240px]">
                  <StatPill value={props.followerCount} label={CREATOR_PROFILE_SUBSCRIBERS_LABEL} variant="aurora" href={props.profileSubscribersHref} />
                  <StatPill value={props.productCount} label="Products" variant="aurora" />
                  <StatPill value={props.profileVisits} label={CREATOR_PROFILE_VISITS_LABEL} variant="aurora" href={props.profileVisitsHref} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {props.trailingActions}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   STAGE — ergonomie poster cinématique
   Cover plein écran, avatar + nom centrés,
   barre de stats + CTA flottante en bas
────────────────────────────────────────────── */

export function StageHeader(props: CreatorProfileHeaderProps) {
  const bioPreview = props.bio?.trim()
    ? props.bio.trim().length > 120
      ? `${props.bio.trim().slice(0, 120)}…`
      : props.bio.trim()
    : null;

  const avatarInner = props.avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={props.avatarUrl} alt="" className="h-full w-full object-cover" />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-neutral-800 text-2xl font-bold text-white">
      {initials(props.fullName)}
    </div>
  );

  const AvatarEl = (
    <div className="relative h-24 w-24 sm:h-28 sm:w-28">
      <div
        className="absolute -inset-1 motion-reduce:animate-none animate-spin-slow rounded-full bg-gradient-to-r from-white/80 via-neutral-300/40 to-white/80"
        aria-hidden
      />
      <div className="absolute -inset-0.5 rounded-full bg-neutral-950" aria-hidden />
      <div className="relative h-full w-full overflow-hidden rounded-full">
        {avatarInner}
      </div>
    </div>
  );

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-2xl">
      <div className="relative min-h-[360px] sm:min-h-[420px] md:min-h-[460px]">
        {/* fond de base — visible si pas de cover */}
        <div className="absolute inset-0 bg-neutral-900 dark:bg-neutral-950" />

        {/* cover plein écran */}
        {props.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={props.coverUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[12s] ease-out hover:scale-105 motion-reduce:transition-none"
            style={{ objectPosition: coverImageObjectPosition(props.coverObjectPositionY) }}
          />
        )}

        {/* Voile sombre sur la cover — lisibilité du texte (comme avant) */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/25" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 to-transparent" />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.55)_0%,transparent_65%)]"
          aria-hidden
        />

        {props.editable && (
          <button
            type="button"
            onClick={props.onCoverPick}
            disabled={props.uploadingCover}
            className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition hover:bg-black/70 disabled:opacity-60"
            aria-label="Change cover image"
          >
            <CameraIcon className="h-5 w-5" />
          </button>
        )}
        {props.editable && props.uploadingCover && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
            <LoadingSpinner size="md" />
          </div>
        )}

        {/* Contenu centré — héros */}
        <div className="absolute inset-x-0 top-0 flex flex-col items-center justify-center gap-4 px-4 pt-8 pb-36 text-center sm:pt-10 sm:pb-40 md:pb-44">
          {/* Avatar avec bouton edit si editable */}
          <div className="motion-reduce:animate-none animate-vip-float drop-shadow-2xl">
            {props.editable ? (
              <button
                type="button"
                onClick={props.onAvatarPick}
                disabled={props.uploadingAvatar}
                className="group relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Change profile photo"
              >
                {AvatarEl}
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition group-hover:bg-black/45">
                  <CameraIcon className="h-7 w-7 text-white opacity-0 transition group-hover:opacity-100" />
                </span>
                {props.uploadingAvatar && (
                  <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">
                    <LoadingSpinner size="sm" />
                  </span>
                )}
              </button>
            ) : (
              AvatarEl
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-white/80 backdrop-blur-sm">
              <StarIcon className="h-2.5 w-2.5 text-yellow-300" />
              Stage
            </span>
            {props.isVerified && (
              <span className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200 backdrop-blur-sm">
                Verified
              </span>
            )}
            {props.specialite && (
              <span className="rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/70 backdrop-blur-sm">
                {props.specialite}
              </span>
            )}
          </div>

          {/* Nom XXL */}
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl">
              {props.fullName}
            </h1>
            <p className="mt-1 font-mono text-sm text-white/50">{props.handle}</p>
          </div>

          {bioPreview && (
            <p className="max-w-lg text-sm leading-relaxed text-white/70">{bioPreview}</p>
          )}

          {props.averageRating != null && props.averageRating > 0 && (
            <p className="text-sm font-semibold text-amber-300/90">
              ★ {props.averageRating.toFixed(1)} / 5
            </p>
          )}
        </div>

        {/* ── Barre bas — verre flottant, pas de fond noir ── */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4 sm:px-5 sm:pb-5">
          <div className="flex flex-col gap-3 overflow-hidden rounded-2xl border border-white/25 bg-white/10 px-4 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4 dark:border-white/15 dark:bg-white/[0.08] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
            {/* Stats */}
            <div className="flex items-center justify-center gap-0 sm:justify-start">
              {[
                { value: props.followerCount, label: CREATOR_PROFILE_SUBSCRIBERS_LABEL, href: props.profileSubscribersHref },
                { value: props.productCount, label: 'Products', href: undefined },
                { value: props.profileVisits, label: CREATOR_PROFILE_VISITS_LABEL, href: props.profileVisitsHref },
              ].map((s, i) => {
                const statBody = (
                  <div className="text-center">
                    <p className="text-xl font-black tabular-nums leading-none text-white drop-shadow-sm sm:text-2xl">
                      {s.value.toLocaleString()}
                    </p>
                    <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-white/55">
                      {s.label}
                    </p>
                  </div>
                );

                return (
                  <div key={s.label} className="flex items-center">
                    {i > 0 && (
                      <span
                        className="mx-4 h-7 w-px flex-shrink-0 bg-white/20 sm:mx-5 dark:bg-white/15"
                        aria-hidden
                      />
                    )}
                    {s.href ? (
                      <Link href={s.href} className="rounded-lg transition hover:bg-white/10">
                        {statBody}
                      </Link>
                    ) : (
                      statBody
                    )}
                  </div>
                );
              })}
            </div>

            {/* CTA + localisation */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 border-t border-white/15 pt-3 sm:justify-end sm:border-t-0 sm:pt-0">
              {props.locationLabel && (
                <span className="hidden items-center gap-1.5 text-xs text-white/60 sm:inline-flex">
                  <PinIcon className="h-3.5 w-3.5 shrink-0 text-white/45" />
                  {props.locationLabel}
                </span>
              )}
              {props.trailingActions && (
                <div className="flex items-center gap-2">{props.trailingActions}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
