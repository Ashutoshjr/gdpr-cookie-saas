import { type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <div className="space-y-1.5">
        <h3 className="font-semibold text-slate-800 text-lg">{title}</h3>
        <p className="text-sm text-slate-500 max-w-xs">{description}</p>
      </div>
      {action && (
        action.href ? (
          <Button className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl" asChild>
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ) : (
          <Button
            className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )
      )}
    </div>
  );
}
