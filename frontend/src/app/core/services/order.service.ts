import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { apiEndpoint } from '../tokens/api-base-url.token';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { Order } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = apiEndpoint('orders');

  create(data: { address_id: string; items: unknown[]; coupon_code?: string }): Observable<Order> {
    return this.http.post<ApiResponse<Order>>(this.apiUrl, data).pipe(
      map(res => res.data)
    );
  }

  getMyOrders(page = 1, limit = 20): Observable<PaginatedResponse<Order>> {
    return this.http.get<PaginatedResponse<Order>>(this.apiUrl, {
      params: { page, limit }
    });
  }

  getById(id: string): Observable<Order> {
    return this.http.get<ApiResponse<Order>>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.data)
    );
  }

  cancel(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/cancel`, {});
  }
}
