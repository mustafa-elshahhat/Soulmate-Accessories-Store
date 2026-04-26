import { Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { SeoService } from '../../core/services/seo.service';
import { TranslationService } from '../../core/services/translation.service';
import { FormatPricePipe } from '../../shared/pipes/format-price.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, FormatPricePipe, TranslatePipe, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-4xl mx-auto px-4 py-12 font-inter text-foreground">
      <!-- Page Header -->
      <div class="text-center mb-10">
        <p class="text-primary text-sm font-semibold tracking-widest uppercase mb-2">{{ 'cart.pageSubtitle' | t }}</p>
        <h1 class="font-playfair text-3xl md:text-4xl font-bold text-foreground">{{ 'cart.title' | t }}</h1>
      </div>

      @if (cart.items().length === 0) {
        <div class="text-center py-20 bg-background rounded-xl shadow-sm border border-border flex flex-col items-center justify-center">
          <div class="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-6 text-primary/40">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
          <p class="text-muted-foreground text-lg mb-2 font-playfair font-medium">{{ 'cart.emptyTitle' | t }}</p>
          <p class="text-sm text-muted-foreground mb-8">{{ 'cart.emptySubtitle' | t }}</p>
          <a routerLink="/products" class="inline-flex items-center justify-center bg-primary text-white h-14 px-10 rounded-xl font-semibold tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-primary-dark transition-all duration-300 min-h-[44px]">{{ 'cart.emptyCta' | t }}</a>
        </div>
      } @else {
        <div class="space-y-4 mb-8">
          @for (item of cart.items(); track item.id) {
            <div class="bg-background rounded-xl border border-border p-4 flex flex-col sm:flex-row items-center gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <img [ngSrc]="item.image_url" [alt]="currentLang() === 'ar' ? item.name : (item.name_en || item.name)" class="w-full sm:w-20 h-32 sm:h-20 object-cover rounded-lg" width="80" height="80">
              <div class="flex-1 min-w-0 text-center sm:text-start">
                <h3 class="font-playfair text-lg font-semibold truncate">{{ currentLang() === 'ar' ? item.name : (item.name_en || item.name) }}</h3>
                <p class="text-sm text-muted-foreground mt-1">{{ item.type === 'box' ? ('cart.itemTypeBox' | t) : ('cart.itemTypeProduct' | t) }}</p>
                <p class="font-playfair text-primary font-bold text-lg mt-1">{{ item.unit_price | formatPrice }}</p>
              </div>
              <div class="flex items-center gap-3 mt-4 sm:mt-0">
                <button (click)="cart.updateQuantity(item.id, item.quantity - 1)"
                        [disabled]="item.quantity <= 1"
                        class="w-11 h-11 rounded-full border border-border flex items-center justify-center hover:bg-muted hover:border-primary/50 text-start group focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-colors duration-300 disabled:opacity-50 disabled:hover:border-border disabled:hover:bg-transparent min-h-[44px] min-w-[44px]"
                        [attr.aria-label]="'cart.decreaseQuantityAria' | t">
                  <span class="text-lg leading-none mb-1">−</span>
                </button>
                <span class="w-8 text-center font-medium">{{ item.quantity }}</span>
                <button (click)="cart.updateQuantity(item.id, item.quantity + 1)"
                        class="w-11 h-11 rounded-full border border-border flex items-center justify-center hover:bg-muted hover:border-primary/50 text-start group focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-colors duration-300 min-h-[44px] min-w-[44px]"
                        [attr.aria-label]="'cart.increaseQuantityAria' | t">
                  <span class="text-lg leading-none mb-1">+</span>
                </button>
              </div>
              <p class="font-playfair font-bold text-xl w-full sm:w-28 text-center sm:text-end mt-4 sm:mt-0">{{ item.unit_price * item.quantity | formatPrice }}</p>
              <button (click)="cart.removeItem(item.id)" class="text-muted-foreground hover:text-destructive p-3 sm:p-2 transition-colors duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center mt-2 sm:mt-0" [attr.aria-label]="'cart.removeItemAria' | t">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          }
        </div>

        <!-- Summary -->
        <div class="bg-gradient-to-br from-primary-dark via-[#4A3B32] to-black rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden border border-white/10">
          <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" aria-hidden="true"></div>
          <div class="absolute bottom-0 left-0 w-40 h-40 bg-primary/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" aria-hidden="true"></div>
          
          <div class="relative z-10 flex justify-between items-end mb-6 border-b border-white/10 pb-6">
            <span class="text-lg font-medium text-white/80 font-inter">{{ 'cart.totalLabel' | t }}</span>
            <span class="font-playfair text-4xl font-bold text-white drop-shadow-sm">{{ cart.totalPrice() | formatPrice }}</span>
          </div>
          <p class="relative z-10 text-sm text-white/60 mb-8 font-inter">{{ 'cart.shippingNote' | t }}</p>
          <div class="relative z-10 flex flex-col sm:flex-row gap-4">
            <a routerLink="/checkout" class="flex-[2] bg-primary text-white h-14 rounded-xl hover:bg-primary-dark transition-all duration-300 font-semibold tracking-wide shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center min-h-[44px]">{{ 'cart.checkoutBtn' | t }}</a>
            <button (click)="cart.clear()" class="flex-1 h-14 border border-white/20 text-white/80 rounded-xl hover:bg-white/10 transition-all duration-300 font-medium font-inter min-h-[44px]">{{ 'cart.clearBtn' | t }}</button>
          </div>
        </div>
      }
    </div>
  `,
})
export class CartComponent implements OnInit {
  cart = inject(CartService);
  private t = inject(TranslationService);
  private seoService = inject(SeoService);
  readonly currentLang = this.t.currentLang;

  ngOnInit(): void {
    this.seoService.updatePage({
      title: this.t.get('cart.seo.title'),
      description: this.t.get('cart.seo.description'),
      url: '/cart',
    });
  }
}
