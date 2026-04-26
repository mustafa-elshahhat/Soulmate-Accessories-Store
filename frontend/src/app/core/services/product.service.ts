import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${inject(API_BASE_URL)}/api/products`;

  getAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    order?: string;
    gender?: string;
    category?: string;
    minRating?: number;
    minPrice?: number;
    maxPrice?: number;
  } = {}): Observable<PaginatedResponse<Product>> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.limit) httpParams = httpParams.set('limit', params.limit);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    if (params.order) httpParams = httpParams.set('order', params.order);
    if (params.gender) httpParams = httpParams.set('gender', params.gender);
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.minRating) httpParams = httpParams.set('minRating', params.minRating);
    if (params.minPrice) httpParams = httpParams.set('minPrice', params.minPrice);
    if (params.maxPrice) httpParams = httpParams.set('maxPrice', params.maxPrice);

    return this.http.get<PaginatedResponse<Product>>(this.apiUrl, { params: httpParams });
  }

  getBySlug(slug: string): Observable<Product> {
    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/${slug}`).pipe(
      map(res => res.data)
    );
  }

  getRelated(slug: string, limit = 4): Observable<Product[]> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/${slug}/related`, {
      params: new HttpParams().set('limit', limit),
    }).pipe(
      map(res => res.data)
    );
  }
}
