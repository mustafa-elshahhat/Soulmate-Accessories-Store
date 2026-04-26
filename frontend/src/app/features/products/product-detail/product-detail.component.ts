import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { ReviewService } from '../../../core/services/review.service';
import { AuthService } from '../../../core/services/auth.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { Product } from '../../../core/models/product.model';
import { Review, ProductReviewsSummary } from '../../../core/models/review.model';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { SeoService } from '../../../core/services/seo.service';
import { StructuredDataService } from '../../../core/services/structured-data.service';
import { ToastService } from '../../../shared/components/toast/toast.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';
import { AudioService } from '../../../core/services/audio.service';
import { ProductImagesComponent } from './components/product-images/product-images.component';
import { ProductInfoComponent } from './components/product-info/product-info.component';
import { ProductCustomizationComponent } from './components/product-customization/product-customization.component';
import { ProductReviewsComponent } from './components/product-reviews/product-reviews.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    RouterLink,
    ProductCardComponent,
    TranslatePipe,
    ProductImagesComponent,
    ProductInfoComponent,
    ProductCustomizationComponent,
    ProductReviewsComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <div class="flex justify-center items-center min-h-[60vh]">
        <div class="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    } @else if (product()) {
      <div class="max-w-[1280px] mx-auto px-4 py-8 md:py-16">
        <!-- Breadcrumb -->
        <nav class="text-sm text-muted-foreground mb-8 md:mb-12 font-inter flex items-center gap-2">
          <a routerLink="/" class="hover:text-primary transition-colors duration-300">{{ 'productDetail.breadcrumbHome' | t }}</a>
          <span class="text-border">/</span>
          <a routerLink="/products" class="hover:text-primary transition-colors duration-300">{{ 'productDetail.breadcrumbProducts' | t }}</a>
          <span class="text-border">/</span>
          <span class="text-foreground font-medium">{{ currentLang() === 'ar' ? product()!.name : (product()!.name_en || product()!.name) }}</span>
        </nav>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
          <app-product-images
            [imageUrl]="product()!.image_url"
            [altText]="currentLang() === 'ar' ? product()!.name : (product()!.name_en || product()!.name)" />

          <div class="flex flex-col">
            <app-product-info
              [product]="product()!"
              [currentLang]="currentLang()"
              [inWishlist]="inWishlist()"
              [displayPrice]="displayPrice()"
              [isCustomizing]="customizationEnabled()"
              (toggleWishlist)="toggleWishlist()" />

            <app-product-customization
              [isCustomizable]="product()!.is_customizable"
              [price]="product()!.customization_price"
              [enabled]="customizationEnabled()"
              [(customName)]="customName"
              [(customDate)]="customDate"
              [(customMessage)]="customMessage"
              (toggle)="toggleCustomization()" />

            <!-- Add to Cart Action -->
            @if (product()!.stock_quantity === 0) {
              <button disabled
                      class="w-full bg-muted text-muted-foreground h-16 rounded-xl font-inter font-bold tracking-wide text-lg flex items-center justify-center gap-3 cursor-not-allowed opacity-60">
                {{ 'productDetail.outOfStock' | t }}
              </button>
            } @else {
              <button
                (click)="addToCart()"
                class="w-full bg-primary text-white h-16 rounded-xl font-inter font-bold tracking-wide text-lg shadow-lg hover:shadow-2xl hover:-translate-y-1 hover:bg-primary-dark transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group border border-white/10"
              >
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 relative z-10 transition-transform group-hover:scale-110 duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <span class="relative z-10">{{ 'productDetail.addToCart' | t }}</span>
              </button>
            }
            <div class="mt-4 flex items-center justify-center gap-6 text-sm text-muted-foreground font-inter">
              @if (product()!.stock_quantity === 0) {
                <span class="flex items-center gap-2 text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {{ 'productDetail.outOfStock' | t }}
                </span>
              } @else if (product()!.stock_quantity <= 5) {
                <span class="flex items-center gap-2 text-amber-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                  {{ 'productDetail.lowStock' | t }}
                </span>
              } @else {
                <span class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {{ 'productDetail.inStock' | t }}
                </span>
              }
              <span class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                {{ 'productDetail.premiumPackaging' | t }}
              </span>
            </div>
          </div>
        </div>

        <app-product-reviews
          [summary]="reviewSummary()"
          [userReview]="userReview()"
          [isAuthenticated]="auth.isAuthenticated()"
          [(rating)]="reviewRating"
          [(comment)]="reviewComment"
          [submitting]="submittingReview()"
          (save)="submitReview()"
          (delete)="deleteReview()" />

        <!-- Related Products -->
        @if (relatedProducts().length > 0) {
        <div class="mt-24">
          <h2 class="font-playfair text-2xl md:text-3xl font-bold text-foreground mb-8 text-center border-b border-border pb-4">{{ 'productDetail.relatedProducts' | t }}</h2>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            @for (p of relatedProducts(); track p.id) {
              <app-product-card [product]="p" />
            }
          </div>
        </div>
        }
      </div>
    }
  `,
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private reviewService = inject(ReviewService);
  readonly auth = inject(AuthService);
  private wishlistService = inject(WishlistService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private seo = inject(SeoService);
  private structuredData = inject(StructuredDataService);
  private t = inject(TranslationService);
  private audio = inject(AudioService);
  private destroyRef = inject(DestroyRef);
  readonly currentLang = this.t.currentLang;

  product = signal<Product | null>(null);
  relatedProducts = signal<Product[]>([]);
  loading = signal(true);
  reviewSummary = signal<ProductReviewsSummary | null>(null);
  userReview = signal<Review | null>(null);
  submittingReview = signal(false);
  reviewRating = 0;
  reviewComment = '';

  // Customization fields
  customName = '';
  customDate = '';
  customMessage = '';
  customizationEnabled = signal(false);

  inWishlist = computed(() => {
    const p = this.product();
    return p ? this.wishlistService.isInWishlist(p.id) : false;
  });

  displayPrice = computed(() => {
    const p = this.product();
    if (!p) return 0;
    const base = p.final_price ?? p.price;
    return base + (this.customizationEnabled() ? p.customization_price : 0);
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.loadProduct(slug);
      }
    });
  }

  loadProduct(slug: string): void {
    this.loading.set(true);
    this.productService.getBySlug(slug).subscribe({
      next: (product) => {
        this.product.set(product);
        const lang = this.t.currentLang();
        const productName = lang === 'ar' ? product.name : (product.name_en || product.name);
        const productDesc = lang === 'ar' ? product.description : (product.description_en || product.description);
        this.seo.updatePage({
          title: productName,
          description: productDesc,
          url: `/products/${slug}`,
        });
        this.structuredData.setProductSchema(product, lang);
        this.structuredData.setBreadcrumbSchema([
          { name: this.t.get('productDetail.breadcrumbHome'), url: '/' },
          { name: this.t.get('productDetail.breadcrumbProducts'), url: '/products' },
          { name: productName, url: `/products/${slug}` },
        ]);

        // Reset inputs
        this.customName = '';
        this.customDate = '';
        this.customMessage = '';
        this.customizationEnabled.set(false);

        this.loading.set(false);

        this.productService.getRelated(slug, 4).subscribe({
          next: (related) => this.relatedProducts.set(related),
        });

        this.loadReviews(product.id);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  addToCart(): void {
    const p = this.product();
    if (!p || p.stock_quantity === 0) return;

    // Store customization data
    const customData = {
      name: this.customName || undefined,
      date: this.customDate || undefined,
      message: this.customMessage || undefined
    };

    const basePrice = p.final_price ?? p.price;

    this.cartService.addItem({
      id: p.id,
      type: 'standalone',
      name: p.name,
      name_en: p.name_en,
      image_url: p.image_url,
      unit_price: basePrice + (this.customizationEnabled() ? p.customization_price : 0),
      quantity: 1,
      product_id: p.id,
      custom_data_json: JSON.stringify(customData),
    });

    this.audio.playCartSound();
    this.toast.show(this.t.get('productDetail.toast.addedToCart'), 'success');
  }

  toggleWishlist(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    const p = this.product();
    if (!p) return;
    const wasIn = this.inWishlist();
    this.wishlistService.toggle(p.id);
    this.audio.playWishlistSound();
    this.toast.show(
      this.t.get(wasIn ? 'productCard.removedFromWishlist' : 'productCard.addedToWishlist'),
      'success'
    );
  }

  toggleCustomization(): void {
    this.customizationEnabled.update(v => !v);
    if (!this.customizationEnabled()) {
      this.customName = '';
      this.customDate = '';
      this.customMessage = '';
    }
  }

  private loadReviews(productId: string): void {
    this.reviewService.getByProduct(productId).subscribe({
      next: (summary) => {
        this.reviewSummary.set(summary);

        // Update product schema with reviews data
        const currentProduct = this.product();
        if (currentProduct) {
          this.structuredData.setProductSchema(currentProduct, this.t.currentLang(), summary);
        }

        const userId = this.auth.user()?.id;
        if (userId) {
          const mine = summary.reviews.find(r => r.user_id === userId);
          if (mine) {
            this.userReview.set(mine);
            this.reviewRating = mine.rating;
            this.reviewComment = mine.comment || '';
          } else {
            this.userReview.set(null);
            this.reviewRating = 0;
            this.reviewComment = '';
          }
        }
      },
    });
  }

  submitReview(): void {
    const p = this.product();
    if (!p || this.reviewRating === 0) return;

    this.submittingReview.set(true);
    const existing = this.userReview();

    if (existing) {
      this.reviewService.update(existing.id, {
        rating: this.reviewRating,
        comment: this.reviewComment || undefined,
      }).subscribe({
        next: () => {
          this.submittingReview.set(false);
          this.toast.show(this.t.get('productDetail.toast.reviewUpdated'), 'success');
          this.loadReviews(p.id);
        },
        error: () => this.submittingReview.set(false),
      });
    } else {
      this.reviewService.create({
        product_id: p.id,
        rating: this.reviewRating,
        comment: this.reviewComment || undefined,
      }).subscribe({
        next: () => {
          this.submittingReview.set(false);
          this.toast.show(this.t.get('productDetail.toast.reviewAdded'), 'success');
          this.loadReviews(p.id);
        },
        error: () => this.submittingReview.set(false),
      });
    }
  }

  deleteReview(): void {
    const existing = this.userReview();
    const p = this.product();
    if (!existing || !p) return;

    this.submittingReview.set(true);
    this.reviewService.delete(existing.id).subscribe({
      next: () => {
        this.submittingReview.set(false);
        this.userReview.set(null);
        this.reviewRating = 0;
        this.reviewComment = '';
        this.toast.show(this.t.get('productDetail.toast.reviewDeleted'), 'success');
        this.loadReviews(p.id);
      },
      error: () => this.submittingReview.set(false),
    });
  }
}
