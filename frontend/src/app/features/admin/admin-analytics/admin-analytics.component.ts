import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { AdminService, AnalyticsData } from '../../../core/services/admin.service';
import { FormatPricePipe } from '../../../shared/pipes/format-price.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

const STATUS_MAP: Record<string, string> = {
  pending: 'status.pending', payment_review: 'status.paymentReview', processing: 'status.processing',
  shipped: 'status.shipped', delivered: 'status.delivered', cancelled: 'status.cancelled',
};
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-400', payment_review: 'bg-blue-400', processing: 'bg-purple-400',
  shipped: 'bg-indigo-400', delivered: 'bg-green-400', cancelled: 'bg-red-400',
};

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [FormatPricePipe, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <h1 class="font-playfair text-3xl font-bold text-foreground mb-6">{{ 'admin.analytics.title' | t }}</h1>

      @if (data(); as d) {
        <!-- Quick Stats -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div class="bg-background rounded-xl border p-5">
            <p class="text-xs text-muted-foreground mb-1">{{ 'admin.analytics.revenue' | t }} ({{ 'admin.analytics.30days' | t }})</p>
            <p class="text-2xl font-bold text-primary">{{ d.last_30_days.revenue | formatPrice }}</p>
          </div>
          <div class="bg-background rounded-xl border p-5">
            <p class="text-xs text-muted-foreground mb-1">{{ 'admin.analytics.orders' | t }} ({{ 'admin.analytics.30days' | t }})</p>
            <p class="text-2xl font-bold text-foreground">{{ d.last_30_days.order_count }}</p>
          </div>
          <div class="bg-background rounded-xl border p-5">
            <p class="text-xs text-muted-foreground mb-1">{{ 'admin.analytics.avgOrder' | t }}</p>
            <p class="text-2xl font-bold text-foreground">{{ d.last_30_days.avg_order_value | formatPrice }}</p>
          </div>
          <div class="bg-background rounded-xl border p-5">
            <p class="text-xs text-muted-foreground mb-1">{{ 'admin.analytics.todayOrders' | t }}</p>
            <p class="text-2xl font-bold text-foreground">{{ d.today_orders }}</p>
          </div>
          <div class="bg-background rounded-xl border p-5">
            <p class="text-xs text-muted-foreground mb-1">{{ 'admin.analytics.pendingPayments' | t }}</p>
            <p class="text-2xl font-bold" [class.text-amber-600]="d.pending_payments > 0" [class.text-foreground]="d.pending_payments === 0">{{ d.pending_payments }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Status Breakdown -->
          <div class="bg-background rounded-xl border p-6">
            <h2 class="font-bold text-lg mb-4">{{ 'admin.analytics.orderDistribution' | t }}</h2>
            <div class="space-y-3">
              @for (item of d.status_breakdown; track item.status) {
                <div class="flex items-center gap-4">
                  <span class="text-sm w-28 text-muted-foreground">{{ getStatusLabel(item.status) }}</span>
                  <div class="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-300 ease-in-out" [class]="getStatusColor(item.status)"
                         [style.width.%]="getBarWidth(item.count)"></div>
                  </div>
                  <span class="text-sm font-medium w-12 text-end">{{ item.count }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Top Products -->
          <div class="bg-background rounded-xl border p-6">
            <h2 class="font-bold text-lg mb-4">{{ 'admin.analytics.topProducts' | t }}</h2>
            @if (d.top_products.length === 0) {
              <p class="text-sm text-muted-foreground py-4">{{ 'admin.analytics.noDataAvailable' | t }}</p>
            } @else {
              <div class="space-y-3">
                @for (product of d.top_products; track product.name; let i = $index) {
                  <div class="flex items-center gap-4">
                    <span class="text-sm font-bold text-muted-foreground w-6">{{ i + 1 }}</span>
                    <span class="text-sm flex-1 truncate">{{ currentLang() === 'ar' ? product.name : (product.name_en || product.name) }}</span>
                    <div class="flex-1 bg-muted rounded-full h-5 overflow-hidden max-w-32">
                      <div class="h-full rounded-full bg-primary/70 transition-all duration-300 ease-in-out"
                           [style.width.%]="getProductBarWidth(product.sales_count)"></div>
                    </div>
                    <span class="text-sm font-medium w-12 text-end">{{ product.sales_count }}</span>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminAnalyticsComponent implements OnInit {
  private adminService = inject(AdminService);
  private t = inject(TranslationService);
  readonly currentLang = this.t.currentLang;
  data = signal<AnalyticsData | null>(null);
  private maxCount = 1;
  private maxProductSales = 1;

  ngOnInit(): void {
    this.adminService.getAnalytics().subscribe({
      next: (d) => {
        this.maxCount = Math.max(1, ...d.status_breakdown.map(s => s.count));
        this.maxProductSales = Math.max(1, ...d.top_products.map(p => p.sales_count));
        this.data.set(d);
      },
    });
  }

  getStatusLabel(s: string): string { return this.t.get(STATUS_MAP[s] ?? s); }
  getStatusColor(s: string): string { return STATUS_COLOR[s] ?? 'bg-muted-foreground'; }
  getBarWidth(count: number): number { return (count / this.maxCount) * 100; }
  getProductBarWidth(count: number): number { return (count / this.maxProductSales) * 100; }
}
