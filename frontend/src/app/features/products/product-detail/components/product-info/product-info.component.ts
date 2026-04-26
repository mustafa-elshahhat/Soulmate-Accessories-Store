import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Product } from '../../../../../core/models/product.model';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { FormatPricePipe } from '../../../../../shared/pipes/format-price.pipe';

@Component({
  selector: 'app-product-info',
  standalone: true,
  imports: [TranslatePipe, FormatPricePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col">
      <div class="flex flex-wrap gap-2 mb-4">
        <span class="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
          {{ (product.gender === 'male' ? 'common.gender.male' : 'common.gender.female') | t }}
        </span>
        @if (product.category) {
          <span class="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
            {{ product.category }}
          </span>
        }
      </div>

      <h1 class="font-playfair text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
        {{ currentLang === 'ar' ? product.name : (product.name_en || product.name) }}
      </h1>

      <button (click)="onToggleWishlist()" class="flex items-center gap-2 mb-4 group cursor-pointer transition-all duration-200">
        @if (inWishlist) {
          <svg class="w-6 h-6 text-red-500 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"/></svg>
          <span class="text-sm font-inter text-red-500 font-medium">{{ 'productDetail.removeFromWishlist' | t }}</span>
        } @else {
          <svg class="w-6 h-6 text-muted-foreground group-hover:text-red-500 transition-all group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>
          <span class="text-sm font-inter text-muted-foreground group-hover:text-red-500 font-medium">{{ 'productDetail.addToWishlist' | t }}</span>
        }
      </button>

      <p class="text-primary text-2xl md:text-3xl font-bold mb-6 font-playfair tracking-wide flex items-center gap-4">
        {{ displayPrice | formatPrice }}
        @if (isCustomizing && product.customization_price > 0) {
          <span class="text-xs font-inter font-semibold text-primary/70 bg-primary/10 px-2.5 py-1 rounded-full">{{ 'productDetail.includesCustomization' | t }}</span>
        }
        @if (product.original_price !== null && product.final_price !== null && product.final_price! < product.original_price!) {
          <span class="text-sm font-inter font-normal text-muted-foreground line-through decoration-gray-300">
            {{ product.original_price | formatPrice }}
          </span>
          @if (product.discount_percentage) {
            <span class="text-xs font-inter font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-full">-{{ product.discount_percentage }}%</span>
          }
        }
      </p>

      <p class="text-muted-foreground leading-relaxed mb-10 text-base md:text-lg font-inter">
        {{ currentLang === 'ar' ? product.description : (product.description_en || product.description) }}
      </p>

      <div class="h-px w-full bg-border mb-8"></div>
    </div>
  `
})
export class ProductInfoComponent {
  @Input({ required: true }) product!: Product;
  @Input() currentLang = 'ar';
  @Input() inWishlist = false;
  @Input() displayPrice = 0;
  @Input() isCustomizing = false;

  @Output() toggleWishlist = new EventEmitter<void>();

  onToggleWishlist() { this.toggleWishlist.emit(); }
}
