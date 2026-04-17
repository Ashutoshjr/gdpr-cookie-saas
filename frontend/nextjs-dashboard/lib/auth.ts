import type { AuthUser } from './types';

const STORAGE_KEY = 'cc_auth_user';

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function isTokenValid(user: AuthUser): boolean {
  return new Date(user.expiresAt) > new Date();
}

export function getCurrentUser(): AuthUser | null {
  const user = getStoredUser();
  if (!user || !isTokenValid(user)) return null;
  return user;
}

export function setAuthCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = 'cc_auth_flag=1; path=/; max-age=86400; SameSite=Lax';
}

export function clearAuthCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = 'cc_auth_flag=; max-age=0; path=/; SameSite=Lax';
}

export function getUserInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
