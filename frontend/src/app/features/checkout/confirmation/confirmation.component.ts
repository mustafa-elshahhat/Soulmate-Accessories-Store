import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';
import { FormatPricePipe } from '../../../shared/pipes/format-price.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [RouterLink, FormatPricePipe, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-2xl mx-auto px-4 py-12">
      @if (loading()) {
        <div class="flex justify-center py-20">
          <div class="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (order()) {
        <div class="text-center mb-8">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 class="font-playfair text-3xl font-bold text-foreground mb-2">{{ 'confirmation.orderCreatedSuccess' | t }}</h1>
          <p class="text-muted-foreground">{{ 'confirmation.orderNumber' | t }} <span class="font-bold text-foreground">{{ order()!.order_number }}</span></p>
        </div>

        <!-- Order summary -->
        <div class="bg-background rounded-xl border border-border p-6 mb-6">
          <h2 class="text-lg font-bold mb-4">{{ 'confirmation.orderSummary' | t }}</h2>
          <div class="space-y-3 mb-4">
            @for (item of order()!.items; track item.id) {
              <div class="flex justify-between text-sm py-2 border-b border-border last:border-0">
                <span>{{ item.box_type_id ? ('confirmation.customBox' | t) : ('confirmation.product' | t) }} × {{ item.quantity }}</span>
                <span class="font-medium">{{ item.unit_price * item.quantity | formatPrice }}</span>
              </div>
            }
          </div>
          <hr class="my-4">
          <div class="flex justify-between text-sm mb-2">
            <span class="text-muted-foreground">{{ 'confirmation.products' | t }}</span>
            <span>{{ order()!.total_price | formatPrice }}</span>
          </div>
          <div class="flex justify-between text-sm mb-4">
            <span class="text-muted-foreground">{{ 'confirmation.shipping' | t }}</span>
            <span>{{ order()!.shipping_cost | formatPrice }}</span>
          </div>
          <hr class="my-4">
          <div class="flex justify-between font-bold text-lg">
            <span>{{ 'confirmation.totalToTransfer' | t }}</span>
            <span class="text-primary">{{ order()!.total_price + order()!.shipping_cost | formatPrice }}</span>
          </div>
        </div>

        <!-- Next step -->
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <h3 class="font-bold text-amber-800 mb-2">{{ 'confirmation.nextStep' | t }}</h3>
          <p class="text-primary text-sm">
            {{ 'confirmation.transferAmountPrefix' | t }} (<span class="font-bold">{{ order()!.total_price + order()!.shipping_cost | formatPrice }}</span>)
            {{ 'confirmation.transferInstruction' | t }}
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <a [routerLink]="['/checkout/payment']" [queryParams]="{ orderId: order()!.id }"
             class="flex-1 bg-primary text-white text-center py-3 rounded-xl hover:bg-primary/90 transition font-medium">
            {{ 'confirmation.uploadReceipt' | t }}
          </a>
          <a routerLink="/orders" class="flex-1 border border-border text-center py-3 rounded-xl hover:bg-muted transition text-muted-foreground">
            {{ 'confirmation.myOrders' | t }}
          </a>
        </div>
      } @else {
        <div class="text-center py-20">
          <p class="text-muted-foreground text-lg mb-6">{{ 'confirmation.orderNotFound' | t }}</p>
          <a routerLink="/orders" class="bg-primary text-white px-6 py-3 rounded-xl">{{ 'confirmation.myOrders' | t }}</a>
        </div>
      }
    </div>
  `,
})
export class ConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);

  order = signal<Order | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    const orderId = this.route.snapshot.queryParamMap.get('orderId');
    if (!orderId) {
      this.router.navigate(['/orders']);
      return;
    }

    this.orderService.getById(orderId).subscribe({
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
}
