import { Component, inject, signal, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { Promotion } from '../../../core/models/coupon.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';
import { ToastService } from '../../../shared/components/toast/toast.component';
import { FormatPricePipe } from '../../../shared/pipes/format-price.pipe';

@Component({
  selector: 'app-admin-promotions',
  standalone: true,
  imports: [RouterLink, TranslatePipe, FormatPricePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 md:p-8 font-inter">
      <div class="flex items-center justify-between mb-8">
        <h1 class="font-playfair text-2xl md:text-3xl font-bold text-foreground">{{ 'admin.promotions.title' | t }}</h1>
        <a routerLink="/admin/promotions/new" class="bg-primary text-white h-11 px-6 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all duration-300 flex items-center">
          {{ 'admin.promotions.addPromotion' | t }}
        </a>
      </div>

      @if (promotions().length === 0) {
        <div class="text-center py-16 text-muted-foreground">{{ 'admin.promotions.noPromotions' | t }}</div>
      } @else {
        <div class="bg-background rounded-xl border border-border overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-muted/50">
                <tr>
                  <th class="text-start p-4 font-semibold">{{ 'admin.promotions.name' | t }}</th>
                  <th class="text-start p-4 font-semibold">{{ 'admin.promotions.discount' | t }}</th>
                  <th class="text-start p-4 font-semibold">{{ 'admin.promotions.period' | t }}</th>
                  <th class="text-start p-4 font-semibold">{{ 'admin.promotions.target' | t }}</th>
                  <th class="text-start p-4 font-semibold">{{ 'admin.promotions.status' | t }}</th>
                  <th class="p-4"></th>
                </tr>
              </thead>
              <tbody>
                @for (promo of promotions(); track promo.id) {
                  <tr class="border-t border-border hover:bg-muted/30 transition-colors">
                    <td class="p-4">
                      <p class="font-medium">{{ currentLang() === 'ar' ? promo.name : (promo.name_en || promo.name) }}</p>
                    </td>
                    <td class="p-4">
                      @if (promo.discount_type === 'percentage') {
                        <span class="text-green-600 font-semibold">{{ promo.value }}%</span>
                      } @else {
                        <span class="text-green-600 font-semibold">{{ promo.value | formatPrice }}</span>
                      }
                    </td>
                    <td class="p-4 text-muted-foreground text-xs">
                      {{ formatDate(promo.start_date) }} - {{ formatDate(promo.end_date) }}
                    </td>
                    <td class="p-4 text-muted-foreground">
                      {{ promo.product_name || promo.category || ('admin.promotions.allProducts' | t) }}
                    </td>
                    <td class="p-4">
                      @if (promo.is_active) {
                        <span class="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold">{{ 'admin.promotions.active' | t }}</span>
                      } @else {
                        <span class="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold">{{ 'admin.promotions.inactive' | t }}</span>
                      }
                    </td>
                    <td class="p-4">
                      <div class="flex gap-2">
                        <a [routerLink]="['/admin/promotions', promo.id, 'edit']" class="text-primary hover:underline text-sm font-medium">{{ 'admin.promotions.edit' | t }}</a>
                        <button (click)="deletePromotion(promo)" class="text-red-500 hover:underline text-sm font-medium">{{ 'admin.promotions.delete' | t }}</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminPromotionsComponent implements OnInit {
  private admin = inject(AdminService);
  private toast = inject(ToastService);
  private t = inject(TranslationService);
  private cdr = inject(ChangeDetectorRef);
  readonly currentLang = this.t.currentLang;

  promotions = signal<Promotion[]>([]);

  ngOnInit(): void {
    this.loadPromotions();
  }

  loadPromotions(): void {
    this.admin.getPromotions().subscribe({
      next: (data) => { this.promotions.set(data); this.cdr.markForCheck(); },
    });
  }

  deletePromotion(promo: Promotion): void {
    if (!confirm(this.t.get('admin.promotions.deleteConfirm'))) return;
    this.admin.deletePromotion(promo.id).subscribe({
      next: () => {
        this.promotions.set(this.promotions().filter(p => p.id !== promo.id));
        this.toast.show(this.t.get('admin.promotions.deleteSuccess'), 'success');
      },
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(this.t.currentLocale(), { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
