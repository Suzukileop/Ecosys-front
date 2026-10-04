import type { Metadata } from 'next';
import { SiteNav } from '@/components/landing/home/SiteNav';
import { HeroSection } from '@/components/landing/home/HeroSection';
import { AudienceSection } from '@/components/landing/home/AudienceSection';
import { FeatureRows } from '@/components/landing/home/FeatureRows';
import { PlansOverview } from '@/components/landing/home/PlansOverview';
import { PricingSection } from '@/components/landing/home/PricingSection';
import { FaqSection } from '@/components/landing/home/FaqSection';
import { ClosingCta } from '@/components/landing/home/ClosingCta';
import { SiteFooter } from '@/components/landing/home/SiteFooter';

const DESCRIPTION =
  'Create your portfolio, sell physical and digital products, and talk to clients directly — all in one place, with no middleman.';

export const metadata: Metadata = {
  title: 'Skraft — Build, showcase and sell',
  description: DESCRIPTION,
  openGraph: {
    title: 'Skraft — Build, showcase and sell',
    description: DESCRIPTION,
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/landing/v2/hero.jpg', width: 1024, height: 576 }],
  },
};

export default function LandingPage() {
  return (
    <>
      <SiteNav />
      <main className="overflow-x-clip">
        <HeroSection />
        <AudienceSection />
        <FeatureRows />
        <PlansOverview />
        <PricingSection />
        <FaqSection />
        <ClosingCta />
      </main>
      <SiteFooter />
    </>
  );
}
