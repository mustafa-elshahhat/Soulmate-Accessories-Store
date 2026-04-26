import { Component, inject, signal, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { Coupon } from '../../../core/models/coupon.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';
import { ToastService } from '../../../shared/components/toast/toast.component';
import { FormatPricePipe } from '../../../shared/pipes/format-price.pipe';

@Component({
  selector: 'app-admin-coupons',
  standalone: true,
  imports: [RouterLink, TranslatePipe, FormatPricePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 md:p-8 font-inter">
      <div class="flex items-center justify-between mb-8">
        <h1 class="font-playfair text-2xl md:text-3xl font-bold text-foreground">{{ 'admin.coupons.title' | t }}</h1>
        <a routerLink="/admin/coupons/new" class="bg-primary text-white h-11 px-6 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all duration-300 flex items-center">
          {{ 'admin.coupons.addCoupon' | t }}
        </a>
      </div>

      @if (coupons().length === 0) {
        <div class="text-center py-16 text-muted-foreground">{{ 'admin.coupons.noCoupons' | t }}</div>
      } @else {
        <div class="bg-background rounded-xl border border-border overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-muted/50">
                <tr>
                  <th class="text-start p-4 font-semibold">{{ 'admin.coupons.code' | t }}</th>
                  <th class="text-start p-4 font-semibold">{{ 'admin.coupons.discount' | t }}</th>
                  <th class="text-start p-4 font-semibold">{{ 'admin.coupons.usage' | t }}</th>
                  <th class="text-start p-4 font-semibold">{{ 'admin.coupons.expiration' | t }}</th>
                  <th class="text-start p-4 font-semibold">{{ 'admin.coupons.status' | t }}</th>
                  <th class="p-4"></th>
                </tr>
              </thead>
              <tbody>
                @for (coupon of coupons(); track coupon.id) {
                  <tr class="border-t border-border hover:bg-muted/30 transition-colors">
                    <td class="p-4 font-mono font-bold">{{ coupon.code }}</td>
                    <td class="p-4">
                      @if (coupon.discount_type === 'percentage') {
                        <span class="text-green-600 font-semibold">{{ coupon.value }}%</span>
                      } @else {
                        <span class="text-green-600 font-semibold">{{ coupon.value | formatPrice }}</span>
                      }
                    </td>
                    <td class="p-4 text-muted-foreground">
                      {{ coupon.used_count }} / {{ coupon.max_uses === 0 ? ('admin.coupons.unlimited' | t) : coupon.max_uses }}
                    </td>
                    <td class="p-4 text-muted-foreground text-xs">{{ formatDate(coupon.expiration_date) }}</td>
                    <td class="p-4">
                      @if (coupon.is_active) {
                        <span class="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold">{{ 'admin.coupons.active' | t }}</span>
                      } @else {
                        <span class="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold">{{ 'admin.coupons.inactive' | t }}</span>
                      }
                    </td>
                    <td class="p-4">
                      <div class="flex gap-2">
                        <a [routerLink]="['/admin/coupons', coupon.id, 'edit']" class="text-primary hover:underline text-sm font-medium">{{ 'admin.coupons.edit' | t }}</a>
                        <button (click)="deleteCoupon(coupon)" class="text-red-500 hover:underline text-sm font-medium">{{ 'admin.coupons.delete' | t }}</button>
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
export class AdminCouponsComponent implements OnInit {
  private admin = inject(AdminService);
  private toast = inject(ToastService);
  private t = inject(TranslationService);
  private cdr = inject(ChangeDetectorRef);

  coupons = signal<Coupon[]>([]);

  ngOnInit(): void {
    this.admin.getCoupons().subscribe({
      next: (data) => { this.coupons.set(data); this.cdr.markForCheck(); },
    });
  }

  deleteCoupon(coupon: Coupon): void {
    if (!confirm(this.t.get('admin.coupons.deleteConfirm'))) return;
    this.admin.deleteCoupon(coupon.id).subscribe({
      next: () => {
        this.coupons.set(this.coupons().filter(c => c.id !== coupon.id));
        this.toast.show(this.t.get('admin.coupons.deleteSuccess'), 'success');
      },
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(this.t.currentLocale(), { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
