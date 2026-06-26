import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { apiEndpoint } from '../tokens/api-base-url.token';
import { ApiResponse } from '../models/api-response.model';
import { Promotion, Coupon } from '../models/coupon.model';
import { BoxReviewAdmin } from '../models/box-review.model';
import {
  DashboardStats,
  AdminOrder,
  AdminOrderDetail,
  AdminUser,
  AnalyticsData,
  AdminBoxType,
  AdminBoxTypeDetail,
} from '../models/admin.model';

export type {
  DashboardStats,
  AdminOrder,
  AdminOrderDetail,
  AdminUser,
  AnalyticsData,
  AdminBoxType,
  AdminBoxTypeDetail,
} from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = apiEndpoint('admin');

  getDashboard(): Observable<DashboardStats> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.apiUrl}/dashboard`).pipe(map(r => r.data));
  }

  getOrders(page = 1, limit = 20, status?: string, search?: string): Observable<{ data: AdminOrder[]; meta: { page: number; limit: number; total: number; total_pages: number } }> {
    const params: Record<string, string | number> = { page, limit };
    if (status) params['status'] = status;
    if (search) params['search'] = search;
    return this.http.get<{ success: boolean; data: AdminOrder[]; meta: { page: number; limit: number; total: number; total_pages: number } }>(`${this.apiUrl}/orders`, { params });
  }

  getOrder(id: string): Observable<AdminOrderDetail> {
    return this.http.get<ApiResponse<AdminOrderDetail>>(`${this.apiUrl}/orders/${id}`).pipe(map(r => r.data));
  }

  updateOrderStatus(id: string, status: string, adminNote?: string): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/orders/${id}/status`, { status, admin_note: adminNote });
  }

  verifyPayment(paymentId: string, action: 'verify' | 'reject', adminNote?: string): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/payments/${paymentId}/verify`, { action, admin_note: adminNote });
  }

  getUsers(page = 1, limit = 20): Observable<{ data: AdminUser[]; meta: { page: number; limit: number; total: number; total_pages: number } }> {
    return this.http.get<{ success: boolean; data: AdminUser[]; meta: { page: number; limit: number; total: number; total_pages: number } }>(`${this.apiUrl}/users`, { params: { page, limit } });
  }

  getAnalytics(): Observable<AnalyticsData> {
    return this.http.get<ApiResponse<AnalyticsData>>(`${this.apiUrl}/analytics`).pipe(map(r => r.data));
  }

  uploadProductImage(file: File): Observable<string> {
    const fd = new FormData();
    fd.append('image', file);
    return this.http.post<{ success: boolean; data: { url: string } }>(`${this.apiUrl}/uploads/product-image`, fd).pipe(map(r => r.data.url));
  }

  // Products Admin
  getProducts(page = 1, limit = 50, search?: string): Observable<{ data: { id: string; name: string; name_en: string; slug: string; description: string; description_en: string; price: number; image_url: string; category: string; gender: string; is_active: boolean; is_standalone: boolean; is_builder_item: boolean }[]; meta: { page: number; limit: number; total: number; total_pages: number } }> {
    const params: Record<string, string | number> = { page, limit };
    if (search) params['search'] = search;
    return this.http.get<{ success: boolean; data: { id: string; name: string; name_en: string; slug: string; description: string; description_en: string; price: number; image_url: string; category: string; gender: string; is_active: boolean; is_standalone: boolean; is_builder_item: boolean }[]; meta: { page: number; limit: number; total: number; total_pages: number } }>(`${this.apiUrl}/products`, { params });
  }

  createProduct(data: Record<string, unknown>): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/products`, data);
  }

  updateProduct(id: string, data: Record<string, unknown>): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/products/${id}`, data);
  }

  deleteProduct(id: string): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/products/${id}`);
  }

  getProduct(id: string): Observable<{ id: string; name: string; name_en: string; description: string; description_en: string; price: number; image_url: string; gallery_json: string | null; category: string; gender: string; is_active: boolean; is_standalone: boolean; is_builder_item: boolean; is_customizable: boolean; stock_quantity: number }> {
    return this.http.get<ApiResponse<{ id: string; name: string; name_en: string; slug: string; description: string; description_en: string; price: number; image_url: string; gallery_json: string | null; category: string; gender: string; is_active: boolean; is_standalone: boolean; is_builder_item: boolean; is_customizable: boolean; stock_quantity: number }>>(`${this.apiUrl}/products/${id}`).pipe(map(r => r.data));
  }

  // Box Types
  getBoxTypes(): Observable<AdminBoxType[]> {
    return this.http.get<ApiResponse<AdminBoxType[]>>(`${this.apiUrl}/box-types`).pipe(map(r => r.data));
  }

  getBoxType(id: string): Observable<AdminBoxTypeDetail> {
    return this.http.get<ApiResponse<AdminBoxTypeDetail>>(`${this.apiUrl}/box-types/${id}`).pipe(map(r => r.data));
  }

  createBoxType(data: { name: string; name_en?: string; gender: string; base_price: number; image_url: string; is_active: boolean }): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/box-types`, data);
  }

  updateBoxType(id: string, data: { name: string; name_en?: string; gender: string; base_price: number; image_url: string; is_active: boolean }): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/box-types/${id}`, data);
  }

  deleteBoxType(id: string): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/box-types/${id}`);
  }

  createSlot(boxTypeId: string, data: { slot_key: string; label_ar: string; label_en?: string; is_required: boolean; sort_order: number; filter_gender?: string }): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/box-types/${boxTypeId}/slots`, data);
  }

  updateSlot(boxTypeId: string, slotId: string, data: { slot_key: string; label_ar: string; label_en?: string; is_required: boolean; sort_order: number; filter_gender?: string }): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/box-types/${boxTypeId}/slots/${slotId}`, data);
  }

  deleteSlot(boxTypeId: string, slotId: string): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/box-types/${boxTypeId}/slots/${slotId}`);
  }

  // Governorates (Shipping)
  getGovernorates(): Observable<{ id: string; name: string; name_en: string; shipping_cost: number; is_active: boolean }[]> {
    return this.http.get<ApiResponse<{ id: string; name: string; name_en: string; shipping_cost: number; is_active: boolean }[]>>(`${this.apiUrl}/governorates`).pipe(map(r => r.data));
  }

  updateGovernorate(id: string, data: { shipping_cost: number; is_active: boolean }): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/governorates/${id}`, data);
  }

  // Customization Prices
  getCustomizationPrices(): Observable<{ id: string; category: string; price: number }[]> {
    return this.http.get<ApiResponse<{ id: string; category: string; price: number }[]>>(`${this.apiUrl}/customization-prices`).pipe(map(r => r.data));
  }

  upsertCustomizationPrice(data: { category: string; price: number }): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/customization-prices`, data);
  }

  deleteCustomizationPrice(id: string): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/customization-prices/${id}`);
  }

  // Promotions
  getPromotions(): Observable<Promotion[]> {
    return this.http.get<ApiResponse<Promotion[]>>(`${this.apiUrl}/promotions`).pipe(map(r => r.data));
  }

  getPromotion(id: string): Observable<Promotion> {
    return this.http.get<ApiResponse<Promotion>>(`${this.apiUrl}/promotions/${id}`).pipe(map(r => r.data));
  }

  createPromotion(data: Record<string, unknown>): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/promotions`, data);
  }

  updatePromotion(id: string, data: Record<string, unknown>): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/promotions/${id}`, data);
  }

  deletePromotion(id: string): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/promotions/${id}`);
  }

  // Coupons
  getCoupons(): Observable<Coupon[]> {
    return this.http.get<ApiResponse<Coupon[]>>(`${this.apiUrl}/coupons`).pipe(map(r => r.data));
  }

  getCoupon(id: string): Observable<Coupon> {
    return this.http.get<ApiResponse<Coupon>>(`${this.apiUrl}/coupons/${id}`).pipe(map(r => r.data));
  }

  createCoupon(data: Record<string, unknown>): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/coupons`, data);
  }

  updateCoupon(id: string, data: Record<string, unknown>): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/coupons/${id}`, data);
  }

  deleteCoupon(id: string): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/coupons/${id}`);
  }

  // Box Reviews (admin moderation)
  getBoxReviews(): Observable<BoxReviewAdmin[]> {
    return this.http.get<ApiResponse<BoxReviewAdmin[]>>(`${this.apiUrl}/box-reviews`).pipe(map(r => r.data));
  }

  deleteBoxReview(id: string): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/box-reviews/${id}`);
  }
}
