import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { ApiResponse } from '../models/api-response.model';
import { Address, CreateAddressDto } from '../models/address.model';

export type { Address, CreateAddressDto } from '../models/address.model';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private http = inject(HttpClient);
  private apiUrl = `${inject(API_BASE_URL)}/api/addresses`;

  getAll(): Observable<Address[]> {
    return this.http.get<ApiResponse<Address[]>>(this.apiUrl).pipe(map(res => res.data));
  }

  create(dto: CreateAddressDto): Observable<Address> {
    return this.http.post<ApiResponse<Address>>(this.apiUrl, dto).pipe(map(res => res.data));
  }

  update(id: string, dto: CreateAddressDto): Observable<Address> {
    return this.http.put<ApiResponse<Address>>(`${this.apiUrl}/${id}`, dto).pipe(map(res => res.data));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
