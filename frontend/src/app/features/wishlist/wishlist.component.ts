import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../core/services/wishlist.service';
import { WishlistItem } from '../../core/models/wishlist.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { Product } from '../../core/models/product.model';
import { SeoService } from '../../core/services/seo.service';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-[1280px] mx-auto px-4 py-8 md:py-16 font-inter">
      <h1 class="font-playfair text-3xl md:text-5xl font-bold mb-10 text-center text-foreground">{{ 'wishlist.pageTitle' | t }}</h1>

      @if (loading()) {
        <div class="flex justify-center items-center py-24">
          <div class="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (items().length === 0) {
        <div class="text-center py-24 bg-background rounded-xl shadow-sm border border-border max-w-2xl mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mx-auto text-border mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
          </svg>
          <p class="text-muted-foreground text-xl mb-2 font-medium">{{ 'wishlist.empty' | t }}</p>
          <p class="text-muted-foreground text-sm mb-8">{{ 'wishlist.emptySubtitle' | t }}</p>
          <a routerLink="/products" class="inline-flex items-center justify-center bg-primary text-white h-14 px-10 rounded-xl hover:bg-primary-dark transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            {{ 'wishlist.browseCta' | t }}
          </a>
        </div>
      } @else {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          @for (item of items(); track item.id) {
            <app-product-card [product]="toProduct(item)" />
          }
        </div>
      }
    </div>
  `,
})
export class WishlistComponent implements OnInit {
  private wishlistService = inject(WishlistService);
  private seo = inject(SeoService);
  private t = inject(TranslationService);

  items = signal<WishlistItem[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.seo.updatePage({
      title: this.t.get('wishlist.pageTitle'),
      description: this.t.get('wishlist.emptySubtitle'),
      url: '/wishlist',
    });

    this.wishlistService.getAll().subscribe({
      next: (res) => {
        this.items.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toProduct(item: WishlistItem): Product {
    return {
      id: item.product_id,
      name: item.name,
      name_en: item.name_en,
      slug: item.slug,
      description: '',
      description_en: '',
      price: item.price,
      image_url: item.image_url,
      gallery_json: null,
      category: item.category,
      gender: '',
      is_standalone: true,
      is_builder_item: false,
      is_customizable: false,
      customization_price: 0,
      is_active: true,
      review_count: 0,
      average_rating: 0,
      created_at: '',
      updated_at: '',
      stock_quantity: item.stock_quantity,
      original_price: null,
      final_price: null,
      discount_percentage: null,
    };
  }
}
