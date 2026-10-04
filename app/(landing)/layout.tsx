import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
  ],
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <div className="landing-body min-h-screen bg-white text-[#111111] antialiased">{children}</div>;
}
