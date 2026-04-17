'use client';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BannerAppearanceForm } from './BannerAppearanceForm';
import { BannerLivePreview } from './BannerLivePreview';
import type { WebsiteDto, UpdateBannerAppearanceRequest } from '@/lib/types';

const appearanceSchema = z.object({
  primaryColor: z.string(),
  bannerTitle: z.string(),
  bannerDescription: z.string(),
  bannerPosition: z.string(),
  language: z.string(),
  geoRestrictionEnabled: z.boolean(),
  privacyPolicyUrl: z.string(),
});

interface BannerCustomizationPanelProps {
  website: WebsiteDto;
  onSave: (data: UpdateBannerAppearanceRequest) => Promise<void>;
}

export function BannerCustomizationPanel({ website, onSave }: BannerCustomizationPanelProps) {
  const form = useForm<UpdateBannerAppearanceRequest>({
    resolver: zodResolver(appearanceSchema),
    defaultValues: {
      primaryColor: website.primaryColor || '#4F46E5',
      bannerTitle: website.bannerTitle || 'We use cookies',
      bannerDescription: website.bannerDescription || 'We use cookies to improve your experience on our site.',
      bannerPosition: website.bannerPosition || 'bottom',
      language: website.language || 'en',
      geoRestrictionEnabled: website.geoRestrictionEnabled ?? false,
      privacyPolicyUrl: website.privacyPolicyUrl || '',
    },
  });

  // useWatch gives live preview updates as the user types
  const watchedValues = useWatch({ control: form.control });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Banner Customization</h2>
        <p className="text-sm text-slate-500">Edit your cookie banner appearance. The preview updates as you type.</p>
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        {/* Left: controls */}
        <BannerAppearanceForm form={form} onSubmit={onSave} />

        {/* Right: live preview — sticky on large screens */}
        <div className="xl:sticky xl:top-6 h-fit">
          <BannerLivePreview config={watchedValues} categories={website.categories} />
        </div>
      </div>
    </div>
  );
}
