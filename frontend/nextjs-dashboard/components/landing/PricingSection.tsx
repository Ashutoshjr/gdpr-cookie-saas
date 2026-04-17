'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Zap, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    icon: null,
    description: 'Perfect for personal projects and small websites.',
    cta: 'Get Started Free',
    ctaVariant: 'outline' as const,
    highlight: false,
    features: [
      '1 website',
      '1,000 consents / month',
      'All banner layouts',
      'GDPR consent logging',
      'CSV export',
      'Email support',
    ],
  },
  {
    name: 'Pro',
    price: '$9',
    period: 'per month',
    icon: Zap,
    description: 'For agencies and businesses managing multiple sites.',
    cta: 'Start Pro Trial',
    ctaVariant: 'default' as const,
    highlight: true,
    badge: 'Most Popular',
    features: [
      'Unlimited websites',
      'Unlimited consents',
      'All Free features',
      'Priority email support',
      'Analytics dashboard',
      'Cookie policy generator',
      'Multi-language banners',
      'Geo-restriction (EU/EEA)',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    icon: Building2,
    description: 'Custom contracts, SLAs, and dedicated infrastructure.',
    cta: 'Contact Sales',
    ctaVariant: 'outline' as const,
    highlight: false,
    features: [
      'Everything in Pro',
      'Dedicated infrastructure',
      'Custom SLA',
      'SSO / SAML',
      'Audit trail export',
      'Dedicated account manager',
    ],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-sm font-medium px-4 py-1.5 rounded-full">
            Simple pricing
          </div>
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
            Start free. Scale when you need to.
          </h2>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            No hidden fees. Cancel anytime. All plans include GDPR-compliant consent logging.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {tiers.map((tier, idx) => {
            const Icon = tier.icon;
            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`relative rounded-2xl p-8 ${
                  tier.highlight
                    ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200 scale-105 border-2 border-indigo-500'
                    : 'bg-white border-2 border-slate-200'
                }`}
              >
                {tier.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 hover:bg-amber-400 px-3 py-1 text-xs font-semibold">
                    {tier.badge}
                  </Badge>
                )}

                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    {Icon && (
                      <div className={`p-1.5 rounded-lg ${tier.highlight ? 'bg-indigo-500' : 'bg-indigo-50'}`}>
                        <Icon className={`w-4 h-4 ${tier.highlight ? 'text-white' : 'text-indigo-600'}`} />
                      </div>
                    )}
                    <span className={`font-bold text-lg ${tier.highlight ? 'text-white' : 'text-slate-900'}`}>
                      {tier.name}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className={`text-4xl font-bold tracking-tight ${tier.highlight ? 'text-white' : 'text-slate-900'}`}>
                      {tier.price}
                    </span>
                    <span className={`text-sm ${tier.highlight ? 'text-indigo-200' : 'text-slate-500'}`}>
                      /{tier.period}
                    </span>
                  </div>
                  <p className={`text-sm ${tier.highlight ? 'text-indigo-200' : 'text-slate-500'}`}>
                    {tier.description}
                  </p>
                </div>

                {/* CTA */}
                <Button
                  variant={tier.ctaVariant}
                  className={`w-full mb-8 rounded-xl h-11 font-semibold ${
                    tier.highlight
                      ? 'bg-white text-indigo-600 hover:bg-indigo-50 border-0'
                      : tier.name === 'Enterprise'
                      ? 'border-slate-300 text-slate-700 hover:bg-slate-50'
                      : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50'
                  }`}
                  asChild
                >
                  <Link href={tier.name === 'Enterprise' ? 'mailto:sales@cookieconsent.io' : '/register'}>
                    {tier.cta}
                  </Link>
                </Button>

                {/* Features */}
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <Check
                        className={`w-4 h-4 flex-shrink-0 ${
                          tier.highlight ? 'text-indigo-200' : 'text-green-500'
                        }`}
                      />
                      <span className={tier.highlight ? 'text-indigo-100' : 'text-slate-600'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
