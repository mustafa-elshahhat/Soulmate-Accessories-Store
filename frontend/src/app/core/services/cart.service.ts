import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { ApiResponse } from '../models/api-response.model';
import { AudioService } from './audio.service';

export interface CartItem {
  id: string;
  type: 'box' | 'standalone';
  name: string;
  name_en?: string;
  image_url: string;
  unit_price: number;
  quantity: number;
  product_id?: string;
  box_type_id?: string;
  custom_data_json: string;
}

interface CartResponse {
  items_json: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly STORAGE_KEY = 'soulmate_cart';
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private apiUrl = `${inject(API_BASE_URL)}/api/cart`;
  private syncTimer: ReturnType<typeof setTimeout> | null = null;
  private audio = inject(AudioService);

  /** Set to true when the user is authenticated; controls whether server sync happens */
  private _authenticated = false;

  items = signal<CartItem[]>(this.loadFromStorage());
  totalPrice = computed(() => this.items().reduce((sum, i) => sum + i.unit_price * i.quantity, 0));
  totalItems = computed(() => this.items().reduce((sum, i) => sum + i.quantity, 0));

  /** Called by AuthService / layout after login succeeds */
  setAuthenticated(value: boolean): void {
    this._authenticated = value;
  }

  addItem(item: CartItem): void {
    const current = this.items();
    const existing = current.find(i => i.id === item.id);
    if (existing) {
      this.items.set(current.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i));
    } else {
      this.items.set([...current, item]);
    }
    this.persist();
  }

  removeItem(id: string): void {
    this.items.set(this.items().filter(i => i.id !== id));
    this.audio.playRemoveSound();
    this.persist();
  }

  updateQuantity(id: string, quantity: number): void {
    if (quantity < 1) return;
    this.items.set(this.items().map(i => i.id === id ? { ...i, quantity } : i));
    this.persist();
  }

  clear(): void {
    this.items.set([]);
    this.persist();
  }

  /** Called after login / auto-login to load server cart and merge with any local items */
  loadFromServer(): void {
    const localItems = this.items();
    this.http.get<ApiResponse<CartResponse>>(this.apiUrl).subscribe({
      next: (res) => {
        let serverItems: CartItem[] = [];
        try { serverItems = JSON.parse(res.data.items_json); } catch { /* empty */ }

        // Merge: server items + any local items not already on server
        const serverIds = new Set(serverItems.map(i => i.id));
        const merged = [...serverItems, ...localItems.filter(i => !serverIds.has(i.id))];
        this.items.set(merged);
        this.saveToStorage();

        // If we merged local items in, sync back to server
        if (merged.length !== serverItems.length) {
          this.syncToServer();
        }
      },
      error: () => { /* keep local cart as-is */ },
    });
  }

  /** Called on logout — clears local storage and resets cart signal */
  clearLocal(): void {
    this.items.set([]);
    this.saveToStorage();
  }

  private persist(): void {
    this.saveToStorage();
    this.debouncedSync();
  }

  private debouncedSync(): void {
    if (!this._authenticated) return;
    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => this.syncToServer(), 800);
  }

  private syncToServer(): void {
    const json = JSON.stringify(this.items());
    this.http.put(this.apiUrl, { items_json: json }).subscribe({
      error: () => { /* silent — localStorage is the fallback */ },
    });
  }

  private loadFromStorage(): CartItem[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items()));
    } catch { /* localStorage unavailable */ }
  }
}
