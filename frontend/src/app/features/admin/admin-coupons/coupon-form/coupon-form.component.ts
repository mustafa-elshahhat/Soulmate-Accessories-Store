import { Component, inject, signal, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../core/services/translation.service';
import { ToastService } from '../../../../shared/components/toast/toast.component';

@Component({
  selector: 'app-coupon-form',
  standalone: true,
  imports: [RouterLink, FormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 md:p-8 font-inter max-w-3xl mx-auto">
      <a routerLink="/admin/coupons" class="text-primary hover:underline text-sm font-medium mb-4 inline-block">
        &larr; {{ 'admin.coupons.form.backToCoupons' | t }}
      </a>
      <h1 class="font-playfair text-2xl md:text-3xl font-bold text-foreground mb-8">
        {{ isEdit ? ('admin.coupons.form.editTitle' | t) : ('admin.coupons.form.addTitle' | t) }}
      </h1>

      <div class="bg-background rounded-xl border border-border p-6 space-y-6">
        <div>
          <label class="block text-sm font-semibold mb-2">{{ 'admin.coupons.form.codeLabel' | t }}</label>
          <input [(ngModel)]="form.code" dir="ltr" class="w-full h-12 rounded-xl bg-background border border-border px-4 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase font-mono">
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-semibold mb-2">{{ 'admin.coupons.form.discountTypeLabel' | t }}</label>
            <select [(ngModel)]="form.discount_type" class="w-full h-12 rounded-xl bg-background border border-border px-4 focus:border-primary outline-none">
              <option value="percentage">{{ 'admin.coupons.form.percentage' | t }}</option>
              <option value="fixed">{{ 'admin.coupons.form.fixed' | t }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2">{{ 'admin.coupons.form.valueLabel' | t }}</label>
            <input type="number" [(ngModel)]="form.value" min="0" class="w-full h-12 rounded-xl bg-background border border-border px-4 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-semibold mb-2">{{ 'admin.coupons.form.maxUsesLabel' | t }}</label>
            <input type="number" [(ngModel)]="form.max_uses" min="0" class="w-full h-12 rounded-xl bg-background border border-border px-4 focus:border-primary outline-none">
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2">{{ 'admin.coupons.form.expirationLabel' | t }}</label>
            <input type="datetime-local" [(ngModel)]="form.expiration_date" class="w-full h-12 rounded-xl bg-background border border-border px-4 focus:border-primary outline-none">
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold mb-2">{{ 'admin.coupons.form.minOrderLabel' | t }}</label>
          <input type="number" [(ngModel)]="form.min_order_amount" min="0" class="w-full h-12 rounded-xl bg-background border border-border px-4 focus:border-primary outline-none">
        </div>

        <label class="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" [(ngModel)]="form.is_active" class="w-5 h-5 rounded border-border text-primary focus:ring-primary">
          <span class="font-semibold text-sm">{{ 'admin.coupons.form.isActive' | t }}</span>
        </label>

        <div class="flex gap-4 pt-4 border-t border-border">
          <button (click)="save()" [disabled]="saving()" class="bg-primary text-white h-12 px-8 rounded-xl font-semibold hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center gap-2">
            @if (saving()) {
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            }
            {{ isEdit ? ('admin.coupons.form.update' | t) : ('admin.coupons.form.save' | t) }}
          </button>
          <a routerLink="/admin/coupons" class="h-12 px-8 rounded-xl border border-border font-semibold flex items-center hover:bg-muted transition-colors">{{ 'common.cancel' | t }}</a>
        </div>
      </div>
    </div>
  `,
})
export class CouponFormComponent implements OnInit {
  private admin = inject(AdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);
  private t = inject(TranslationService);
  private cdr = inject(ChangeDetectorRef);

  isEdit = false;
  editId = '';
  saving = signal(false);

  form = {
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    max_uses: 0,
    expiration_date: '',
    is_active: true,
    min_order_amount: 0,
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editId = id;
      this.admin.getCoupon(id).subscribe({
        next: (c) => {
          this.form = {
            code: c.code,
            discount_type: c.discount_type,
            value: c.value,
            max_uses: c.max_uses,
            expiration_date: this.toLocalDatetime(c.expiration_date),
            is_active: c.is_active,
            min_order_amount: c.min_order_amount ?? 0,
          };
          this.cdr.markForCheck();
        },
      });
    }
  }

  save(): void {
    this.saving.set(true);
    const data: Record<string, unknown> = {
      code: this.form.code,
      discount_type: this.form.discount_type,
      value: this.form.value,
      max_uses: this.form.max_uses,
      expiration_date: this.form.expiration_date,
      is_active: this.form.is_active,
      min_order_amount: this.form.min_order_amount || null,
    };

    const obs = this.isEdit
      ? this.admin.updateCoupon(this.editId, data)
      : this.admin.createCoupon(data);

    obs.subscribe({
      next: () => {
        this.toast.show(this.t.get(this.isEdit ? 'admin.coupons.updateSuccess' : 'admin.coupons.addSuccess'), 'success');
        this.router.navigate(['/admin/coupons']);
      },
      error: () => {
        this.saving.set(false);
        this.toast.show(this.t.get('admin.coupons.genericError'), 'error');
      },
    });
  }

  private toLocalDatetime(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}
