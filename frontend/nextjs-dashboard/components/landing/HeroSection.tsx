'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BannerMockup } from './BannerMockup';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-b from-slate-50 via-white to-white overflow-hidden pt-16">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-indigo-400 rounded-full opacity-60" />
        <div className="absolute top-1/4 right-1/3 w-3 h-3 bg-indigo-300 rounded-full opacity-40" />
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-50" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: text + CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="space-y-8"
          >
            {/* Trust pill */}
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium px-4 py-2 rounded-full">
              <Shield className="w-4 h-4" />
              GDPR Compliant · EU Hosted
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
                GDPR Cookie{' '}
                <span className="text-indigo-600">Compliance</span>{' '}
                Made Simple
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                Automatically manage consent, block cookies before approval, and log
                every interaction. Stay compliant in minutes — not days.
              </p>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-8">
              {[
                { value: '10k+', label: 'Websites protected' },
                { value: '2M+', label: 'Consents logged' },
                { value: '100%', label: 'GDPR compliant' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 h-12 text-base shadow-lg shadow-indigo-200"
                asChild
              >
                <Link href="/register">
                  Start for Free <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl h-12 text-base border-slate-200 hover:bg-slate-50"
                asChild
              >
                <Link href="#how-it-works">
                  <Play className="w-4 h-4 mr-2 text-indigo-600" fill="currentColor" />
                  See How it Works
                </Link>
              </Button>
            </div>

            <p className="text-sm text-slate-500">
              No credit card required · Free plan available · Cancel anytime
            </p>
          </motion.div>

          {/* Right: banner mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
          >
            <BannerMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
