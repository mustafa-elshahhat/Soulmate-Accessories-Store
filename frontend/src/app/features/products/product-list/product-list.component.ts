import { Component, inject, signal, OnInit, PLATFORM_ID, HostListener, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { SeoService } from '../../../core/services/seo.service';
import { StructuredDataService } from '../../../core/services/structured-data.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

interface DropdownOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [FormsModule, ProductCardComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Page Header Banner -->
    <div class="relative bg-gradient-to-r from-[#121212] via-[#1a1a1a] to-[#121212] py-16 md:py-20 overflow-hidden mb-8 md:mb-12 border-b border-border/10">
      <div class="absolute inset-0 bg-[url('/assets/images/grid-pattern.svg')] opacity-[0.03]"></div>
      <div class="absolute top-1/2 -translate-y-1/2 right-[20%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div class="absolute top-1/2 -translate-y-1/2 left-[20%] w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div class="max-w-[1280px] mx-auto px-4 relative z-10 text-center">
        <span class="inline-block text-primary text-[11px] tracking-[0.2em] font-semibold uppercase mb-4 font-inter">Soulmate Store</span>
        <h1 class="font-playfair text-4xl md:text-5xl font-bold text-white tracking-wide">{{ 'products.title' | t }}</h1>
      </div>
    </div>

    <div class="max-w-[1280px] mx-auto px-4 pb-16 md:pb-24">

      <!-- Filters -->
      <div class="flex flex-col gap-3 md:gap-4 mb-12 bg-background p-3 md:p-4 rounded-xl shadow-sm border border-border font-inter">
        <div class="relative">
          <div class="absolute inset-y-0 end-4 flex items-center pointer-events-none text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            [(ngModel)]="search"
            (keyup.enter)="loadProducts()"
            [placeholder]="'products.searchPlaceholder' | t"
            class="w-full h-12 md:h-14 bg-white/50 border border-border/50 rounded-xl ps-12 pe-4 text-sm md:text-base text-foreground focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 shadow-sm block backdrop-blur-sm"
          />
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap gap-2 md:gap-3 mt-4">
          <!-- Gender dropdown -->
          <div class="relative min-w-[140px] md:min-w-[180px] flex-1">
            <button
              (click)="toggleDropdown('gender')"
              class="w-full h-10 md:h-12 bg-white/50 border border-border/50 rounded-xl px-3 md:px-4 text-xs md:text-sm text-foreground outline-none transition-all duration-300 shadow-sm cursor-pointer flex items-center justify-between gap-2 hover:bg-white backdrop-blur-sm"
              [class.bg-white]="openDropdown === 'gender'"
              [class.ring-4]="openDropdown === 'gender'"
              [class.ring-primary/10]="openDropdown === 'gender'"
              [class.border-primary]="openDropdown === 'gender'"
            >
              <span class="truncate text-sm" [class.text-foreground]="gender" [class.text-muted-foreground]="!gender">
                {{ getGenderLabel() }}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0"
                [class.rotate-180]="openDropdown === 'gender'"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            @if (openDropdown === 'gender') {
              <div class="absolute z-50 top-full mt-1 inset-x-0 bg-background rounded-xl shadow-lg border border-border overflow-hidden animate-[slideDown_150ms_ease-out]">
                @for (opt of genderOptions; track opt.value) {
                  <button
                    (click)="selectGender(opt.value)"
                    class="w-full px-4 py-3 text-sm text-start transition-colors duration-150 flex items-center justify-between"
                    [class.bg-primary/5]="gender === opt.value"
                    [class.text-primary]="gender === opt.value"
                    [class.font-medium]="gender === opt.value"
                    [class.hover:bg-muted]="gender !== opt.value"
                  >
                    {{ opt.label | t }}
                    @if (gender === opt.value) {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    }
                  </button>
                }
              </div>
            }
          </div>

          <!-- Category dropdown -->
          <div class="relative min-w-[140px] md:min-w-[180px] flex-1">
            <button
              (click)="toggleDropdown('category')"
              class="w-full h-10 md:h-12 bg-white/50 border border-border/50 rounded-xl px-3 md:px-4 text-xs md:text-sm text-foreground outline-none transition-all duration-300 shadow-sm cursor-pointer flex items-center justify-between gap-2 hover:bg-white backdrop-blur-sm"
              [class.bg-white]="openDropdown === 'category'"
              [class.ring-4]="openDropdown === 'category'"
              [class.ring-primary/10]="openDropdown === 'category'"
              [class.border-primary]="openDropdown === 'category'"
            >
              <span class="truncate text-sm" [class.text-foreground]="category" [class.text-muted-foreground]="!category">
                {{ getCategoryLabel() }}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0"
                [class.rotate-180]="openDropdown === 'category'"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            @if (openDropdown === 'category') {
              <div class="absolute z-50 top-full mt-1 inset-x-0 bg-background rounded-xl shadow-lg border border-border overflow-hidden animate-[slideDown_150ms_ease-out]">
                @for (opt of categoryOptions; track opt.value) {
                  <button
                    (click)="selectCategory(opt.value)"
                    class="w-full px-4 py-3 text-sm text-start transition-colors duration-150 flex items-center justify-between"
                    [class.bg-primary/5]="category === opt.value"
                    [class.text-primary]="category === opt.value"
                    [class.font-medium]="category === opt.value"
                    [class.hover:bg-muted]="category !== opt.value"
                  >
                    {{ opt.label | t }}
                    @if (category === opt.value) {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    }
                  </button>
                }
              </div>
            }
          </div>

          <!-- Sort dropdown -->
          <div class="relative min-w-[140px] md:min-w-[180px] flex-1">
            <button
              (click)="toggleDropdown('sort')"
              class="w-full h-10 md:h-12 bg-white/50 border border-border/50 rounded-xl px-3 md:px-4 text-xs md:text-sm text-foreground outline-none transition-all duration-300 shadow-sm cursor-pointer flex items-center justify-between gap-2 hover:bg-white backdrop-blur-sm"
              [class.bg-white]="openDropdown === 'sort'"
              [class.ring-4]="openDropdown === 'sort'"
              [class.ring-primary/10]="openDropdown === 'sort'"
              [class.border-primary]="openDropdown === 'sort'"
            >
              <span class="truncate text-sm text-foreground">
                {{ getSortLabel() }}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0"
                [class.rotate-180]="openDropdown === 'sort'"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            @if (openDropdown === 'sort') {
              <div class="absolute z-50 top-full mt-1 inset-x-0 bg-background rounded-xl shadow-lg border border-border overflow-hidden animate-[slideDown_150ms_ease-out]">
                @for (opt of sortOptions; track opt.value) {
                  <button
                    (click)="selectSort(opt.value)"
                    class="w-full px-4 py-3 text-sm text-start transition-colors duration-150 flex items-center justify-between"
                    [class.bg-primary/5]="sort === opt.value"
                    [class.text-primary]="sort === opt.value"
                    [class.font-medium]="sort === opt.value"
                    [class.hover:bg-muted]="sort !== opt.value"
                  >
                    {{ opt.label | t }}
                    @if (sort === opt.value) {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    }
                  </button>
                }
              </div>
            }
          </div>

          <!-- Clear filters button -->
          @if (gender || category) {
            <button
              (click)="clearFilters()"
              class="h-10 md:h-12 px-4 md:px-5 bg-muted/50 border border-border/50 rounded-xl text-xs md:text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 flex items-center gap-2 flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              {{ 'products.clearFilters' | t }}
            </button>
          }
        </div>

        <!-- Active Filter Tags -->
        @if (hasActiveFilters()) {
          <div class="flex flex-wrap gap-2 mt-3">
            @if (gender) {
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium">
                {{ getGenderLabel() }}
                <button (click)="selectGender('')" class="hover:text-primary/70 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            }
            @if (category) {
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium">
                {{ getCategoryLabel() }}
                <button (click)="selectCategory('')" class="hover:text-primary/70 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            }
          </div>
        }
      </div>

      @if (loading()) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <div class="bg-background/50 rounded-xl border border-border overflow-hidden flex flex-col h-full font-inter animate-pulse">
              <div class="aspect-square bg-muted w-full"></div>
              <div class="p-5 md:p-6 flex flex-col flex-grow">
                <div class="h-6 bg-muted rounded-md w-3/4 mb-3"></div>
                <div class="h-4 bg-muted rounded-md w-full mb-2"></div>
                <div class="h-4 bg-muted rounded-md w-5/6 mb-4"></div>
                <div class="h-4 bg-muted rounded-md w-1/3 mb-auto"></div>
                <div class="mt-8">
                  <div class="h-3 bg-muted rounded-md w-1/4 mb-2"></div>
                  <div class="h-6 bg-muted rounded-md w-1/3 mb-5"></div>
                  <div class="h-12 bg-muted rounded-xl w-full"></div>
                </div>
              </div>
            </div>
          }
        </div>
      } @else if (loadError()) {
        <div class="text-center py-20">
          <p class="text-muted-foreground text-lg">{{ loadError() }}</p>
        </div>
      } @else if (products().length === 0) {
        <div class="text-center py-20">
          <p class="text-muted-foreground text-lg">{{ 'products.empty' | t }}</p>
        </div>
      } @else {
        <!-- Products Grid -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          @for (product of products(); track product.id) {
            <app-product-card [product]="product"></app-product-card>
          }
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="flex justify-center gap-2 mt-10">
            @for (p of pages(); track p) {
              <button
                (click)="goToPage(p)"
                [class.bg-primary]="p === page"
                [class.text-white]="p === page"
                [class.bg-muted]="p !== page"
                class="w-10 h-10 rounded-xl text-sm font-medium transition-colors hover:bg-primary/80 hover:text-white"
              >
                {{ p }}
              </button>
            }
          </div>
        }
      }
    </div>

  `,
  styles: [`
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private platformId = inject(PLATFORM_ID);
  private seoService = inject(SeoService);
  private structuredData = inject(StructuredDataService);
  private t = inject(TranslationService);
  private destroyRef = inject(DestroyRef);

  products = signal<Product[]>([]);
  loading = signal(true);
  loadError = signal('');
  page = 1;
  totalPages = signal(0);
  pages = signal<number[]>([]);
  search = '';
  gender = '';
  category = '';
  sort = 'newest';
  openDropdown: 'gender' | 'sort' | 'category' | null = null;

  readonly genderOptions: DropdownOption[] = [
    { value: '', label: 'products.filter.genderAll' },
    { value: 'male', label: 'products.filter.genderMale' },
    { value: 'female', label: 'products.filter.genderFemale' },
  ];

  readonly categoryOptions: DropdownOption[] = [
    { value: '', label: 'products.filter.categoryAll' },
    { value: 'watch', label: 'products.filter.categoryWatch' },
    { value: 'wallet', label: 'products.filter.categoryWallet' },
    { value: 'mug', label: 'products.filter.categoryMug' },
    { value: 'necklace', label: 'products.filter.categoryNecklace' },
    { value: 'ring', label: 'products.filter.categoryRing' },
  ];

  readonly sortOptions: DropdownOption[] = [
    { value: 'newest', label: 'products.filter.sortNewest' },
    { value: 'price', label: 'products.filter.sortPriceAsc' },
    { value: 'price-desc', label: 'products.filter.sortPriceDesc' },
    { value: 'rating', label: 'products.filter.sortRating' },
    { value: 'name', label: 'products.filter.sortName' },
  ];

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.openDropdown = null;
    }
  }

  ngOnInit(): void {
    this.seoService.updatePage({
      title: this.t.get('products.seo.title'),
      description: this.t.get('products.seo.description'),
      url: '/products',
    });
    this.structuredData.setBreadcrumbSchema([
      { name: this.t.get('productDetail.breadcrumbHome'), url: '/' },
      { name: this.t.get('products.title'), url: '/products' },
    ]);
    this.loadProducts();
  }

  toggleDropdown(which: 'gender' | 'sort' | 'category'): void {
    this.openDropdown = this.openDropdown === which ? null : which;
  }

  getGenderLabel(): string {
    const key = this.genderOptions.find(o => o.value === this.gender)?.label ?? 'products.filter.genderAll';
    return this.t.get(key);
  }

  getCategoryLabel(): string {
    const key = this.categoryOptions.find(o => o.value === this.category)?.label ?? 'products.filter.categoryAll';
    return this.t.get(key);
  }

  getSortLabel(): string {
    const key = this.sortOptions.find(o => o.value === this.sort)?.label ?? 'products.filter.sortNewest';
    return this.t.get(key);
  }

  selectGender(value: string): void {
    this.gender = value;
    this.openDropdown = null;
    this.page = 1;
    this.loadProducts();
  }

  selectCategory(value: string): void {
    this.category = value;
    this.openDropdown = null;
    this.page = 1;
    this.loadProducts();
  }

  selectSort(value: string): void {
    this.sort = value;
    this.openDropdown = null;
    this.page = 1;
    this.loadProducts();
  }

  clearFilters(): void {
    this.gender = '';
    this.category = '';
    this.openDropdown = null;
    this.page = 1;
    this.loadProducts();
  }

  hasActiveFilters(): boolean {
    return !!(this.gender || this.category);
  }

  loadProducts(): void {
    this.loading.set(true);

    const sortField = this.sort === 'price-desc' ? 'price' : this.sort;
    const sortOrder = this.sort === 'price-desc' ? 'desc' : 'asc';

    this.productService
      .getAll({
        page: this.page,
        limit: 20,
        search: this.search || undefined,
        sort: sortField,
        order: sortOrder,
        gender: this.gender || undefined,
        category: this.category || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.products.set(res.data);
          this.totalPages.set(res.meta.total_pages);
          this.pages.set(Array.from({ length: res.meta.total_pages }, (_, i) => i + 1));
          this.loadError.set('');
          this.loading.set(false);
        },
        error: (error) => {
          this.loadError.set(this.productErrorMessage(error));
          this.loading.set(false);
        },
      });
  }

  private productErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) return this.t.get('errors.noConnection');
      if (error.status === 200) return this.t.get('errors.invalidResponse');
      if (error.status >= 500) return this.t.get('errors.serverError');
      return error.error?.message || this.t.get('errors.unexpected');
    }

    return this.t.get('errors.unexpected');
  }

  goToPage(p: number): void {
    this.page = p;
    this.loadProducts();
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
