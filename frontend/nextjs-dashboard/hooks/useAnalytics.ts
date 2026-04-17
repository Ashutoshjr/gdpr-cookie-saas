'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { ConsentSummary, DailyConsent, CategoryRate } from '@/lib/types';

export function useAnalytics(websiteId: string, days: number = 30) {
  const [summary, setSummary] = useState<ConsentSummary | null>(null);
  const [trend, setTrend] = useState<DailyConsent[]>([]);
  const [categoryRates, setCategoryRates] = useState<CategoryRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!websiteId) return;
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, trendRes, catRes] = await Promise.all([
        api.get<ConsentSummary>(`/api/analytics/summary?websiteId=${websiteId}`),
        api.get<DailyConsent[]>(`/api/analytics/trend?websiteId=${websiteId}&days=${days}`),
        api.get<CategoryRate[]>(`/api/analytics/categories?websiteId=${websiteId}`),
      ]);
      setSummary(summaryRes.data);
      setTrend(trendRes.data);
      setCategoryRates(catRes.data);
    } catch {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [websiteId, days]);

  useEffect(() => { fetch(); }, [fetch]);

  return { summary, trend, categoryRates, loading, error };
}
