import { redirect } from 'next/navigation';

export default function DashboardPurchasesRedirect() {
  redirect('/marketplace/purchases');
}
