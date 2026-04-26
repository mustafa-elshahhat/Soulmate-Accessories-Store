import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { ApiResponse } from '../models/api-response.model';
import { BoxReviewsSummary, BoxReview } from '../models/box-review.model';

@Injectable({ providedIn: 'root' })
export class BoxReviewService {
  private http = inject(HttpClient);
  private apiUrl = `${inject(API_BASE_URL)}/api/box-reviews`;

  getByBoxType(boxTypeId: string, page = 1, limit = 20): Observable<ApiResponse<BoxReviewsSummary>> {
    return this.http.get<ApiResponse<BoxReviewsSummary>>(`${this.apiUrl}/box-type/${boxTypeId}`, {
      params: { page, limit },
    });
  }

  create(boxTypeId: string, orderId: string, rating: number, comment: string | null): Observable<ApiResponse<BoxReview>> {
    return this.http.post<ApiResponse<BoxReview>>(this.apiUrl, {
      box_type_id: boxTypeId,
      order_id: orderId,
      rating,
      comment,
    });
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }
}
