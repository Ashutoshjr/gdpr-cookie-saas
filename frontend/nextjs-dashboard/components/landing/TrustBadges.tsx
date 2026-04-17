import { ShieldCheck, Server, Lock, Globe } from 'lucide-react';

const badges = [
  {
    icon: ShieldCheck,
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-100',
    label: 'GDPR Compliant',
    sub: 'Article 7 & ePrivacy',
  },
  {
    icon: Server,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-100',
    label: 'EU Data Centers',
    sub: 'No data leaves the EU',
  },
  {
    icon: Lock,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 border-indigo-100',
    label: 'Privacy First',
    sub: 'Zero third-party trackers',
  },
  {
    icon: Globe,
    color: 'text-purple-600',
    bg: 'bg-purple-50 border-purple-100',
    label: 'Multi-Language',
    sub: '8 languages supported',
  },
];

export function TrustBadges() {
  return (
    <section className="py-12 bg-slate-50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-slate-500 mb-8 uppercase tracking-widest">
          Built for compliance. Trusted by thousands.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.label}
                className={`flex items-center gap-3 p-4 rounded-2xl border ${badge.bg} transition-transform hover:-translate-y-0.5`}
              >
                <div className={`p-2.5 rounded-xl bg-white shadow-sm ${badge.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{badge.label}</p>
                  <p className="text-xs text-slate-500">{badge.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
