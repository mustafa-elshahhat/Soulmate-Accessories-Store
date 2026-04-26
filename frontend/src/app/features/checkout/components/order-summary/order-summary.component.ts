import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CouponValidationResult } from '../../../../core/models/coupon.model';
import { CartItem } from '../../../../core/services/cart.service';
import { FormatPricePipe } from '../../../../shared/pipes/format-price.pipe';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-checkout-order-summary',
  standalone: true,
  imports: [FormsModule, FormatPricePipe, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-background rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-shadow duration-300 border border-border p-6 sm:p-8 sticky top-24">
      <h2 class="font-playfair text-2xl font-semibold mb-6">{{ 'checkout.orderSummary' | t }}</h2>

      <div class="space-y-4 mb-6">
        @for (item of items; track item.id) {
          <div class="flex justify-between items-center text-sm">
            <span class="font-medium text-foreground">
              {{ currentLang === 'ar' ? item.name : (item.name_en || item.name) }}
              <span class="text-muted-foreground me-1">× {{ item.quantity }}</span>
            </span>
            <span class="font-playfair font-semibold">{{ item.unit_price * item.quantity | formatPrice }}</span>
          </div>
        }
      </div>

      <div class="border-t border-border pt-6 space-y-4 mb-6">
        <div class="flex justify-between text-sm">
          <span class="text-muted-foreground">{{ 'checkout.products' | t }}</span>
          <span class="font-playfair font-medium">{{ subtotal | formatPrice }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-muted-foreground">{{ 'checkout.shipping' | t }}</span>
          <span class="font-playfair font-medium">{{ shippingCost | formatPrice }}</span>
        </div>
        @if (appliedCoupon) {
          <div class="flex justify-between text-sm text-green-600">
            <span class="flex items-center gap-1.5">
              {{ 'checkout.coupon.discount' | t }} ({{ appliedCoupon.code }})
              <button (click)="onRemoveCoupon()" class="text-red-400 hover:text-red-600 transition-colors text-xs">
                {{ 'checkout.coupon.remove' | t }}
              </button>
            </span>
            <span class="font-playfair font-medium">-{{ appliedCoupon.discount_amount | formatPrice }}</span>
          </div>
        }
      </div>

      <!-- Coupon Input -->
      @if (!appliedCoupon) {
        <div class="border-t border-border pt-4 mb-4">
          <label class="block text-sm font-semibold mb-2 text-foreground">{{ 'checkout.coupon.label' | t }}</label>
          <div class="flex gap-2">
            <input [(ngModel)]="couponCode" (ngModelChange)="couponCodeChange.emit($event)" [placeholder]="'checkout.coupon.placeholder' | t"
                   class="flex-1 h-11 rounded-xl bg-background border border-border px-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300" dir="ltr">
            <button (click)="onApplyCoupon()" [disabled]="!couponCode.trim() || applyingCoupon"
                    class="bg-primary text-white h-11 px-5 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0">
              @if (applyingCoupon) {
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              }
              {{ 'checkout.coupon.apply' | t }}
            </button>
          </div>
        </div>
      }

      <div class="border-t border-border pt-6 mb-8">
        <div class="flex justify-between items-center">
          <span class="text-lg font-semibold">{{ 'checkout.total' | t }}</span>
          <span class="font-playfair text-2xl font-bold text-primary">{{ total | formatPrice }}</span>
        </div>
      </div>

      <button (click)="onPlaceOrder()" [disabled]="!canPlaceOrder || loading"
              class="w-full bg-primary text-white h-14 rounded-xl hover:bg-primary-dark transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg mt-6">
        @if (loading) {
          <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin ms-2"></div>
          <span>{{ 'checkout.placingOrder' | t }}</span>
        } @else {
          {{ 'checkout.confirmOrder' | t }}
        }
      </button>
    </div>
  `
})
export class OrderSummaryComponent {
  @Input() items: CartItem[] = [];
  @Input() subtotal = 0;
  @Input() shippingCost = 0;
  @Input() total = 0;
  @Input() appliedCoupon: CouponValidationResult | null = null;
  @Input() couponCode = '';
  @Input() applyingCoupon = false;
  @Input() loading = false;
  @Input() canPlaceOrder = false;
  @Input() currentLang = 'ar';

  @Output() couponCodeChange = new EventEmitter<string>();
  @Output() applyCoupon = new EventEmitter<void>();
  @Output() removeCoupon = new EventEmitter<void>();
  @Output() placeOrder = new EventEmitter<void>();

  onApplyCoupon() { this.applyCoupon.emit(); }
  onRemoveCoupon() { this.removeCoupon.emit(); }
  onPlaceOrder() { this.placeOrder.emit(); }
}
