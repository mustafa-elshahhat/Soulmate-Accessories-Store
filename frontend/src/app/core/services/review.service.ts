import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { ApiResponse } from '../models/api-response.model';
import { ProductReviewsSummary, Review, CreateReviewRequest, UpdateReviewRequest } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  private apiUrl = `${inject(API_BASE_URL)}/api/reviews`;

  getByProduct(productId: string): Observable<ProductReviewsSummary> {
    return this.http.get<ApiResponse<ProductReviewsSummary>>(`${this.apiUrl}/product/${productId}`).pipe(
      map(res => res.data)
    );
  }

  create(dto: CreateReviewRequest): Observable<Review> {
    return this.http.post<ApiResponse<Review>>(this.apiUrl, dto).pipe(
      map(res => res.data)
    );
  }

  update(id: string, dto: UpdateReviewRequest): Observable<Review> {
    return this.http.put<ApiResponse<Review>>(`${this.apiUrl}/${id}`, dto).pipe(
      map(res => res.data)
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<object>>(`${this.apiUrl}/${id}`).pipe(
      map(() => void 0)
    );
  }
}
