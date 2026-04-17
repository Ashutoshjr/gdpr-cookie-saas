'use client';
import { use } from 'react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft, Globe, RefreshCw, Loader2, Shield, Copy, Check, Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { BannerCustomizationPanel } from '@/components/websites/BannerCustomizationPanel';
import { EmbedSnippetCard } from '@/components/websites/EmbedSnippetCard';
import { CookiePolicyCard } from '@/components/websites/CookiePolicyCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { useWebsite } from '@/hooks/useWebsites';
import { api, getErrorMessage } from '@/lib/api';
import type { UpdateBannerAppearanceRequest, WebsiteDto } from '@/lib/types';

const infoSchema = z.object({
  name: z.string().min(2),
  domain: z.string().url('Enter a valid URL including https://'),
});
type InfoForm = z.infer<typeof infoSchema>;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function WebsiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { website, loading, setWebsite } = useWebsite(id);
  const [regenerating, setRegenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const infoForm = useForm<InfoForm>({
    resolver: zodResolver(infoSchema),
    values: website ? { name: website.name, domain: website.domain } : undefined,
  });

  const handleInfoSave = async (data: InfoForm) => {
    try {
      const res = await api.put<WebsiteDto>(`/api/websites/${id}`, data);
      setWebsite(res.data);
      toast.success('Website info updated!');
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const handleAppearanceSave = async (data: UpdateBannerAppearanceRequest) => {
    try {
      const res = await api.patch<WebsiteDto>(`/api/websites/${id}/appearance`, data);
      setWebsite(res.data);
      toast.success('Appearance saved!');
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const handleRegenerateKey = async () => {
    setRegenerating(true);
    try {
      const res = await api.post<WebsiteDto>(`/api/websites/${id}/regenerate-key`);
      setWebsite(res.data);
      toast.success('API key regenerated. Update your embed snippet!');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setRegenerating(false); }
  };

  const handleCopyKey = () => {
    if (!website) return;
    navigator.clipboard.writeText(website.apiKey);
    setCopiedKey(true);
    toast.success('API key copied!');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleGeneratePolicy = async () => {
    const res = await api.get<{ html: string }>(`/api/websites/${id}/cookie-policy`);
    return res.data.html;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  if (!website) {
    return (
      <div className="text-center py-16 text-slate-500">
        Website not found.{' '}
        <Link href="/websites" className="text-indigo-600 underline">Back to websites</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/websites" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to websites
        </Link>
        <PageHeader title={website.name} description={website.domain} />
      </div>

      {/* Website info card */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Info + API key */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50"><Globe className="w-4 h-4 text-indigo-600" /></div>
            <h2 className="font-semibold text-slate-800">Website Info</h2>
          </div>

          <form onSubmit={infoForm.handleSubmit(handleInfoSave)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-slate-600 text-xs font-medium uppercase tracking-wide">Name</Label>
              <Input className="h-10 rounded-xl border-slate-200" {...infoForm.register('name')} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-600 text-xs font-medium uppercase tracking-wide">Domain</Label>
              <Input className="h-10 rounded-xl border-slate-200" {...infoForm.register('domain')} />
            </div>
            <Button type="submit" disabled={infoForm.formState.isSubmitting} variant="outline" className="rounded-xl h-9 text-sm">
              {infoForm.formState.isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
              Save info
            </Button>
          </form>

          {/* API key section */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <Label className="text-slate-600 text-xs font-medium uppercase tracking-wide">API Key</Label>
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-200 px-3 py-2">
              <code className="text-xs font-mono text-slate-600 flex-1 truncate">{website.apiKey}</code>
              <button onClick={handleCopyKey} className="text-slate-400 hover:text-indigo-600 transition-colors flex-shrink-0">
                {copiedKey ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={regenerating} className="rounded-xl h-8 text-xs text-amber-600 border-amber-200 hover:bg-amber-50">
                  {regenerating ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : <RefreshCw className="w-3 h-3 mr-1.5" />}
                  Regenerate API Key
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Regenerate API Key?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The old key will stop working immediately. You must update your embed snippet with the new key.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRegenerateKey} className="bg-amber-600 hover:bg-amber-700 rounded-xl">
                    Regenerate
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Cookie categories */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-50"><Tag className="w-4 h-4 text-purple-600" /></div>
            <div>
              <h2 className="font-semibold text-slate-800">Cookie Categories</h2>
              <p className="text-xs text-slate-500">Auto-created when the website was added.</p>
            </div>
          </div>
          <div className="space-y-2">
            {website.categories.map((cat) => (
              <div key={cat.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                    {cat.isRequired && (
                      <Badge variant="secondary" className="text-[10px] px-2 py-0 rounded-full">Required</Badge>
                    )}
                  </div>
                  {cat.description && <p className="text-xs text-slate-400 mt-0.5">{cat.description}</p>}
                </div>
                <Shield className={`w-4 h-4 flex-shrink-0 mt-0.5 ${cat.isRequired ? 'text-green-500' : 'text-slate-300'}`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Banner customization with live preview */}
      <BannerCustomizationPanel website={website} onSave={handleAppearanceSave} />

      {/* Embed snippet + cookie policy */}
      <div className="grid lg:grid-cols-2 gap-6">
        <EmbedSnippetCard apiKey={website.apiKey} apiUrl={API_URL} />
        <CookiePolicyCard onGenerate={handleGeneratePolicy} />
      </div>
    </div>
  );
}
