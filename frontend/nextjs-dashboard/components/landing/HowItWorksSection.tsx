'use client';
import { motion } from 'framer-motion';
import { Code2, Palette, ShieldCheck, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Code2,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    title: 'Add One Script',
    description:
      'Paste a single line of JavaScript into your website. No complex setup, no dependencies — works with any tech stack.',
    code: '<script src="cdn.cookieconsent.io/sdk.js"\n  data-api-key="YOUR_KEY">\n</script>',
  },
  {
    number: '02',
    icon: Palette,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    title: 'Customize Your Banner',
    description:
      'Match your brand with colors, text, and layout. Preview changes in real time before publishing to your live site.',
    code: null,
  },
  {
    number: '03',
    icon: ShieldCheck,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-100',
    title: 'Stay Compliant',
    description:
      'Every consent is logged with timestamp, IP, and category breakdown. Download audit reports anytime you need them.',
    code: null,
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-sm font-medium px-4 py-1.5 rounded-full">
            Simple setup
          </div>
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
            Live in 3 simple steps
          </h2>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            From zero to GDPR compliant in under 5 minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="grid lg:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-12 left-1/3 right-1/3 h-px bg-gradient-to-r from-indigo-100 via-purple-100 to-green-100" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative"
              >
                <div className={`rounded-2xl border ${step.border} bg-white p-8 h-full shadow-sm hover:shadow-md transition-shadow`}>
                  {/* Step number */}
                  <div className="text-xs font-bold text-slate-400 mb-4 tracking-widest">{step.number}</div>

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl ${step.bg} flex items-center justify-center mb-6`}>
                    <Icon className={`w-6 h-6 ${step.color}`} />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>

                  {/* Code snippet for step 1 */}
                  {step.code && (
                    <div className="mt-6 bg-slate-900 rounded-xl p-4 font-mono text-xs text-green-400 overflow-x-auto whitespace-pre">
                      {step.code}
                    </div>
                  )}
                </div>

                {/* Arrow between steps */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white border border-slate-200 rounded-full p-1 shadow-sm">
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
