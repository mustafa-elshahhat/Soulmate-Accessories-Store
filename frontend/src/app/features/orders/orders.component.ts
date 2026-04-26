import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/order.model';
import { FormatPricePipe } from '../../shared/pipes/format-price.pipe';
import { getStatusLabel, getStatusColor } from '../../shared/constants/order-status.constants';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [RouterLink, FormatPricePipe, DatePipe, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-4xl mx-auto px-4 py-12 font-inter">
      <!-- Page Header -->
      <div class="text-center mb-10">
        <p class="text-primary text-sm font-semibold tracking-widest uppercase mb-2">{{ 'orders.pageSubtitle' | t }}</p>
        <h1 class="font-playfair text-3xl md:text-4xl font-bold text-foreground">{{ 'orders.pageTitle' | t }}</h1>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-20">
          <div class="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (orders().length === 0) {
        <div class="text-center py-20 bg-background rounded-xl shadow-sm border border-border flex flex-col items-center justify-center">
          <div class="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-4 text-primary/40">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
          <p class="text-lg font-playfair font-medium text-foreground mb-1">{{ 'orders.noOrders' | t }}</p>
          <p class="text-sm text-muted-foreground mb-6">{{ 'orders.startShoppingSubtitle' | t }}</p>
          <a routerLink="/products" class="inline-flex items-center justify-center bg-primary text-white h-14 px-10 rounded-xl font-semibold tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-primary-dark transition-all duration-300 min-h-[44px]">{{ 'orders.startShopping' | t }}</a>
        </div>
      } @else {
        <div class="space-y-4">
          @for (order of orders(); track order.id) {
            <a [routerLink]="['/orders', order.id]"
               class="block bg-background rounded-xl border border-border p-6 md:p-8 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30 text-start group transition-all duration-300 ease-in-out relative overflow-hidden">
              <div class="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true"></div>
              <div class="relative z-10 flex items-center justify-between mb-5 flex-wrap gap-4">
                <div class="flex items-baseline gap-3">
                  <span class="font-bold text-foreground font-playfair text-2xl">#{{ order.order_number }}</span>
                  <span class="text-sm text-muted-foreground">{{ order.created_at | date:'mediumDate' }}</span>
                </div>
                <span class="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border" [class]="getStatusColor(order.status) + ' border-current'">
                  {{ getStatusLabel(order.status) }}
                </span>
              </div>
              <div class="relative z-10 flex items-center justify-between mt-4 pt-5 border-t border-border">
                <span class="text-sm font-medium text-muted-foreground font-inter">{{ 'orders.productCount' | t }} {{ order.items.length }}</span>
                <span class="font-bold text-primary font-playfair text-2xl drop-shadow-sm">{{ order.total_price | formatPrice }}</span>
              </div>
            </a>
          }
        </div>

        @if (hasMore()) {
          <div class="text-center mt-12">
            <button (click)="loadMore()" class="inline-flex items-center justify-center h-14 px-10 border border-border text-foreground rounded-xl font-inter hover:bg-muted hover:border-primary/50 hover:shadow-sm transition-all duration-300 ease-in-out font-medium tracking-wide min-h-[44px]">
              {{ 'orders.showMore' | t }}
            </button>
          </div>
        }
      }
    </div>
  `,
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private t = inject(TranslationService);
  orders = signal<Order[]>([]);
  loading = signal(true);
  hasMore = signal(false);
  page = 1;

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getMyOrders(this.page).subscribe({
      next: (res) => {
        this.orders.set([...this.orders(), ...res.data]);
        this.hasMore.set(this.page < res.meta.total_pages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadMore(): void {
    this.page++;
    this.loadOrders();
  }

  getStatusLabel(status: string): string {
    return getStatusLabel(status, this.t);
  }

  getStatusColor(status: string): string {
    return getStatusColor(status);
  }
}
