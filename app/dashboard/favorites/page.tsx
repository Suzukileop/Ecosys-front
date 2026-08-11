import { redirect } from 'next/navigation';

export default function DashboardFavoritesRedirect() {
  redirect('/marketplace/favorites');
}
