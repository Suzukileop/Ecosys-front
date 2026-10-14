import { Role } from '@/types/auth';

const roleColors: Record<Role, string> = {
  ROLE_ADMIN: 'bg-[#0F1419] text-white dark:bg-[#EFF3F4] dark:text-[#0F1419]',
  ROLE_CLIENT: 'bg-[#EFF3F4] text-[#0F1419] dark:bg-[#202327] dark:text-[#E7E9EA]',
  ROLE_CREATOR: 'bg-[#EFF3F4] text-[#0F1419] dark:bg-[#202327] dark:text-[#E7E9EA]',
};

const roleLabels: Record<Role, string> = {
  ROLE_ADMIN: 'Admin',
  ROLE_CLIENT: 'Client',
  ROLE_CREATOR: 'Creator',
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
