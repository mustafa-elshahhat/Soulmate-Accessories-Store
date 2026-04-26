import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { FormatPricePipe } from '../../../shared/pipes/format-price.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

interface AdminProduct {
  id: string;
  name: string;
  name_en: string;
  slug: string;
  description: string;
  description_en: string;
  price: number;
  image_url: string;
  category: string;
  is_builder_item: boolean;
  gender: string;
  is_active: boolean;
  is_standalone: boolean;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [RouterLink, FormatPricePipe, TranslatePipe, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <div class="flex items-center justify-between mb-8">
        <h1 class="font-playfair text-3xl font-bold text-foreground">{{ 'admin.products.title' | t }}</h1>
        <a routerLink="/admin/products/new" class="inline-flex items-center justify-center bg-primary text-white h-12 px-6 rounded-xl font-medium tracking-wide shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:bg-primary-dark transition-all duration-300 font-inter">+ {{ 'admin.products.addProduct' | t }}</a>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row flex-wrap gap-4 mb-8 font-inter">
        <button (click)="filter('')" class="h-14 sm:h-12 w-full sm:w-auto px-6 rounded-xl text-sm font-semibold transition-all duration-300"
                [class.bg-primary]="activeFilter() === ''" [class.text-white]="activeFilter() === ''" [class.shadow-md]="activeFilter() === ''"
                [class.bg-background]="activeFilter() !== ''" [class.border]="activeFilter() !== ''" [class.border-border]="activeFilter() !== ''" [class.text-muted-foreground]="activeFilter() !== ''" [class.hover:border-primary/50]="activeFilter() !== ''">{{ 'admin.products.filterAll' | t }}</button>
        <button (click)="filter('active')" class="h-14 sm:h-12 w-full sm:w-auto px-6 rounded-xl text-sm font-semibold transition-all duration-300"
                [class.bg-primary]="activeFilter() === 'active'" [class.text-white]="activeFilter() === 'active'" [class.shadow-md]="activeFilter() === 'active'"
                [class.bg-background]="activeFilter() !== 'active'" [class.border]="activeFilter() !== 'active'" [class.border-border]="activeFilter() !== 'active'" [class.text-muted-foreground]="activeFilter() !== 'active'" [class.hover:border-primary/50]="activeFilter() !== 'active'">{{ 'admin.products.filterActive' | t }}</button>
        <button (click)="filter('inactive')" class="h-14 sm:h-12 w-full sm:w-auto px-6 rounded-xl text-sm font-semibold transition-all duration-300"
                [class.bg-primary]="activeFilter() === 'inactive'" [class.text-white]="activeFilter() === 'inactive'" [class.shadow-md]="activeFilter() === 'inactive'"
                [class.bg-background]="activeFilter() !== 'inactive'" [class.border]="activeFilter() !== 'inactive'" [class.border-border]="activeFilter() !== 'inactive'" [class.text-muted-foreground]="activeFilter() !== 'inactive'" [class.hover:border-primary/50]="activeFilter() !== 'inactive'">{{ 'admin.products.filterInactive' | t }}</button>
      </div>

      <!-- Desktop Table -->
      <div class="hidden md:block bg-background rounded-xl shadow-sm border border-border overflow-hidden font-inter">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-muted/80 border-b border-border">
              <tr>
                <th class="text-start px-6 py-4 font-semibold text-muted-foreground">{{ 'admin.products.image' | t }}</th>
                <th class="text-start px-6 py-4 font-semibold text-muted-foreground">{{ 'admin.products.name' | t }}</th>
                <th class="text-start px-6 py-4 font-semibold text-muted-foreground">{{ 'admin.products.price' | t }}</th>
                <th class="text-start px-6 py-4 font-semibold text-muted-foreground">{{ 'admin.products.type' | t }}</th>
                <th class="text-start px-6 py-4 font-semibold text-muted-foreground">{{ 'admin.products.status' | t }}</th>
                <th class="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              @for (p of filteredProducts(); track p.id) {
                <tr class="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td class="px-6 py-4">
                    <img [ngSrc]="p.image_url" [alt]="currentLang() === 'ar' ? p.name : (p.name_en || p.name)" class="w-14 h-14 rounded-xl object-cover shadow-sm bg-background border border-border" width="56" height="56">
                  </td>
                  <td class="px-6 py-4">
                    <div class="font-semibold text-foreground text-base">{{ currentLang() === 'ar' ? p.name : (p.name_en || p.name) }}</div>
                    <div class="text-xs text-muted-foreground mt-0.5">{{ p.category }} - {{ p.gender }}</div>
                  </td>
                  <td class="px-6 py-4 font-playfair font-bold text-primary text-base">{{ p.price | formatPrice }}</td>
                  <td class="px-6 py-4 text-sm font-medium text-foreground">{{ (p.is_standalone ? 'admin.products.standalone' : 'admin.products.boxComponent') | t }}</td>
                  <td class="px-6 py-4">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold tracking-wide border"
                          [class.bg-green-50]="p.is_active" [class.text-green-700]="p.is_active" [class.border-green-200]="p.is_active"
                          [class.bg-red-50]="!p.is_active" [class.text-red-700]="!p.is_active" [class.border-red-200]="!p.is_active">
                      {{ (p.is_active ? 'admin.products.active' : 'admin.products.inactive') | t }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-end">
                    <a [routerLink]="['/admin/products', p.id, 'edit']" class="inline-flex items-center justify-center bg-muted text-foreground hover:bg-primary hover:text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors duration-300">{{ 'admin.products.edit' | t }}</a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile Cards -->
      <div class="md:hidden flex flex-col gap-4 font-inter">
        @for (p of filteredProducts(); track p.id) {
          <div class="bg-background rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-all duration-300">
            <div class="flex items-start gap-4 mb-4">
              <img [ngSrc]="p.image_url" [alt]="currentLang() === 'ar' ? p.name : (p.name_en || p.name)" class="w-16 h-16 rounded-xl object-cover shadow-sm bg-background border border-border shrink-0" width="64" height="64">
              <div class="flex-1 min-w-0">
                <div class="font-semibold text-foreground text-base truncate">{{ currentLang() === 'ar' ? p.name : (p.name_en || p.name) }}</div>
                <div class="text-xs text-muted-foreground mt-0.5">{{ p.category }} - {{ p.gender }}</div>
                <div class="text-xs text-muted-foreground mt-1">{{ (p.is_standalone ? 'admin.products.standalone' : 'admin.products.boxComponent') | t }}</div>
              </div>
            </div>
            
            <div class="flex items-center justify-between pt-4 border-t border-border/50">
              <div class="font-playfair font-bold text-primary text-lg">{{ p.price | formatPrice }}</div>
              <div class="flex items-center gap-2 sm:gap-3">
                <span class="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide border"
                      [class.bg-green-50]="p.is_active" [class.text-green-700]="p.is_active" [class.border-green-200]="p.is_active"
                      [class.bg-red-50]="!p.is_active" [class.text-red-700]="!p.is_active" [class.border-red-200]="!p.is_active">
                  {{ (p.is_active ? 'admin.products.active' : 'admin.products.inactive') | t }}
                </span>
                <a [routerLink]="['/admin/products', p.id, 'edit']" class="inline-flex items-center justify-center bg-muted text-foreground hover:bg-primary hover:text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors duration-300">{{ 'admin.products.edit' | t }}</a>
              </div>
            </div>
          </div>
        }
      </div>

      @if (hasMore()) {
        <div class="flex justify-center mt-10">
          <button (click)="loadMore()" class="inline-flex items-center justify-center h-14 px-10 border border-border text-foreground rounded-xl font-inter hover:bg-muted hover:border-primary/50 hover:shadow-sm transition-all duration-300 ease-in-out font-medium tracking-wide">{{ 'admin.products.loadMore' | t }}</button>
        </div>
      }
    </div>
  `,
})
export class AdminProductsComponent implements OnInit {
  private adminService = inject(AdminService);
  private t = inject(TranslationService);
  readonly currentLang = this.t.currentLang;

  products = signal<AdminProduct[]>([]);
  filteredProducts = signal<AdminProduct[]>([]);
  activeFilter = signal('');
  page = 1;
  hasMore = signal(false);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.adminService.getProducts(this.page, 50).subscribe({
      next: (res) => {
        const all = this.page === 1 ? res.data : [...this.products(), ...res.data];
        this.products.set(all);
        this.hasMore.set(res.meta.page < res.meta.total_pages);
        this.applyFilter();
      },
    });
  }

  loadMore(): void {
    this.page++;
    this.loadProducts();
  }

  filter(f: string): void {
    this.activeFilter.set(f);
    this.applyFilter();
  }

  private applyFilter(): void {
    const f = this.activeFilter();
    if (f === 'active') this.filteredProducts.set(this.products().filter(p => p.is_active));
    else if (f === 'inactive') this.filteredProducts.set(this.products().filter(p => !p.is_active));
    else this.filteredProducts.set(this.products());
  }
}
