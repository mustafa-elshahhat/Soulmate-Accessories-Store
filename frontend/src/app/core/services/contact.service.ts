import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { ApiResponse } from '../models/api-response.model';

export interface ContactRequest {
  name: string;
  email: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private http = inject(HttpClient);
  private apiUrl = `${inject(API_BASE_URL)}/api/contact`;

  send(data: ContactRequest): Observable<string> {
    return this.http.post<ApiResponse<string>>(this.apiUrl, data).pipe(
      map((res) => res.message ?? '')
    );
  }
}
