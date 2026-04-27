import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotificationService, Notification } from '../../core/services/notification.service';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [RouterLink, DatePipe, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-3xl mx-auto px-4 py-12">
      <!-- Page Header -->
      <div class="text-center mb-10">
        <p class="text-primary text-sm font-semibold tracking-widest uppercase mb-2">{{ 'notifications.title' | t }}</p>
        <h1 class="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-3">{{ 'notifications.pageTitle' | t }}</h1>
      </div>

      @if (hasUnread()) {
        <div class="flex justify-end mb-6">
          <button (click)="markAllRead()" class="text-sm text-primary hover:text-primary-dark font-medium transition-colors min-h-[44px] px-3">{{ 'notifications.markAllReadBtn' | t }}</button>
        </div>
      }

      @if (loading()) {
        <div class="flex justify-center py-20">
          <div class="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (notifications().length === 0) {
        <div class="text-center py-20 bg-background rounded-xl shadow-sm border border-border flex flex-col items-center justify-center">
          <div class="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-4 text-primary/40">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
          </div>
          <p class="text-lg font-playfair font-medium text-foreground mb-1">{{ 'notifications.empty' | t }}</p>
          <p class="text-sm text-muted-foreground">{{ 'notifications.emptySubtitle' | t }}</p>
        </div>
      } @else {
        <div class="space-y-3">
          @for (n of notifications(); track n.id) {
            <div class="bg-background rounded-xl border p-4 transition-all duration-300 cursor-pointer hover:shadow-sm"
                 [class.border-primary/30]="!n.is_read"
                 [class.bg-primary/5]="!n.is_read"
                 [class.border-border]="n.is_read"
                 (click)="markRead(n)">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    @if (!n.is_read) {
                      <span class="w-2 h-2 rounded-full bg-primary shrink-0" aria-hidden="true"></span>
                    }
                    <h3 class="font-medium text-foreground">{{ currentLang() === 'ar' ? n.title : (n.title_en || n.title) }}</h3>
                  </div>
                  <p class="text-sm text-muted-foreground">{{ currentLang() === 'ar' ? n.message : (n.message_en || n.message) }}</p>
                </div>
                <span class="text-xs text-muted-foreground whitespace-nowrap">{{ n.created_at | date:'short' }}</span>
              </div>
              @if (n.order_id) {
                <a [routerLink]="['/orders', n.order_id]" class="text-xs text-primary hover:text-primary-dark font-medium mt-2 inline-block transition-colors min-h-[44px] flex items-center">{{ 'notifications.viewOrder' | t }}</a>
              }
            </div>
          }
        </div>

        @if (hasMore()) {
          <div class="text-center mt-8">
            <button (click)="loadMore()" [disabled]="loadingMore()"
                    class="px-8 py-3 border border-border rounded-xl text-sm font-medium hover:bg-muted hover:border-primary/50 transition-all duration-300 disabled:opacity-50 min-h-[44px]">
              @if (loadingMore()) { {{ 'notifications.loadingMore' | t }} } @else { {{ 'notifications.loadMore' | t }} }
            </button>
          </div>
        }
      }
    </div>
  `,
})
export class NotificationsComponent implements OnInit {
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
