'use client';
import type { ReactNode } from 'react';
import { teamCardFrameClass, teamCardStyle, teamSocialAlignClass, type PortfolioTeamPresentationSettings } from '@/components/portfolio/portfolio-team-settings';
import { TeamMemberImage, TeamSocialLinks } from '@/components/portfolio/portfolio-team-design-primitives';
import { teamIndexLabel } from '@/components/portfolio/portfolio-team-design-motion';
import type { ProfileTeamMember } from '@/types/profile';
const TEAM_VEIL_RATIOS = { square: 'aspect-square', soft: 'aspect-[4/5]', portrait: 'aspect-[3/4]', tall: 'aspect-[2/3]', xtall: 'aspect-[9/16]' };

export function TeamHoverVeilCard({
  member, presentation, index, widthClass, renderPortrait,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  index: number;
  widthClass: string;
  renderPortrait?: (member: ProfileTeamMember, index: number) => ReactNode;
}) {
  const align = presentation.listAlign ?? 'center';
  const overlayAlign = align === 'left' ? 'items-start text-left' : align === 'right' ? 'items-end text-right' : 'items-center text-center';
  const hasSocials = presentation.showSocials && member.socialLinks?.some(link => link.url.trim());
  return (
    <article className={`team-veil-card group relative w-full ${widthClass} ${teamCardFrameClass(presentation)}`}
      tabIndex={presentation.showImage ? 0 : undefined} aria-label={presentation.showImage ? member.name : undefined}
      data-always-visible={presentation.profileCardsPanel === 'always'} data-with-image={presentation.showImage} data-team-reveal="" style={teamCardStyle(presentation)}>
      <div className="team-veil-stack">
        {presentation.showImage && (
          <div className={`team-veil-media ${TEAM_VEIL_RATIOS[presentation.profileCardsRatio ?? 'soft']}`}>
            <div className="team-veil-photo" data-pf-no-color-transition="">
              {renderPortrait ? renderPortrait(member, index) : <TeamMemberImage member={member} presentation={presentation} fill
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" />}
            </div>
          </div>
        )}
        <div className={`team-veil-caption ${overlayAlign}`} data-pf-no-color-transition="">
          <span className="team-veil-accent" aria-hidden="true" />
          {presentation.showName && <h3 className="team-veil-name">{member.name}</h3>}
          {presentation.showResponsibility && member.responsibility.trim() && (
            <p className="team-veil-role">{member.responsibility}</p>
          )}
          {hasSocials && <div className="team-veil-socials">
            <TeamSocialLinks member={member} presentation={{...presentation, socialIconColor:'#ffffff',
              socialBackgroundColor:'transparent', socialIconStyle:'minimal'}} align={teamSocialAlignClass(align)} />
          </div>}
        </div>
        {presentation.showImage && presentation.profileCardsShowNumbers !== false && <span className="team-veil-index" aria-hidden="true">{teamIndexLabel(index)}</span>}
      </div>
    </article>
  );
}
