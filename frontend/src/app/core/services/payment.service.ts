import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { ApiResponse } from '../models/api-response.model';
import { PaymentInfo, PaymentStatus } from '../models/payment.model';

export type { PaymentInfo, PaymentStatus } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private apiBase = inject(API_BASE_URL);
  private apiUrl = `${this.apiBase}/api/payments`;

  uploadReceipt(orderId: string, method: string, screenshot: File): Observable<unknown> {
    const formData = new FormData();
    formData.append('screenshot', screenshot);
    formData.append('method', method);
    return this.http.post(`${this.apiUrl}/${orderId}/upload`, formData);
  }

  getPaymentStatus(orderId: string): Observable<PaymentStatus> {
    return this.http.get<ApiResponse<PaymentStatus>>(`${this.apiUrl}/${orderId}`).pipe(map(res => res.data));
  }

  getPaymentInfo(): Observable<PaymentInfo> {
    return this.http.get<ApiResponse<PaymentInfo>>(`${this.apiBase}/api/payment-info`).pipe(map(res => res.data));
  }
}
