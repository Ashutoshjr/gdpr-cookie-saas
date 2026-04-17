'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { BarChart2, PieChart, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { AnalyticsStatCards } from '@/components/analytics/StatCards';
import { useWebsites } from '@/hooks/useWebsites';
import { useAnalytics } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';

// Dynamic imports with ssr:false to avoid recharts hydration mismatch
const ConsentDonutChart = dynamic(
  () => import('@/components/analytics/ConsentDonutChart').then((m) => m.ConsentDonutChart),
  { ssr: false, loading: () => <Skeleton className="h-60 w-full rounded-xl" /> }
);
const CategoryBarChart = dynamic(
  () => import('@/components/analytics/CategoryBarChart').then((m) => m.CategoryBarChart),
  { ssr: false, loading: () => <Skeleton className="h-60 w-full rounded-xl" /> }
);
const ConsentTrendChart = dynamic(
  () => import('@/components/analytics/ConsentTrendChart').then((m) => m.ConsentTrendChart),
  { ssr: false, loading: () => <Skeleton className="h-60 w-full rounded-xl" /> }
);

const PERIOD_OPTIONS = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
];

function ChartCard({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-5">
        <Icon className="w-4 h-4 text-slate-400" />
        <h3 className="font-semibold text-slate-700 text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function AnalyticsPage() {
  const { websites, loading: websitesLoading } = useWebsites();
  const [selectedWebsiteId, setSelectedWebsiteId] = useState('');
  const [days, setDays] = useState(30);

  const { summary, trend, categoryRates, loading } = useAnalytics(selectedWebsiteId, days);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Consent trends, acceptance rates, and category breakdown."
      />

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={selectedWebsiteId}
          onValueChange={setSelectedWebsiteId}
          disabled={websitesLoading}
        >
          <SelectTrigger className="w-56 rounded-xl border-slate-200 h-10">
            <SelectValue placeholder="Select a website…" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {websites.map((w) => (
              <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Period toggle */}
        <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-white">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors',
                days === opt.value
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state when no website selected */}
      {!selectedWebsiteId && !loading && (
        <EmptyState
          icon={BarChart2}
          title="Select a website"
          description="Choose a website from the dropdown to view consent analytics."
        />
      )}

      {/* Loading state */}
      {selectedWebsiteId && loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <Skeleton className="h-72 rounded-2xl" />
            <Skeleton className="h-72 rounded-2xl" />
          </div>
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      )}

      {/* Analytics data */}
      {selectedWebsiteId && !loading && summary && (
        <div className="space-y-6">
          {/* Stat cards */}
          <AnalyticsStatCards summary={summary} />

          {/* Charts row */}
          <div className="grid lg:grid-cols-2 gap-6">
            <ChartCard title="Consent Decision Breakdown" icon={PieChart}>
              <ConsentDonutChart summary={summary} />
            </ChartCard>
            <ChartCard title="Category Acceptance Rates" icon={BarChart2}>
              <CategoryBarChart data={categoryRates} />
            </ChartCard>
          </div>

          {/* Trend chart */}
          <ChartCard title={`Consent Trend — Last ${days} days`} icon={TrendingUp}>
            <ConsentTrendChart data={trend} />
          </ChartCard>
        </div>
      )}

      {/* No data yet */}
      {selectedWebsiteId && !loading && !summary && (
        <EmptyState
          icon={BarChart2}
          title="No consent data yet"
          description="Add the embed snippet to your website and consent records will appear here."
        />
      )}
    </div>
  );
}
