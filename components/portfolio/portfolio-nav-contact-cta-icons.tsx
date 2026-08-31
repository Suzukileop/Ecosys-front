'use client';

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faArrowUp,
  faAt,
  faCalendar,
  faCommentDots,
  faEnvelope,
  faMobileScreen,
  faPaperPlane,
  faPhone,
  faPhoneVolume,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import {
  normalizePortfolioNavContactCtaIcon,
  type PortfolioNavContactCtaIcon,
} from '@/components/portfolio/portfolio-settings-types';

const CONTACT_CTA_ICON_MAP: Record<
  Exclude<
    PortfolioNavContactCtaIcon,
    | 'none'
    | 'phone-handset'
    | 'phone-incoming'
    | 'phone-outgoing'
    | 'arrow-up-right'
    | 'arrow-right'
    | 'arrow-up'
  >,
  IconDefinition
> = {
  phone: faPhone,
  smartphone: faMobileScreen,
  'phone-call': faPhoneVolume,
  mail: faEnvelope,
  chat: faCommentDots,
  at: faAt,
  calendar: faCalendar,
  send: faPaperPlane,
  user: faUser,
};

const DIRECTION_ICON_MAP: Record<
  Extract<PortfolioNavContactCtaIcon, 'arrow-up-right' | 'arrow-right' | 'arrow-up'>,
  { icon: IconDefinition; className?: string }
> = {
  'arrow-up-right': { icon: faArrowUp, className: 'rotate-45' },
  'arrow-right': { icon: faArrowRight },
  'arrow-up': { icon: faArrowUp },
};

export function PortfolioNavContactCtaGlyph({
  variant,
  className = 'h-4 w-4',
}: {
  variant: PortfolioNavContactCtaIcon;
  className?: string;
}) {
  const resolved = normalizePortfolioNavContactCtaIcon(variant, 'phone');
  if (resolved === 'none') return null;

  const direction = DIRECTION_ICON_MAP[resolved as keyof typeof DIRECTION_ICON_MAP];
  if (direction) {
    return (
      <FontAwesomeIcon
        icon={direction.icon}
        className={[className, direction.className].filter(Boolean).join(' ')}
        fixedWidth
        aria-hidden
      />
    );
  }

  const icon = CONTACT_CTA_ICON_MAP[resolved as keyof typeof CONTACT_CTA_ICON_MAP] ?? faPhone;
  return <FontAwesomeIcon icon={icon} className={className} fixedWidth aria-hidden />;
}

/** Icon-only contact buttons should always show a glyph — never an empty circle. */
export function resolvePortfolioNavContactCtaIcon(
  variant: PortfolioNavContactCtaIcon | undefined,
  opts?: { iconOnly?: boolean }
): PortfolioNavContactCtaIcon {
  const normalized = normalizePortfolioNavContactCtaIcon(variant, 'phone');
  if (normalized !== 'none') return normalized;
  if (opts?.iconOnly) return 'phone';
  return normalized;
}
