import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiEndpoint } from '../tokens/api-base-url.token';
import { ApiResponse } from '../models/api-response.model';
import { CouponValidationResult } from '../models/coupon.model';

@Injectable({ providedIn: 'root' })
export class CouponService {
  private http = inject(HttpClient);
  private apiUrl = apiEndpoint('coupons');

  appliedCoupon = signal<CouponValidationResult | null>(null);

  validate(code: string, orderTotal: number): Observable<ApiResponse<CouponValidationResult>> {
    return this.http.post<ApiResponse<CouponValidationResult>>(`${this.apiUrl}/validate`, {
      code,
      order_total: orderTotal,
    });
  }

  apply(result: CouponValidationResult): void {
    this.appliedCoupon.set(result);
  }

  clear(): void {
    this.appliedCoupon.set(null);
  }
}
