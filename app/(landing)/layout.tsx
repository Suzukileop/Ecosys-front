import type { Viewport } from 'next';
import { LandingPreloaderGate } from '@/components/landing/LandingPreloaderGate';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#06060F',
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <LandingPreloaderGate>
      <div className="landing-body">{children}</div>
    </LandingPreloaderGate>
  );
}
