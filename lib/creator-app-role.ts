export const CREATOR_APP_ROLE_VALUES = [
  'GENERAL_MEMBER',
  'SERVICE_PROVIDER',
  'FREELANCER_STUDENT',
  'SELLER',
  'RH_RECRUITER',
] as const;

export type CreatorAppRole = (typeof CREATOR_APP_ROLE_VALUES)[number];

export const DEFAULT_CREATOR_APP_ROLE: CreatorAppRole = 'GENERAL_MEMBER';

/** Legacy roles merged into SERVICE_PROVIDER. */
const LEGACY_SERVICE_PROVIDER_ROLES = new Set(['JOB_SEEKER']);

export const CREATOR_APP_ROLE_OPTIONS: ReadonlyArray<{
  value: CreatorAppRole;
  label: string;
  description: string | readonly string[];
}> = [
  {
    value: 'GENERAL_MEMBER',
    label: 'General Member',
    description: 'Explore the platform and connect with the community.',
  },
  {
    value: 'SERVICE_PROVIDER',
    label: 'Service Provider / Freelancer',
    description: [
      'Manage your online storefront, portfolio, and profile to showcase your work and get contacted easily',
      'Attract your first clients, trigger new professional opportunities, and optimize your visibility',
      'Highlight your skills, publish your projects, and streamline how clients find you',
    ],
  },
  {
    value: 'FREELANCER_STUDENT',
    label: 'Student',
    description: 'Build your portfolio and showcase your work to attract your first clients.',
  },
  {
    value: 'SELLER',
    label: 'Seller',
    description: 'Showcase your catalog and present your products to an active community',
  },
  {
    value: 'RH_RECRUITER',
    label: 'RH / Recruiter / Client',
    description: 'Source talent and manage hiring workflows.',
  },
];

export function normalizeCreatorAppRole(raw: unknown): CreatorAppRole {
  if (raw == null) return DEFAULT_CREATOR_APP_ROLE;
  const text = String(raw).trim().toUpperCase().replace(/[\s-]+/g, '_');
  if (LEGACY_SERVICE_PROVIDER_ROLES.has(text)) return 'SERVICE_PROVIDER';
  if (text === 'STUDENT' || text === 'FREELANCER') return 'FREELANCER_STUDENT';
  if ((CREATOR_APP_ROLE_VALUES as readonly string[]).includes(text)) {
    return text as CreatorAppRole;
  }
  const key = String(raw)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (key.includes('seller') || key.includes('catalog')) return 'SELLER';
  if (key.includes('service') || key.includes('provider') || key.includes('job') || key.includes('seeker')) {
    return 'SERVICE_PROVIDER';
  }
  if (key.includes('freelancer') || key.includes('student')) return 'FREELANCER_STUDENT';
  if (
    key.includes('recruiter') ||
    key.includes('client') ||
    key === 'rh' ||
    key.startsWith('rh ')
  ) {
    return 'RH_RECRUITER';
  }
  if (key.includes('general') || key.includes('member')) return 'GENERAL_MEMBER';
  return DEFAULT_CREATOR_APP_ROLE;
}

export function creatorAppRoleLabel(role: CreatorAppRole | null | undefined): string {
  const normalized = normalizeCreatorAppRole(role);
  return CREATOR_APP_ROLE_OPTIONS.find((option) => option.value === normalized)?.label ?? 'General Member';
}

/** Tailwind ring color for the floating avatar status ring. */
export function creatorAppRoleRingClass(role: CreatorAppRole | null | undefined): string {
  switch (normalizeCreatorAppRole(role)) {
    case 'SERVICE_PROVIDER':
      return 'ring-orange-500';
    case 'FREELANCER_STUDENT':
      return 'ring-cyan-500';
    case 'SELLER':
      return 'ring-violet-500';
    case 'RH_RECRUITER':
      return 'ring-yellow-400';
    case 'GENERAL_MEMBER':
    default:
      return 'ring-gray-400';
  }
}

/** Border / accent classes for My Role cards (match avatar ring colors). */
export type CreatorAppRoleAccent = {
  border: string;
  borderSelected: string;
  iconIdle: string;
  iconSelected: string;
  check: string;
  focusRing: string;
};

export function creatorAppRoleAccent(role: CreatorAppRole | null | undefined): CreatorAppRoleAccent {
  switch (normalizeCreatorAppRole(role)) {
    case 'SERVICE_PROVIDER':
      return {
        border: 'border-orange-400 dark:border-orange-500/70',
        borderSelected: 'border-orange-500 dark:border-orange-400',
        iconIdle: 'bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300',
        iconSelected: 'bg-orange-500/15 text-orange-600 dark:bg-orange-400/20 dark:text-orange-300',
        check: 'bg-orange-500 text-white dark:bg-orange-400 dark:text-neutral-950',
        focusRing: 'focus-visible:ring-orange-500/40',
      };
    case 'FREELANCER_STUDENT':
      return {
        border: 'border-cyan-400 dark:border-cyan-500/70',
        borderSelected: 'border-cyan-500 dark:border-cyan-400',
        iconIdle: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-300',
        iconSelected: 'bg-cyan-500/15 text-cyan-600 dark:bg-cyan-400/20 dark:text-cyan-300',
        check: 'bg-cyan-500 text-white dark:bg-cyan-400 dark:text-neutral-950',
        focusRing: 'focus-visible:ring-cyan-500/40',
      };
    case 'SELLER':
      return {
        border: 'border-violet-400 dark:border-violet-500/70',
        borderSelected: 'border-violet-500 dark:border-violet-400',
        iconIdle: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300',
        iconSelected: 'bg-violet-500/15 text-violet-600 dark:bg-violet-400/20 dark:text-violet-300',
        check: 'bg-violet-500 text-white dark:bg-violet-400 dark:text-neutral-950',
        focusRing: 'focus-visible:ring-violet-500/40',
      };
    case 'RH_RECRUITER':
      return {
        border: 'border-yellow-400 dark:border-yellow-500/70',
        borderSelected: 'border-yellow-400 dark:border-yellow-300',
        iconIdle: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300',
        iconSelected: 'bg-yellow-500/15 text-yellow-700 dark:bg-yellow-400/20 dark:text-yellow-300',
        check: 'bg-yellow-400 text-neutral-950 dark:bg-yellow-300 dark:text-neutral-950',
        focusRing: 'focus-visible:ring-yellow-400/40',
      };
    case 'GENERAL_MEMBER':
    default:
      return {
        border: 'border-neutral-400 dark:border-neutral-500',
        borderSelected: 'border-neutral-500 dark:border-neutral-400',
        iconIdle: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
        iconSelected: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200',
        check: 'bg-neutral-500 text-white dark:bg-neutral-400 dark:text-neutral-950',
        focusRing: 'focus-visible:ring-neutral-500/40',
      };
  }
}

/** Hide Products sidebar (explore catalog). */
export const APP_ROLES_WITHOUT_PRODUCTS_MENU: readonly CreatorAppRole[] = [
  'SERVICE_PROVIDER',
  'RH_RECRUITER',
];

/** Hide My Product management (toggle + /my-products). */
export const APP_ROLES_WITHOUT_MY_PRODUCTS: readonly CreatorAppRole[] = [
  'SERVICE_PROVIDER',
  'FREELANCER_STUDENT',
  'RH_RECRUITER',
];

/** Hide Products tab in creator profile. */
export const APP_ROLES_WITHOUT_PROFILE_PRODUCTS: readonly CreatorAppRole[] = [
  'SERVICE_PROVIDER',
  'FREELANCER_STUDENT',
  'RH_RECRUITER',
];

/** Hide Service Provider sidebar. */
export const APP_ROLES_WITHOUT_SERVICE_PROVIDER_MENU: readonly CreatorAppRole[] = ['SELLER'];

/** Hide My Services management (toggle + /my-services). */
export const APP_ROLES_WITHOUT_MY_SERVICES: readonly CreatorAppRole[] = ['SELLER', 'RH_RECRUITER'];

/** Hide Services tab in creator profile. */
export const APP_ROLES_WITHOUT_PROFILE_SERVICES: readonly CreatorAppRole[] = [
  'SELLER',
  'RH_RECRUITER',
];

/** @deprecated Use APP_ROLES_WITHOUT_PRODUCTS_MENU */
export const APP_ROLES_WITHOUT_PRODUCTS = APP_ROLES_WITHOUT_PRODUCTS_MENU;
/** @deprecated Use APP_ROLES_WITHOUT_SERVICE_PROVIDER_MENU */
export const APP_ROLES_WITHOUT_SERVICE_PROVIDER = APP_ROLES_WITHOUT_SERVICE_PROVIDER_MENU;

export const CREATOR_APP_ROLE_CHANGED_EVENT = 'creator-app-role-changed';

function roleDenied(
  role: CreatorAppRole | null | undefined,
  denied: readonly CreatorAppRole[]
): boolean {
  if (role == null) return false;
  return (denied as readonly string[]).includes(normalizeCreatorAppRole(role));
}

/** Sidebar Products explore — `null` = show (buyers & non-creators). */
export function creatorCanAccessProductsMenu(role: CreatorAppRole | null | undefined): boolean {
  return !roleDenied(role, APP_ROLES_WITHOUT_PRODUCTS_MENU);
}

export function creatorCanAccessMyProducts(role: CreatorAppRole | null | undefined): boolean {
  return !roleDenied(role, APP_ROLES_WITHOUT_MY_PRODUCTS);
}

export function creatorCanAccessProfileProducts(role: CreatorAppRole | null | undefined): boolean {
  return !roleDenied(role, APP_ROLES_WITHOUT_PROFILE_PRODUCTS);
}

export function creatorCanAccessServiceProviderMenu(role: CreatorAppRole | null | undefined): boolean {
  return !roleDenied(role, APP_ROLES_WITHOUT_SERVICE_PROVIDER_MENU);
}

export function creatorCanAccessMyServices(role: CreatorAppRole | null | undefined): boolean {
  return !roleDenied(role, APP_ROLES_WITHOUT_MY_SERVICES);
}

export function creatorCanAccessProfileServices(role: CreatorAppRole | null | undefined): boolean {
  return !roleDenied(role, APP_ROLES_WITHOUT_PROFILE_SERVICES);
}

/**
 * Service-provider About fields (specialty, years, availability status/hours, response time)
 * and Information sections Why/Skills/FAQ — hidden for RH / Recruiter / Client.
 */
export function creatorShowsProviderAboutFields(role: CreatorAppRole | null | undefined): boolean {
  return normalizeCreatorAppRole(role) !== 'RH_RECRUITER';
}

export function dispatchCreatorAppRoleChanged(role: CreatorAppRole): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(CREATOR_APP_ROLE_CHANGED_EVENT, { detail: { appRole: role } })
  );
}
