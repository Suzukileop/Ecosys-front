import { redirect } from 'next/navigation';

export default function MarketplaceFavoritesRedirect() {
  redirect('/marketplace?tab=favorites');
}
