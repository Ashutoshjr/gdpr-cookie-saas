'use client';
import { useState } from 'react';
import { X, Settings2, Shield } from 'lucide-react';
import { getTranslations } from '@/lib/translations';
import type { CookieCategory, UpdateBannerAppearanceRequest } from '@/lib/types';

interface BannerLivePreviewProps {
  config: Partial<UpdateBannerAppearanceRequest>;
  categories?: CookieCategory[];
}

interface ModalPreviewProps {
  config: Partial<UpdateBannerAppearanceRequest>;
  categories: CookieCategory[];
  primary: string;
  onClose: () => void;
}

function BannerModalPreview({ config, categories, primary, onClose }: ModalPreviewProps) {
  const t = getTranslations(config.language || 'en');
  const [toggles, setToggles] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(categories.map((c) => [c.name, true]))
  );

  return (
    <div className="w-full bg-white rounded-xl shadow-2xl p-4 space-y-3 max-h-56 overflow-y-auto">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-800">{t.modalTitle}</p>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-700 truncate">{cat.name}</span>
                {cat.isRequired && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 flex-shrink-0">
                    {t.required}
                  </span>
                )}
              </div>
              {cat.description && (
                <p className="text-[10px] text-slate-400 truncate">{cat.description}</p>
              )}
            </div>
            <button
              onClick={() => !cat.isRequired && setToggles((prev) => ({ ...prev, [cat.name]: !prev[cat.name] }))}
              className={`flex-shrink-0 w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${
                toggles[cat.name] || cat.isRequired ? 'justify-end' : 'justify-start bg-slate-200'
              }`}
              style={{
                backgroundColor: toggles[cat.name] || cat.isRequired ? primary : undefined,
              }}
            >
              <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
            </button>
          </div>
        ))}
      </div>

      <button
        className="w-full text-xs font-semibold py-2 rounded-lg text-white"
        style={{ backgroundColor: primary }}
        onClick={onClose}
      >
        {t.savePreferences}
      </button>
    </div>
  );
}

export function BannerLivePreview({ config, categories = [] }: BannerLivePreviewProps) {
  const [showModal, setShowModal] = useState(false);

  const primary = config.primaryColor || '#4F46E5';
  const position = config.bannerPosition || 'bottom';
  const t = getTranslations(config.language || 'en');
  const title = config.bannerTitle || 'We use cookies';
  const desc = config.bannerDescription || 'We use cookies to improve your experience on our site.';

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-white">
      {/* Mock browser chrome */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center gap-2.5">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded-md border border-slate-200 px-3 py-1 text-[10px] text-slate-400 text-center truncate flex items-center justify-center gap-1">
          <Shield className="w-2.5 h-2.5 text-green-500" />
          https://yourwebsite.com
        </div>
      </div>

      {/* Mock page content */}
      <div className="relative bg-slate-50 h-72 overflow-hidden">
        {/* Fake page skeleton */}
        <div className="p-5 space-y-3 opacity-40">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-slate-300" />
            <div className="h-2.5 bg-slate-300 rounded w-20" />
          </div>
          <div className="h-5 bg-slate-300 rounded w-3/4" />
          <div className="h-2.5 bg-slate-200 rounded w-full" />
          <div className="h-2.5 bg-slate-200 rounded w-5/6" />
          <div className="h-2.5 bg-slate-200 rounded w-4/5" />
          <div className="flex gap-2 mt-3">
            <div className="h-7 w-16 bg-slate-300 rounded-lg" />
            <div className="h-7 w-16 bg-slate-200 rounded-lg" />
          </div>
        </div>

        {/* Cookie banner */}
        <div
          className={`absolute left-0 right-0 bg-white shadow-xl p-3 z-10 ${
            position === 'top' ? 'top-0' : 'bottom-0'
          }`}
          style={{
            [position === 'top' ? 'borderBottom' : 'borderTop']: `3px solid ${primary}`,
          }}
        >
          {showModal ? (
            <BannerModalPreview
              config={config}
              categories={categories.length > 0 ? categories : [
                { id: '1', name: 'Necessary', description: 'Required for the site to work', isRequired: true },
                { id: '2', name: 'Analytics', description: 'Help us improve our site', isRequired: false },
                { id: '3', name: 'Marketing', description: 'Personalized advertisements', isRequired: false },
              ]}
              primary={primary}
              onClose={() => setShowModal(false)}
            />
          ) : (
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-semibold text-slate-800">{title} </span>
                <span className="text-[11px] text-slate-500">{desc}</span>
                {config.privacyPolicyUrl && (
                  <span className="text-[11px] ml-1" style={{ color: primary }}>
                    {' '}Privacy Policy
                  </span>
                )}
              </div>
              <div className="flex gap-1.5 flex-shrink-0 items-center">
                <button
                  className="text-[10px] px-3 py-1.5 rounded-lg font-semibold text-white transition-opacity hover:opacity-85"
                  style={{ backgroundColor: primary }}
                >
                  {t.acceptAll}
                </button>
                <button className="text-[10px] px-3 py-1.5 rounded-lg font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200">
                  {t.rejectAll}
                </button>
                <button
                  className="text-[10px] px-2 py-1.5 font-medium flex items-center gap-1"
                  style={{ color: primary }}
                  onClick={() => setShowModal(true)}
                >
                  <Settings2 className="w-2.5 h-2.5" />
                  {t.customize}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview meta bar */}
      <div className="bg-white border-t border-slate-100 px-4 py-2 flex items-center justify-between">
        <span className="text-[10px] font-medium text-slate-400">Live Preview</span>
        <div className="flex items-center gap-2">
          {config.geoRestrictionEnabled && (
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">EU Only</span>
          )}
          <span className="text-[10px] text-slate-400 capitalize">
            Position: {position}
          </span>
          <span className="text-[10px] text-slate-400 uppercase">
            {config.language || 'EN'}
          </span>
        </div>
      </div>
    </div>
  );
}
