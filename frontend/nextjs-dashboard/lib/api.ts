import axios from 'axios';
import type { AuthUser } from './types';

const STORAGE_KEY = 'cc_auth_user';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
});

// Attach Bearer token from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const user = JSON.parse(raw) as AuthUser;
        if (user?.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      }
    } catch {
      // ignore parse errors
    }
  }
  return config;
});

// On 401 → clear auth state and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      document.cookie = 'cc_auth_flag=; max-age=0; path=/; SameSite=Lax';
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── API helpers ──────────────────────────────────────────────────────────

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    return data?.message || data?.title || error.message || 'Something went wrong.';
  }
  return 'Something went wrong.';
}
