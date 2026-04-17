'use client';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { DailyConsent } from '@/lib/types';

interface Props { data: DailyConsent[] }

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ConsentTrendChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-56 text-sm text-slate-400">
        No data yet
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    date: formatDate(d.date),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradAccepted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradRejected" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.12} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ fontSize: 12, color: '#64748b' }}>{value}</span>}
        />
        <Area
          type="monotone"
          dataKey="total"
          name="Total"
          stroke="#4F46E5"
          strokeWidth={2}
          fill="url(#gradTotal)"
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="accepted"
          name="Accepted"
          stroke="#22c55e"
          strokeWidth={2}
          fill="url(#gradAccepted)"
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="rejected"
          name="Rejected"
          stroke="#ef4444"
          strokeWidth={2}
          fill="url(#gradRejected)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
