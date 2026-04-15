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
import { WebsiteService } from '../../../core/services/website.service';

@Component({
  selector: 'app-website-new',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="page-header">
      <button mat-icon-button routerLink="/websites"><mat-icon>arrow_back</mat-icon></button>
      <h2>Add New Website</h2>
    </div>

    <mat-card class="form-card">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Website Name</mat-label>
            <input matInput formControlName="name" placeholder="My Company Website" />
            <mat-hint>A friendly name to identify this website in the dashboard</mat-hint>
            @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
              <mat-error>Website name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width" style="margin-top:8px">
            <mat-label>Domain URL</mat-label>
            <input matInput formControlName="domain" placeholder="https://example.com" />
            <mat-hint>The full URL of your website including https://</mat-hint>
            @if (form.get('domain')?.hasError('required') && form.get('domain')?.touched) {
              <mat-error>Domain is required</mat-error>
            } @else if (form.get('domain')?.hasError('pattern') && form.get('domain')?.touched) {
              <mat-error>Must be a valid URL (e.g. https://example.com)</mat-error>
            }
          </mat-form-field>

          <div class="form-actions">
            <a mat-stroked-button routerLink="/websites">Cancel</a>
            <button mat-raised-button color="primary" type="submit" [disabled]="loading">
              @if (loading) { <mat-spinner diameter="20"></mat-spinner> }
              @else { Create Website }
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .page-header { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
    .page-header h2 { margin: 0; font-size: 24px; color: #1e293b; }
    .form-card { max-width: 560px; }
    .form-card mat-card-content { padding: 24px; }
    .full-width { width: 100%; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
  `]
})
export class WebsiteNewComponent {
  private fb = inject(FormBuilder);
  private websiteService = inject(WebsiteService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  loading = false;

  form = this.fb.group({
    name: ['', Validators.required],
    domain: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]]
  });

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    const { name, domain } = this.form.value;
    this.websiteService.create({ name: name!, domain: domain! }).subscribe({
      next: (w) => this.router.navigate(['/websites', w.id]),
      error: (err) => {
        this.loading = false;
        const msg = err.error?.message || 'Failed to create website.';
        this.snack.open(msg, 'Close', { duration: 4000 });
      }
    });
  }
}
