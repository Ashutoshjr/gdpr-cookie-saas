'use client';
import { useState, useEffect } from 'react';
import { Download, ClipboardList, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConsentTable } from '@/components/websites/ConsentTable';
import { useWebsites } from '@/hooks/useWebsites';
import { api } from '@/lib/api';
import type { ConsentRecord, PagedResult } from '@/lib/types';

const PAGE_SIZE = 20;

export default function ConsentsPage() {
  const { websites, loading: websitesLoading } = useWebsites();
  const [selectedWebsiteId, setSelectedWebsiteId] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PagedResult<ConsentRecord> | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!selectedWebsiteId) return;
    setLoading(true);
    api
      .get<PagedResult<ConsentRecord>>(
        `/api/consents?websiteId=${selectedWebsiteId}&page=${page}&pageSize=${PAGE_SIZE}`
      )
      .then((res) => setResult(res.data))
      .catch(() => toast.error('Failed to load consent records.'))
      .finally(() => setLoading(false));
  }, [selectedWebsiteId, page]);

  const handleWebsiteChange = (id: string) => {
    setSelectedWebsiteId(id);
    setPage(1);
    setResult(null);
  };

  const handleExport = async () => {
    if (!selectedWebsiteId) return;
    setExporting(true);
    try {
      const res = await api.get(`/api/consents/export?websiteId=${selectedWebsiteId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      const site = websites.find((w) => w.id === selectedWebsiteId);
      link.setAttribute('download', `consents-${site?.name ?? selectedWebsiteId}-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported!');
    } catch {
      toast.error('Export failed.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consent Logs"
        description="A full audit trail of every consent decision made on your websites."
      />

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={selectedWebsiteId}
          onValueChange={handleWebsiteChange}
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

        {selectedWebsiteId && (
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exporting || !result?.totalCount}
            className="rounded-xl h-10 text-sm border-slate-200 text-slate-600"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export CSV
          </Button>
        )}
      </div>

      {/* Empty: no website selected */}
      {!selectedWebsiteId && (
        <EmptyState
          icon={ClipboardList}
          title="Select a website"
          description="Choose a website to view its GDPR consent audit trail."
        />
      )}

      {/* Loading skeleton */}
      {selectedWebsiteId && loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      )}

      {/* Consent table */}
      {selectedWebsiteId && !loading && result && (
        result.totalCount === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No records yet"
            description="Consent records will appear here after visitors interact with your cookie banner."
          />
        ) : (
          <ConsentTable result={result} page={page} onPageChange={setPage} />
        )
      )}
    </div>
  );
}
