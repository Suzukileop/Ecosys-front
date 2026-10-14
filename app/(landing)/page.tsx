import type { Metadata } from 'next';
import { SiteNav } from '@/components/landing/home/SiteNav';
import { HeroSection } from '@/components/landing/home/HeroSection';
import { AudienceSection } from '@/components/landing/home/AudienceSection';
import { FeatureRows } from '@/components/landing/home/FeatureRows';
import { TemplatesSection } from '@/components/landing/home/TemplatesSection';
import { FeaturesGrid } from '@/components/landing/home/FeaturesGrid';
import { PricingSection } from '@/components/landing/home/PricingSection';
import { FaqSection } from '@/components/landing/home/FaqSection';
import { ClosingCta } from '@/components/landing/home/ClosingCta';
import { SiteFooter } from '@/components/landing/home/SiteFooter';
import { LOCALE_TAGS } from '@/lib/i18n/config';
import { getT } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  const title = t('Skraft — Build, showcase and sell');
  const description = t(
    'Create your portfolio, sell physical and digital products, and talk to clients directly — all in one place, with no middleman.',
  );
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: LOCALE_TAGS[t.locale].replace('-', '_'),
      images: [{ url: '/landing/v2/hero.jpg', width: 1024, height: 576 }],
    },
  };
}

export default function LandingPage() {
  return (
    <>
      <SiteNav />
      <main className="overflow-x-clip">
        <HeroSection />
        <AudienceSection />
        <FeatureRows />
        <TemplatesSection />
        <FeaturesGrid />
        <PricingSection />
        <FaqSection />
        <ClosingCta />
      </main>
      <SiteFooter />
    </>
  );
}
