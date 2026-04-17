import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexChart, ApexNonAxisChartSeries, ApexAxisChartSeries,
  ApexXAxis, ApexYAxis, ApexDataLabels, ApexPlotOptions,
  ApexLegend, ApexTooltip, ApexStroke, ApexFill, ApexGrid
} from 'ng-apexcharts';

import { WebsiteService } from '../../core/services/website.service';
import { AnalyticsService, ConsentSummary, DailyConsent, CategoryRate } from '../../core/services/analytics.service';
import { WebsiteModel } from '../../shared/models/website.model';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatSelectModule, MatFormFieldModule,
    MatProgressSpinnerModule, MatIconModule, MatButtonToggleModule,
    NgApexchartsModule
  ],
  template: `
    <div class="page-header">
      <mat-icon>bar_chart</mat-icon>
      <h2>Consent Analytics</h2>
    </div>

    <!-- Website + Period Selectors -->
    <div class="toolbar">
      <mat-form-field appearance="outline" class="site-select">
        <mat-label>Website</mat-label>
        <mat-select [(ngModel)]="selectedWebsiteId" (ngModelChange)="loadData()">
          @for (w of websites(); track w.id) {
            <mat-option [value]="w.id">{{ w.name }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-button-toggle-group [(ngModel)]="days" (ngModelChange)="loadTrend()" class="period-toggle">
        <mat-button-toggle [value]="7">7d</mat-button-toggle>
        <mat-button-toggle [value]="30">30d</mat-button-toggle>
        <mat-button-toggle [value]="90">90d</mat-button-toggle>
      </mat-button-toggle-group>
    </div>

    @if (!selectedWebsiteId) {
      <div class="empty-state">
        <mat-icon>bar_chart</mat-icon>
        <p>Select a website to view analytics</p>
      </div>
    } @else if (loading()) {
      <div class="loading-center"><mat-spinner></mat-spinner></div>
    } @else {

      <!-- Stat Cards -->
      <div class="stat-grid">
        <mat-card class="stat-card">
          <mat-icon class="stat-icon total">fact_check</mat-icon>
          <div class="stat-value">{{ summary()?.totalConsents ?? 0 }}</div>
          <div class="stat-label">Total Consents</div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon class="stat-icon accept">check_circle</mat-icon>
          <div class="stat-value">{{ summary()?.acceptRate ?? 0 }}%</div>
          <div class="stat-label">Accept Rate</div>
          <div class="stat-sub">{{ summary()?.acceptedAll }} accepted all</div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon class="stat-icon reject">cancel</mat-icon>
          <div class="stat-value">{{ summary()?.rejectRate ?? 0 }}%</div>
          <div class="stat-label">Reject Rate</div>
          <div class="stat-sub">{{ summary()?.rejectedAll }} rejected all</div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon class="stat-icon custom">tune</mat-icon>
          <div class="stat-value">{{ summary()?.customizeRate ?? 0 }}%</div>
          <div class="stat-label">Customized</div>
          <div class="stat-sub">{{ summary()?.customized }} customized</div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon class="stat-icon month">calendar_month</mat-icon>
          <div class="stat-value">{{ summary()?.thisMonth ?? 0 }}</div>
          <div class="stat-label">This Month</div>
        </mat-card>
      </div>

      <!-- Charts Row -->
      <div class="charts-grid">

        <!-- Donut: Accept vs Reject vs Customize -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Consent Breakdown</mat-card-title>
            <mat-card-subtitle>How visitors respond to the banner</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            @if ((summary()?.totalConsents ?? 0) === 0) {
              <div class="no-data">No consent data yet</div>
            } @else {
              <apx-chart
                [series]="donutSeries"
                [chart]="donutChart"
                [labels]="donutLabels"
                [colors]="donutColors"
                [legend]="donutLegend"
                [dataLabels]="donutDataLabels"
                [plotOptions]="donutPlotOptions"
                [tooltip]="donutTooltip">
              </apx-chart>
            }
          </mat-card-content>
        </mat-card>

        <!-- Bar: Category Rates -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Category Acceptance</mat-card-title>
            <mat-card-subtitle>% of visitors who accepted each category</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            @if (categoryRates().length === 0) {
              <div class="no-data">No consent data yet</div>
            } @else {
              <apx-chart
                [series]="barSeries"
                [chart]="barChart"
                [xaxis]="barXAxis"
                [yaxis]="barYAxis"
                [colors]="barColors"
                [dataLabels]="barDataLabels"
                [plotOptions]="barPlotOptions"
                [tooltip]="barTooltip"
                [grid]="barGrid">
              </apx-chart>
            }
          </mat-card-content>
        </mat-card>

        <!-- Line: Trend -->
        <mat-card class="chart-card chart-full">
          <mat-card-header>
            <mat-card-title>Consent Trend</mat-card-title>
            <mat-card-subtitle>Daily consents over the last {{ days }} days</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            @if (trend().every(d => d.total === 0)) {
              <div class="no-data">No consent data in this period</div>
            } @else {
              <apx-chart
                [series]="lineSeries"
                [chart]="lineChart"
                [xaxis]="lineXAxis"
                [yaxis]="lineYAxis"
                [stroke]="lineStroke"
                [fill]="lineFill"
                [colors]="lineColors"
                [dataLabels]="lineDataLabels"
                [tooltip]="lineTooltip"
                [grid]="lineGrid">
              </apx-chart>
            }
          </mat-card-content>
        </mat-card>

      </div>
    }
  `,
  styles: [`
    .page-header { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
    .page-header mat-icon { color: #1a73e8; font-size: 28px; width: 28px; height: 28px; }
    .page-header h2 { margin: 0; font-size: 24px; color: #1e293b; }

    .toolbar { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .site-select { min-width: 220px; }
    .period-toggle { height: 40px; }

    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 80px; color: #94a3b8; gap: 8px; }
    .empty-state mat-icon { font-size: 56px; width: 56px; height: 56px; }
    .empty-state p { font-size: 16px; margin: 0; }
    .loading-center { display: flex; justify-content: center; padding: 80px; }

    /* Stat Cards */
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 20px; }
    .stat-card { padding: 16px 20px; display: flex; flex-direction: column; align-items: flex-start; gap: 2px; }
    .stat-icon { font-size: 28px; width: 28px; height: 28px; margin-bottom: 4px; }
    .stat-icon.total { color: #1a73e8; }
    .stat-icon.accept { color: #22c55e; }
    .stat-icon.reject { color: #ef4444; }
    .stat-icon.custom { color: #f59e0b; }
    .stat-icon.month { color: #8b5cf6; }
    .stat-value { font-size: 28px; font-weight: 700; color: #1e293b; line-height: 1; }
    .stat-label { font-size: 13px; color: #64748b; font-weight: 500; }
    .stat-sub { font-size: 11px; color: #94a3b8; }

    /* Charts */
    .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px; }
    .chart-card { overflow: hidden; }
    .chart-full { grid-column: 1 / -1; }
    mat-card-title { font-size: 15px; }
    .no-data { display: flex; align-items: center; justify-content: center; height: 200px;
      color: #94a3b8; font-size: 14px; }

    @media (max-width: 600px) {
      .stat-grid { grid-template-columns: repeat(2, 1fr); }
      .charts-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AnalyticsComponent implements OnInit {
  private websiteService = inject(WebsiteService);
  private analyticsService = inject(AnalyticsService);

  websites = signal<WebsiteModel[]>([]);
  loading = signal(false);
  summary = signal<ConsentSummary | null>(null);
  trend = signal<DailyConsent[]>([]);
  categoryRates = signal<CategoryRate[]>([]);

  selectedWebsiteId = '';
  days = 30;

  // ── Donut chart config ──────────────────────────────────────────────────────
  donutSeries: ApexNonAxisChartSeries = [];
  donutLabels: string[] = ['Accepted All', 'Rejected All', 'Customized'];
  donutColors = ['#22c55e', '#ef4444', '#f59e0b'];
  donutChart: ApexChart = { type: 'donut', height: 260, fontFamily: 'inherit' };
  donutLegend: ApexLegend = { position: 'bottom' };
  donutDataLabels: ApexDataLabels = { enabled: true, formatter: (val: number) => val.toFixed(1) + '%' };
  donutPlotOptions: ApexPlotOptions = { pie: { donut: { size: '60%' } } };
  donutTooltip: ApexTooltip = { y: { formatter: (val: number) => val + ' consents' } };

  // ── Bar chart config ────────────────────────────────────────────────────────
  barSeries: ApexAxisChartSeries = [];
  barChart: ApexChart = { type: 'bar', height: 260, fontFamily: 'inherit', toolbar: { show: false } };
  barXAxis: ApexXAxis = { categories: [] };
  barYAxis: ApexYAxis = { min: 0, max: 100, labels: { formatter: (v: number) => v + '%' } };
  barColors = ['#1a73e8'];
  barDataLabels: ApexDataLabels = { enabled: true, formatter: (val: number) => val + '%' };
  barPlotOptions: ApexPlotOptions = { bar: { borderRadius: 4, columnWidth: '50%' } };
  barTooltip: ApexTooltip = { y: { formatter: (val: number) => val + '%' } };
  barGrid: ApexGrid = { borderColor: '#f1f5f9' };

  // ── Line chart config ───────────────────────────────────────────────────────
  lineSeries: ApexAxisChartSeries = [];
  lineChart: ApexChart = { type: 'area', height: 280, fontFamily: 'inherit', toolbar: { show: false }, zoom: { enabled: false } };
  lineXAxis: ApexXAxis = { type: 'category', categories: [], tickAmount: 10,
    labels: { rotate: -30, style: { fontSize: '11px' } } };
  lineYAxis: ApexYAxis = { min: 0, labels: { formatter: (v: number) => Math.round(v) + '' } };
  lineStroke: ApexStroke = { curve: 'smooth', width: 2 };
  lineFill: ApexFill = { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 } };
  lineColors = ['#1a73e8', '#22c55e', '#ef4444'];
  lineDataLabels: ApexDataLabels = { enabled: false };
  lineTooltip: ApexTooltip = { shared: true, intersect: false };
  lineGrid: ApexGrid = { borderColor: '#f1f5f9' };

  ngOnInit() {
    this.websiteService.getAll().subscribe({
      next: (sites) => {
        this.websites.set(sites);
        if (sites.length > 0) {
          this.selectedWebsiteId = sites[0].id;
          this.loadData();
        }
      }
    });
  }

  loadData() {
    if (!this.selectedWebsiteId) return;
    this.loading.set(true);

    let pending = 3;
    const done = () => { if (--pending === 0) this.loading.set(false); };

    this.analyticsService.getSummary(this.selectedWebsiteId).subscribe({
      next: (s) => { this.summary.set(s); this.updateDonut(s); this.updateBarAxis(); done(); },
      error: () => done()
    });

    this.analyticsService.getTrend(this.selectedWebsiteId, this.days).subscribe({
      next: (t) => { this.trend.set(t); this.updateLine(t); done(); },
      error: () => done()
    });

    this.analyticsService.getCategoryRates(this.selectedWebsiteId).subscribe({
      next: (r) => { this.categoryRates.set(r); this.updateBar(r); done(); },
      error: () => done()
    });
  }

  loadTrend() {
    if (!this.selectedWebsiteId) return;
    this.analyticsService.getTrend(this.selectedWebsiteId, this.days).subscribe({
      next: (t) => { this.trend.set(t); this.updateLine(t); }
    });
  }

  private updateDonut(s: ConsentSummary) {
    this.donutSeries = [s.acceptedAll, s.rejectedAll, s.customized];
  }

  private updateBar(rates: CategoryRate[]) {
    this.barXAxis = { ...this.barXAxis, categories: rates.map(r => this.capitalize(r.category)) };
    this.barSeries = [{ name: 'Accept Rate', data: rates.map(r => Math.round(r.acceptRate)) }];
  }

  private updateBarAxis() {
    // called after category rates arrive — already handled in updateBar
  }

  private updateLine(trend: DailyConsent[]) {
    // Show last N dates — abbreviate to "Apr 15" format
    const labels = trend.map(d => {
      const [, m, day] = d.date.split('-');
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${months[parseInt(m) - 1]} ${parseInt(day)}`;
    });

    this.lineXAxis = { ...this.lineXAxis, categories: labels };
    this.lineSeries = [
      { name: 'Total', data: trend.map(d => d.total) },
      { name: 'Accepted', data: trend.map(d => d.accepted) },
      { name: 'Rejected', data: trend.map(d => d.rejected) }
    ];
  }

  private capitalize(s: string) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }
}
