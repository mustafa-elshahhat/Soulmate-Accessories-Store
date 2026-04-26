import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription, timer } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { ApiResponse } from '../models/api-response.model';
import { Notification, NotificationListData } from '../models/notification.model';
import { AudioService } from './audio.service';

export type { Notification, NotificationListData } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = `${inject(API_BASE_URL)}/api/notifications`;
  private audio = inject(AudioService);
  private pollSub: Subscription | null = null;

  unreadCount = signal(0);

  startPolling(intervalMs = 30_000): void {
    if (this.pollSub) return;
    this.pollSub = timer(0, intervalMs).pipe(
      switchMap(() => this.getUnreadCount())
    ).subscribe();
  }

  stopPolling(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = null;
  }

  getAll(page = 1, limit = 20): Observable<NotificationListData> {
    return this.http.get<ApiResponse<NotificationListData>>(this.apiUrl, {
      params: { page: page.toString(), limit: limit.toString() }
    }).pipe(
      map(res => res.data),
      tap(data => this.unreadCount.set(data.unread_count))
    );
  }

  markAsRead(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => this.unreadCount.update(c => Math.max(0, c - 1)))
    );
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/unread-count`).pipe(
      map(res => res.data),
      tap(count => {
        if (count > this.unreadCount()) {
          this.audio.playNotificationSound();
        }
        this.unreadCount.set(count);
      })
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => this.unreadCount.set(0))
    );
  }
}
