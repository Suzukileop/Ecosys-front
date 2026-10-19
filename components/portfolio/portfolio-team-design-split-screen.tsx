'use client';

/** Split screen: a readable editorial roster beside one continuous portrait surface. */
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import type { PortfolioTeamPresentationSettings } from '@/components/portfolio/portfolio-team-settings';
import type { PortfolioContentGutter } from '@/components/portfolio/portfolio-editorial-layout';
import { teamIndexLabel, useTeamSwipe } from '@/components/portfolio/portfolio-team-design-motion';
import { TeamMemberImage, TeamSocialLinks } from '@/components/portfolio/portfolio-team-design-primitives';
import { readableMix } from '@/components/portfolio/stack-designs/readable-ink';
import type { ProfileTeamMember } from '@/types/profile';
import { useT } from '@/lib/i18n/I18nProvider';

export function TeamSplitScreen({ members, presentation }: {
  members: ProfileTeamMember[];
  presentation: PortfolioTeamPresentationSettings;
  contentGutter?: PortfolioContentGutter;
}) {
  const t = useT();
  const baseId = useId();
  const [activeId, setActiveId] = useState(members[0]?.id ?? '');
  const [socialsFor, setSocialsFor] = useState<string | null>(null);
  const active = members.find(member => member.id === activeId) ?? members[0];
  const activeIndex = Math.max(0, members.findIndex(member => member.id === active?.id));
  const portraitRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(hoverTimer.current), []);
  const step = useCallback((direction: 1 | -1) => {
    if (members.length < 2) return;
    setActiveId(current => {
      const index = Math.max(0, members.findIndex(member => member.id === current));
      return members[(index + direction + members.length) % members.length].id;
    });
  }, [members]);
  useTeamSwipe(portraitRef, step, members.length < 2);

  if (!active) return null;
  // Unframed text sits on the section surface, not the unused card background.
  const surface = presentation.teamPalette?.fond ?? (presentation.activeColorMode === 'dark' ? '#0a0a0a' : '#fff');
  const strong = readableMix(presentation.nameColor, 100, surface);
  const muted = readableMix(presentation.responsibilityColor, 100, surface);
  const portraitRight = presentation.splitPortraitSide !== 'left';
  const revealSocials = presentation.splitSocialsReveal !== false;
  const socialsVisible = !revealSocials || socialsFor === active.id;
  const hasSocials = presentation.showSocials && active.socialLinks?.some(link => link.url.trim());
  const socialSurface = ['minimal', 'outline'].includes(presentation.socialIconStyle) ? surface : presentation.socialBackgroundColor;
  const socialPresentation = { ...presentation, socialIconColor: readableMix(presentation.socialIconColor, 100, socialSurface) };
  const radius = { none: 'rounded-none', sm: 'rounded-xl', md: 'rounded-[2rem]', lg: 'rounded-[3rem]' }[presentation.splitPanelRadius ?? 'none'];
  const shadow = { none: '', soft: 'shadow-xs', medium: 'shadow-lg shadow-black/10', strong: 'shadow-2xl shadow-black/20' }[presentation.cardShadow];
  const onKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    clearTimeout(hoverTimer.current);
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? members.length - 1 :
      (activeIndex + (['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1) + members.length) % members.length;
    setActiveId(members[index].id);
    buttonRefs.current[index]?.focus();
  };

  return (
    <article className="team-split"
      data-portrait-right={portraitRight} data-with-image={presentation.showImage}
      data-roster-size={members.length > 8 ? 'large' : members.length > 5 ? 'medium' : 'small'} style={{ color: strong }}>
      <div className="team-split-text">
        <ul className="team-split-list" role="tablist" aria-orientation="vertical"
          aria-label={t('Team members')} onKeyDown={onKeyDown} data-team-reveal="">
          {members.map((member, index) => (
            <li key={member.id} role="presentation">
              <button ref={node => { buttonRefs.current[index] = node; }} type="button" role="tab"
                id={`${baseId}-tab-${index}`} aria-selected={member.id === active.id} aria-controls={`${baseId}-panel`}
                tabIndex={member.id === active.id ? 0 : -1} className="team-split-name" data-pf-no-color-transition=""
                style={{ color: member.id === active.id ? strong : muted }}
                onClick={() => { clearTimeout(hoverTimer.current); setActiveId(member.id); }}
                onFocus={() => { clearTimeout(hoverTimer.current); setActiveId(member.id); }}
                onPointerEnter={event => {
                  if (event.pointerType !== 'mouse' || event.currentTarget.parentElement?.parentElement?.contains(document.activeElement)) return;
                  clearTimeout(hoverTimer.current);
                  hoverTimer.current = setTimeout(() => setActiveId(member.id), 180);
                }} onPointerLeave={() => clearTimeout(hoverTimer.current)}>
                {presentation.splitShowNumbers !== false && <span className="team-split-index" aria-hidden="true">{teamIndexLabel(index)}</span>}
                <span className="team-split-name-text">{member.name}</span>
                <span className="team-split-current" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
        <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-tab-${activeIndex}`}
          tabIndex={0} className="team-split-caption" data-team-reveal="">
          <p className="team-split-count" style={{ color: muted }} aria-live="polite" aria-atomic="true">
            {presentation.splitShowNumbers !== false && <span>{teamIndexLabel(activeIndex)} / {teamIndexLabel(members.length - 1)}</span>}
            <span className="sr-only">{active.name}</span>
          </p>
          {presentation.showResponsibility && active.responsibility.trim() && (
            <p className="team-split-role" style={{ color: muted }}>{active.responsibility}</p>
          )}
          {hasSocials && (
            <div className="team-split-socials">
              {revealSocials && (
                <button type="button" className="team-split-social-toggle" aria-expanded={socialsVisible}
                  aria-controls={`${baseId}-socials`} onClick={() => setSocialsFor(socialsVisible ? null : active.id)}>
                  {t('Social links')} <span aria-hidden="true">{socialsVisible ? '−' : '+'}</span>
                </button>
              )}
              <div id={`${baseId}-socials`} className="team-split-social-reveal" data-visible={socialsVisible}
                data-split-socials="" inert={!socialsVisible} aria-hidden={!socialsVisible} data-pf-no-color-transition="">
                <div><TeamSocialLinks member={active} presentation={socialPresentation} align="justify-start" spacing="wide" /></div>
              </div>
            </div>
          )}
        </div>
      </div>
      {presentation.showImage && (
        <div ref={portraitRef} className={`team-split-portrait ${radius} ${shadow}`} data-tone={presentation.splitPhotoTone ?? 'monochrome'}>
          {members.map(member => (
            <div key={member.id} className="team-split-layer" data-active={member.id === active.id}
              aria-hidden={member.id !== active.id} data-pf-no-color-transition="">
              <TeamMemberImage member={member} presentation={presentation} fill sizes="(max-width: 1023px) 100vw, 50vw" />
            </div>
          ))}
          {presentation.showName && <div className="team-split-photo-caption" aria-hidden="true"><span>{active.name}</span></div>}
        </div>
      )}
    </article>
  );
}
