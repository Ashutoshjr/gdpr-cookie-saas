'use client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import type { CategoryRate } from '@/lib/types';

interface Props { data: CategoryRate[] }

export function CategoryBarChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-56 text-sm text-slate-400">
        No data yet
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.category.charAt(0).toUpperCase() + d.category.slice(1),
    rate: Math.round(d.acceptRate * 100),
    raw: d,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value) => [`${value}%`, 'Acceptance rate']}
          contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }}
          cursor={{ fill: '#f8fafc' }}
        />
        <Bar dataKey="rate" radius={[6, 6, 0, 0]} maxBarSize={60}>
          {chartData.map((entry, index) => (
            <Cell
              key={index}
              fill={entry.rate >= 70 ? '#22c55e' : entry.rate >= 40 ? '#4F46E5' : '#f59e0b'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
