import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService, UserProfile, UsageSummary } from '../../core/auth/auth.service';

function passwordMatchValidator(control: AbstractControl) {
  const pw = control.get('newPassword')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return pw && confirm && pw !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatDividerModule, MatProgressBarModule, MatChipsModule
  ],
  template: `
    <div class="page-header">
      <mat-icon>account_circle</mat-icon>
      <h2>My Profile</h2>
    </div>

    <div class="profile-grid">

      <!-- ── Plan & Usage Card ─────────────────────────────────── -->
      <mat-card class="plan-card">
        <mat-card-header>
          <mat-card-title><mat-icon>workspace_premium</mat-icon> Plan & Usage</mat-card-title>
          <mat-card-subtitle>Your current plan and resource usage</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          @if (loadingUsage()) {
            <div class="loading-center"><mat-spinner diameter="28"></mat-spinner></div>
          } @else if (usage()) {
            <div class="plan-badge-row">
              <span class="plan-badge" [class.pro]="usage()!.plan === 'pro'">
                <mat-icon>{{ usage()!.plan === 'pro' ? 'star' : 'lock_open' }}</mat-icon>
                {{ usage()!.plan === 'pro' ? 'Pro Plan' : 'Free Plan' }}
              </span>
              @if (usage()!.plan === 'free') {
                <button mat-raised-button color="primary" class="upgrade-btn"
                        [disabled]="upgradingPlan()" (click)="upgradeToPro()">
                  @if (upgradingPlan()) { <mat-spinner diameter="16"></mat-spinner> }
                  @else { <ng-container><mat-icon>rocket_launch</mat-icon> Upgrade to Pro</ng-container> }
                </button>
              } @else {
                <button mat-stroked-button color="warn" [disabled]="upgradingPlan()"
                        (click)="downgradeToFree()">Downgrade to Free</button>
              }
            </div>

            <mat-divider style="margin: 16px 0"></mat-divider>

            <!-- Websites usage -->
            <div class="usage-row">
              <div class="usage-label">
                <mat-icon>language</mat-icon>
                <span>Websites</span>
                <span class="usage-count">
                  {{ usage()!.websitesUsed }} / {{ usage()!.websitesLimit === -1 ? '∞' : usage()!.websitesLimit }}
                </span>
              </div>
              @if (usage()!.websitesLimit !== -1) {
                <mat-progress-bar
                  [value]="usagePct(usage()!.websitesUsed, usage()!.websitesLimit)"
                  [color]="usage()!.websiteLimitReached ? 'warn' : 'primary'">
                </mat-progress-bar>
                @if (usage()!.websiteLimitReached) {
                  <p class="limit-warning"><mat-icon>warning</mat-icon> Website limit reached — upgrade to add more</p>
                }
              } @else {
                <mat-progress-bar value="0" color="primary"></mat-progress-bar>
                <p class="unlimited-hint">Unlimited websites</p>
              }
            </div>

            <!-- Consents usage -->
            <div class="usage-row" style="margin-top:16px">
              <div class="usage-label">
                <mat-icon>fact_check</mat-icon>
                <span>Consents this month</span>
                <span class="usage-count">
                  {{ usage()!.consentsThisMonth | number }} / {{ usage()!.consentsLimit === -1 ? '∞' : (usage()!.consentsLimit | number) }}
                </span>
              </div>
              @if (usage()!.consentsLimit !== -1) {
                <mat-progress-bar
                  [value]="usagePct(usage()!.consentsThisMonth, usage()!.consentsLimit)"
                  [color]="usage()!.consentLimitReached ? 'warn' : 'primary'">
                </mat-progress-bar>
                @if (usage()!.consentLimitReached) {
                  <p class="limit-warning"><mat-icon>warning</mat-icon> Consent limit reached — new consents won't be recorded until next month or you upgrade</p>
                }
              } @else {
                <mat-progress-bar value="0" color="primary"></mat-progress-bar>
                <p class="unlimited-hint">Unlimited consents</p>
              }
            </div>

            <!-- Plan comparison table -->
            @if (usage()!.plan === 'free') {
              <mat-divider style="margin: 16px 0"></mat-divider>
              <p class="compare-title">What's included in Pro?</p>
              <div class="compare-grid">
                <div class="compare-row header">
                  <span>Feature</span><span>Free</span><span>Pro</span>
                </div>
                <div class="compare-row">
                  <span>Websites</span><span>1</span><span>Unlimited</span>
                </div>
                <div class="compare-row">
                  <span>Consents / month</span><span>1,000</span><span>Unlimited</span>
                </div>
                <div class="compare-row">
                  <span>CSV Export</span>
                  <mat-icon class="yes">check</mat-icon>
                  <mat-icon class="yes">check</mat-icon>
                </div>
                <div class="compare-row">
                  <span>Analytics</span>
                  <mat-icon class="yes">check</mat-icon>
                  <mat-icon class="yes">check</mat-icon>
                </div>
                <div class="compare-row">
                  <span>All Languages</span>
                  <mat-icon class="yes">check</mat-icon>
                  <mat-icon class="yes">check</mat-icon>
                </div>
              </div>
            }
          }
        </mat-card-content>
      </mat-card>

      <!-- ── Profile Info Card ──────────────────────────────────── -->
      <mat-card>
        <mat-card-header>
          <mat-card-title><mat-icon>person</mat-icon> Account Information</mat-card-title>
          <mat-card-subtitle>Update your name and email address</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          @if (loadingProfile()) {
            <div class="loading-center"><mat-spinner diameter="32"></mat-spinner></div>
          } @else {
            <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Full Name</mat-label>
                <input matInput formControlName="fullName">
                <mat-icon matPrefix>badge</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email Address</mat-label>
                <input matInput type="email" formControlName="email">
                <mat-icon matPrefix>email</mat-icon>
                @if (profileForm.get('email')?.hasError('email')) {
                  <mat-error>Enter a valid email address</mat-error>
                }
              </mat-form-field>

              @if (profile()) {
                <p class="member-since">Member since {{ profile()!.createdAt | date:'mediumDate' }}</p>
              }

              <button mat-raised-button color="primary" type="submit"
                      [disabled]="savingProfile() || profileForm.invalid">
                @if (savingProfile()) {
                  <mat-spinner diameter="18"></mat-spinner>
                } @else {
                  <ng-container><mat-icon>save</mat-icon> Save Changes</ng-container>
                }
              </button>
            </form>
          }
        </mat-card-content>
      </mat-card>

      <!-- ── Change Password Card ───────────────────────────────── -->
      <mat-card>
        <mat-card-header>
          <mat-card-title><mat-icon>lock</mat-icon> Change Password</mat-card-title>
          <mat-card-subtitle>Use a strong password you don't use elsewhere</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Current Password</mat-label>
              <input matInput type="password" formControlName="currentPassword" autocomplete="current-password">
              <mat-icon matPrefix>lock_outline</mat-icon>
            </mat-form-field>

            <mat-divider style="margin: 4px 0 16px"></mat-divider>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>New Password</mat-label>
              <input matInput type="password" formControlName="newPassword" autocomplete="new-password">
              <mat-icon matPrefix>lock</mat-icon>
              @if (passwordForm.get('newPassword')?.hasError('minlength')) {
                <mat-error>Minimum 6 characters</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirm New Password</mat-label>
              <input matInput type="password" formControlName="confirmPassword" autocomplete="new-password">
              <mat-icon matPrefix>lock_outline</mat-icon>
              @if (passwordForm.hasError('passwordMismatch') && passwordForm.get('confirmPassword')?.touched) {
                <mat-error>Passwords do not match</mat-error>
              }
            </mat-form-field>

            <button mat-raised-button color="warn" type="submit"
                    [disabled]="savingPassword() || passwordForm.invalid">
              @if (savingPassword()) {
                <mat-spinner diameter="18"></mat-spinner>
              } @else {
                <ng-container><mat-icon>key</mat-icon> Change Password</ng-container>
              }
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- ── Danger Zone Card ───────────────────────────────────── -->
      <mat-card class="danger-card">
        <mat-card-header>
          <mat-card-title><mat-icon>dangerous</mat-icon> Danger Zone</mat-card-title>
          <mat-card-subtitle>Irreversible actions — proceed with caution</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="danger-row">
            <div>
              <p class="danger-title">Delete Account</p>
              <p class="danger-desc">Permanently deletes your account, all websites, and all consent records. This cannot be undone.</p>
            </div>
            <button mat-stroked-button color="warn" [disabled]="deletingAccount()"
                    (click)="confirmDeleteAccount()">
              @if (deletingAccount()) {
                <mat-spinner diameter="18"></mat-spinner>
              } @else {
                <ng-container><mat-icon>delete_forever</mat-icon> Delete My Account</ng-container>
              }
            </button>
          </div>
        </mat-card-content>
      </mat-card>

    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
    .page-header mat-icon { color: #1a73e8; font-size: 28px; width: 28px; height: 28px; }
    .page-header h2 { margin: 0; font-size: 24px; color: #1e293b; }
    .profile-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 20px; }
    mat-card-title { display: flex; align-items: center; gap: 8px; }
    mat-card-content { padding-top: 12px; }
    .full-width { width: 100%; margin-bottom: 4px; }
    .loading-center { display: flex; justify-content: center; padding: 32px; }
    .member-since { font-size: 12px; color: #94a3b8; margin: -4px 0 12px; }

    /* Plan card */
    .plan-card { grid-column: 1 / -1; }
    .plan-badge-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .plan-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 16px;
      border-radius: 20px; font-weight: 600; font-size: 14px;
      background: #f1f5f9; color: #475569; }
    .plan-badge.pro { background: linear-gradient(135deg, #1a73e8, #7c3aed);
      color: #fff; box-shadow: 0 2px 8px rgba(26,115,232,.35); }
    .plan-badge mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .upgrade-btn { height: 36px; }

    /* Usage bars */
    .usage-row {}
    .usage-label { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 13px; color: #475569; }
    .usage-label mat-icon { font-size: 18px; width: 18px; height: 18px; color: #1a73e8; }
    .usage-count { margin-left: auto; font-weight: 600; color: #1e293b; font-size: 13px; }
    .limit-warning { display: flex; align-items: center; gap: 4px; color: #ef4444;
      font-size: 12px; margin: 4px 0 0; }
    .limit-warning mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .unlimited-hint { font-size: 11px; color: #94a3b8; margin: 4px 0 0; }

    /* Plan compare table */
    .compare-title { font-size: 13px; font-weight: 600; color: #475569; margin: 0 0 8px; }
    .compare-grid { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .compare-row { display: grid; grid-template-columns: 1fr 80px 80px; padding: 8px 12px;
      font-size: 13px; border-bottom: 1px solid #f1f5f9; align-items: center; }
    .compare-row:last-child { border-bottom: none; }
    .compare-row.header { background: #f8fafc; font-weight: 600; color: #475569; font-size: 12px; }
    .compare-row span:not(:first-child), .compare-row mat-icon { text-align: center; justify-self: center; }
    mat-icon.yes { color: #22c55e; font-size: 18px; width: 18px; height: 18px; }

    /* Danger zone */
    .danger-card { border: 1px solid #fecaca; }
    .danger-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
    .danger-title { margin: 0 0 4px; font-weight: 600; color: #dc2626; font-size: 14px; }
    .danger-desc { margin: 0; font-size: 13px; color: #64748b; max-width: 480px; }

    @media (max-width: 600px) { .profile-grid { grid-template-columns: 1fr; } .plan-card { grid-column: auto; } }
  `]
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private snack = inject(MatSnackBar);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loadingProfile = signal(true);
  loadingUsage = signal(true);
  savingProfile = signal(false);
  savingPassword = signal(false);
  upgradingPlan = signal(false);
  deletingAccount = signal(false);

  profile = signal<UserProfile | null>(null);
  usage = signal<UsageSummary | null>(null);

  profileForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  ngOnInit() {
    this.authService.getProfile().subscribe({
      next: (p) => {
        this.profile.set(p);
        this.profileForm.patchValue({ fullName: p.fullName, email: p.email });
        this.loadingProfile.set(false);
      },
      error: () => this.loadingProfile.set(false)
    });

    this.authService.getUsageSummary().subscribe({
      next: (u) => { this.usage.set(u); this.loadingUsage.set(false); },
      error: () => this.loadingUsage.set(false)
    });
  }

  saveProfile() {
    if (this.profileForm.invalid) return;
    this.savingProfile.set(true);
    const { fullName, email } = this.profileForm.value;
    this.authService.updateProfile(fullName!, email!).subscribe({
      next: (p) => {
        this.profile.set(p);
        this.savingProfile.set(false);
        this.snack.open('Profile updated!', '', { duration: 3000 });
      },
      error: (err) => {
        this.savingProfile.set(false);
        this.snack.open(err?.error?.message || 'Failed to update profile', '', { duration: 3000 });
      }
    });
  }

  changePassword() {
    if (this.passwordForm.invalid) return;
    this.savingPassword.set(true);
    const { currentPassword, newPassword } = this.passwordForm.value;
    this.authService.changePassword(currentPassword!, newPassword!).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.passwordForm.reset();
        this.snack.open('Password changed!', '', { duration: 3000 });
      },
      error: (err) => {
        this.savingPassword.set(false);
        this.snack.open(err?.error?.message || 'Failed to change password', '', { duration: 3000 });
      }
    });
  }

  upgradeToPro() {
    this.upgradingPlan.set(true);
    this.authService.upgradePlan('pro').subscribe({
      next: (p) => {
        this.profile.set(p);
        this.upgradingPlan.set(false);
        // Refresh usage after upgrade
        this.authService.getUsageSummary().subscribe(u => this.usage.set(u));
        this.snack.open('Upgraded to Pro!', '', { duration: 3000 });
      },
      error: () => {
        this.upgradingPlan.set(false);
        this.snack.open('Failed to upgrade plan', '', { duration: 3000 });
      }
    });
  }

  downgradeToFree() {
    const ok = window.confirm('Downgrade to Free plan? You will be limited to 1 website and 1,000 consents/month.');
    if (!ok) return;
    this.upgradingPlan.set(true);
    this.authService.upgradePlan('free').subscribe({
      next: (p) => {
        this.profile.set(p);
        this.upgradingPlan.set(false);
        this.authService.getUsageSummary().subscribe(u => this.usage.set(u));
        this.snack.open('Downgraded to Free plan', '', { duration: 3000 });
      },
      error: () => {
        this.upgradingPlan.set(false);
        this.snack.open('Failed to change plan', '', { duration: 3000 });
      }
    });
  }

  confirmDeleteAccount() {
    const confirmed = window.confirm(
      'DELETE ACCOUNT?\n\nThis will permanently delete:\n• Your account\n• All your websites\n• All consent records\n\nThis CANNOT be undone. Type OK to confirm.'
    );
    if (!confirmed) return;

    this.deletingAccount.set(true);
    this.authService.deleteAccount().subscribe({
      next: () => {
        this.authService.logout();
        this.snack.open('Account deleted.', '', { duration: 4000 });
      },
      error: () => {
        this.deletingAccount.set(false);
        this.snack.open('Failed to delete account', '', { duration: 3000 });
      }
    });
  }

  usagePct(used: number, limit: number): number {
    if (limit <= 0) return 0;
    return Math.min(100, Math.round((used / limit) * 100));
  }
}
