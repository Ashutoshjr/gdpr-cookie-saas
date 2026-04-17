import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <div class="auth-logo">
            <mat-icon>cookie</mat-icon>
            <h1>CookieConsent</h1>
          </div>
          <mat-card-subtitle>Sign in to your dashboard</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email" />
              <mat-icon matPrefix>email</mat-icon>
              @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                <mat-error>Email is required</mat-error>
              } @else if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                <mat-error>Please enter a valid email</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" autocomplete="current-password" />
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit"
                    class="full-width submit-btn" [disabled]="loading">
              @if (loading) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Sign In
              }
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <p class="auth-link"><a routerLink="/forgot-password">Forgot password?</a></p>
          <p class="auth-link">Don't have an account? <a routerLink="/register">Create one</a></p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f0f4f8; padding: 16px; }
    .auth-card { width: 100%; max-width: 420px; padding: 8px; }
    .auth-logo { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .auth-logo mat-icon { font-size: 32px; width: 32px; height: 32px; color: #1a73e8; }
    .auth-logo h1 { margin: 0; font-size: 22px; color: #1e293b; }
    .full-width { width: 100%; margin-bottom: 12px; }
    .submit-btn { height: 44px; font-size: 16px; }
    .auth-link { text-align: center; font-size: 14px; color: #666; margin: 0; }
    .auth-link a { color: #1a73e8; text-decoration: none; font-weight: 500; }
    mat-card-actions { justify-content: center; padding-bottom: 16px !important; }
    mat-spinner { display: inline-block; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  hidePassword = true;
  loading = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    const { email, password } = this.form.value;
    this.auth.login({ email: email!, password: password! }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loading = false;
        const msg = err.error?.message || 'Login failed. Please check your credentials.';
        this.snack.open(msg, 'Close', { duration: 4000, panelClass: 'snack-error' });
      }
    });
  }
}
