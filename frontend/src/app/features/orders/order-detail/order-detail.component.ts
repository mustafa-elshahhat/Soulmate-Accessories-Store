import { Component, inject, signal, OnInit, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';
import { FormatPricePipe } from '../../../shared/pipes/format-price.pipe';
import { ToastService } from '../../../shared/components/toast/toast.component';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { getStatusLabel, getStatusColor } from '../../../shared/constants/order-status.constants';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [RouterLink, FormatPricePipe, DatePipe, TranslatePipe, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-4xl mx-auto px-4 py-12 font-inter">
      @if (loading()) {
        <div class="flex justify-center py-20">
          <div class="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (order()) {
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <a routerLink="/orders" class="text-sm text-muted-foreground hover:text-primary transition-colors mb-4 inline-flex items-center gap-2 min-h-[44px]">
              <span>&larr;</span> {{ 'orderDetail.backToOrders' | t }}
            </a>
            <h1 class="font-playfair text-3xl sm:text-4xl font-bold text-foreground">{{ 'orderDetail.orderPrefix' | t }} <span class="text-primary">{{ order()!.order_number }}</span></h1>
            <p class="text-sm text-muted-foreground mt-2 tracking-wide">{{ order()!.created_at | date:'medium' }}</p>
          </div>
          <span class="inline-flex px-4 py-2 rounded-full text-sm font-medium self-start sm:self-auto tracking-wide" [class]="getStatusColor(order()!.status)">
            {{ getStatusLabel(order()!.status) }}
          </span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Items + Address + Payment -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Items -->
            <div class="bg-background rounded-xl shadow-sm border border-border p-8 relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
              <div class="absolute top-0 end-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" aria-hidden="true"></div>
              <h2 class="text-xl font-playfair font-bold mb-6 text-foreground border-b border-border pb-4 relative z-10">{{ 'orderDetail.products' | t }}</h2>
              <div class="space-y-4 relative z-10">
                @for (item of order()!.items; track item.id) {
                  <div class="flex justify-between items-center py-4 border-b border-border last:border-0 last:pb-0">
                    <div>
                      <p class="font-medium text-foreground tracking-wide font-inter">{{ item.product_name ? (currentLang() === 'ar' ? item.product_name : (item.product_name_en || item.product_name)) : ((item.box_type_id ? 'orderDetail.customBox' : 'orderDetail.product') | t) }}</p>
                      <p class="text-sm text-muted-foreground mt-1 font-inter">{{ 'orderDetail.quantity' | t }} <span class="font-semibold text-foreground">{{ item.quantity }}</span></p>
                    </div>
                    <span class="font-playfair font-bold text-xl text-primary">{{ item.unit_price * item.quantity | formatPrice }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Shipping address -->
            @if (order()!.shipping_address; as addr) {
              <div class="bg-background rounded-xl shadow-sm border border-border p-8 relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
                <div class="absolute top-0 end-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" aria-hidden="true"></div>
                <h2 class="text-xl font-playfair font-bold mb-6 text-foreground border-b border-border pb-4 relative z-10">{{ 'orderDetail.shippingAddress' | t }}</h2>
                <div class="space-y-4 text-sm font-inter relative z-10">
                  <div class="flex items-center gap-3">
                    <span class="flex items-center justify-center w-8 h-8 rounded-full bg-primary/5 text-primary">
                      <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </span>
                    <span class="font-semibold text-foreground text-base">{{ addr.label }}</span>
                  </div>
                  <div class="me-11 space-y-1.5 text-muted-foreground leading-relaxed">
                    <p>{{ currentLang() === 'ar' ? addr.governorate_name : (addr.governorate_name_en || addr.governorate_name) }} - {{ addr.street }}</p>
                    <p>{{ 'orderDetail.building' | t }} {{ addr.building }} - {{ 'orderDetail.floor' | t }} {{ addr.floor }}</p>
                    @if (addr.apartment) {
                      <p>{{ 'orderDetail.apartment' | t }} {{ addr.apartment }}</p>
                    }
                  </div>
                  <div class="flex items-center gap-3 me-11 pt-2">
                    <svg class="h-4 w-4 text-primary/60 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span class="text-foreground font-medium" dir="ltr">{{ addr.phone }}</span>
                  </div>
                </div>
              </div>
            }

            <!-- Payment status -->
            @if (order()!.payment; as payment) {
              <div class="bg-background rounded-xl shadow-sm border border-border p-8 relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
                <div class="absolute top-0 end-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" aria-hidden="true"></div>
                <h2 class="text-xl font-playfair font-bold mb-6 text-foreground border-b border-border pb-4 relative z-10">{{ 'orderDetail.paymentStatusSection' | t }}</h2>
                <div class="space-y-4 relative z-10">
                  <div class="flex justify-between items-center py-2">
                    <span class="text-sm text-muted-foreground font-inter">{{ 'orderDetail.paymentMethod' | t }}</span>
                    <span class="font-medium text-foreground tracking-wide">{{ getPaymentMethodLabel(payment.method) }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2">
                    <span class="text-sm text-muted-foreground font-inter">{{ 'orderDetail.paymentStatusLabel' | t }}</span>
                    <span class="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border" [class]="getPaymentStatusColor(payment.status) + ' border-current'">
                      {{ getPaymentStatusLabel(payment.status) }}
                    </span>
                  </div>
                  @if (payment.screenshot_url) {
                    <div class="mt-6 pt-5 border-t border-border">
                      <p class="text-sm text-muted-foreground mb-3 font-inter font-medium">{{ 'orderDetail.receiptImage' | t }}</p>
                      <img [ngSrc]="payment.screenshot_url" [alt]="'orderDetail.receiptAlt' | t" class="max-h-56 rounded-xl border border-border shadow-sm object-cover" width="224" height="224">
                    </div>
                  }
                </div>
              </div>
            }

            @if (order()!.cancel_reason) {
              <div class="bg-red-50/50 rounded-xl shadow-sm border border-red-100 p-6 md:p-8">
                <h3 class="font-playfair font-bold text-red-800 mb-3 text-lg">{{ 'orderDetail.cancelReason' | t }}</h3>
                <p class="text-red-700/90 leading-relaxed">{{ order()!.cancel_reason }}</p>
              </div>
            }
          </div>

          <!-- Summary -->
          <div>
            <div class="bg-gradient-to-br from-primary-dark via-[#4A3B32] to-black text-white rounded-3xl shadow-2xl border border-white/10 p-8 sticky top-24 overflow-hidden relative">
              <div class="absolute top-0 end-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" aria-hidden="true"></div>

              <h2 class="text-xl font-playfair font-bold mb-6 text-white/90 border-b border-white/10 pb-4 relative z-10">{{ 'orderDetail.orderSummary' | t }}</h2>
              <div class="space-y-4 text-sm font-inter relative z-10">
                <div class="flex justify-between items-center text-white/70">
                  <span>{{ 'orderDetail.summaryProducts' | t }}</span>
                  <span class="font-medium tracking-wide">{{ order()!.total_price | formatPrice }}</span>
                </div>
                <div class="flex justify-between items-center text-white/70">
                  <span>{{ 'orderDetail.summaryShipping' | t }}</span>
                  <span class="font-medium tracking-wide">{{ order()!.shipping_cost | formatPrice }}</span>
                </div>
                <div class="border-t border-white/20 my-5 pt-5">
                  <div class="flex justify-between items-end font-bold">
                    <span class="text-lg text-white/90">{{ 'orderDetail.summaryTotal' | t }}</span>
                    <span class="font-playfair text-3xl text-primary-light drop-shadow-sm">{{ order()!.total_price + order()!.shipping_cost | formatPrice }}</span>
                  </div>
                </div>
              </div>

              @if (order()!.status === 'pending') {
                <div class="mt-8 space-y-3 relative z-10">
                  <a [routerLink]="['/checkout/payment']" [queryParams]="{ orderId: order()!.id }"
                     class="flex items-center justify-center h-14 w-full bg-primary text-white text-center px-6 rounded-xl hover:bg-primary-dark transition-all duration-300 ease-in-out shadow-lg shadow-primary/25 font-semibold tracking-wide">{{ 'orderDetail.uploadReceipt' | t }}</a>
                  <button (click)="cancelOrder()" [disabled]="cancelling()"
                          class="flex items-center justify-center h-14 w-full border border-white/20 text-white/80 px-6 rounded-xl hover:bg-white/10 transition-all duration-300 ease-in-out disabled:opacity-50 font-medium tracking-wide">
                    @if (cancelling()) { {{ 'orderDetail.cancelling' | t }} } @else { {{ 'orderDetail.cancelOrder' | t }} }
                  </button>
                </div>
              }

              @if (order()!.status === 'payment_review') {
                <div class="mt-8 bg-blue-500/10 rounded-xl p-5 border border-blue-500/20 relative z-10">
                  <p class="text-sm text-blue-200 leading-relaxed font-inter text-center">{{ 'orderDetail.paymentReviewMessage' | t }}</p>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private toast = inject(ToastService);
  private t = inject(TranslationService);
  private destroyRef = inject(DestroyRef);
  readonly currentLang = this.t.currentLang;

  order = signal<Order | null>(null);
  loading = signal(true);
  cancelling = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/orders']);
      return;
    }
    this.orderService.getById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/orders']);
      },
    });
  }

  cancelOrder(): void {
    const order = this.order();
    if (!order) return;

    this.cancelling.set(true);
    this.orderService.cancel(order.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.order.set({ ...order, status: 'cancelled', cancel_reason: this.t.get('orderDetail.cancelledByCustomer') });
        this.cancelling.set(false);
        this.toast.show(this.t.get('orderDetail.toast.orderCancelled'), 'success');
      },
      error: () => {
        this.cancelling.set(false);
        this.toast.show(this.t.get('orderDetail.toast.cannotCancelOrder'), 'error');
      },
    });
  }

  getStatusLabel(status: string): string {
    return getStatusLabel(status, this.t);
  }

  getStatusColor(status: string): string {
    return getStatusColor(status);
  }

  getPaymentMethodLabel(method: string): string {
    const methods: Record<string, string> = {
      vodafone_cash: 'orderDetail.vodafoneCash',
      instapay: 'orderDetail.instapay',
    };
    return this.t.get(methods[method] ?? method);
  }

  getPaymentStatusLabel(status: string): string {
    const statuses: Record<string, string> = {
      pending: 'orderDetail.paymentPending',
      verified: 'orderDetail.paymentVerified',
      rejected: 'orderDetail.paymentRejected',
    };
    return this.t.get(statuses[status] ?? status);
  }

  getPaymentStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] ?? 'bg-muted text-foreground';
  }
}
