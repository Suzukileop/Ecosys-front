import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** Standalone upgrade / pricing — follows global html.dark via lp-brand-zone tokens. */
export default function UpgradeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lp-brand-zone min-h-screen transition-colors duration-300">
      {children}
    </div>
  );
}
