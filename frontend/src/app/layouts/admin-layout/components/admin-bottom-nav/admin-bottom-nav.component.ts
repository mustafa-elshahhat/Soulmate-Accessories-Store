import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-admin-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="fixed bottom-0 inset-x-0 z-50 bg-background border-t border-border safe-bottom" aria-label="Admin navigation">
      <div class="flex items-center justify-around h-14 md:h-16 max-w-3xl mx-auto px-1 sm:px-2 gap-1 sm:gap-2">
        <!-- Dashboard -->
        <a routerLink="/admin" routerLinkActive="text-primary" [routerLinkActiveOptions]="{ exact: true }"
           class="bottom-nav-item flex flex-col items-center justify-center" aria-label="Dashboard">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z"/></svg>
          <span class="bottom-nav-label">{{ 'admin.sidebar.dashboard' | t }}</span>
        </a>

        <!-- Orders -->
        <a routerLink="/admin/orders" routerLinkActive="text-primary"
           class="bottom-nav-item flex flex-col items-center justify-center" aria-label="Orders">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"/></svg>
          <span class="bottom-nav-label">{{ 'admin.sidebar.orders' | t }}</span>
        </a>

        <!-- Products -->
        <a routerLink="/admin/products" routerLinkActive="text-primary"
           class="bottom-nav-item flex flex-col items-center justify-center" aria-label="Products">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/></svg>
          <span class="bottom-nav-label">{{ 'admin.sidebar.products' | t }}</span>
        </a>

        <!-- Box Types (Hidden on mobile) -->
        <a routerLink="/admin/box-types" routerLinkActive="text-primary"
           class="bottom-nav-item hidden md:flex flex-col items-center justify-center" aria-label="Box Types">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/></svg>
          <span class="bottom-nav-label">{{ 'admin.sidebar.boxTypes' | t }}</span>
        </a>

        <!-- Users -->
        <a routerLink="/admin/users" routerLinkActive="text-primary"
           class="bottom-nav-item flex flex-col items-center justify-center" aria-label="Users">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>
          <span class="bottom-nav-label">{{ 'admin.sidebar.users' | t }}</span>
        </a>

        <!-- Analytics (Hidden on mobile) -->
        <a routerLink="/admin/analytics" routerLinkActive="text-primary"
           class="bottom-nav-item hidden md:flex flex-col items-center justify-center" aria-label="Analytics">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>
          <span class="bottom-nav-label">{{ 'admin.sidebar.analytics' | t }}</span>
        </a>

        <!-- Shipping (Hidden on mobile) -->
        <a routerLink="/admin/shipping" routerLinkActive="text-primary"
           class="bottom-nav-item hidden md:flex flex-col items-center justify-center" aria-label="Shipping">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/></svg>
          <span class="bottom-nav-label">{{ 'admin.sidebar.shipping' | t }}</span>
        </a>

        <!-- Settings (Hidden on mobile) -->
        <a routerLink="/admin/customization" routerLinkActive="text-primary"
           class="bottom-nav-item hidden md:flex flex-col items-center justify-center" aria-label="Settings">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          <span class="bottom-nav-label">{{ 'admin.sidebar.customizationPricing' | t }}</span>
        </a>

        <!-- More Items (Mobile Only) -->
        <div class="relative md:hidden flex" #moreDropdown>
          <button (click)="onToggleMore()" class="bottom-nav-item flex flex-col items-center justify-center" [class.text-primary]="moreOpen" aria-label="More">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            <span class="bottom-nav-label">{{ 'nav.more' | t }}</span>
          </button>

          @if (moreOpen) {
            <div class="absolute bottom-full end-0 mb-4 w-48 bg-background rounded-xl shadow-lg border border-border overflow-hidden z-50 animate-[slideUp_150ms_ease-out]">
              <div class="py-1 flex flex-col">
                <a routerLink="/admin/box-types" routerLinkActive="bg-muted text-primary font-semibold" (click)="onCloseMore()" class="px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors border-b border-border/50">
                  {{ 'admin.sidebar.boxTypes' | t }}
                </a>
                <a routerLink="/admin/analytics" routerLinkActive="bg-muted text-primary font-semibold" (click)="onCloseMore()" class="px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors border-b border-border/50">
                  {{ 'admin.sidebar.analytics' | t }}
                </a>
                <a routerLink="/admin/shipping" routerLinkActive="bg-muted text-primary font-semibold" (click)="onCloseMore()" class="px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors border-b border-border/50">
                  {{ 'admin.sidebar.shipping' | t }}
                </a>
                <a routerLink="/admin/customization" routerLinkActive="bg-muted text-primary font-semibold" (click)="onCloseMore()" class="px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors border-b border-border/50">
                  {{ 'admin.sidebar.customizationPricing' | t }}
                </a>
                <a routerLink="/admin/promotions" routerLinkActive="bg-muted text-primary font-semibold" (click)="onCloseMore()" class="px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors border-b border-border/50">
                  {{ 'admin.sidebar.promotions' | t }}
                </a>
                <a routerLink="/admin/coupons" routerLinkActive="bg-muted text-primary font-semibold" (click)="onCloseMore()" class="px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors border-b border-border/50">
                  {{ 'admin.sidebar.coupons' | t }}
                </a>
                <a routerLink="/admin/box-reviews" routerLinkActive="bg-muted text-primary font-semibold" (click)="onCloseMore()" class="px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors">
                  {{ 'admin.sidebar.boxReviews' | t }}
                </a>
              </div>
            </div>
          }
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .bottom-nav-item {
      padding: 4px 6px;
      border-radius: 8px;
      color: var(--muted-foreground, #6B7280);
      transition: color 0.2s;
      min-width: 64px;
      flex-shrink: 0;
      cursor: pointer;
      background: none;
      border: none;
      text-decoration: none;
      -webkit-tap-highlight-color: transparent;
    }
    .bottom-nav-item:active { transform: scale(0.95); }
    .bottom-nav-label {
      font-size: 9px;
      font-weight: 500;
      margin-top: 2px;
      line-height: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 56px;
      display: block;
    }
    @media (min-width: 768px) {
      .bottom-nav-label { font-size: 10px; max-width: 72px; }
    }
    .safe-bottom { padding-bottom: env(safe-area-inset-bottom, 0px); }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AdminBottomNavComponent {
  @Input() moreOpen = false;

  @Output() toggleMore = new EventEmitter<void>();
  @Output() closeMore = new EventEmitter<void>();

  @ViewChild('moreDropdown') moreDropdownRef!: ElementRef;

  onToggleMore() { this.toggleMore.emit(); }
  onCloseMore() { this.closeMore.emit(); }
}
