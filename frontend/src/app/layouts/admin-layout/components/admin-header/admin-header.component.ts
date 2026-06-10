import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { LanguageSwitcherComponent } from '../../../../shared/components/language-switcher/language-switcher.component';
import { Notification } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [RouterLink, DatePipe, TranslatePipe, LanguageSwitcherComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sticky top-0 z-30 bg-background border-b border-border px-4 md:px-6">
      <div class="flex items-center justify-between h-14">
        <a routerLink="/admin" class="flex items-center gap-2">
          <img src="/assets/images/logo-sm-light.webp" srcset="/assets/images/logo-sm-light.webp 200w, /assets/images/logo-md-light.webp 400w" sizes="32px" alt="Soulmate" class="h-8 w-auto" />
          <span class="font-playfair text-sm font-bold text-primary">Admin</span>
        </a>

        <div class="flex items-center gap-2">
          <app-language-switcher />

          <!-- Mute toggle -->
          <button (click)="onToggleMute()"
            class="flex items-center justify-center h-9 w-9 rounded-xl text-foreground hover:bg-muted transition-all duration-200 cursor-pointer"
            [attr.aria-label]="(isMuted ? 'nav.unmuteSound' : 'nav.muteSound') | t">
            @if (isMuted) {
              <svg class="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"/></svg>
            } @else {
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"/></svg>
            }
          </button>

          <!-- Notifications dropdown -->
          <div class="relative" #notifDropdown>
            <button (click)="onToggleNotifDropdown()"
              class="relative flex items-center gap-2 h-9 px-2.5 rounded-xl text-foreground transition-all duration-200 cursor-pointer"
              [class.bg-muted]="!notifDropdownOpen"
              [class.hover:bg-muted]="!notifDropdownOpen"
              [class.bg-background]="notifDropdownOpen"
              [class.ring-2]="notifDropdownOpen"
              [class.ring-primary/20]="notifDropdownOpen"
              [attr.aria-label]="'admin.header.notifications' | t">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/></svg>
              @if (unreadCount > 0) {
                <span class="absolute -top-0.5 -end-0.5 bg-destructive text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {{ unreadCount > 9 ? '9+' : unreadCount }}
                </span>
              }
            </button>

            @if (notifDropdownOpen) {
              <div class="absolute end-0 top-full mt-1 w-80 bg-background rounded-xl shadow-lg border border-border overflow-hidden z-50 animate-[slideDown_150ms_ease-out]">
                <div class="flex items-center justify-between p-4 border-b border-border bg-muted/50">
                  <h3 class="font-playfair font-bold text-sm text-foreground">{{ 'admin.header.notifications' | t }}</h3>
                  @if (notifications.some(hasUnread)) {
                    <button (click)="onMarkAllRead()" class="text-xs text-primary font-medium hover:text-primary-dark transition-colors">{{ 'admin.header.markAllRead' | t }}</button>
                  }
                </div>

                @if (notifLoading) {
                  <div class="flex justify-center py-8">
                    <div class="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                } @else if (notifications.length === 0) {
                  <div class="py-10 text-center">
                    <p class="text-sm text-muted-foreground">{{ 'admin.header.noNotifications' | t }}</p>
                  </div>
                } @else {
                  <div class="max-h-[320px] overflow-y-auto">
                    @for (n of notifications; track n.id) {
                      <a [routerLink]="n.order_id ? ['/admin/orders', n.order_id] : ['/admin/notifications']"
                         (click)="onNotificationClick(n)"
                         class="block p-4 hover:bg-muted transition border-b border-border last:border-0"
                         [class.bg-primary/5]="!n.is_read">
                        <div class="flex items-start gap-3">
                          @if (!n.is_read) {
                            <span class="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5"></span>
                          }
                          <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-foreground truncate">{{ currentLang === 'ar' ? n.title : (n.title_en || n.title) }}</p>
                            <p class="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">{{ currentLang === 'ar' ? n.message : (n.message_en || n.message) }}</p>
                            <p class="text-[10px] text-muted-foreground mt-2 font-medium">{{ n.created_at | date:'short' }}</p>
                          </div>
                        </div>
                      </a>
                    }
                  </div>
                }

                <a routerLink="/admin/notifications" (click)="onCloseNotifDropdown()"
                   class="block text-center text-xs text-primary font-medium hover:bg-muted py-3 border-t border-border transition-colors">
                  {{ 'admin.header.viewAll' | t }}
                </a>
              </div>
            }
          </div>

          <!-- Profile dropdown -->
          <div class="relative" #profileDropdown>
            <button (click)="onToggleProfileDropdown()"
              class="flex items-center gap-2 h-9 px-2.5 rounded-xl text-foreground transition-all duration-200 cursor-pointer"
              [class.bg-muted]="!profileDropdownOpen"
              [class.hover:bg-muted]="!profileDropdownOpen"
              [class.bg-background]="profileDropdownOpen"
              [class.ring-2]="profileDropdownOpen"
              [class.ring-primary/20]="profileDropdownOpen">
              <div class="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <svg class="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
              </div>
              <span class="text-sm font-medium hidden sm:block max-w-[100px] truncate">{{ userName || ('admin.header.defaultName' | t) }}</span>
            </button>

            @if (profileDropdownOpen) {
              <div class="absolute end-0 top-full mt-1 w-56 bg-background rounded-xl shadow-lg border border-border overflow-hidden z-50 animate-[slideDown_150ms_ease-out]">
                <div class="p-4 border-b border-border bg-muted/50">
                  <p class="text-sm font-medium text-foreground truncate">{{ userName || ('admin.header.defaultName' | t) }}</p>
                  <p class="text-xs text-muted-foreground truncate mt-0.5">{{ userEmail }}</p>
                </div>
                <div class="py-1">
                  <a routerLink="/admin/profile" (click)="onCloseProfileDropdown()"
                     class="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                    <svg class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
                    {{ 'admin.profile.link' | t }}
                  </a>
                  <button (click)="onLogout()"
                          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-red-50 transition-colors">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/></svg>
                    {{ 'admin.profile.logout' | t }}
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </header>
  `
})
export class AdminHeaderComponent {
  @Input() userName = '';
  @Input() userEmail = '';
  @Input() unreadCount = 0;
  @Input() isMuted = false;
  @Input() notifDropdownOpen = false;
  @Input() profileDropdownOpen = false;
  @Input() notifLoading = false;
  @Input() notifications: Notification[] = [];
  @Input() currentLang = 'ar';

  @Output() toggleMute = new EventEmitter<void>();
  @Output() toggleNotifDropdown = new EventEmitter<void>();
  @Output() toggleProfileDropdown = new EventEmitter<void>();
  @Output() notificationClick = new EventEmitter<Notification>();
  @Output() markAllRead = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
  @Output() closeNotifDropdown = new EventEmitter<void>();
  @Output() closeProfileDropdown = new EventEmitter<void>();

  @ViewChild('notifDropdown') notifDropdownRef!: ElementRef;
  @ViewChild('profileDropdown') profileDropdownRef!: ElementRef;

  hasUnread = (n: Notification) => !n.is_read;

  onToggleMute() { this.toggleMute.emit(); }
  onToggleNotifDropdown() { this.toggleNotifDropdown.emit(); }
  onToggleProfileDropdown() { this.toggleProfileDropdown.emit(); }
  onNotificationClick(n: Notification) { this.notificationClick.emit(n); }
  onMarkAllRead() { this.markAllRead.emit(); }
  onLogout() { this.logout.emit(); }
  onCloseNotifDropdown() { this.closeNotifDropdown.emit(); }
  onCloseProfileDropdown() { this.closeProfileDropdown.emit(); }
}
