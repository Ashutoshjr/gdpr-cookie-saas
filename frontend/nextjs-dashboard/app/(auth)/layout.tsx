import Link from 'next/link';
import { Shield, ShieldCheck, Lock, Globe } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel — brand / trust (hidden on mobile) */}
      <div className="hidden lg:flex flex-col bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-white p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-500 rounded-full opacity-20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-800 rounded-full opacity-30 blur-3xl" />
        </div>

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-2.5 z-10">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl">CookieConsent</span>
        </Link>

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold leading-tight">
              GDPR compliance<br />without the headache.
            </h2>
            <p className="text-indigo-200 text-lg leading-relaxed max-w-sm">
              Join thousands of website owners who manage cookie consent and stay legally compliant effortlessly.
            </p>
          </div>

          {/* Trust points */}
          <div className="space-y-4">
            {[
              { icon: ShieldCheck, text: 'GDPR & ePrivacy compliant' },
              { icon: Lock, text: 'EU-hosted data centers' },
              { icon: Globe, text: '8 languages supported' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-indigo-200" />
                </div>
                <span className="text-indigo-100 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 border-t border-white/20 pt-8">
          <blockquote className="text-sm text-indigo-200 italic">
            &ldquo;Set up in 5 minutes. Our legal team was impressed with the audit trail.&rdquo;
          </blockquote>
          <p className="text-xs text-indigo-300 mt-2">— Product manager at a EU SaaS company</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">CookieConsent</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
