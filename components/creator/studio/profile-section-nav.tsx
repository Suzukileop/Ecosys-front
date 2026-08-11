import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ReactNode } from 'react';
import {
  faAddressBook,
  faAddressCard,
  faCircleQuestion,
  faCompass,
  faEnvelope,
  faFileLines,
  faFolder,
  faGem,
  faIdBadge,
  faImages,
  faPenToSquare,
  faRectangleList,
  faShareFromSquare,
  faStar,
  faThumbsUp,
} from '@fortawesome/free-regular-svg-icons';

export type ProfileSectionId =
  | 'about'
  | 'whyMe'
  | 'experience'
  | 'strengths'
  | 'services'
  | 'products'
  | 'portfolio'
  | 'faq'
  | 'team'
  | 'gallery'
  | 'links'
  | 'location'
  | 'contact'
  | 'reputation';

export type ProfileSection = {
  id: ProfileSectionId;
  label: string;
  description: string;
};

export const PROFILE_SECTIONS: ProfileSection[] = [
  {
    id: 'about',
    label: 'About',
    description: 'Explain your value proposition, gender, working languages, and location.',
  },
  {
    id: 'whyMe',
    label: 'Why choose me',
    description: 'Show what sets you apart with short stories and optional media.',
  },
  {
    id: 'experience',
    label: 'Experience',
    description: 'Highlight your background, years of experience, and proof points.',
  },
  {
    id: 'strengths',
    label: 'Skills & tools',
    description: 'List the skills and software you master (max 12).',
  },
  {
    id: 'services',
    label: 'Services',
    description: 'Describe what you offer, pricing hints, and typical deadlines.',
  },
  {
    id: 'products',
    label: 'Products',
    description: 'Select and order existing store products to feature on your portfolio.',
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    description: 'Choisissez jusqu’à 4 contenus publiés à mettre en avant sur votre portfolio.',
  },
  {
    id: 'faq',
    label: 'FAQ',
    description: 'Answer common questions from potential clients.',
  },
  {
    id: 'team',
    label: 'Équipe',
    description: 'Présentez les membres de votre équipe, leurs rôles et leurs contacts.',
  },
  {
    id: 'gallery',
    label: 'Galerie',
    description: 'Ajoutez des images et vidéos pour illustrer votre univers.',
  },
  {
    id: 'links',
    label: 'Links',
    description: 'Websites, social profiles, and CTAs. The first link becomes the primary button on your public profile.',
  },
  {
    id: 'location',
    label: 'Location',
    description: 'City, country, and timezone shown on your public profile.',
  },
  {
    id: 'contact',
    label: 'Contact',
    description: 'Professional email, phone, and address — control what visitors can see.',
  },
  {
    id: 'reputation',
    label: 'Reputation',
    description: 'Ratings and feedback from users who interacted with your creator profile.',
  },
];

/** Sidebar order: presentation → offers & showcase → reach & contact → reputation last */
export const PROFILE_SECTION_GROUPS: ProfileSectionId[][] = [
  ['about', 'whyMe', 'experience', 'strengths'],
  ['services', 'products', 'portfolio', 'faq', 'team', 'gallery', 'links'],
  ['contact', 'reputation'],
];

/** Store “Information” tab: only identity / contact / trust sections. */
export const STORE_INFORMATION_SECTION_IDS: ProfileSectionId[] = [
  'about',
  'links',
  'contact',
  'reputation',
];

export function filterProfileSectionGroups(
  groups: ProfileSectionId[][],
  allowed?: readonly ProfileSectionId[] | null
): ProfileSectionId[][] {
  if (!allowed || allowed.length === 0) return groups;
  const allowedSet = new Set(allowed);
  return groups
    .map((group) => group.filter((id) => allowedSet.has(id)))
    .filter((group) => group.length > 0);
}

const PROFILE_SECTION_BY_ID = new Map(PROFILE_SECTIONS.map((section) => [section.id, section]));

const PROFILE_SECTION_ICONS: Record<ProfileSectionId, IconDefinition> = {
  about: faAddressCard,
  whyMe: faStar,
  experience: faIdBadge,
  strengths: faPenToSquare,
  services: faRectangleList,
  products: faGem,
  portfolio: faFolder,
  faq: faCircleQuestion,
  team: faAddressBook,
  gallery: faImages,
  links: faShareFromSquare,
  location: faCompass,
  contact: faEnvelope,
  reputation: faThumbsUp,
};

export function getProfileSection(id: ProfileSectionId): ProfileSection {
  return PROFILE_SECTION_BY_ID.get(id) ?? PROFILE_SECTIONS[0];
}

function NavIcon({
  variant = 'nav',
  active = false,
  children,
}: {
  variant?: 'nav' | 'header';
  active?: boolean;
  children: ReactNode;
}) {
  const isHighlighted = variant === 'header' || active;

  if (variant === 'header') {
    return (
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
        aria-hidden
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center transition-colors ${
        isHighlighted
          ? 'text-[#F97316] dark:text-[#FB923C]'
          : 'text-neutral-900 dark:text-neutral-200'
      }`}
      aria-hidden
    >
      {children}
    </span>
  );
}

export function ProfileSectionNavIcon({
  sectionId,
  variant = 'nav',
  active = false,
}: {
  sectionId: ProfileSectionId;
  variant?: 'nav' | 'header';
  active?: boolean;
}) {
  const icon = PROFILE_SECTION_ICONS[sectionId] ?? faFileLines;
  const iconClass = variant === 'header' ? 'h-5 w-5' : 'h-[15px] w-[15px]';

  return (
    <NavIcon variant={variant} active={active}>
      <FontAwesomeIcon icon={icon} className={iconClass} fixedWidth aria-hidden />
    </NavIcon>
  );
}
