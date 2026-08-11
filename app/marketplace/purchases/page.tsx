import { redirect } from 'next/navigation';

export default function MarketplacePurchasesRedirect() {
  redirect('/marketplace?tab=purchases');
}
