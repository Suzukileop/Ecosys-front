export const CREATOR_APP_ROLE_VALUES = [
  'GENERAL_MEMBER',
  'SERVICE_PROVIDER',
  'FREELANCER_STUDENT',
  'JOB_SEEKER',
  'RH_RECRUITER',
] as const;

export type CreatorAppRole = (typeof CREATOR_APP_ROLE_VALUES)[number];

export const DEFAULT_CREATOR_APP_ROLE: CreatorAppRole = 'GENERAL_MEMBER';

export const CREATOR_APP_ROLE_OPTIONS: ReadonlyArray<{
  value: CreatorAppRole;
  label: string;
  description: string;
}> = [
  {
    value: 'GENERAL_MEMBER',
    label: 'General Member',
    description: 'Explore the platform and connect with the community.',
  },
  {
    value: 'SERVICE_PROVIDER',
    label: 'Service Provider',
    description: 'Manage your online storefront and optimize your profile to get contacted easily.',
  },
  {
    value: 'FREELANCER_STUDENT',
    label: 'Freelancer / Student',
    description: 'Build your portfolio and showcase your work to attract your first clients.',
  },
  {
    value: 'JOB_SEEKER',
    label: 'Job Seeker',
    description: 'Highlight your skills by publishing your work to trigger new opportunities.',
  },
  {
    value: 'RH_RECRUITER',
    label: 'RH / Recruiter',
    description: 'Source talent and manage hiring workflows.',
  },
];

export function normalizeCreatorAppRole(raw: unknown): CreatorAppRole {
  if (raw == null) return DEFAULT_CREATOR_APP_ROLE;
  const text = String(raw).trim().toUpperCase().replace(/[\s-]+/g, '_');
  if ((CREATOR_APP_ROLE_VALUES as readonly string[]).includes(text)) {
    return text as CreatorAppRole;
  }
  const key = String(raw)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (key.includes('service') || key.includes('provider')) return 'SERVICE_PROVIDER';
  if (key.includes('freelancer') || key.includes('student')) return 'FREELANCER_STUDENT';
  if (key.includes('job') || key.includes('seeker')) return 'JOB_SEEKER';
  if (key.includes('recruiter') || key === 'rh' || key.startsWith('rh ')) return 'RH_RECRUITER';
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
    case 'JOB_SEEKER':
      return 'ring-emerald-500';
    case 'RH_RECRUITER':
      return 'ring-yellow-400';
    case 'GENERAL_MEMBER':
    default:
      return 'ring-gray-400';
  }
}
