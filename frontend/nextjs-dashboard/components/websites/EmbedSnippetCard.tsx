'use client';
import { useState } from 'react';
import { Copy, Check, Code2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface EmbedSnippetCardProps {
  apiKey: string;
  apiUrl: string;
}

export function EmbedSnippetCard({ apiKey, apiUrl }: EmbedSnippetCardProps) {
  const [copied, setCopied] = useState(false);

  const snippet = `<script
  src="${apiUrl}/api/sdk/cookie-consent.js"
  data-api-key="${apiKey}"
  data-api-url="${apiUrl}">
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    toast.success('Snippet copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-slate-800">
          <Code2 className="w-4 h-4 text-slate-200" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">Embed Snippet</h3>
          <p className="text-xs text-slate-500">Paste this into the &lt;head&gt; of your website.</p>
        </div>
      </div>

      <div className="relative">
        <pre className="bg-slate-900 text-green-400 font-mono text-xs p-4 rounded-xl overflow-x-auto leading-relaxed whitespace-pre">
          {snippet}
        </pre>
        <Button
          size="sm"
          onClick={handleCopy}
          className="absolute top-2.5 right-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg h-7 text-xs px-3"
        >
          {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>

      <p className="text-xs text-slate-400">
        Add your third-party scripts with{' '}
        <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">type=&quot;text/plain&quot;</code>{' '}
        and{' '}
        <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">data-category=&quot;analytics&quot;</code>{' '}
        to block them until consent is given.
      </p>
    </div>
  );
}
