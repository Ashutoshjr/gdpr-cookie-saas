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
