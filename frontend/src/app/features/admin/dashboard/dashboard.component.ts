import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService, DashboardStats } from '../../../core/services/admin.service';
import { FormatPricePipe } from '../../../shared/pipes/format-price.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, FormatPricePipe, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <h1 class="font-playfair text-3xl font-bold text-foreground mb-6">{{ 'admin.sidebar.dashboard' | t }}</h1>

      @if (stats()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div class="bg-background rounded-xl border border-border p-6 sm:p-8 hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p class="text-sm font-medium text-muted-foreground mb-2 relative z-10 font-inter">{{ 'admin.dashboard.totalOrders' | t }}</p>
            <div class="flex items-end justify-between relative z-10">
              <p class="text-4xl font-bold text-foreground font-playfair">{{ stats()!.total_orders }}</p>
              <svg class="w-16 h-8 text-primary/40 opacity-70" viewBox="0 0 100 30" fill="none" preserveAspectRatio="none">
                <path d="M0 25 C20 10, 40 25, 60 5 S80 15, 100 0L100 30 L0 30Z" fill="currentColor" fill-opacity="0.1" />
                <path d="M0 25 C20 10, 40 25, 60 5 S80 15, 100 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>
          <div class="bg-background rounded-xl border border-border p-6 sm:p-8 hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p class="text-sm font-medium text-muted-foreground mb-2 relative z-10 font-inter">{{ 'admin.dashboard.pendingOrders' | t }}</p>
            <p class="text-4xl font-bold text-yellow-600 font-playfair relative z-10">{{ stats()!.pending_orders }}</p>
          </div>
          <div class="bg-background rounded-xl border border-border p-6 sm:p-8 hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p class="text-sm font-medium text-muted-foreground mb-2 relative z-10 font-inter">{{ 'admin.dashboard.paymentReview' | t }}</p>
            <p class="text-4xl font-bold text-blue-600 font-playfair relative z-10">{{ stats()!.payment_review }}</p>
          </div>
          <div class="bg-background rounded-xl border border-border p-6 sm:p-8 hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p class="text-sm font-medium text-muted-foreground mb-2 relative z-10 font-inter">{{ 'admin.dashboard.revenue' | t }}</p>
            <div class="flex items-end justify-between relative z-10">
              <p class="text-4xl font-bold text-green-600 font-playfair truncate pr-2">{{ stats()!.total_revenue | formatPrice }}</p>
              <svg class="w-16 h-8 text-green-500/40 opacity-70 flex-shrink-0" viewBox="0 0 100 30" fill="none" preserveAspectRatio="none">
                <path d="M0 30 C20 20, 40 30, 60 10 S80 20, 100 5L100 30 L0 30Z" fill="currentColor" fill-opacity="0.1" />
                <path d="M0 30 C20 20, 40 30, 60 10 S80 20, 100 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>
          <div class="bg-background rounded-xl border border-border p-6 sm:p-8 hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p class="text-sm font-medium text-muted-foreground mb-2 relative z-10 font-inter">{{ 'admin.dashboard.activeProducts' | t }}</p>
            <p class="text-4xl font-bold text-foreground font-playfair relative z-10">{{ stats()!.total_products }}</p>
          </div>
          <div class="bg-background rounded-xl border border-border p-6 sm:p-8 hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p class="text-sm font-medium text-muted-foreground mb-2 relative z-10 font-inter">{{ 'admin.dashboard.users' | t }}</p>
            <div class="flex items-end justify-between relative z-10">
              <p class="text-4xl font-bold text-foreground font-playfair">{{ stats()!.total_users }}</p>
              <svg class="w-16 h-8 text-primary/40 opacity-70" viewBox="0 0 100 30" fill="none" preserveAspectRatio="none">
                <path d="M0 20 C20 25, 40 10, 60 15 S80 5, 100 10L100 30 L0 30Z" fill="currentColor" fill-opacity="0.1" />
                <path d="M0 20 C20 25, 40 10, 60 15 S80 5, 100 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-4">
          <a routerLink="/admin/orders" class="inline-flex items-center justify-center bg-primary text-white h-14 px-8 rounded-xl font-semibold tracking-wide shadow-[0_4px_20px_rgba(212,175,55,0.2)] hover:shadow-[0_8px_30px_rgba(212,175,55,0.3)] hover:-translate-y-0.5 hover:bg-primary-dark transition-all duration-300">{{ 'admin.dashboard.viewOrders' | t }}</a>
          <a routerLink="/admin/products" class="inline-flex items-center justify-center h-14 px-8 border border-border text-foreground rounded-xl font-medium tracking-wide hover:bg-muted hover:border-primary/50 transition-all duration-300">{{ 'admin.dashboard.manageProducts' | t }}</a>
        </div>
      } @else if (error()) {
        <div class="text-center py-20">
          <p class="text-red-500 text-lg mb-4">{{ 'admin.dashboard.loadError' | t }}</p>
          <button (click)="retry()" class="bg-primary text-white px-6 py-2 rounded-xl">{{ 'admin.dashboard.retry' | t }}</button>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="bg-background/50 rounded-xl border border-border p-6 sm:p-8 animate-pulse">
              <div class="h-4 bg-muted rounded w-1/2 mb-4"></div>
              <div class="h-10 bg-muted rounded w-1/3 mt-2 mb-2"></div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  stats = signal<DashboardStats | null>(null);
  error = signal(false);

  ngOnInit(): void {
    this.adminService.getDashboard().subscribe({
      next: (data) => this.stats.set(data),
      error: () => this.error.set(true),
    });
  }

  retry(): void {
    this.error.set(false);
    this.ngOnInit();
  }
}
