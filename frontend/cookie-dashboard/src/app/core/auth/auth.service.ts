import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  userId: string;
  email: string;
  fullName: string;
  token: string;
  expiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  plan: string;
}

export interface UsageSummary {
  plan: string;
  websitesUsed: number;
  websitesLimit: number;       // -1 = unlimited
  consentsThisMonth: number;
  consentsLimit: number;       // -1 = unlimited
  websiteLimitReached: boolean;
  consentLimitReached: boolean;
}

const STORAGE_KEY = 'cc_auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _user$ = new BehaviorSubject<AuthUser | null>(this.loadFromStorage());
  user$ = this._user$.asObservable();

  login(request: LoginRequest): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${environment.apiUrl}/api/auth/login`, request).pipe(
      tap(user => this.setUser(user))
    );
  }

  register(request: RegisterRequest): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${environment.apiUrl}/api/auth/register`, request).pipe(
      tap(user => this.setUser(user))
    );
  }

  forgotPassword(email: string): Observable<{ message: string; resetToken: string }> {
    return this.http.post<{ message: string; resetToken: string }>(
      `${environment.apiUrl}/api/auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}/api/auth/reset-password`, { token, newPassword });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}/api/auth/change-password`, { currentPassword, newPassword });
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${environment.apiUrl}/api/auth/profile`);
  }

  getUsageSummary(): Observable<UsageSummary> {
    return this.http.get<UsageSummary>(`${environment.apiUrl}/api/auth/usage`);
  }

  upgradePlan(plan: string): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${environment.apiUrl}/api/auth/upgrade`, { plan });
  }

  deleteAccount(): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/auth/account`);
  }

  updateProfile(fullName: string, email: string): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${environment.apiUrl}/api/auth/profile`, { fullName, email }).pipe(
      tap(profile => {
        const user = this._user$.value;
        if (user) this.setUser({ ...user, fullName: profile.fullName, email: profile.email });
      })
    );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this._user$.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._user$.value?.token ?? null;
  }

  isAuthenticated(): boolean {
    const user = this._user$.value;
    if (!user) return false;
    return new Date(user.expiresAt) > new Date();
  }

  getCurrentUser(): AuthUser | null {
    return this._user$.value;
  }

  private setUser(user: AuthUser): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this._user$.next(user);
  }

  private loadFromStorage(): AuthUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
