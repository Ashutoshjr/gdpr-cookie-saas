import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConsentModel, PagedResult } from '../../shared/models/consent.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ConsentService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/consents`;

  getByWebsite(websiteId: string, page = 1, pageSize = 20): Observable<PagedResult<ConsentModel>> {
    const params = new HttpParams()
      .set('websiteId', websiteId)
      .set('page', page)
      .set('pageSize', pageSize);
    return this.http.get<PagedResult<ConsentModel>>(this.base, { params });
  }

  exportCsv(websiteId: string): Observable<Blob> {
    const params = new HttpParams().set('websiteId', websiteId);
    return this.http.get(`${this.base}/export`, { params, responseType: 'blob' });
  }
}
