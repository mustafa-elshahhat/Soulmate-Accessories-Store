import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { LanguageSwitcherComponent } from '../../../../shared/components/language-switcher/language-switcher.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe, LanguageSwitcherComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sticky top-0 z-50 w-full transition-all duration-500"
            [class.bg-background/80]="scrolled" [class.backdrop-blur-xl]="scrolled" [class.shadow-sm]="scrolled" [class.py-2]="scrolled" [class.py-4]="!scrolled">
      <div class="max-w-[1440px] mx-auto px-4 md:px-8">
        <div class="flex items-center justify-between h-14 md:h-16">
          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-2 group relative z-10">
            <img src="/assets/images/logo-sm-light.webp" srcset="/assets/images/logo-sm-light.webp 200w, /assets/images/logo-md-light.webp 400w" sizes="32px" alt="Soulmate" class="h-8 md:h-10 w-auto transition-transform duration-500 group-hover:scale-110" />
            <div class="flex flex-col">
              <span class="font-playfair text-lg md:text-xl font-bold tracking-tight text-primary leading-none">Soulmate</span>
              <span class="text-[10px] md:text-xs tracking-[0.2em] text-muted-foreground uppercase leading-none mt-1">{{ 'common.accessories' | t }}</span>
            </div>
          </a>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center gap-1">
            @for (item of navItems; track item.path) {
              <a [routerLink]="item.path" routerLinkActive="text-primary bg-primary/5 shadow-sm" [routerLinkActiveOptions]="{exact: item.path === '/'}"
                 class="px-5 py-2.5 rounded-full text-sm font-medium text-foreground/70 hover:text-primary hover:bg-primary/5 transition-all duration-300 relative group overflow-hidden">
                <span class="relative z-10">{{ item.label | t }}</span>
                <span class="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
              </a>
            }
          </nav>

          <!-- Desktop Actions -->
          <div class="hidden md:flex items-center gap-4">
            <app-language-switcher />

            <a routerLink="/wishlist" class="p-2.5 text-foreground/70 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-300 relative group" [attr.aria-label]="'nav.wishlist' | t">
              <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              @if (wishlistCount > 0) {
                <span class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">{{ wishlistCount }}</span>
              }
            </a>

            <a routerLink="/cart" class="p-2.5 text-foreground/70 hover:text-primary hover:bg-primary/5 rounded-full transition-all duration-300 relative group" [attr.aria-label]="'nav.cart' | t">
              <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
              @if (cartCount > 0) {
                <span class="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">{{ cartCount }}</span>
              }
            </a>

            @if (isAuthenticated) {
              <div class="relative" #userDropdown>
                <button (click)="onToggleUserDropdown()" class="flex items-center gap-3 p-1.5 pe-4 rounded-full bg-muted/50 hover:bg-primary/5 transition-all duration-300 group">
                  <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold group-hover:scale-110 transition-transform">
                    {{ userName.charAt(0) }}
                  </div>
                  <span class="text-sm font-semibold text-foreground/80">{{ userName }}</span>
                  <svg class="w-4 h-4 text-muted-foreground transition-transform" [class.rotate-180]="userDropdownOpen" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
                </button>

                @if (userDropdownOpen) {
                  <div class="absolute right-0 mt-2 w-56 bg-background rounded-2xl shadow-xl border border-border py-2 z-50 animate-[slideInUp_0.3s_ease-out]">
                    @if (isAdmin) {
                      <a routerLink="/admin" (click)="userDropdownOpen = false" class="flex items-center gap-3 px-4 py-3 text-sm text-foreground/70 hover:text-primary hover:bg-primary/5 transition-colors">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        {{ 'nav.adminDashboard' | t }}
                      </a>
                    }
                    <a routerLink="/orders" (click)="userDropdownOpen = false" class="flex items-center gap-3 px-4 py-3 text-sm text-foreground/70 hover:text-primary hover:bg-primary/5 transition-colors">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                      {{ 'nav.myOrders' | t }}
                    </a>
                    <a routerLink="/profile" (click)="userDropdownOpen = false" class="flex items-center gap-3 px-4 py-3 text-sm text-foreground/70 hover:text-primary hover:bg-primary/5 transition-colors">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                      {{ 'nav.profile' | t }}
                    </a>
                    <button (click)="onLogout()" class="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                      {{ 'nav.logout' | t }}
                    </button>
                  </div>
                }
              </div>
            } @else {
              <a routerLink="/login" class="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                {{ 'nav.login' | t }}
              </a>
            }
          </div>

          <!-- Mobile Actions -->
          <div class="flex md:hidden items-center gap-2">
            <app-language-switcher />
            <a routerLink="/wishlist" class="p-2 text-foreground/70 relative group" [attr.aria-label]="'nav.wishlist' | t">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>
              @if (wishlistCount > 0) {
                <span class="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">{{ wishlistCount }}</span>
              }
            </a>
          </div>
        </div>
      </div>
    </header>
  `
})
export class NavbarComponent {
  @Input() scrolled = false;
  @Input() wishlistCount = 0;
  @Input() cartCount = 0;
  @Input() isAuthenticated = false;
  @Input() isAdmin = false;
  @Input() userName = '';
  @Input() userDropdownOpen = false;
  @Input() navItems: any[] = [];

  @Output() toggleUserDropdown = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  onToggleUserDropdown() { this.toggleUserDropdown.emit(); }
  onLogout() { this.logout.emit(); }
}
