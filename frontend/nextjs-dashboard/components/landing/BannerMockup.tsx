'use client';
import { useState } from 'react';
import { Check, X, Settings2, Shield } from 'lucide-react';

export function BannerMockup() {
  const [consented, setConsented] = useState<'accepted' | 'rejected' | null>(null);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Floating badge */}
      <div className="absolute -top-4 -right-4 z-10 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
        <Shield className="w-3 h-3" /> GDPR Ready
      </div>

      {/* Browser frame */}
      <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
        {/* Browser chrome */}
        <div className="bg-slate-100 px-4 py-3 flex items-center gap-3 border-b border-slate-200">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-white rounded-md border border-slate-200 px-3 py-1 text-xs text-slate-400 text-center">
            https://yourwebsite.com
          </div>
        </div>

        {/* Page content simulation */}
        <div className="relative bg-slate-50 h-56 overflow-hidden">
          {/* Fake page skeleton */}
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-slate-300" />
              <div className="h-3 bg-slate-300 rounded w-24" />
            </div>
            <div className="h-6 bg-slate-300 rounded w-3/4" />
            <div className="h-3 bg-slate-200 rounded w-full" />
            <div className="h-3 bg-slate-200 rounded w-5/6" />
            <div className="h-3 bg-slate-200 rounded w-4/5" />
            <div className="flex gap-2 mt-4">
              <div className="h-8 w-20 bg-slate-300 rounded-lg" />
              <div className="h-8 w-20 bg-slate-200 rounded-lg" />
            </div>
          </div>

          {/* The cookie banner */}
          {!consented && (
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t-4 border-indigo-600 shadow-xl p-3">
              {showModal ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-800">Cookie Preferences</p>
                  {[
                    { name: 'Necessary', required: true },
                    { name: 'Analytics', required: false },
                    { name: 'Marketing', required: false },
                  ].map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">
                        {cat.name} {cat.required && <span className="text-indigo-600 text-[10px]">(Required)</span>}
                      </span>
                      <div
                        className={`w-7 h-4 rounded-full transition-colors ${cat.required ? 'bg-indigo-600' : 'bg-slate-300'} flex items-center ${cat.required ? 'justify-end pr-0.5' : 'justify-start pl-0.5'}`}
                      >
                        <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setConsented('accepted')}
                    className="w-full mt-1 text-xs font-semibold py-1.5 rounded-md text-white bg-indigo-600"
                  >
                    Save Preferences
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 inline">We use cookies </p>
                    <p className="text-xs text-slate-500 inline">to improve your experience.</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => setConsented('accepted')}
                      className="text-[10px] px-2.5 py-1.5 font-semibold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1"
                    >
                      <Check className="w-2.5 h-2.5" /> Accept All
                    </button>
                    <button
                      onClick={() => setConsented('rejected')}
                      className="text-[10px] px-2.5 py-1.5 font-semibold rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1"
                    >
                      <X className="w-2.5 h-2.5" /> Reject All
                    </button>
                    <button
                      onClick={() => setShowModal(true)}
                      className="text-[10px] px-2 py-1.5 font-medium text-indigo-600 underline flex items-center gap-1"
                    >
                      <Settings2 className="w-2.5 h-2.5" /> Customize
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Post-consent overlay */}
          {consented && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm">
              <div className="text-center space-y-2">
                <div
                  className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${consented === 'accepted' ? 'bg-green-100' : 'bg-slate-100'}`}
                >
                  {consented === 'accepted' ? (
                    <Check className="w-6 h-6 text-green-600" />
                  ) : (
                    <X className="w-6 h-6 text-slate-500" />
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  {consented === 'accepted' ? 'Preferences saved!' : 'Non-essential cookies declined'}
                </p>
                <button
                  onClick={() => { setConsented(null); setShowModal(false); }}
                  className="text-[10px] text-indigo-600 underline"
                >
                  Reset demo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
