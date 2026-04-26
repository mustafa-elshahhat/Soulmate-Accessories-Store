import { Component, Input, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { FormatPricePipe } from '../../pipes/format-price.pipe';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '../../../core/services/auth.service';
import { TranslationService } from '../../../core/services/translation.service';
import { ToastService } from '../toast/toast.component';
import { AudioService } from '../../../core/services/audio.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, FormatPricePipe, NgOptimizedImage, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="group bg-background rounded-xl shadow-sm border border-border hover:shadow-[0_8px_30px_rgba(212,175,55,0.12)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full font-inter relative">
      <div class="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/5 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true"></div>

      <!-- Wishlist Heart Button -->
      <button (click)="toggleWishlist($event)" class="absolute top-3 end-3 z-20 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-300 hover:scale-110"
              [attr.aria-label]="(inWishlist() ? 'productDetail.removeFromWishlist' : 'productDetail.addToWishlist') | t">
        @if (inWishlist()) {
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"/>
          </svg>
        } @else {
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-muted-foreground hover:text-red-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
          </svg>
        }
      </button>

      <!-- Discount Badge -->
      @if (product.discount_percentage) {
        <div class="absolute top-3 start-3 z-20 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
          -{{ product.discount_percentage }}%
        </div>
      }

      <a [routerLink]="['/products', product.slug]" class="block relative aspect-square overflow-hidden bg-muted">
        <!-- Out of Stock Overlay -->
        @if (product.stock_quantity === 0) {
          <div class="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <span class="bg-white/95 text-foreground text-sm font-bold py-2 px-5 rounded-xl shadow-lg">
              {{ 'productCard.outOfStock' | t }}
            </span>
          </div>
        } @else {
          <!-- Quick View Overlay -->
          <div class="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 backdrop-blur-[2px]">
            <span class="bg-white/95 text-primary text-sm font-semibold py-2.5 px-6 rounded-xl shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
              {{ 'productCard.quickView' | t }}
            </span>
          </div>
        }

        <img [ngSrc]="product.image_url" fill [alt]="currentLang() === 'ar' ? product.name : (product.name_en || product.name)"
             sizes="(max-width: 768px) 45vw, (max-width: 1024px) 33vw, 25vw"
             class="object-cover group-hover:scale-105 transition-transform duration-500 ease-out">
      </a>

      <div class="p-5 md:p-6 flex flex-col flex-grow relative z-20 bg-background">
        <a [routerLink]="['/products', product.slug]" class="group-hover:text-primary transition-colors">
          <h3 class="font-playfair text-lg font-semibold text-foreground line-clamp-1 mb-1.5">{{ currentLang() === 'ar' ? product.name : (product.name_en || product.name) }}</h3>
        </a>
        <p class="text-sm font-medium text-muted-foreground line-clamp-2 mb-3 flex-grow leading-relaxed">{{ currentLang() === 'ar' ? product.description : (product.description_en || product.description) }}</p>

        <!-- Rating Stars -->
        @if (product.review_count > 0) {
          <div class="flex items-center gap-1.5 mb-3">
            <div class="flex items-center gap-0.5" role="img" [attr.aria-label]="'productCard.ratingAriaLabel' | t:{ rating: product.average_rating }">
              @for (star of [1,2,3,4,5]; track star) {
                @if (star <= Math.round(product.average_rating)) {
                  <svg class="w-4 h-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                } @else {
                  <svg class="w-4 h-4 text-border" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                }
              }
            </div>
            <span class="text-xs font-medium text-muted-foreground">({{ product.review_count }})</span>
          </div>
        } @else {
          <div class="flex items-center gap-1.5 mb-3">
            <div class="flex items-center gap-0.5" role="img" [attr.aria-label]="'productCard.noRatings' | t">
              @for (star of [1,2,3,4,5]; track star) {
                <svg class="w-4 h-4 text-border" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              }
            </div>
            <span class="text-xs font-medium text-muted-foreground">{{ 'productCard.noRatings' | t }}</span>
          </div>
        }

        <div class="flex items-end justify-between mt-auto mb-5">
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">{{ 'productCard.priceLabel' | t }}</span>
            @if (product.final_price !== null && product.original_price !== null && product.final_price < product.original_price) {
              <div class="flex items-center gap-2">
                <p class="font-playfair text-primary font-bold text-xl tracking-tight">{{ product.final_price | formatPrice }}</p>
                <p class="font-playfair text-muted-foreground font-medium text-sm line-through">{{ product.original_price | formatPrice }}</p>
              </div>
            } @else {
              <p class="font-playfair text-primary font-bold text-xl tracking-tight">{{ product.price | formatPrice }}</p>
            }
          </div>
        </div>

        <!-- Add to Cart Button with animation feedback -->
        @if (product.stock_quantity === 0) {
          <button disabled
                  class="w-full h-12 font-semibold rounded-xl bg-muted text-muted-foreground cursor-not-allowed flex items-center justify-center gap-2.5 min-h-[44px] opacity-60">
            {{ 'productCard.outOfStock' | t }}
          </button>
        } @else {
          <button (click)="addToCart($event)"
                  [class.bg-green-600]="added()" [class.text-white]="added()"
                  [class.bg-muted]="!added()" [class.text-foreground]="!added()"
                  class="w-full h-12 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2.5 group/btn min-h-[44px]"
                  [class.hover:bg-primary]="!added()" [class.hover:text-white]="!added()" [class.hover:shadow-md]="!added()">
            @if (added()) {
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 animate-[ping_0.3s_cubic-bezier(0,0,0.2,1)_1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-muted-foreground group-hover/btn:text-white transition-colors duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              {{ 'productCard.addToCart' | t }}
            }
          </button>
        }
      </div>
    </div>
  `,
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  protected readonly Math = Math;
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private audio = inject(AudioService);
  private t = inject(TranslationService);
  readonly currentLang = this.t.currentLang;

  added = signal(false);

  inWishlist = computed(() => this.wishlistService.isInWishlist(this.product.id));

  toggleWishlist(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    const wasInWishlist = this.inWishlist();
    this.wishlistService.toggle(this.product.id);
    this.audio.playWishlistSound();
    this.toast.show(
      this.t.get(wasInWishlist ? 'productCard.removedFromWishlist' : 'productCard.addedToWishlist'),
      'success'
    );
  }

  addToCart(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    if (this.added() || this.product.stock_quantity === 0) return;

    this.cartService.addItem({
      id: this.product.id,
      type: 'standalone',
      name: this.product.name,
      name_en: this.product.name_en,
      image_url: this.product.image_url,
      unit_price: this.product.final_price ?? this.product.price,
      quantity: 1,
      product_id: this.product.id,
      custom_data_json: '{}',
    });

    this.audio.playCartSound();
    this.toast.show(this.t.get('productCard.addedToCartSuccess'), 'success');

    // Show added feedback state
    this.added.set(true);
    setTimeout(() => {
      this.added.set(false);
    }, 800);
  }
}
