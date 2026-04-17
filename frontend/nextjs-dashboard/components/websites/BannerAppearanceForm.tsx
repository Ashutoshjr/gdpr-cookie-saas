'use client';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { Loader2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { LANGUAGE_OPTIONS } from '@/lib/translations';
import type { UpdateBannerAppearanceRequest } from '@/lib/types';

interface BannerAppearanceFormProps {
  form: UseFormReturn<UpdateBannerAppearanceRequest>;
  onSubmit: (data: UpdateBannerAppearanceRequest) => Promise<void>;
}

export function BannerAppearanceForm({ form, onSubmit }: BannerAppearanceFormProps) {
  const { register, handleSubmit, control, watch, formState: { isSubmitting, errors } } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-white rounded-2xl border border-slate-200 p-6">
      <div>
        <h3 className="font-semibold text-slate-800 mb-1">Appearance Settings</h3>
        <p className="text-xs text-slate-500">Changes update the preview in real time.</p>
      </div>

      {/* Primary color */}
      <div className="space-y-1.5">
        <Label className="text-slate-700 font-medium text-sm">Primary Color</Label>
        <div className="flex items-center gap-3">
          <Controller
            name="primaryColor"
            control={control}
            render={({ field }) => (
              <input
                type="color"
                value={field.value}
                onChange={field.onChange}
                className="w-12 h-10 rounded-xl border border-slate-200 cursor-pointer p-1 bg-white"
              />
            )}
          />
          <code className="text-sm font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            {watch('primaryColor') || '#4F46E5'}
          </code>
        </div>
      </div>

      {/* Banner title */}
      <div className="space-y-1.5">
        <Label className="text-slate-700 font-medium text-sm">Banner Title</Label>
        <Input
          className="h-10 rounded-xl border-slate-200 text-sm"
          placeholder="We use cookies"
          {...register('bannerTitle')}
        />
      </div>

      {/* Banner description */}
      <div className="space-y-1.5">
        <Label className="text-slate-700 font-medium text-sm">Description</Label>
        <Textarea
          className="rounded-xl border-slate-200 text-sm resize-none"
          rows={3}
          placeholder="We use cookies to improve your experience…"
          {...register('bannerDescription')}
        />
      </div>

      {/* Position */}
      <div className="space-y-1.5">
        <Label className="text-slate-700 font-medium text-sm">Banner Position</Label>
        <Controller
          name="bannerPosition"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="bottom">Bottom of page</SelectItem>
                <SelectItem value="top">Top of page</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Language */}
      <div className="space-y-1.5">
        <Label className="text-slate-700 font-medium text-sm">Banner Language</Label>
        <Controller
          name="language"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.flag} {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Geo restriction */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-slate-700">EU/EEA Geo-Restriction</p>
          <p className="text-xs text-slate-500 mt-0.5">Show banner only to EU/EEA visitors</p>
        </div>
        <Controller
          name="geoRestrictionEnabled"
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      {/* Privacy policy URL */}
      <div className="space-y-1.5">
        <Label className="text-slate-700 font-medium text-sm">Privacy Policy URL</Label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            className="h-10 rounded-xl border-slate-200 text-sm pl-9"
            placeholder="https://example.com/privacy"
            {...register('privacyPolicyUrl')}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10"
      >
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        {isSubmitting ? 'Saving…' : 'Save Appearance'}
      </Button>
    </form>
  );
}
