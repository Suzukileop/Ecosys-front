/* Families portfolios can pick by name — not needed on the landing / sign-in pages. */
import '@/lib/fonts/portfolio-fonts';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** Standalone upgrade / pricing — X palette ground (#FFF / #000), follows global html.dark. */
export default function UpgradeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {children}
    </div>
  );
}
