import { Component, ChangeDetectionStrategy, inject, signal, OnInit, HostListener, ViewChild, ElementRef, OnDestroy, effect } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { filter } from 'rxjs';
import { TranslationService } from '../../core/services/translation.service';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { BottomNavComponent } from './components/bottom-nav/bottom-nav.component';
import { NotificationService } from '../../core/services/notification.service';
import { Notification as AppNotification } from '../../core/models/notification.model';
import { AudioService } from '../../core/services/audio.service';
import { CONTACT } from '../../core/constants/contact';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { CurrencyPipe, DatePipe, CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LanguageSwitcherComponent } from '../../shared/components/language-switcher/language-switcher.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    BottomNavComponent,
    TranslatePipe,
    CurrencyPipe,
    DatePipe,
    CommonModule,
    RouterLink,
    RouterLinkActive,
    LanguageSwitcherComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Top Announcement Bar -->
    <div class="bg-foreground text-white text-[11px] py-2 text-center font-inter tracking-[0.15em] hidden md:block">
      {{ 'announcement.freeShipping' | t }}
    </div>

    <!-- Main Sticky Navbar -->
    <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-border transition-all duration-300">
      <nav class="max-w-[1280px] mx-auto flex items-center justify-between px-6 lg:px-8 h-14 md:h-[80px] transition-all duration-300">
        <a routerLink="/" class="block shrink-0"><img src="/assets/images/logo-md.webp" srcset="/assets/images/logo-sm.webp 200w, /assets/images/logo-md.webp 400w, /assets/images/logo-lg.webp 800w" sizes="(max-width: 768px) 30vw, 15vw" alt="Soulmate" width="150" height="82" class="h-10 md:h-14 w-auto" /></a>

        <!-- Desktop nav -->
        <div class="hidden md:flex items-center gap-10 font-inter">
          <a routerLink="/products" routerLinkActive="text-primary" class="text-[15px] font-medium text-foreground/75 hover:text-primary transition-colors duration-200 relative after:absolute after:-bottom-1 after:end-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-primary after:transition-all after:duration-300">{{ 'nav.products' | t }}</a>
          <a routerLink="/builder/select" routerLinkActive="text-primary" class="text-[15px] font-medium text-foreground/75 hover:text-primary transition-colors duration-200 relative after:absolute after:-bottom-1 after:end-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-primary after:transition-all after:duration-300">{{ 'nav.buildBox' | t }}</a>

          <div class="flex items-center gap-5 me-3 border-e border-border pe-8">
            <a routerLink="/cart" [attr.aria-label]="'nav.cart' | t" class="relative text-foreground/60 hover:text-primary transition-colors duration-200 p-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>
              @if (cart.totalItems() > 0) {
                <span class="absolute -top-0.5 -end-0.5 bg-primary text-white text-[9px] font-bold w-[18px] h-[18px] flex items-center justify-center rounded-full shadow-sm">{{ cart.totalItems() }}</span>
              }
            </a>
            @if (authService.isAuthenticated()) {
              <!-- Wishlist -->
              <a routerLink="/wishlist" [attr.aria-label]="'nav.wishlist' | t" class="relative text-foreground/60 hover:text-primary transition-colors duration-200 p-1.5">
                <svg class="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>
              </a>
              <!-- Notification dropdown -->
              <div class="relative" #notifDropdown>
                <button (click)="toggleDropdown()" [attr.aria-label]="'nav.notifications' | t"
                  class="relative text-foreground/60 hover:text-primary transition-colors duration-200 p-1.5 cursor-pointer">
                  <svg class="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
                  @if (notificationService.unreadCount() > 0) {
                    <span class="absolute -top-0.5 -end-0.5 bg-destructive text-white text-[9px] font-bold w-[18px] h-[18px] flex items-center justify-center rounded-full shadow-sm">
                      {{ notificationService.unreadCount() > 9 ? '9+' : notificationService.unreadCount() }}
                    </span>
                  }
                </button>

                @if (dropdownOpen()) {
                  <div class="absolute end-0 top-full mt-1 w-80 bg-background rounded-xl shadow-lg border border-border overflow-hidden z-50 animate-[slideDown_150ms_ease-out]">
                    <div class="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
                      <h3 class="text-sm font-semibold text-foreground">{{ 'nav.notifications' | t }}</h3>
                      @if (notificationService.unreadCount() > 0) {
                        <button (click)="markAllRead()" class="text-xs text-primary hover:underline cursor-pointer">{{ 'notifications.markAllRead' | t }}</button>
                      }
                    </div>
                    <div class="max-h-[320px] overflow-y-auto">
                      @if (dropdownLoading()) {
                        <div class="flex items-center justify-center py-8">
                          <div class="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                        </div>
                      } @else if (dropdownNotifications().length === 0) {
                        <div class="py-8 text-center text-sm text-muted-foreground">{{ 'notifications.empty' | t }}</div>
                      } @else {
                        @for (n of dropdownNotifications(); track n.id) {
                          <a routerLink="/notifications" (click)="onNotificationClick(n)"
                             class="flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border last:border-0"
                             [class.bg-primary/5]="!n.is_read">
                            <div class="shrink-0 w-2 h-2 rounded-full mt-1.5" [class.bg-primary]="!n.is_read" [class.bg-transparent]="n.is_read"></div>
                            <div class="flex-1 min-w-0">
                              <p class="text-sm text-foreground line-clamp-2" [class.font-medium]="!n.is_read">{{ currentLang() === 'ar' ? n.message : (n.message_en || n.message) }}</p>
                              <p class="text-[11px] text-muted-foreground mt-1">{{ n.created_at | date:'short' }}</p>
                            </div>
                          </a>
                        }
                      }
                    </div>
                    <a routerLink="/notifications" (click)="dropdownOpen.set(false)"
                       class="block text-center py-2.5 text-xs font-medium text-primary hover:bg-muted/50 transition-colors border-t border-border">
                      {{ 'notifications.viewAll' | t }}
                    </a>
                  </div>
                }
              </div>

              <!-- Account dropdown -->
              <div class="relative" #profileDropdown>
                <button (click)="toggleProfileDropdown()"
                  class="relative text-foreground/60 hover:text-primary transition-colors duration-200 p-1.5 cursor-pointer"
                  [class.text-primary]="profileDropdownOpen()"
                  [attr.aria-label]="'nav.myAccount' | t">
                  <svg class="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
                </button>

                @if (profileDropdownOpen()) {
                  <div class="absolute end-0 top-full mt-1 w-56 bg-background rounded-xl shadow-lg border border-border overflow-hidden z-50 animate-[slideDown_150ms_ease-out]">
                    <div class="p-4 border-b border-border bg-muted/50">
                      <p class="text-sm font-medium text-foreground truncate">{{ authService.user()?.name || ('nav.myAccount' | t) }}</p>
                      <p class="text-xs text-muted-foreground truncate mt-0.5">{{ authService.user()?.email }}</p>
                    </div>
                    <div class="py-1">
                      <a routerLink="/profile" (click)="profileDropdownOpen.set(false)"
                         class="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                        <svg class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
                        {{ 'nav.account' | t }}
                      </a>
                      <a routerLink="/orders" (click)="profileDropdownOpen.set(false)"
                         class="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                        <svg class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>
                        {{ 'nav.orders' | t }}
                      </a>
                      <button (click)="logout()"
                              class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-red-50 transition-colors">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/></svg>
                        {{ 'nav.logout' | t }}
                      </button>
                    </div>
                  </div>
                }
              </div>
            } @else if (authService.initialized()) {
              <a routerLink="/login" data-auth-guest [attr.aria-label]="'nav.login' | t"
                 class="relative text-foreground/60 hover:text-primary transition-colors duration-200 p-1.5">
                <svg class="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
              </a>
            } @else {
              <!-- Auth loading skeleton -->
              <div class="w-[22px] h-[22px] rounded-full bg-border/50 animate-pulse p-1.5"></div>
            }
            <!-- /auth check -->

            <!-- Mute toggle -->
            <button (click)="audioService.toggleMute()"
              class="relative text-foreground/60 hover:text-primary transition-colors duration-200 p-1.5 cursor-pointer"
              [attr.aria-label]="(audioService.isMuted() ? 'nav.unmuteSound' : 'nav.muteSound') | t">
              @if (audioService.isMuted()) {
                <svg class="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"/></svg>
              } @else {
                <svg class="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"/></svg>
              }
            </button>

            <app-language-switcher />
          </div>
        </div>

        <!-- Mobile: language switcher + login/account -->
        <div class="md:hidden flex items-center gap-2">
          <!-- Mobile mute toggle -->
          <button (click)="audioService.toggleMute()"
            class="flex items-center justify-center w-9 h-9 rounded-lg text-foreground/70 hover:text-primary transition-all duration-200 cursor-pointer"
            [attr.aria-label]="(audioService.isMuted() ? 'nav.unmuteSound' : 'nav.muteSound') | t">
            @if (audioService.isMuted()) {
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"/></svg>
            } @else {
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"/></svg>
            }
          </button>
          <app-language-switcher />
          @if (authService.isAuthenticated()) {
            <div class="relative" #mobileProfileDropdown>
              <button (click)="toggleMobileProfile()"
                class="flex items-center justify-center w-9 h-9 rounded-lg text-foreground/70 hover:text-foreground transition-all duration-200 cursor-pointer"
                [class.bg-muted]="mobileProfileOpen()"
                [attr.aria-label]="'nav.myAccount' | t">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
              </button>

              @if (mobileProfileOpen()) {
                <div class="absolute end-0 top-full mt-1 w-48 bg-background rounded-xl shadow-lg border border-border overflow-hidden z-50 animate-[slideDown_150ms_ease-out]">
                  <div class="py-1">
                    <a routerLink="/profile" (click)="mobileProfileOpen.set(false)"
                       class="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                      <svg class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
                      {{ 'nav.account' | t }}
                    </a>
                    <a routerLink="/orders" (click)="mobileProfileOpen.set(false)"
                       class="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                      <svg class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>
                      {{ 'nav.orders' | t }}
                    </a>
                    <button (click)="logout(); mobileProfileOpen.set(false)"
                            class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-red-50 transition-colors">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/></svg>
                      {{ 'nav.logout' | t }}
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else if (authService.initialized()) {
            <a routerLink="/login" data-auth-guest [attr.aria-label]="'nav.login' | t"
               class="flex items-center justify-center w-9 h-9 rounded-lg text-foreground/70 hover:text-primary transition-all duration-200">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
            </a>
          } @else {
            <!-- Auth loading skeleton (mobile) -->
            <div class="w-5 h-5 rounded-full bg-border/50 animate-pulse"></div>
          }
        </div>
      </nav>

      <!-- Mobile nav removed as we replaced it with bottom bar -->
    </header>

    <main class="flex-1">
      <router-outlet />
    </main>

    <!-- Mobile Bottom Navigation Bar -->
    <div [class.translate-y-full]="!isBottomNavVisible()"
         class="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-border z-[60] px-1 py-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.04)] pb-[calc(0.5rem+env(safe-area-inset-bottom))] transition-transform duration-300 ease-in-out">

      <!-- Home -->
      <a routerLink="/" routerLinkActive="text-primary" [routerLinkActiveOptions]="{exact: true}" class="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors min-w-[44px] min-h-[44px]">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
        <span class="text-[10px] font-medium font-inter leading-none">{{ 'nav.home' | t }}</span>
      </a>

      <!-- Shop -->
      <a routerLink="/products" routerLinkActive="text-primary" class="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors min-w-[44px] min-h-[44px]">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.999 2.999 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.999 2.999 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" /></svg>
        <span class="text-[10px] font-medium font-inter leading-none">{{ 'nav.shop' | t }}</span>
      </a>

      <!-- Builder -->
      <a routerLink="/builder/select" routerLinkActive="text-primary" class="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors min-w-[44px] min-h-[44px]">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
        <span class="text-[10px] font-medium font-inter leading-none">{{ 'nav.box' | t }}</span>
      </a>

      <!-- Cart -->
      <a routerLink="/cart" routerLinkActive="text-primary" class="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors relative min-w-[44px] min-h-[44px]">
        <div class="relative">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
          @if (cart.totalItems() > 0) {
            <span class="absolute -top-1.5 -end-2 bg-primary text-white text-[8px] font-bold w-[15px] h-[15px] flex items-center justify-center rounded-full shadow-sm">{{ cart.totalItems() }}</span>
          }
        </div>
        <span class="text-[10px] font-medium font-inter leading-none">{{ 'nav.cart' | t }}</span>
      </a>

      <!-- Wishlist (authenticated only) -->
      @if (authService.initialized() && authService.isAuthenticated()) {
        <a routerLink="/wishlist" routerLinkActive="text-primary" class="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors min-w-[44px] min-h-[44px]">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>
          <span class="text-[10px] font-medium font-inter leading-none">{{ 'nav.wishlist' | t }}</span>
        </a>
      }

      <!-- Notifications (authenticated only) -->
      @if (authService.initialized() && authService.isAuthenticated()) {
        <a routerLink="/notifications" routerLinkActive="text-primary" class="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors relative min-w-[44px] min-h-[44px]">
          <div class="relative">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
            @if (notificationService.unreadCount() > 0) {
              <span class="absolute -top-1.5 -end-2 bg-destructive text-white text-[8px] font-bold w-[15px] h-[15px] flex items-center justify-center rounded-full shadow-sm">
                {{ notificationService.unreadCount() > 9 ? '9+' : notificationService.unreadCount() }}
              </span>
            }
          </div>
          <span class="text-[10px] font-medium font-inter leading-none">{{ 'nav.notifications' | t }}</span>
        </a>
      }
    </div>


    <footer class="bg-foreground text-white mb-[80px] sm:mb-[60px] md:mb-0 pb-[env(safe-area-inset-bottom)]">
      <!-- Top section with newsletter-style CTA -->
      <div class="border-b border-white/10">
        <div class="max-w-[1280px] mx-auto px-6 lg:px-8 py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="text-center md:text-start">
            <h3 class="font-playfair text-xl md:text-2xl font-bold mb-2">{{ 'footer.followUs' | t }}</h3>
            <p class="text-sm text-white/60 font-inter">{{ 'footer.followSubtitle' | t }}</p>
          </div>
          <div class="flex items-center gap-4">
            <a [href]="contact.FACEBOOK_URL" target="_blank" rel="noopener noreferrer" aria-label="Facebook" class="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center text-white/60 hover:bg-primary hover:border-primary hover:text-white transition-all duration-300">
              <svg class="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a [href]="contact.INSTAGRAM_URL" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center text-white/60 hover:bg-gradient-to-br hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:border-transparent hover:text-white transition-all duration-300">
              <svg class="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
          </div>
        </div>
      </div>

      <!-- Main footer content -->
      <div class="max-w-[1280px] mx-auto px-6 lg:px-8 py-12 md:py-16">
        <div class="grid grid-cols-2 md:grid-cols-12 gap-8 lg:gap-8">
          <!-- Logo & description -->
          <div class="col-span-2 md:col-span-5 lg:col-span-4">
            <img src="/assets/images/logo-md-light.webp" srcset="/assets/images/logo-sm-light.webp 200w, /assets/images/logo-md-light.webp 400w" sizes="15vw" alt="Soulmate" width="150" height="82" class="h-12 w-auto mb-5" />
            <p class="text-[13px] text-white/60 font-inter leading-relaxed max-w-xs mb-6">
              {{ 'footer.description' | t }}
            </p>
            <!-- Trust badges -->
            <div class="flex items-center gap-4 text-white/50">
              <div class="flex items-center gap-1.5 text-[11px] font-inter">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>
                {{ 'footer.securePayment' | t }}
              </div>
              <div class="flex items-center gap-1.5 text-[11px] font-inter">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/></svg>
                {{ 'footer.fastShipping' | t }}
              </div>
            </div>
          </div>

          <!-- Quick links -->
          <div class="md:col-span-3 lg:col-span-2 lg:col-start-7">
            <h3 class="text-xs uppercase tracking-[0.15em] text-white/60 font-inter font-semibold mb-5">{{ 'footer.quickLinks' | t }}</h3>
            <ul class="space-y-3 text-sm font-inter">
              <li><a routerLink="/about" class="text-white/60 hover:text-primary hover:pe-1 transition-all duration-200">{{ 'footer.aboutSoulmate' | t }}</a></li>
              <li><a routerLink="/contact" class="text-white/60 hover:text-primary hover:pe-1 transition-all duration-200">{{ 'footer.contactUs' | t }}</a></li>
              <li><a routerLink="/products" class="text-white/60 hover:text-primary hover:pe-1 transition-all duration-200">{{ 'footer.shop' | t }}</a></li>
              <li><a routerLink="/builder/select" class="text-white/60 hover:text-primary hover:pe-1 transition-all duration-200">{{ 'footer.buildBox' | t }}</a></li>
            </ul>
          </div>

          <!-- Policies -->
          <div class="md:col-span-4 lg:col-span-3">
            <h3 class="text-xs uppercase tracking-[0.15em] text-white/60 font-inter font-semibold mb-5">{{ 'footer.policiesSupport' | t }}</h3>
            <ul class="space-y-3 text-sm font-inter">
              <li><a routerLink="/privacy" class="text-white/60 hover:text-primary hover:pe-1 transition-all duration-200">{{ 'footer.privacyPolicy' | t }}</a></li>
              <li><a routerLink="/terms" class="text-white/60 hover:text-primary hover:pe-1 transition-all duration-200">{{ 'footer.termsConditions' | t }}</a></li>
              <li><a routerLink="/return-policy" class="text-white/60 hover:text-primary hover:pe-1 transition-all duration-200">{{ 'footer.returnPolicy' | t }}</a></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="border-t border-white/8">
        <div class="max-w-[1280px] mx-auto px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-3 font-inter text-[11px] text-white/50">
          <p>{{ 'footer.copyright' | t }}</p>
          <p>{{ 'footer.madeWith' | t }} <span class="text-primary">&#9829;</span> {{ 'footer.inEgypt' | t }}</p>
        </div>
      </div>
    </footer>

  `,
})
export class AppLayoutComponent implements OnDestroy {
  authService = inject(AuthService);
  cart = inject(CartService);
  notificationService = inject(NotificationService);
  audioService = inject(AudioService);
  private t = inject(TranslationService);
  readonly currentLang = this.t.currentLang;
  readonly contact = CONTACT;
  private router = inject(Router);
  private elRef = inject(ElementRef);

  mobileMenu = signal(false);
  dropdownOpen = signal(false);
  profileDropdownOpen = signal(false);
  mobileProfileOpen = signal(false);
  dropdownLoading = signal(false);
  dropdownNotifications = signal<AppNotification[]>([]);
  
  isBottomNavVisible = signal(true);
  private lastScrollY = 0;

  constructor() {
    // React to auth state changes — start/stop polling dynamically
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.notificationService.startPolling();
      } else {
        this.notificationService.stopPolling();
      }
    });
  }

  ngOnDestroy(): void {
    this.notificationService.stopPolling();
  }

  toggleDropdown(): void {
    if (this.dropdownOpen()) {
      this.dropdownOpen.set(false);
      return;
    }
    this.profileDropdownOpen.set(false);
    this.dropdownOpen.set(true);
    this.loadDropdownNotifications();
  }

  toggleProfileDropdown(): void {
    if (this.profileDropdownOpen()) {
      this.profileDropdownOpen.set(false);
      return;
    }
    this.dropdownOpen.set(false);
    this.profileDropdownOpen.set(true);
  }

  toggleMobileProfile(): void {
    this.mobileProfileOpen.update(v => !v);
  }

  @ViewChild('notifDropdown') notifDropdownRef!: ElementRef;
  @ViewChild('profileDropdown') profileDropdownRef!: ElementRef;
  @ViewChild('mobileProfileDropdown') mobileProfileDropdownRef!: ElementRef;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.dropdownOpen() && this.notifDropdownRef && !this.notifDropdownRef.nativeElement.contains(event.target)) {
      this.dropdownOpen.set(false);
    }
    if (this.profileDropdownOpen() && this.profileDropdownRef && !this.profileDropdownRef.nativeElement.contains(event.target)) {
      this.profileDropdownOpen.set(false);
    }
    if (this.mobileProfileOpen() && this.mobileProfileDropdownRef && !this.mobileProfileDropdownRef.nativeElement.contains(event.target)) {
      this.mobileProfileOpen.set(false);
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const currentScrollY = window.scrollY;
    
    // threshold to prevent jitter
    if (Math.abs(currentScrollY - this.lastScrollY) < 10) return;
    
    if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
      // scroll down -> hide
      this.isBottomNavVisible.set(false);
    } else {
      // scroll up -> show
      this.isBottomNavVisible.set(true);
    }
    
    this.lastScrollY = currentScrollY;
  }

  private loadDropdownNotifications(): void {
    this.dropdownLoading.set(true);
    this.notificationService.getAll().subscribe({
      next: (data) => {
        this.dropdownNotifications.set(data.items.slice(0, 10));
        this.dropdownLoading.set(false);
      },
      error: () => this.dropdownLoading.set(false),
    });
  }

  onNotificationClick(n: AppNotification): void {
    this.dropdownOpen.set(false);
    if (!n.is_read) {
      this.notificationService.markAsRead(n.id).subscribe();
    }
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.dropdownNotifications.set(
          this.dropdownNotifications().map(n => ({ ...n, is_read: true }))
        );
      },
    });
  }

  logout(): void {
    this.mobileMenu.set(false);
    this.authService.logout().subscribe({
      next: () => this.router.navigateByUrl('/login', { replaceUrl: true }),
      error: () => this.router.navigateByUrl('/login', { replaceUrl: true }),
    });
  }
}
