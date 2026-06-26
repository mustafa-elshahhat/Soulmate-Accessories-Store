import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { apiEndpoint } from '../tokens/api-base-url.token';
import { ApiResponse } from '../models/api-response.model';
import { PaymentInfo, PaymentStatus } from '../models/payment.model';

export type { PaymentInfo, PaymentStatus } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = apiEndpoint('payments');
  private paymentInfoUrl = apiEndpoint('payment-info');

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
    return this.http.get<ApiResponse<PaymentInfo>>(this.paymentInfoUrl).pipe(map(res => res.data));
  }
}
