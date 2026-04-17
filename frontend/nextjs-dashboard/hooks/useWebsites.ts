'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type {
  WebsiteDto, CreateWebsiteRequest, UpdateWebsiteInfoRequest,
  UpdateBannerAppearanceRequest,
} from '@/lib/types';

export function useWebsites() {
  const [websites, setWebsites] = useState<WebsiteDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<WebsiteDto[]>('/api/websites');
      setWebsites(res.data);
      setError(null);
    } catch {
      setError('Failed to load websites');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const createWebsite = async (data: CreateWebsiteRequest): Promise<WebsiteDto> => {
    const res = await api.post<WebsiteDto>('/api/websites', data);
    await fetchAll();
    return res.data;
  };

  const updateInfo = async (id: string, data: UpdateWebsiteInfoRequest): Promise<WebsiteDto> => {
    const res = await api.put<WebsiteDto>(`/api/websites/${id}`, data);
    await fetchAll();
    return res.data;
  };

  const updateAppearance = async (id: string, data: UpdateBannerAppearanceRequest): Promise<WebsiteDto> => {
    const res = await api.patch<WebsiteDto>(`/api/websites/${id}/appearance`, data);
    await fetchAll();
    return res.data;
  };

  const regenerateKey = async (id: string): Promise<WebsiteDto> => {
    const res = await api.post<WebsiteDto>(`/api/websites/${id}/regenerate-key`);
    await fetchAll();
    return res.data;
  };

  const getCookiePolicy = async (id: string): Promise<string> => {
    const res = await api.get<{ html: string }>(`/api/websites/${id}/cookie-policy`);
    return res.data.html;
  };

  const deleteWebsite = async (id: string): Promise<void> => {
    await api.delete(`/api/websites/${id}`);
    setWebsites((prev) => prev.filter((w) => w.id !== id));
  };

  return {
    websites, loading, error,
    createWebsite, updateInfo, updateAppearance,
    regenerateKey, getCookiePolicy, deleteWebsite,
    refetch: fetchAll,
  };
}

export function useWebsite(id: string) {
  const [website, setWebsite] = useState<WebsiteDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.get<WebsiteDto>(`/api/websites/${id}`);
      setWebsite(res.data);
      setError(null);
    } catch {
      setError('Website not found');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { website, loading, error, refetch: fetch, setWebsite };
}
