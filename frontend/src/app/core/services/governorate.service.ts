import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { ApiResponse } from '../models/api-response.model';
import { Governorate } from '../models/governorate.model';

export type { Governorate } from '../models/governorate.model';

@Injectable({ providedIn: 'root' })
export class GovernorateService {
  private http = inject(HttpClient);
  private apiUrl = `${inject(API_BASE_URL)}/api/governorates`;

  getAll(): Observable<Governorate[]> {
    return this.http.get<ApiResponse<Governorate[]>>(this.apiUrl).pipe(map(res => res.data));
  }
}
