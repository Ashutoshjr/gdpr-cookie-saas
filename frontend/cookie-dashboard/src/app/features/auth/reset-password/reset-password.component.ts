import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/auth/auth.service';

function passwordMatchValidator(control: AbstractControl) {
  const pw = control.get('newPassword')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return pw && confirm && pw !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-reset-password',
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
          <mat-card-subtitle>Set a new password</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (!done()) {
            @if (!token()) {
              <div class="error-box">
                <mat-icon>error</mat-icon>
                <p>Invalid reset link. Please request a new one.</p>
                <a routerLink="/forgot-password" mat-stroked-button>Request Reset Link</a>
              </div>
            } @else {
              <form [formGroup]="form" (ngSubmit)="submit()">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>New Password</mat-label>
                  <input matInput type="password" formControlName="newPassword" autocomplete="new-password">
                  <mat-icon matPrefix>lock</mat-icon>
                  @if (form.get('newPassword')?.hasError('minlength')) {
                    <mat-error>Minimum 6 characters</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Confirm New Password</mat-label>
                  <input matInput type="password" formControlName="confirmPassword" autocomplete="new-password">
                  <mat-icon matPrefix>lock_outline</mat-icon>
                  @if (form.hasError('passwordMismatch') && form.get('confirmPassword')?.touched) {
                    <mat-error>Passwords do not match</mat-error>
                  }
                </mat-form-field>

                @if (error()) {
                  <p class="error-msg">{{ error() }}</p>
                }

                <button mat-raised-button color="primary" type="submit"
                        class="full-width submit-btn" [disabled]="loading() || form.invalid">
                  @if (loading()) { <mat-spinner diameter="20"></mat-spinner> }
                  @else { Reset Password }
                </button>
              </form>
            }
          } @else {
            <div class="success-box">
              <mat-icon class="success-icon">check_circle</mat-icon>
              <h3>Password Reset!</h3>
              <p>Your password has been changed. You can now log in.</p>
              <a routerLink="/login" mat-raised-button color="primary" style="margin-top:12px">
                Go to Login
              </a>
            </div>
          }
        </mat-card-content>

        @if (!done()) {
          <mat-card-actions>
            <a routerLink="/login" mat-button><mat-icon>arrow_back</mat-icon> Back to Login</a>
          </mat-card-actions>
        }
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
    .error-msg { color: #ef4444; font-size: 13px; margin: -8px 0 8px; }
    .success-box { text-align: center; padding: 16px 0; }
    .success-icon { font-size: 56px; width: 56px; height: 56px; color: #22c55e; }
    .success-box h3 { margin: 8px 0 4px; font-size: 18px; }
    .success-box p { color: #64748b; font-size: 14px; }
    .error-box { text-align: center; padding: 16px 0; }
    .error-box mat-icon { font-size: 48px; width: 48px; height: 48px; color: #ef4444; }
    .error-box p { color: #64748b; font-size: 14px; margin: 8px 0 16px; }
  `]
})
export class ResetPasswordComponent implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  loading = signal(false);
  error = signal('');
  done = signal(false);
  token = signal('');

  form = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  ngOnInit() {
    this.token.set(this.route.snapshot.queryParamMap.get('token') ?? '');
  }

  submit() {
    if (this.form.invalid || !this.token()) return;
    this.loading.set(true);
    this.error.set('');

    this.authService.resetPassword(this.token(), this.form.value.newPassword!).subscribe({
      next: () => { this.loading.set(false); this.done.set(true); },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Invalid or expired token. Please request a new reset link.');
      }
    });
  }
}
