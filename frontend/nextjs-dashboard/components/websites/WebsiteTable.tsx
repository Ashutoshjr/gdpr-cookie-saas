'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Copy, Trash2, ExternalLink, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { WebsiteDto } from '@/lib/types';

interface WebsiteTableProps {
  websites: WebsiteDto[];
  onDelete: (id: string) => Promise<void>;
}

export function WebsiteTable({ websites, onDelete }: WebsiteTableProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleCopy = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey);
    setCopied(apiKey);
    toast.success('API key copied!');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await onDelete(id);
      toast.success('Website deleted.');
    } catch {
      toast.error('Failed to delete website.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left py-3.5 px-5 font-medium text-slate-500 text-xs uppercase tracking-wide">Name</th>
              <th className="text-left py-3.5 px-5 font-medium text-slate-500 text-xs uppercase tracking-wide">Domain</th>
              <th className="text-left py-3.5 px-5 font-medium text-slate-500 text-xs uppercase tracking-wide">API Key</th>
              <th className="text-left py-3.5 px-5 font-medium text-slate-500 text-xs uppercase tracking-wide">Plan</th>
              <th className="text-left py-3.5 px-5 font-medium text-slate-500 text-xs uppercase tracking-wide">Created</th>
              <th className="py-3.5 px-5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {websites.map((site) => (
              <tr key={site.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-5">
                  <Link href={`/websites/${site.id}`} className="font-medium text-slate-800 hover:text-indigo-600 transition-colors">
                    {site.name}
                  </Link>
                </td>
                <td className="py-4 px-5 text-slate-500 text-xs font-mono">{site.domain}</td>
                <td className="py-4 px-5">
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded-lg font-mono text-slate-600">
                      {site.apiKey.slice(0, 8)}…
                    </code>
                    <button
                      onClick={() => handleCopy(site.apiKey)}
                      className="text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Copy full API key"
                    >
                      {copied === site.apiKey ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </td>
                <td className="py-4 px-5">
                  <Badge variant="secondary" className="text-xs rounded-full">
                    {site.language.toUpperCase()}
                  </Badge>
                </td>
                <td className="py-4 px-5 text-slate-400 text-xs">
                  {new Date(site.createdAt).toLocaleDateString()}
                </td>
                <td className="py-4 px-5">
                  <div className="flex items-center gap-1 justify-end">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-indigo-50" asChild>
                      <Link href={`/websites/${site.id}`}>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 hover:text-indigo-600" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg hover:bg-red-50"
                          disabled={deleting === site.id}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete &quot;{site.name}&quot;?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the website and all associated consent records. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(site.id)}
                            className="bg-red-600 hover:bg-red-700 rounded-xl"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
