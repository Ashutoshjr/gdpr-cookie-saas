import { TrendingUp, TrendingDown, Check, X, Settings2, CalendarDays } from 'lucide-react';
import type { ConsentSummary } from '@/lib/types';

interface Props { summary: ConsentSummary }

export function AnalyticsStatCards({ summary }: Props) {
  const cards = [
    {
      label: 'Total Consents',
      value: summary.totalConsents.toLocaleString(),
      icon: TrendingUp,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
      sub: 'All time',
    },
    {
      label: 'Accept Rate',
      value: `${(summary.acceptRate * 100).toFixed(1)}%`,
      icon: Check,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-50',
      sub: `${summary.acceptedAll.toLocaleString()} accepted all`,
    },
    {
      label: 'Reject Rate',
      value: `${(summary.rejectRate * 100).toFixed(1)}%`,
      icon: X,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-50',
      sub: `${summary.rejectedAll.toLocaleString()} rejected all`,
    },
    {
      label: 'Customized',
      value: `${(summary.customizeRate * 100).toFixed(1)}%`,
      icon: Settings2,
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-50',
      sub: `${summary.customized.toLocaleString()} used preferences`,
    },
    {
      label: 'This Month',
      value: summary.thisMonth.toLocaleString(),
      icon: CalendarDays,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50',
      sub: 'Consents in current month',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-slate-500">{card.label}</p>
              <div className={`w-8 h-8 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{card.value}</p>
            <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
          </div>
        );
      })}
    </div>
  );
}
