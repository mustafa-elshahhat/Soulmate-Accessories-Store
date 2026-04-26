import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { ApiResponse } from '../models/api-response.model';
import { WishlistItem } from '../models/wishlist.model';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private http = inject(HttpClient);
  private apiUrl = `${inject(API_BASE_URL)}/api/wishlist`;

  wishlistIds = signal<Set<string>>(new Set());
  count = computed(() => this.wishlistIds().size);

  loadIds(): void {
    this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/ids`).subscribe({
      next: (res) => this.wishlistIds.set(new Set(res.data)),
      error: () => {},
    });
  }

  getAll() {
    return this.http.get<ApiResponse<WishlistItem[]>>(this.apiUrl);
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistIds().has(productId);
  }

  toggle(productId: string): void {
    if (this.isInWishlist(productId)) {
      this.remove(productId);
    } else {
      this.add(productId);
    }
  }

  private add(productId: string): void {
    // Optimistic update
    this.wishlistIds.update(ids => {
      const next = new Set(ids);
      next.add(productId);
      return next;
    });

    this.http.post(`${this.apiUrl}/${productId}`, {}).subscribe({
      error: () => {
        // Revert on failure
        this.wishlistIds.update(ids => {
          const next = new Set(ids);
          next.delete(productId);
          return next;
        });
      },
    });
  }

  private remove(productId: string): void {
    // Optimistic update
    this.wishlistIds.update(ids => {
      const next = new Set(ids);
      next.delete(productId);
      return next;
    });

    this.http.delete(`${this.apiUrl}/${productId}`).subscribe({
      error: () => {
        // Revert on failure
        this.wishlistIds.update(ids => {
          const next = new Set(ids);
          next.add(productId);
          return next;
        });
      },
    });
  }

  clear(): void {
    this.wishlistIds.set(new Set());
  }
}
