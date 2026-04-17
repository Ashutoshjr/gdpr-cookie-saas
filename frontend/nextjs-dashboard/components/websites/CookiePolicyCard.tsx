'use client';
import { useState } from 'react';
import { FileText, Copy, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface CookiePolicyCardProps {
  onGenerate: () => Promise<string>;
}

export function CookiePolicyCard({ onGenerate }: CookiePolicyCardProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const policyHtml = await onGenerate();
      setHtml(policyHtml);
      toast.success('Cookie policy generated!');
    } catch {
      toast.error('Failed to generate policy.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (html) {
      navigator.clipboard.writeText(html);
      toast.success('HTML copied!');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-green-50">
            <FileText className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Cookie Policy Generator</h3>
            <p className="text-xs text-slate-500">Auto-generate a cookie policy based on your categories.</p>
          </div>
        </div>
        <div className="flex gap-2">
          {html && (
            <Button variant="outline" size="sm" onClick={handleCopy} className="rounded-xl h-8 text-xs">
              <Copy className="w-3 h-3 mr-1.5" /> Copy HTML
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-8 text-xs"
          >
            {loading ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
            ) : html ? (
              <RefreshCw className="w-3 h-3 mr-1.5" />
            ) : (
              <FileText className="w-3 h-3 mr-1.5" />
            )}
            {html ? 'Regenerate' : 'Generate Policy'}
          </Button>
        </div>
      </div>

      {html && (
        <div
          className="prose prose-sm max-w-none bg-slate-50 rounded-xl border border-slate-200 p-5 max-h-80 overflow-y-auto text-slate-700"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  );
}
