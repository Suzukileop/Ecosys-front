import { cookies } from 'next/headers';
import { MarketplaceShell } from '@/components/marketplace/MarketplaceShell';

export default async function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const authenticated = Boolean(cookieStore.get('refresh_token'));

  return <MarketplaceShell authenticated={authenticated}>{children}</MarketplaceShell>;
}
