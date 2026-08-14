import { redirect } from 'next/navigation';
import { DASHBOARD_HOME_PATH } from '@/components/layout/dashboard/navConfig';

/** Overview hub is hidden — send everyone to the home/news feed. */
export default function DashboardOverviewPage() {
  redirect(DASHBOARD_HOME_PATH);
}
