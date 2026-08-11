import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function NotificationsLoading() {
  return (
    <DashboardHomeShell>
      <div className="mx-auto max-w-2xl">
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    </DashboardHomeShell>
  );
}
