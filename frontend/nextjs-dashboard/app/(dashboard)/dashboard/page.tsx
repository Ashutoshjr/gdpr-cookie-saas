'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Globe, BarChart2, Plus, ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatTile } from '@/components/dashboard/StatTile';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import type { UsageSummary, WebsiteDto } from '@/lib/types';

export default function DashboardPage() {
  const user = getStoredUser();
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [websites, setWebsites] = useState<WebsiteDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<UsageSummary>('/api/auth/usage'),
      api.get<WebsiteDto[]>('/api/websites'),
    ])
      .then(([usageRes, sitesRes]) => {
        setUsage(usageRes.data);
        setWebsites(sitesRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const isCompliant = usage && !usage.websiteLimitReached && !usage.consentLimitReached;

  return (
    <div>
      <PageHeader
        title={`Welcome back${user ? ', ' + user.fullName.split(' ')[0] : ''}!`}
        description="Here's an overview of your GDPR compliance status."
        action={
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl" asChild>
            <Link href="/websites/new"><Plus className="w-4 h-4 mr-2" /> Add Website</Link>
          </Button>
        }
      />

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Compliance status banner */}
          {usage && (
            <div
              className={`flex items-center gap-3 rounded-2xl border px-6 py-4 mb-6 ${
                isCompliant
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              {isCompliant ? (
                <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              )}
              <div>
                <p className="font-semibold text-sm">
                  {isCompliant ? 'All systems compliant' : 'Usage limit reached'}
                </p>
                <p className="text-xs mt-0.5 opacity-80">
                  {isCompliant
                    ? 'Your consent management is active and logging correctly.'
                    : 'Upgrade to Pro for unlimited websites and consents.'}
                </p>
              </div>
              {!isCompliant && (
                <Button size="sm" className="ml-auto bg-amber-600 hover:bg-amber-700 text-white rounded-lg" asChild>
                  <Link href="/profile">Upgrade</Link>
                </Button>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatTile
              icon={Globe}
              iconColor="text-indigo-600"
              iconBg="bg-indigo-50"
              value={usage?.websitesUsed ?? websites.length}
              label="Active Websites"
              subtext={usage?.websitesLimit === -1 ? 'Unlimited' : `of ${usage?.websitesLimit ?? 1} allowed`}
            />
            <StatTile
              icon={BarChart2}
              iconColor="text-green-600"
              iconBg="bg-green-50"
              value={usage?.consentsThisMonth ?? 0}
              label="Consents This Month"
              subtext={usage?.consentsLimit === -1 ? 'Unlimited' : `of ${usage?.consentsLimit?.toLocaleString() ?? '1,000'} allowed`}
            />
            <StatTile
              icon={ShieldCheck}
              iconColor="text-blue-600"
              iconBg="bg-blue-50"
              value={usage ? (usage.plan === 'pro' ? 'Pro' : 'Free') : '—'}
              label="Current Plan"
              subtext={usage?.plan === 'pro' ? 'Full feature access' : 'Upgrade for unlimited access'}
            />
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Quick actions</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { label: 'Add a website', description: 'Register a new domain', href: '/websites/new', icon: Plus, color: 'bg-indigo-50 text-indigo-600' },
                { label: 'View analytics', description: 'Consent trends & rates', href: '/analytics', icon: BarChart2, color: 'bg-green-50 text-green-600' },
                { label: 'Manage websites', description: 'Edit banners & settings', href: '/websites', icon: Globe, color: 'bg-purple-50 text-purple-600' },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 group-hover:text-indigo-700">{action.label}</p>
                      <p className="text-xs text-slate-500">{action.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
