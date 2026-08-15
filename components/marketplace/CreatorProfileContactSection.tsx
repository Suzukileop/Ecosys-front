import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  ExternalLinkChevron,
  NeutralIconBadge,
  SocialPlatformIcon,
  socialPlatformBrandClass,
  type NeutralIconName,
} from '@/components/marketplace/creator-profile-social-icons';
import { formatAvailabilityDisplay } from '@/lib/availabilityHours';
import { formatPhoneDisplay } from '@/lib/phone';
import { formatServiceDelivery, formatServicePrice } from '@/lib/profile-services';
import type { ProfileMediaBlock } from '@/types/ecosystem';
import type { MarketplaceCreatorPublicProfile } from '@/types/marketplace';
import { ContentMediaPreview } from '@/components/creator/creator-content-media';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import { SOCIAL_PLATFORMS } from '@/types/ecosystem';

type CreatorProfileContactSectionProps = {
  creatorId: string;
  profile: MarketplaceCreatorPublicProfile;
  isAuthenticated: boolean;
  locationLabel?: string | null;
};

function socialLabel(platform: string): string {
  return SOCIAL_PLATFORMS.find((p) => p.value === platform)?.label ?? platform;
}

function websiteHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function formatMemberSince(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

function resolveDisplayLinks(profile: MarketplaceCreatorPublicProfile) {
  if (profile.profileLinks && profile.profileLinks.length > 0) {
    return profile.profileLinks.filter((link) => link.url.trim());
  }
  const legacy: Array<{ id: string; label: string; url: string; type: string; platform?: string | null }> = [];
  if (profile.websiteUrl?.trim()) {
    legacy.push({ id: 'website', label: 'Site web', url: profile.websiteUrl.trim(), type: 'WEBSITE' });
  }
  if (profile.ctaUrl?.trim()) {
    legacy.push({
      id: 'cta',
      label: profile.ctaLabel?.trim() || 'En savoir plus',
      url: profile.ctaUrl.trim(),
      type: 'CTA',
    });
  }
  if (profile.socialLinks) {
    for (const [platform, url] of Object.entries(profile.socialLinks)) {
      if (url.trim()) {
        legacy.push({ id: platform, label: socialLabel(platform), url, type: 'SOCIAL', platform });
      }
    }
  }
  return legacy;
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500">
      {children}
    </h3>
  );
}

function InfoPanel({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/80">
      {children}
    </div>
  );
}

function InfoPanelSection({
  children,
  bordered = true,
  id,
}: {
  children: ReactNode;
  bordered?: boolean;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`px-5 py-5 sm:px-6 sm:py-6 ${bordered ? 'border-t border-neutral-200 first:border-t-0 dark:border-neutral-800' : ''} ${id ? 'scroll-mt-24' : ''}`}
    >
      {children}
    </div>
  );
}

function LocationFeaturedBlock({ children }: { children: ReactNode }) {
  return (
    <div className="theme-accent-border flex h-full min-h-[11rem] flex-col justify-between rounded-2xl border border-orange-300/50 bg-orange-50/30 p-5 dark:border-orange-500/30 dark:bg-orange-500/5">
      <NeutralIconBadge name="location" size="lg" accent />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Localisation
        </p>
        <p className="mt-3 text-xl font-semibold leading-snug text-neutral-900 dark:text-neutral-100 sm:text-2xl">
          {children}
        </p>
      </div>
    </div>
  );
}

function CompactInfoRow({
  icon,
  label,
  children,
}: {
  icon: NeutralIconName;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-4">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium leading-relaxed text-neutral-900 dark:text-neutral-100 sm:text-base">
          {children}
        </p>
      </div>
      <NeutralIconBadge name={icon} size="sm" />
    </div>
  );
}

function ContactDirectCard({
  href,
  icon,
  label,
  value,
}: {
  href: string;
  icon: NeutralIconName;
  label: string;
  value: string;
}) {
  return (
    <a
      href={href}
      className="group flex min-h-[6.5rem] flex-col justify-between rounded-2xl border border-neutral-200/80 bg-gradient-to-br from-neutral-50/90 to-white p-4 transition hover:border-orange-300/70 hover:from-orange-50/40 hover:to-white hover:shadow-sm dark:border-neutral-800 dark:from-neutral-900/70 dark:to-neutral-900/40 dark:hover:border-orange-500/35 dark:hover:from-orange-500/5 dark:hover:to-neutral-900"
    >
      <div className="flex items-center gap-2.5">
        <NeutralIconBadge name={icon} size="sm" />
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400 dark:text-neutral-500">
          {label}
        </span>
      </div>
      <p className="mt-3 break-all text-base font-semibold leading-snug text-neutral-900 dark:text-white sm:text-lg">
        {value}
      </p>
    </a>
  );
}

function StoryBlockCard({
  block,
  showMedia = true,
}: {
  block: ProfileMediaBlock;
  showMedia?: boolean;
}) {
  const tools: string[] = [];
  const toolIcons: Record<string, string> = {};
  for (const item of block.tools ?? []) {
    let name = '';
    let iconUrl: string | null = null;
    if (typeof item === 'string') {
      name = item.trim();
    } else if (item && typeof item === 'object') {
      name = String(item.name ?? item.value ?? '').trim();
      iconUrl =
        typeof item.iconUrl === 'string' && item.iconUrl.trim() ? item.iconUrl.trim() : null;
    }
    if (!name) continue;
    if (tools.some((existing) => existing.toLowerCase() === name.toLowerCase())) continue;
    tools.push(name);
    if (iconUrl) toolIcons[name] = iconUrl;
    if (tools.length >= 8) break;
  }

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
      {block.title?.trim() ? (
        <p className="mb-2 font-semibold text-neutral-900 dark:text-white">{block.title.trim()}</p>
      ) : null}
      <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-800 dark:text-neutral-100 sm:text-base">
        {block.text}
      </p>
      {tools.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {tools.map((tool) => (
            <span
              key={tool}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white py-1 pl-1 pr-2.5 text-xs font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200"
              title={tool}
            >
              <CreatorToolLogo label={tool} iconUrl={toolIcons[tool] ?? null} size={20} />
              <span className="max-w-[8rem] truncate">{tool}</span>
            </span>
          ))}
        </div>
      ) : null}
      {showMedia && block.mediaUrl ? (
        <div className="mt-4 overflow-hidden rounded-xl">
          <ContentMediaPreview locale="en" mediaUrl={block.mediaUrl} mediaType="FILE" large fluid />
        </div>
      ) : null}
    </div>
  );
}

function UnifiedLinkCard({
  link,
  index,
}: {
  link: { id: string; label: string; url: string; type: string; platform?: string | null };
  index: number;
}) {
  const isSocial = link.type === 'SOCIAL';
  const platform = link.platform;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white p-4 transition hover:border-orange-300/60 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:border-orange-500/35"
    >
      {isSocial && platform ? (
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${socialPlatformBrandClass(platform)}`}
        >
          <SocialPlatformIcon platform={platform} className="h-6 w-6" />
        </div>
      ) : (
        <NeutralIconBadge name="link" size="sm" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400 dark:text-neutral-500">
          {index === 0 ? 'Lien principal' : 'Lien'}
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-neutral-900 dark:text-white sm:text-base">
          {link.label}
        </p>
        <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{websiteHostname(link.url)}</p>
      </div>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 transition group-hover:bg-orange-50 group-hover:text-orange-600 dark:bg-neutral-800 dark:group-hover:bg-orange-500/15 dark:group-hover:text-orange-400">
        <ExternalLinkChevron className="h-4 w-4" />
      </span>
    </a>
  );
}

export function CreatorProfileContactSection({
  creatorId,
  profile,
  isAuthenticated,
  locationLabel,
}: CreatorProfileContactSectionProps) {
  const displayLinks = resolveDisplayLinks(profile);
  const primaryLink = displayLinks[0] ?? null;
  const contactPhone =
    profile.contactPhones?.map((entry) => entry.value.trim()).find(Boolean) ||
    profile.contactPhone?.trim() ||
    profile.phone?.trim() ||
    '';
  const contactEmail =
    profile.contactEmails?.map((entry) => entry.value.trim()).find(Boolean) ||
    profile.contactEmail?.trim() ||
    '';
  const contactAddress =
    profile.contactAddresses?.map((entry) => entry.value.trim()).find(Boolean) ||
    profile.contactAddress?.trim() ||
    '';
  const hasPhone = Boolean(contactPhone);
  const hasEmail = Boolean(contactEmail);
  const availabilityDisplay = formatAvailabilityDisplay(profile.availabilityHours, profile.timezoneId);
  const hasAvailability = Boolean(availabilityDisplay);
  const hasAddress = Boolean(contactAddress);
  const spokenLanguages = profile.spokenLanguages ?? [];
  const legacyLanguages = profile.languages?.trim();
  const hasLanguages = spokenLanguages.length > 0 || Boolean(legacyLanguages);
  const hasLocation = Boolean(locationLabel?.trim());
  const memberSinceLabel = formatMemberSince(profile.memberSince);
  const hasGender = Boolean(profile.gender?.trim());
  const hasResponseTime = Boolean(profile.responseTimeLabel?.trim());

  const whyMeBlocks = profile.whyMeBlocks ?? [];
  const experienceBlocks = profile.experienceBlocks ?? [];
  const services = profile.profileServices ?? [];
  const faqItems = profile.faqItems ?? [];
  const hasWhyMe = whyMeBlocks.length > 0;
  const hasExperience = experienceBlocks.length > 0;
  const hasYears = profile.yearsOfExperience != null;
  const strengths = profile.strengthsToolsMastered ?? [];
  const hasStrengths = strengths.length > 0;
  const hasServices = services.length > 0;
  const hasFaq = faqItems.length > 0;
  const hasLinks = displayLinks.length > 0;
  const hasAboutMeta = hasGender || hasLanguages || memberSinceLabel || hasResponseTime || hasAvailability;
  const hasProfileInfo = hasAboutMeta || hasLocation || hasAddress || hasYears || hasStrengths;
  const hasDirectContact = hasEmail || hasPhone;
  const hasAnyPublicInfo =
    hasProfileInfo ||
    hasDirectContact ||
    hasLinks ||
    hasWhyMe ||
    hasExperience ||
    hasServices ||
    hasFaq;
  const showMembersHint = !isAuthenticated && profile.membersOnlyContactAvailable;

  const profileDetailRows: Array<{ icon: NeutralIconName; label: string; value: ReactNode; key: string }> = [];
  if (hasGender) {
    profileDetailRows.push({ icon: 'languages', label: 'Genre', value: profile.gender, key: 'gender' });
  }
  if (hasLanguages) {
    profileDetailRows.push({
      icon: 'languages',
      label: 'Langues de travail',
      value: spokenLanguages.length > 0 ? spokenLanguages.join(', ') : legacyLanguages,
      key: 'languages',
    });
  }
  if (memberSinceLabel) {
    profileDetailRows.push({ icon: 'clock', label: 'Membre depuis', value: memberSinceLabel, key: 'memberSince' });
  }
  if (hasResponseTime) {
    profileDetailRows.push({
      icon: 'clock',
      label: 'Délai de réponse',
      value: profile.responseTimeLabel,
      key: 'responseTime',
    });
  }
  if (hasAvailability) {
    profileDetailRows.push({
      icon: 'clock',
      label: 'Disponibilité',
      value: availabilityDisplay,
      key: 'availability',
    });
  }
  if (hasYears) {
    profileDetailRows.push({
      icon: 'clock',
      label: 'Years of experience',
      value: `${profile.yearsOfExperience} year${profile.yearsOfExperience === 1 ? '' : 's'}`,
      key: 'years',
    });
  }
  if (hasAddress) {
    profileDetailRows.push({
      icon: 'address',
      label: 'Adresse',
      value: <span className="whitespace-pre-line">{contactAddress}</span>,
      key: 'address',
    });
  }

  const directContacts: Array<{ key: string; href: string; icon: NeutralIconName; label: string; value: string }> = [];
  if (hasEmail) {
    directContacts.push({
      key: 'email',
      href: `mailto:${contactEmail}`,
      icon: 'email',
      label: 'Email',
      value: contactEmail,
    });
  }
  if (hasPhone) {
    directContacts.push({
      key: 'phone',
      href: `tel:${contactPhone}`,
      icon: 'phone',
      label: 'Téléphone',
      value: formatPhoneDisplay(contactPhone),
    });
  }

  return (
    <section aria-labelledby="info-heading">
      <h2 id="info-heading" className="sr-only">
        Informations publiques
      </h2>

      {primaryLink ? (
        <div className="mb-4">
          <a
            href={primaryLink.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-orange-500 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-orange-600 sm:w-auto"
          >
            {primaryLink.label}
          </a>
        </div>
      ) : null}

      {!hasAnyPublicInfo && !showMembersHint ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-5 py-10 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Aucune information publique pour le moment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <InfoPanel>
            {hasWhyMe ? (
              <InfoPanelSection bordered={false}>
                <SectionHeading>Why choose me</SectionHeading>
                <div className="space-y-3">
                  {whyMeBlocks.map((block) => (
                    <StoryBlockCard key={block.id} block={block} showMedia={false} />
                  ))}
                </div>
              </InfoPanelSection>
            ) : null}

            {hasExperience ? (
              <InfoPanelSection bordered={!hasWhyMe}>
                <SectionHeading>Experience</SectionHeading>
                <div className="space-y-3">
                  {experienceBlocks.map((block) => (
                    <StoryBlockCard key={block.id} block={block} />
                  ))}
                </div>
              </InfoPanelSection>
            ) : null}

            {hasServices ? (
              <InfoPanelSection id="services" bordered={!hasWhyMe && !hasExperience}>
                <SectionHeading>Services</SectionHeading>
                <div className="grid gap-3 sm:grid-cols-2">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/40"
                    >
                      <p className="font-semibold text-neutral-900 dark:text-white">{service.title}</p>
                      {service.description ? (
                        <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                          {service.description}
                        </p>
                      ) : null}
                      {Array.isArray(service.tasks) && service.tasks.filter(Boolean).length > 0 ? (
                        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-600 dark:text-neutral-300">
                          {service.tasks
                            .map((task) => task.trim())
                            .filter(Boolean)
                            .map((task) => (
                              <li key={task}>{task}</li>
                            ))}
                        </ul>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-neutral-500">
                        <span>{formatServicePrice(service)}</span>
                        {formatServiceDelivery(service) ? (
                          <span>{formatServiceDelivery(service)}</span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </InfoPanelSection>
            ) : null}

            {(hasProfileInfo || hasStrengths) ? (
              <InfoPanelSection bordered={!hasWhyMe && !hasExperience && !hasServices}>
                <SectionHeading>Profil</SectionHeading>
                {hasStrengths ? (
                  <div className="mb-4">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      Skills & tools
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {strengths.map((item) => {
                        const label = typeof item === 'string' ? item : item.name;
                        return (
                          <span
                            key={label}
                            className="inline-flex items-center gap-2.5 rounded-full border border-neutral-200 bg-neutral-50 py-2 pl-2 pr-3 text-sm font-medium text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                          >
                            <CreatorToolLogo label={label} size={28} />
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
                {(hasLocation || profileDetailRows.length > 0) && (
                  <div className="grid gap-3 lg:grid-cols-5">
                    {hasLocation ? (
                      <div className="lg:col-span-2">
                        <LocationFeaturedBlock>{locationLabel}</LocationFeaturedBlock>
                      </div>
                    ) : null}

                    {profileDetailRows.length > 0 ? (
                      <div className={hasLocation ? 'lg:col-span-3' : 'lg:col-span-5'}>
                        <div className="h-full overflow-hidden rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
                          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                            {profileDetailRows.map((row) => (
                              <CompactInfoRow key={row.key} icon={row.icon} label={row.label}>
                                {row.value}
                              </CompactInfoRow>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </InfoPanelSection>
            ) : null}

            {hasFaq ? (
              <InfoPanelSection>
                <SectionHeading>FAQ</SectionHeading>
                <div className="space-y-3">
                  {faqItems.map((item) => (
                    <details
                      key={item.id}
                      className="rounded-2xl border border-neutral-200/80 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/40"
                    >
                      <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-neutral-900 dark:text-white [&::-webkit-details-marker]:hidden">
                        {item.question}
                      </summary>
                      <div className="border-t border-neutral-200 px-4 py-3 text-sm leading-relaxed text-neutral-600 dark:border-neutral-800 dark:text-neutral-300">
                        {item.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </InfoPanelSection>
            ) : null}

            {hasDirectContact ? (
              <InfoPanelSection>
                <SectionHeading>Coordonnées</SectionHeading>
                <div
                  className={`grid gap-3 ${directContacts.length > 1 ? 'sm:grid-cols-2' : 'sm:max-w-md'}`}
                >
                  {directContacts.map((item) => (
                    <ContactDirectCard
                      key={item.key}
                      href={item.href}
                      icon={item.icon}
                      label={item.label}
                      value={item.value}
                    />
                  ))}
                </div>
              </InfoPanelSection>
            ) : null}

            {hasLinks ? (
              <InfoPanelSection>
                <SectionHeading>Liens</SectionHeading>
                <div className="grid gap-3 sm:grid-cols-2">
                  {displayLinks.map((link, index) => (
                    <UnifiedLinkCard key={link.id} link={link} index={index} />
                  ))}
                </div>
              </InfoPanelSection>
            ) : null}
          </InfoPanel>

          {showMembersHint ? (
            <p className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-neutral-400">
              <Link
                href={`/login?redirect=${encodeURIComponent(`/marketplace/${creatorId}`)}`}
                className="font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400"
              >
                Connectez-vous
              </Link>{' '}
              pour voir d&apos;autres informations réservées aux membres.
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
