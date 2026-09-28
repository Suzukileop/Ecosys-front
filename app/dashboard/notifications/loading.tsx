import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function NotificationsLoading() {
  return (
    <DashboardHomeShell>
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-0">
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    </DashboardHomeShell>
  );
}
