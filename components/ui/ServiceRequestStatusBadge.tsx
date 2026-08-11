import { ServiceRequestStatus } from '@/types/ecosystem';

const styles: Record<ServiceRequestStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-900 ring-amber-200',
  IN_PROGRESS: 'bg-sky-100 text-sky-900 ring-sky-200',
  PROPOSED: 'bg-blue-100 text-blue-900 ring-blue-200',
  VALIDATED: 'bg-green-100 text-green-900 ring-green-200',
  REJECTED: 'bg-red-100 text-red-900 ring-red-200',
  COMPLETED: 'bg-gray-100 text-gray-800 ring-gray-200',
};

const labels: Record<ServiceRequestStatus, string> = {
  PENDING: 'En attente',
  IN_PROGRESS: 'En cours',
  PROPOSED: 'Proposition',
  VALIDATED: 'Validé',
  REJECTED: 'Rejeté',
  COMPLETED: 'Terminé',
};

export function ServiceRequestStatusBadge({ status }: { status: ServiceRequestStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status] ?? 'bg-gray-100 text-gray-800 ring-gray-200'}`}
    >
      {labels[status] ?? status}
    </span>
  );
}
