'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, getErrorMessage } from '@/lib/api';
import type { WebsiteDto } from '@/lib/types';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  domain: z.string().url('Enter a valid URL including https://'),
});
type FormData = z.infer<typeof schema>;

export default function WebsiteNewPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post<WebsiteDto>('/api/websites', data);
      toast.success('Website added successfully!');
      router.push(`/websites/${res.data.id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="max-w-2xl">
      <Link href="/websites" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to websites
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Globe className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Add a website</h1>
            <p className="text-sm text-slate-500">Register a domain to manage cookie consent.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-slate-700 font-medium">Website name</Label>
            <Input
              id="name"
              placeholder="My Company Website"
              className="h-11 rounded-xl border-slate-200"
              {...register('name')}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="domain" className="text-slate-700 font-medium">Domain URL</Label>
            <Input
              id="domain"
              placeholder="https://example.com"
              type="url"
              className="h-11 rounded-xl border-slate-200"
              {...register('domain')}
            />
            {errors.domain && <p className="text-sm text-red-500">{errors.domain.message}</p>}
            <p className="text-xs text-slate-400">Include the protocol (https://) and do not add a trailing slash.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-6"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isSubmitting ? 'Creating…' : 'Create website'}
            </Button>
            <Button type="button" variant="outline" className="rounded-xl h-11" asChild>
              <Link href="/websites">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
