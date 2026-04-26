import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border px-4 pb-safe shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.1)]">
      <div class="flex items-center justify-between h-16 max-w-lg mx-auto">
        <a routerLink="/" routerLinkActive="text-primary" [routerLinkActiveOptions]="{exact: true}" class="flex flex-col items-center gap-1 min-w-[64px] transition-all duration-300 active:scale-90">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>
          <span class="text-[10px] font-semibold tracking-wide">{{ 'nav.home' | t }}</span>
        </a>
        <a routerLink="/products" routerLinkActive="text-primary" class="flex flex-col items-center gap-1 min-w-[64px] transition-all duration-300 active:scale-90">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"/></svg>
          <span class="text-[10px] font-semibold tracking-wide">{{ 'nav.products' | t }}</span>
        </a>
        <a routerLink="/boxes" routerLinkActive="text-primary" class="flex flex-col items-center gap-1 min-w-[64px] transition-all duration-300 active:scale-90">
          <div class="relative">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/></svg>
            <span class="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping"></span>
          </div>
          <span class="text-[10px] font-semibold tracking-wide">{{ 'nav.boxes' | t }}</span>
        </a>
        <a routerLink="/cart" routerLinkActive="text-primary" class="flex flex-col items-center gap-1 min-w-[64px] transition-all duration-300 active:scale-90">
          <div class="relative">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>
            @if (cartCount > 0) {
              <span class="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">{{ cartCount }}</span>
            }
          </div>
          <span class="text-[10px] font-semibold tracking-wide">{{ 'nav.cart' | t }}</span>
        </a>
        <a [routerLink]="isAuthenticated ? '/profile' : '/login'" routerLinkActive="text-primary" class="flex flex-col items-center gap-1 min-w-[64px] transition-all duration-300 active:scale-90">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
          <span class="text-[10px] font-semibold tracking-wide">{{ (isAuthenticated ? 'nav.profile' : 'nav.login') | t }}</span>
        </a>
      </div>
    </nav>
  `
})
export class BottomNavComponent {
  @Input() cartCount = 0;
  @Input() isAuthenticated = false;
}
