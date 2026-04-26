import { Component, inject, OnInit, ChangeDetectionStrategy, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { StructuredDataService } from '../../core/services/structured-data.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

interface CategoryConfig {
  translationKey: string;
  relatedCategory?: string;
  ctaLink: string;
}

const CATEGORY_MAP: Record<string, CategoryConfig> = {
  'custom-gift-box': { translationKey: 'customGiftBox', ctaLink: '/builder/select' },
  'couple-gifts': { translationKey: 'coupleGifts', ctaLink: '/products?gender=couple', relatedCategory: 'couple' },
  'birthday-gifts': { translationKey: 'birthdayGifts', ctaLink: '/products' },
  'anniversary-gifts': { translationKey: 'anniversaryGifts', ctaLink: '/products' },
  'personalized-mug': { translationKey: 'personalizedMug', ctaLink: '/products?category=mug', relatedCategory: 'mug' },
  'photo-gifts': { translationKey: 'photoGifts', ctaLink: '/products' },
};

@Component({
  selector: 'app-gift-category',
  standalone: true,
  imports: [RouterLink, TranslatePipe, ProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (config()) {
      <!-- Breadcrumb -->
      <nav class="max-w-[1280px] mx-auto px-4 pt-6 text-sm text-muted-foreground font-inter flex items-center gap-2">
        <a routerLink="/" class="hover:text-primary transition-colors">{{ 'productDetail.breadcrumbHome' | t }}</a>
        <span class="text-border">/</span>
        <span class="text-foreground font-medium">{{ 'gifts.' + config()!.translationKey + '.title' | t }}</span>
      </nav>

      <!-- Hero Section -->
      <section class="relative bg-gradient-to-br from-[#1A1A1A] via-[#242424] to-[#1A1A1A] overflow-hidden mt-6">
        <div class="absolute top-20 right-10 w-72 h-72 bg-primary/8 rounded-full blur-3xl"></div>
        <div class="absolute bottom-10 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div class="max-w-[1280px] mx-auto px-6 lg:px-8 py-16 md:py-24 text-center">
          <h1 class="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-white mb-6 leading-[1.2]">
            {{ 'gifts.' + config()!.translationKey + '.heading' | t }}
          </h1>
          <p class="text-base md:text-lg text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed font-inter">
            {{ 'gifts.' + config()!.translationKey + '.description' | t }}
          </p>
          <a
            [routerLink]="config()!.ctaLink.split('?')[0]"
            class="inline-flex items-center justify-center bg-primary text-white h-12 md:h-14 px-10 rounded-xl font-semibold text-sm md:text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 hover:bg-primary-dark transition-all duration-300"
          >
            {{ 'gifts.' + config()!.translationKey + '.cta' | t }}
          </a>
        </div>
      </section>

      <!-- Related Products Section -->
      @if (relatedProducts().length > 0) {
        <section class="py-16 md:py-24">
          <div class="max-w-[1280px] mx-auto px-4">
            <h2 class="font-playfair text-2xl md:text-3xl font-bold text-foreground mb-10 text-center">
              {{ 'home.featured.title' | t }}
            </h2>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              @for (product of relatedProducts(); track product.id) {
                <app-product-card [product]="product"></app-product-card>
              }
            </div>
            <div class="text-center mt-10">
              <a routerLink="/products" class="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                {{ 'home.featured.viewAll' | t }}
                <svg class="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        </section>
      }

      <!-- Features Section (for custom-gift-box) -->
      @if (slug() === 'custom-gift-box') {
        <section class="bg-gradient-to-b from-[#FAFAF8] to-white py-16 md:py-24">
          <div class="max-w-[1280px] mx-auto px-4">
            <h2 class="font-playfair text-2xl md:text-3xl font-bold text-foreground mb-12 text-center">
              {{ 'gifts.customGiftBox.features.title' | t }}
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              @for (feature of ['personalized', 'curated', 'packaging', 'delivery']; track feature) {
                <div class="text-center p-6 rounded-xl bg-background border border-border shadow-sm">
                  <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <p class="text-foreground font-medium text-sm leading-relaxed">
                    {{ 'gifts.customGiftBox.features.' + feature | t }}
                  </p>
                </div>
              }
            </div>
          </div>
        </section>
      }

      <!-- Internal Links to other categories -->
      <section class="py-16 md:py-20 bg-gradient-to-b from-[#FAFAF8] to-white">
        <div class="max-w-[1280px] mx-auto px-4">
          <h2 class="font-playfair text-2xl md:text-3xl font-bold text-foreground mb-10 text-center">
            {{ 'gifts.exploreMore' | t }}
          </h2>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            @for (cat of otherCategories(); track cat.slug) {
              <a [routerLink]="'/gifts/' + cat.slug" class="group p-6 rounded-xl bg-background border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center">
                <h3 class="font-playfair text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                  {{ 'gifts.' + cat.key + '.title' | t }}
                </h3>
                <span class="text-xs text-muted-foreground font-inter group-hover:text-primary transition-colors">
                  {{ 'gifts.viewCategory' | t }}
                  <svg class="w-3 h-3 inline-block rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                </span>
              </a>
            }
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="bg-gradient-to-br from-[#1A1A1A] via-[#242424] to-[#1A1A1A] py-16 md:py-20">
        <div class="max-w-[1280px] mx-auto px-6 text-center">
          <h2 class="font-playfair text-2xl md:text-3xl font-bold text-white mb-4">
            {{ 'home.cta.titlePart1' | t }} <span class="text-primary">{{ 'home.cta.titlePart2' | t }}</span>
          </h2>
          <p class="text-white/70 mb-8 max-w-lg mx-auto font-inter">{{ 'home.cta.description' | t }}</p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <a routerLink="/builder/select" class="bg-primary text-white h-12 px-8 rounded-xl font-semibold text-sm shadow-lg hover:bg-primary-dark transition-all duration-300 flex items-center justify-center">
              {{ 'home.hero.ctaBuildBox' | t }}
            </a>
            <a routerLink="/products" class="border border-white/20 text-white h-12 px-8 rounded-xl font-medium text-sm hover:bg-white/5 hover:border-primary hover:text-primary transition-all duration-300 flex items-center justify-center">
              {{ 'home.hero.ctaBrowse' | t }}
            </a>
          </div>
        </div>
      </section>
    }
  `,
})
export class GiftCategoryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private seo = inject(SeoService);
  private structuredData = inject(StructuredDataService);
  private t = inject(TranslationService);
  private productService = inject(ProductService);
  private destroyRef = inject(DestroyRef);

  config = signal<CategoryConfig | null>(null);
  slug = signal('');
  relatedProducts = signal<Product[]>([]);
  otherCategories = signal<Array<{ slug: string; key: string }>>([]);

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const category = params.get('category') || '';
      const cfg = CATEGORY_MAP[category];
      if (!cfg) return;

      this.slug.set(category);
      this.config.set(cfg);

      const key = cfg.translationKey;

      this.seo.updatePage({
        title: this.t.get(`gifts.${key}.seo.title`),
        description: this.t.get(`gifts.${key}.seo.description`),
        url: `/gifts/${category}`,
      });

      this.structuredData.setBreadcrumbSchema([
        { name: this.t.get('productDetail.breadcrumbHome'), url: '/' },
        { name: this.t.get(`gifts.${key}.title`), url: `/gifts/${category}` },
      ]);

      // Set other categories for internal linking
      const others = Object.entries(CATEGORY_MAP)
        .filter(([slug]) => slug !== category)
        .map(([slug, c]) => ({ slug, key: c.translationKey }));
      this.otherCategories.set(others);

      // Load related products
      this.productService.getAll({
        page: 1,
        limit: 8,
        category: cfg.relatedCategory,
      }).subscribe({
        next: (res) => this.relatedProducts.set(res.data),
      });
    });
  }
}
