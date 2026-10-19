/* Families portfolios can pick by name — not needed on the landing / sign-in pages. */
import '@/lib/fonts/portfolio-fonts';
import { HeaderAuth } from '@/components/layout/HeaderAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <HeaderAuth />
      {children}
    </div>
  );
}
