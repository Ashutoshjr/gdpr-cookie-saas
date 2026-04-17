'use client';
import { motion } from 'framer-motion';
import {
  ShieldOff, ClipboardList, Languages, MapPin,
  Eye, Zap,
} from 'lucide-react';

const features = [
  {
    icon: ShieldOff,
    color: 'text-red-500',
    bg: 'bg-red-50',
    title: 'Auto Script Blocking',
    description:
      'Tag any third-party script with a category. It stays blocked until the user consents — Google Analytics, Facebook Pixel, and more.',
  },
  {
    icon: ClipboardList,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    title: 'Consent Audit Logs',
    description:
      'Every consent decision is logged with timestamp, IP address, user agent, and exact category breakdown. Export as CSV anytime.',
  },
  {
    icon: Languages,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    title: 'Multi-Language Support',
    description:
      'Serve banners in English, German, French, Spanish, Italian, Portuguese, Dutch, and Polish. Automatically detected or manually configured.',
  },
  {
    icon: MapPin,
    color: 'text-green-600',
    bg: 'bg-green-50',
    title: 'EU/EEA Geo-Targeting',
    description:
      'Show the consent banner only to visitors from EU/EEA countries. Users outside the region see your site without interruption.',
  },
  {
    icon: Eye,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    title: 'Live Banner Preview',
    description:
      'See exactly how your banner looks before publishing. Change colors, text, and layout with real-time visual feedback.',
  },
  {
    icon: Zap,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    title: 'One-Line Integration',
    description:
      'A single `<script>` tag is all it takes. No npm packages, no build steps, no framework dependencies. Works on any website.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium px-4 py-1.5 rounded-full shadow-sm">
            Everything you need
          </div>
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
            Compliance, without the complexity
          </h2>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Purpose-built for GDPR. Every feature designed for non-technical website owners.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.07 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`w-11 h-11 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
