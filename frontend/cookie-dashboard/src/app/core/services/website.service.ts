import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WebsiteModel, CreateWebsiteRequest } from '../../shared/models/website.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WebsiteService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/websites`;

  getAll(): Observable<WebsiteModel[]> {
    return this.http.get<WebsiteModel[]>(this.base);
  }

  getById(id: string): Observable<WebsiteModel> {
    return this.http.get<WebsiteModel>(`${this.base}/${id}`);
  }

  create(request: CreateWebsiteRequest): Observable<WebsiteModel> {
    return this.http.post<WebsiteModel>(this.base, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
