import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotificationService, Notification } from '../../../core/services/notification.service';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [RouterLink, DatePipe, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-3xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="font-playfair text-2xl md:text-3xl font-bold text-foreground">{{ 'admin.notifications.title' | t }}</h1>
        @if (hasUnread()) {
          <button (click)="markAllRead()" class="text-sm text-primary hover:underline">{{ 'admin.notifications.markAllRead' | t }}</button>
        }
      </div>

      @if (loading()) {
        <div class="flex justify-center py-20">
          <div class="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (notifications().length === 0) {
        <div class="text-center py-20">
          <svg class="w-16 h-16 text-border mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          <p class="text-muted-foreground text-lg">{{ 'admin.notifications.empty' | t }}</p>
        </div>
      } @else {
        <div class="space-y-3">
          @for (n of notifications(); track n.id) {
            <div class="bg-background rounded-xl border p-4 transition cursor-pointer"
                 [class.border-primary/30]="!n.is_read"
                 [class.bg-primary/5]="!n.is_read"
                 [class.border-border]="n.is_read"
                 (click)="markRead(n)">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    @if (!n.is_read) {
                      <span class="w-2 h-2 rounded-full bg-primary shrink-0"></span>
                    }
                    <h3 class="font-medium text-foreground">{{ currentLang() === 'ar' ? n.title : (n.title_en || n.title) }}</h3>
                  </div>
                  <p class="text-sm text-muted-foreground">{{ currentLang() === 'ar' ? n.message : (n.message_en || n.message) }}</p>
                </div>
                <span class="text-xs text-muted-foreground whitespace-nowrap">{{ n.created_at | date:'short' }}</span>
              </div>
              @if (n.order_id) {
                <a [routerLink]="['/admin/orders', n.order_id]" class="text-xs text-primary hover:underline mt-2 inline-block">{{ 'admin.notifications.viewOrder' | t }}</a>
              }
            </div>
          }
        </div>

        @if (hasMore()) {
          <div class="text-center mt-8">
            <button (click)="loadMore()" [disabled]="loadingMore()"
                    class="px-8 py-3 border border-border rounded-xl text-sm font-medium hover:bg-muted transition disabled:opacity-50">
              @if (loadingMore()) { {{ 'admin.notifications.loading' | t }} } @else { {{ 'admin.notifications.loadMore' | t }} }
            </button>
          </div>
        }
      }
    </div>
  `,
})
export class AdminNotificationsComponent implements OnInit {
  private t = inject(TranslationService);
  readonly currentLang = this.t.currentLang;
  private notificationService = inject(NotificationService);
  notifications = signal<Notification[]>([]);
  hasUnread = computed(() => this.notifications().some(n => !n.is_read));
  loading = signal(true);
  loadingMore = signal(false);
  hasMore = signal(false);
  private page = 1;
  private readonly limit = 20;

  ngOnInit(): void {
    this.loadPage(1);
  }

  private loadPage(page: number): void {
    this.notificationService.getAll(page, this.limit).subscribe({
      next: (data) => {
        if (page === 1) {
          this.notifications.set(data.items);
        } else {
          this.notifications.set([...this.notifications(), ...data.items]);
        }
        this.hasMore.set(data.items.length === this.limit);
        this.page = page;
        this.loading.set(false);
        this.loadingMore.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadingMore.set(false);
      },
    });
  }

  loadMore(): void {
    this.loadingMore.set(true);
    this.loadPage(this.page + 1);
  }

  markRead(n: Notification): void {
    if (n.is_read) return;
    this.notificationService.markAsRead(n.id).subscribe({
      next: () => {
        this.notifications.set(this.notifications().map(item =>
          item.id === n.id ? { ...item, is_read: true } : item
        ));
      },
    });
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.set(this.notifications().map(n => ({ ...n, is_read: true })));
      },
    });
  }
}
