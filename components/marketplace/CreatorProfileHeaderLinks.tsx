'use client';

import { useMemo, type ReactNode } from 'react';
import { SocialPlatformIcon } from '@/components/marketplace/creator-profile-social-icons';
import {
  linkDisplayLabel,
  resolveDisplayLinks,
  resolveLinkPlatform,
} from '@/components/marketplace/CreatorProfileContactSection';
import { formatPhoneDisplay } from '@/lib/phone';
import type { MarketplaceCreatorPublicProfile } from '@/types/marketplace';
import { useT } from '@/lib/i18n/I18nProvider';

/** 36px round icon link, X palette: ink glyph, soft disc on hover, tooltip = what it opens. */
const ICON_LINK =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#0F1419] shadow-[inset_0_0_0_1px_#CFD9DE] transition-colors hover:bg-[rgba(15,20,25,0.06)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0F1419]/30 dark:text-[#E7E9EA] dark:shadow-[inset_0_0_0_1px_#536471] dark:hover:bg-[rgba(231,233,234,0.1)] dark:focus-visible:ring-white/30';

function StrokeGlyph({ children }: { children: ReactNode }) {
  return (
    <svg className="h-[17px] w-[17px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      {children}
    </svg>
  );
}

const EMAIL_PATH =
  'M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z';
const PHONE_PATH =
  'M3 5a2 2 0 0 1 2-2h2.28a1 1 0 0 1 .95.68l1.12 3.36a1 1 0 0 1-.5 1.2l-1.27.64a11.04 11.04 0 0 0 5.18 5.18l.64-1.27a1 1 0 0 1 1.2-.5l3.36 1.12a1 1 0 0 1 .68.95V19a2 2 0 0 1-2 2h-1C9.16 21 3 14.84 3 7V5z';
const GLOBE_PATH =
  'M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9';

/** Whether the creator exposes any contact channel to this visitor (email, phone or a link). */
export function creatorHasContactChannels(profile: MarketplaceCreatorPublicProfile): boolean {
  return Boolean(profile.contactEmail?.trim() || profile.contactPhone?.trim() || resolveDisplayLinks(profile).length > 0);
}

/** Explicit kicker (not `.gn-kicker`): the rail also renders in the phone sheet, outside `.news-mono`. */
const KICKER = 'text-[11px] font-semibold uppercase leading-4 tracking-[0.12em] text-[#536471] dark:text-[#71767B]';

const RAIL_ROW =
  'flex min-h-10 w-full min-w-0 items-center gap-3 rounded-md px-3 py-2 text-[15px] font-medium leading-5 text-[#0F1419] transition-colors hover:bg-[rgba(15,20,25,0.06)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black/15 dark:text-[#E7E9EA] dark:hover:bg-[rgba(231,233,234,0.1)] dark:focus-visible:ring-white/25';

/**
 * Desktop right rail of the public profile: the creator's contact channels as two short lists —
 * "Contact" (email, phone) and "Links" (socials / website) — so the header stays light. Same
 * kicker + row style as My Profile's "Manage" rail.
 */
export function CreatorProfileContactRail({ profile }: { profile: MarketplaceCreatorPublicProfile }) {
  const t = useT();
  const links = useMemo(() => resolveDisplayLinks(profile), [profile]);
  const email = profile.contactEmail?.trim() ?? '';
  const phone = profile.contactPhone?.trim() ?? '';

  return (
    <div className="flex flex-col gap-6">
      {email || phone ? (
        <section aria-label={t('Contact')}>
          <h2 className={`${KICKER} px-3 pb-2`}>{t('Contact')}</h2>
          <ul className="flex flex-col gap-0.5">
            {email ? (
              <li>
                <a href={`mailto:${email}`} className={RAIL_ROW} title={email}>
                  <StrokeGlyph>
                    <path strokeLinecap="round" strokeLinejoin="round" d={EMAIL_PATH} />
                  </StrokeGlyph>
                  <span className="min-w-0 flex-1 truncate">{email}</span>
                </a>
              </li>
            ) : null}
            {phone ? (
              <li>
                <a href={`tel:${phone}`} className={RAIL_ROW} title={phone}>
                  <StrokeGlyph>
                    <path strokeLinecap="round" strokeLinejoin="round" d={PHONE_PATH} />
                  </StrokeGlyph>
                  <span className="min-w-0 flex-1 truncate tabular-nums">{formatPhoneDisplay(phone)}</span>
                </a>
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}
      {links.length > 0 ? (
        <section aria-label={t('Links')}>
          <h2 className={`${KICKER} px-3 pb-2`}>{t('Links')}</h2>
          <ul className="flex flex-col gap-0.5">
            {links.map((link) => {
              const platform = resolveLinkPlatform(link);
              const label = linkDisplayLabel(link, platform);
              const isBrand = !['OTHER', 'WEBSITE', 'CTA'].includes(platform.toUpperCase());
              return (
                <li key={link.id}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className={`group ${RAIL_ROW}`} title={link.url}>
                    {isBrand ? (
                      <SocialPlatformIcon platform={platform} className="h-[17px] w-[17px] shrink-0" />
                    ) : (
                      <StrokeGlyph>
                        <path strokeLinecap="round" strokeLinejoin="round" d={GLOBE_PATH} />
                      </StrokeGlyph>
                    )}
                    <span className="min-w-0 flex-1 truncate">{label}</span>
                    <span aria-hidden className="text-[13px] text-[#536471] opacity-0 transition-opacity group-hover:opacity-100 dark:text-[#71767B]">
                      ↗
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

/**
 * The creator's contact channels as one row of small icons in the profile header (email, phone,
 * then every social / website link) — visible on arrival, without opening Info › Contact / Links.
 * Email and phone only come through when the API exposes them to this visitor (members-only
 * contact stays hidden for guests). Renders nothing when there is no channel.
 */
export function CreatorProfileHeaderLinks({ profile }: { profile: MarketplaceCreatorPublicProfile }) {
  const t = useT();
  const links = useMemo(() => resolveDisplayLinks(profile), [profile]);
  const email = profile.contactEmail?.trim() ?? '';
  const phone = profile.contactPhone?.trim() ?? '';

  if (!email && !phone && links.length === 0) return null;

  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label={t('Contact and links')}>
      {email ? (
        <li>
          <a href={`mailto:${email}`} className={ICON_LINK} title={email} aria-label={t('Email {email}', { email })}>
            <StrokeGlyph>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
            </StrokeGlyph>
          </a>
        </li>
      ) : null}
      {phone ? (
        <li>
          <a href={`tel:${phone}`} className={ICON_LINK} title={phone} aria-label={t('Call {phone}', { phone })}>
            <StrokeGlyph>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 5a2 2 0 0 1 2-2h2.28a1 1 0 0 1 .95.68l1.12 3.36a1 1 0 0 1-.5 1.2l-1.27.64a11.04 11.04 0 0 0 5.18 5.18l.64-1.27a1 1 0 0 1 1.2-.5l3.36 1.12a1 1 0 0 1 .68.95V19a2 2 0 0 1-2 2h-1C9.16 21 3 14.84 3 7V5z"
              />
            </StrokeGlyph>
          </a>
        </li>
      ) : null}
      {(email || phone) && links.length > 0 ? (
        <li aria-hidden className="mx-1 h-5 w-px bg-[#CFD9DE] dark:bg-[#2F3336]" />
      ) : null}
      {links.map((link) => {
        const platform = resolveLinkPlatform(link);
        const label = linkDisplayLabel(link, platform);
        const isBrand = !['OTHER', 'WEBSITE', 'CTA'].includes(platform.toUpperCase());
        return (
          <li key={link.id}>
            <a href={link.url} target="_blank" rel="noopener noreferrer" className={ICON_LINK} title={label} aria-label={label}>
              {isBrand ? (
                <SocialPlatformIcon platform={platform} className="h-[17px] w-[17px]" />
              ) : (
                <StrokeGlyph>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9"
                  />
                </StrokeGlyph>
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
