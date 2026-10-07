import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ReactNode } from 'react';
import {
  faAddressBook,
  faAddressCard,
  faCircleQuestion,
  faCircleUser,
  faCompass,
  faEnvelope,
  faFileLines,
  faFolder,
  faGem,
  faIdBadge,
  faImages,
  faKeyboard,
  faPenToSquare,
  faRectangleList,
  faShareFromSquare,
  faUser,
} from '@fortawesome/free-regular-svg-icons';
import { normalizeCreatorAppRole, type CreatorAppRole } from '@/lib/creator-app-role';

export type ProfileSectionId =
  | 'about'
  | 'aboutPage'
  | 'aboutUs'
  | 'myRole'
  | 'experience'
  | 'strengths'
  | 'tools'
  | 'services'
  | 'products'
  | 'portfolio'
  | 'faq'
  | 'team'
  | 'gallery'
  | 'links'
  | 'location'
  | 'contact';

type ProfileSection = {
  id: ProfileSectionId;
  label: string;
  description: string;
};

const PROFILE_SECTIONS: ProfileSection[] = [
  {
    id: 'about',
    label: 'General Info',
    description: 'Name, username, bio, specialty, languages, availability, and location.',
  },
  {
    id: 'aboutPage',
    label: 'About',
    description: 'Specialty, languages, education, skills, strengths, systems, and interests.',
  },
  {
    id: 'aboutUs',
    label: 'About us',
    description: 'Company story, tasks, images, quote, and founder information.',
  },
  {
    id: 'myRole',
    label: 'My Role',
    description: 'Choose your role in the app to improve your experience.',
  },
  {
    id: 'experience',
    label: 'Experience',
    description: 'Highlight your background, years of experience, and proof points.',
  },
  {
    id: 'strengths',
    label: 'Stack',
    description: 'Technologies you work with — name, level, logo, and description (max 12).',
  },
  {
    id: 'tools',
    label: 'Tools',
    description: 'List the software and skills you master with proficiency levels (max 12).',
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
    label: 'Team',
    description: 'Présentez les membres de votre équipe, leurs rôles et leurs contacts.',
  },
  {
    id: 'gallery',
    label: 'Gallery',
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
];

/** Sidebar order: presentation → offers & showcase → reach & contact */
export const PROFILE_SECTION_GROUPS: ProfileSectionId[][] = [
  ['about', 'aboutPage', 'aboutUs', 'myRole', 'experience', 'strengths', 'tools'],
  ['services', 'products', 'portfolio', 'faq', 'team', 'gallery', 'links'],
  ['contact'],
];

/** Store “Information” tab: only identity / contact sections. */
export const STORE_INFORMATION_SECTION_IDS: ProfileSectionId[] = [
  'about',
  'myRole',
  'strengths',
  'tools',
  'links',
  'contact',
  'faq',
];

/** Career sections (experience, stack, tools) mean nothing for a shop or a recruiter. */
const HIDDEN_INFORMATION_SECTIONS_BY_ROLE: Partial<Record<CreatorAppRole, readonly ProfileSectionId[]>> = {
  SELLER: ['experience', 'strengths', 'tools'],
  RH_RECRUITER: ['experience', 'strengths', 'tools', 'faq'],
};

export function filterStoreInformationSectionsForRole(
  role: string | null | undefined,
  sections: readonly ProfileSectionId[] = STORE_INFORMATION_SECTION_IDS
): ProfileSectionId[] {
  const hidden = HIDDEN_INFORMATION_SECTIONS_BY_ROLE[normalizeCreatorAppRole(role)];
  if (!hidden) return [...sections];
  const hiddenSet = new Set(hidden);
  return sections.filter((id) => !hiddenSet.has(id));
}

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
  aboutPage: faCircleUser,
  aboutUs: faFileLines,
  myRole: faUser,
  experience: faIdBadge,
  strengths: faPenToSquare,
  tools: faKeyboard,
  services: faRectangleList,
  products: faGem,
  portfolio: faFolder,
  faq: faCircleQuestion,
  team: faAddressBook,
  gallery: faImages,
  links: faShareFromSquare,
  location: faCompass,
  contact: faEnvelope,
};

export function getProfileSection(id: ProfileSectionId): ProfileSection {
  return PROFILE_SECTION_BY_ID.get(id) ?? PROFILE_SECTIONS[0];
}

function NavIcon({
  variant = 'nav',
  active = false,
  inheritColor = false,
  children,
}: {
  variant?: 'nav' | 'header';
  active?: boolean;
  inheritColor?: boolean;
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
          ? 'text-[#FF5722]'
          : inheritColor
            ? 'text-current'
            : 'text-neutral-600 dark:text-neutral-400'
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
  inheritColor = false,
}: {
  sectionId: ProfileSectionId;
  variant?: 'nav' | 'header';
  active?: boolean;
  /** Idle icon takes the label's colour instead of its own neutral tone. */
  inheritColor?: boolean;
}) {
  const icon = PROFILE_SECTION_ICONS[sectionId] ?? faFileLines;
  const iconClass = variant === 'header' ? 'h-5 w-5' : 'h-[15px] w-[15px]';

  return (
    <NavIcon variant={variant} active={active} inheritColor={inheritColor}>
      {sectionId === 'tools' ? (
        <ScrewdriverWrenchOutlineIcon className={iconClass} />
      ) : (
        <FontAwesomeIcon icon={icon} className={iconClass} fixedWidth aria-hidden />
      )}
    </NavIcon>
  );
}

/** Font Awesome only ships screwdriver-wrench as solid; this stroke version matches the regular set. */
function ScrewdriverWrenchOutlineIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.1}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      <path d="M2.8 2.8 5.6 4 4 5.6z" />
      <path d="m5 5 5.2 5.2" />
      <path d="M13.5 16.3l2.8-2.8 5 5a2 2 0 0 1 0 2.8 2 2 0 0 1-2.8 0z" />
    </svg>
  );
}
