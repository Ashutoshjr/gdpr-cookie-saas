import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ConsentSummary {
  totalConsents: number;
  acceptedAll: number;
  rejectedAll: number;
  customized: number;
  thisMonth: number;
  acceptRate: number;
  rejectRate: number;
  customizeRate: number;
}

export interface DailyConsent {
  date: string;
  total: number;
  accepted: number;
  rejected: number;
}

export interface CategoryRate {
  category: string;
  acceptedCount: number;
  totalCount: number;
  acceptRate: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/analytics`;

  getSummary(websiteId: string): Observable<ConsentSummary> {
    return this.http.get<ConsentSummary>(`${this.base}/summary?websiteId=${websiteId}`);
  }

  getTrend(websiteId: string, days = 30): Observable<DailyConsent[]> {
    return this.http.get<DailyConsent[]>(`${this.base}/trend?websiteId=${websiteId}&days=${days}`);
  }

  getCategoryRates(websiteId: string): Observable<CategoryRate[]> {
    return this.http.get<CategoryRate[]>(`${this.base}/categories?websiteId=${websiteId}`);
  }
}
