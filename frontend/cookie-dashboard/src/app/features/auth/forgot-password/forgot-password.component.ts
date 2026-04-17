import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <div class="auth-logo">
            <mat-icon>cookie</mat-icon>
            <h1>CookieConsent</h1>
          </div>
          <mat-card-subtitle>Reset your password</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (!sent()) {
            <p class="hint">Enter your email address and we'll send you a reset link.</p>
            <form [formGroup]="form" (ngSubmit)="submit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email address</mat-label>
                <input matInput type="email" formControlName="email" autocomplete="email">
                <mat-icon matPrefix>email</mat-icon>
              </mat-form-field>

              @if (error()) {
                <p class="error-msg">{{ error() }}</p>
              }

              <button mat-raised-button color="primary" type="submit"
                      class="full-width submit-btn" [disabled]="loading() || form.invalid">
                @if (loading()) { <mat-spinner diameter="20"></mat-spinner> }
                @else { Send Reset Link }
              </button>
            </form>
          } @else {
            <div class="success-box">
              <mat-icon class="success-icon">check_circle</mat-icon>
              <h3>Check your email</h3>
              <p>A password reset link has been sent to <strong>{{ form.value.email }}</strong>.</p>
              @if (devToken()) {
                <div class="dev-token">
                  <p><strong>Dev mode:</strong> Use this token to reset:</p>
                  <code>{{ devToken() }}</code>
                  <a [routerLink]="['/reset-password']" [queryParams]="{ token: devToken() }" mat-stroked-button color="primary" style="margin-top:8px;display:block">
                    Go to Reset Password
                  </a>
                </div>
              }
            </div>
          }
        </mat-card-content>

        <mat-card-actions>
          <a routerLink="/login" mat-button>
            <mat-icon>arrow_back</mat-icon> Back to Login
          </a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f1f5f9; padding: 16px; }
    .auth-card { width: 100%; max-width: 420px; }
    .auth-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
    .auth-logo mat-icon { font-size: 32px; width: 32px; height: 32px; color: #1a73e8; }
    .auth-logo h1 { margin: 0; font-size: 22px; color: #1e293b; }
    mat-card-content { padding: 16px 16px 0; }
    mat-card-actions { padding: 8px 16px 16px; }
    .full-width { width: 100%; }
    .submit-btn { height: 44px; margin-top: 8px; }
    .hint { color: #64748b; font-size: 14px; margin: 0 0 16px; }
    .error-msg { color: #ef4444; font-size: 13px; margin: -8px 0 8px; }
    .success-box { text-align: center; padding: 16px 0; }
    .success-icon { font-size: 56px; width: 56px; height: 56px; color: #22c55e; }
    .success-box h3 { margin: 8px 0 4px; font-size: 18px; }
    .success-box p { color: #64748b; font-size: 14px; }
    .dev-token { background: #fef9c3; border: 1px solid #fde047; border-radius: 8px; padding: 12px; margin-top: 16px; text-align: left; }
    .dev-token p { margin: 0 0 6px; font-size: 12px; color: #854d0e; }
    .dev-token code { display: block; font-size: 11px; word-break: break-all; background: #fff; padding: 6px 8px; border-radius: 4px; border: 1px solid #e5e7eb; }
  `]
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  loading = signal(false);
  error = signal('');
  sent = signal(false);
  devToken = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    this.authService.forgotPassword(this.form.value.email!).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.sent.set(true);
        // Show token in dev mode (in production this would be emailed)
        if (res.resetToken && res.resetToken !== 'If that email exists, a reset link has been sent.') {
          this.devToken.set(res.resetToken);
        }
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Something went wrong. Please try again.');
      }
    });
  }
}
