import { redirect } from 'next/navigation';

export default function DashboardPurchaseDetailRedirect() {
  redirect('/marketplace?tab=purchases');
}
