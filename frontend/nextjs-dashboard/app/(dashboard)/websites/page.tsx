'use client';
import Link from 'next/link';
import { Plus, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { WebsiteTable } from '@/components/websites/WebsiteTable';
import { useWebsites } from '@/hooks/useWebsites';

export default function WebsitesPage() {
  const { websites, loading, deleteWebsite } = useWebsites();

  return (
    <div>
      <PageHeader
        title="Websites"
        description="Manage your registered websites and cookie banners."
        action={
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl" asChild>
            <Link href="/websites/new"><Plus className="w-4 h-4 mr-2" />Add Website</Link>
          </Button>
        }
      />

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-5 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      ) : websites.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="No websites yet"
          description="Add your first website to start managing GDPR cookie consent."
          action={{ label: 'Add your first website', href: '/websites/new' }}
        />
      ) : (
        <WebsiteTable websites={websites} onDelete={deleteWebsite} />
      )}
    </div>
  );
}
