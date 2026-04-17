import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { TrustBadges } from '@/components/landing/TrustBadges';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const metadata = {
  title: 'CookieConsent — GDPR Cookie Compliance Made Simple',
  description:
    'Automatically manage consent, block cookies, and stay GDPR compliant. Add one script and go.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingNav />
      <main>
        <HeroSection />
        <TrustBadges />
        <HowItWorksSection />
        <FeaturesSection />
        <PricingSection />
        <FaqSection />
      </main>
      <LandingFooter />
    </div>
  );
}
