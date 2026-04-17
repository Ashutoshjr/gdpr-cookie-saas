'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ConsentRecord, PagedResult } from '@/lib/types';

interface ConsentTableProps {
  result: PagedResult<ConsentRecord>;
  page: number;
  onPageChange: (page: number) => void;
}

function parseCategories(raw: string): { name: string; accepted: boolean }[] {
  try {
    const obj = JSON.parse(raw) as Record<string, boolean>;
    return Object.entries(obj).map(([name, accepted]) => ({ name, accepted }));
  } catch {
    return [];
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function ConsentTable({ result, page, onPageChange }: ConsentTableProps) {
  const { items, totalPages, totalCount } = result;

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <p className="text-slate-400 text-sm">No consent records found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['Session ID', 'Decision', 'Categories', 'IP Address', 'Timestamp'].map((h) => (
                <th key={h} className="text-left py-3.5 px-5 font-medium text-slate-500 text-xs uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((record) => {
              const cats = parseCategories(record.categories);
              return (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-5">
                    <code className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-mono">
                      {record.sessionId?.slice(0, 12) ?? '—'}…
                    </code>
                  </td>
                  <td className="py-3.5 px-5">
                    <Badge
                      className={`text-xs rounded-full px-2.5 ${
                        record.consentGiven
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                      variant="outline"
                    >
                      {record.consentGiven ? 'Accepted' : 'Rejected'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {cats.map(({ name, accepted }) => (
                        <span
                          key={name}
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize ${
                            accepted
                              ? 'bg-green-50 text-green-600'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-slate-400 text-xs font-mono whitespace-nowrap">
                    {record.ipAddress || '—'}
                  </td>
                  <td className="py-3.5 px-5 text-slate-400 text-xs whitespace-nowrap">
                    {formatDate(record.timestamp)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="border-t border-slate-100 px-5 py-3.5 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          {totalCount.toLocaleString()} total records · Page {page} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="h-8 w-8 p-0 rounded-lg"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs text-slate-600 min-w-[3rem] text-center font-medium">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="h-8 w-8 p-0 rounded-lg"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
