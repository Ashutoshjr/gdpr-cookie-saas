'use client';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ConsentSummary } from '@/lib/types';

interface Props { summary: ConsentSummary }

const COLORS = ['#22c55e', '#ef4444', '#f59e0b'];

export function ConsentDonutChart({ summary }: Props) {
  const data = [
    { name: 'Accepted All', value: summary.acceptedAll, color: COLORS[0] },
    { name: 'Rejected All', value: summary.rejectedAll, color: COLORS[1] },
    { name: 'Customized', value: summary.customized, color: COLORS[2] },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-56 text-sm text-slate-400">
        No data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [
            `${value} (${((Number(value) / summary.totalConsents) * 100).toFixed(1)}%)`,
            name,
          ]}
          contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ fontSize: 12, color: '#64748b' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
