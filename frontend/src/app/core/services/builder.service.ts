import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { ApiResponse } from '../models/api-response.model';
import { BoxType, BoxSlot, SlotProduct, PreviewResponse, Customization } from '../models/box-type.model';

@Injectable({ providedIn: 'root' })
export class BuilderService {
  private http = inject(HttpClient);
  private apiUrl = `${inject(API_BASE_URL)}/api/builder`;
  private boxTypes$: Observable<BoxType[]> | null = null;

  getBoxTypes(): Observable<BoxType[]> {
    if (!this.boxTypes$) {
      this.boxTypes$ = this.http.get<ApiResponse<BoxType[]>>(`${this.apiUrl}/box-types`).pipe(
        map(res => res.data),
        shareReplay(1)
      );
    }
    return this.boxTypes$;
  }

  getSlots(boxTypeId: string): Observable<BoxSlot[]> {
    return this.http.get<ApiResponse<BoxSlot[]>>(`${this.apiUrl}/box-types/${boxTypeId}/slots`).pipe(
      map(res => res.data)
    );
  }

  getProductsForSlot(slotId: string): Observable<SlotProduct[]> {
    return this.http.get<ApiResponse<SlotProduct[]>>(`${this.apiUrl}/slots/${slotId}/products`).pipe(
      map(res => res.data)
    );
  }

  preview(boxTypeId: string, slots: Record<string, string>, customization?: Customization, customizedSlots?: string[]): Observable<PreviewResponse> {
    return this.http.post<ApiResponse<PreviewResponse>>(`${this.apiUrl}/preview`, {
      box_type_id: boxTypeId,
      slots,
      customization: customization ?? null,
      customized_slots: customizedSlots ?? []
    }).pipe(map(res => res.data));
  }
}
