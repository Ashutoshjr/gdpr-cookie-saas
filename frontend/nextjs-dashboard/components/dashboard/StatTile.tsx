import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatTileProps {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  value: string | number;
  label: string;
  subtext?: string;
}

export function StatTile({ icon: Icon, iconColor, iconBg, value, label, subtext }: StatTileProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{value}</p>
          {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
      </div>
    </div>
  );
}
