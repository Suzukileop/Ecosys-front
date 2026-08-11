import { Role } from '@/types/auth';

const roleColors: Record<Role, string> = {
  ROLE_ADMIN: 'bg-red-100 text-red-800 border border-red-200',
  ROLE_CLIENT: 'bg-blue-100 text-blue-800 border border-blue-200',
  ROLE_CREATOR: 'bg-green-100 text-green-800 border border-green-200',
  ROLE_AGENT: 'bg-orange-100 text-orange-800 border border-orange-200',
};

const roleLabels: Record<Role, string> = {
  ROLE_ADMIN: 'Admin',
  ROLE_CLIENT: 'Client',
  ROLE_CREATOR: 'Créateur',
  ROLE_AGENT: 'Agent',
};

interface BadgeProps {
  role: Role;
}

export function Badge({ role }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[role]}`}
    >
      {roleLabels[role]}
    </span>
  );
}
