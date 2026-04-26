import { Component, inject, signal, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../core/services/translation.service';
import { ToastService } from '../../../../shared/components/toast/toast.component';

@Component({
  selector: 'app-promotion-form',
  standalone: true,
  imports: [RouterLink, FormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 md:p-8 font-inter max-w-3xl mx-auto">
      <a routerLink="/admin/promotions" class="text-primary hover:underline text-sm font-medium mb-4 inline-block">
        &larr; {{ 'admin.promotions.form.backToPromotions' | t }}
      </a>
      <h1 class="font-playfair text-2xl md:text-3xl font-bold text-foreground mb-8">
        {{ isEdit ? ('admin.promotions.form.editTitle' | t) : ('admin.promotions.form.addTitle' | t) }}
      </h1>

      <div class="bg-background rounded-xl border border-border p-6 space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-semibold mb-2">{{ 'admin.promotions.form.nameLabel' | t }}</label>
            <input [(ngModel)]="form.name" class="w-full h-12 rounded-xl bg-background border border-border px-4 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2">{{ 'admin.promotions.form.nameEnLabel' | t }}</label>
            <input [(ngModel)]="form.name_en" dir="ltr" class="w-full h-12 rounded-xl bg-background border border-border px-4 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-semibold mb-2">{{ 'admin.promotions.form.discountTypeLabel' | t }}</label>
            <select [(ngModel)]="form.discount_type" class="w-full h-12 rounded-xl bg-background border border-border px-4 focus:border-primary outline-none">
              <option value="percentage">{{ 'admin.promotions.form.percentage' | t }}</option>
              <option value="fixed">{{ 'admin.promotions.form.fixed' | t }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2">{{ 'admin.promotions.form.valueLabel' | t }}</label>
            <input type="number" [(ngModel)]="form.value" min="0" class="w-full h-12 rounded-xl bg-background border border-border px-4 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-semibold mb-2">{{ 'admin.promotions.form.startDateLabel' | t }}</label>
            <input type="datetime-local" [(ngModel)]="form.start_date" class="w-full h-12 rounded-xl bg-background border border-border px-4 focus:border-primary outline-none">
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2">{{ 'admin.promotions.form.endDateLabel' | t }}</label>
            <input type="datetime-local" [(ngModel)]="form.end_date" class="w-full h-12 rounded-xl bg-background border border-border px-4 focus:border-primary outline-none">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-semibold mb-2">{{ 'admin.promotions.form.categoryLabel' | t }}</label>
            <input [(ngModel)]="form.category" [placeholder]="'admin.promotions.form.selectCategory' | t" class="w-full h-12 rounded-xl bg-background border border-border px-4 focus:border-primary outline-none">
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2">{{ 'admin.promotions.form.productLabel' | t }}</label>
            <input [(ngModel)]="form.product_id" [placeholder]="'admin.promotions.form.selectProduct' | t" class="w-full h-12 rounded-xl bg-background border border-border px-4 focus:border-primary outline-none" dir="ltr">
          </div>
        </div>

        <label class="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" [(ngModel)]="form.is_active" class="w-5 h-5 rounded border-border text-primary focus:ring-primary">
          <span class="font-semibold text-sm">{{ 'admin.promotions.form.isActive' | t }}</span>
        </label>

        <div class="flex gap-4 pt-4 border-t border-border">
          <button (click)="save()" [disabled]="saving()" class="bg-primary text-white h-12 px-8 rounded-xl font-semibold hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center gap-2">
            @if (saving()) {
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            }
            {{ isEdit ? ('admin.promotions.form.update' | t) : ('admin.promotions.form.save' | t) }}
          </button>
          <a routerLink="/admin/promotions" class="h-12 px-8 rounded-xl border border-border font-semibold flex items-center hover:bg-muted transition-colors">{{ 'common.cancel' | t }}</a>
        </div>
      </div>
    </div>
  `,
})
export class PromotionFormComponent implements OnInit {
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
    name: '',
    name_en: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    start_date: '',
    end_date: '',
    is_active: true,
    product_id: '',
    category: '',
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editId = id;
      this.admin.getPromotion(id).subscribe({
        next: (p) => {
          this.form = {
            name: p.name,
            name_en: p.name_en,
            discount_type: p.discount_type,
            value: p.value,
            start_date: this.toLocalDatetime(p.start_date),
            end_date: this.toLocalDatetime(p.end_date),
            is_active: p.is_active,
            product_id: p.product_id || '',
            category: p.category || '',
          };
          this.cdr.markForCheck();
        },
      });
    }
  }

  save(): void {
    this.saving.set(true);
    const data: Record<string, unknown> = {
      name: this.form.name,
      name_en: this.form.name_en,
      discount_type: this.form.discount_type,
      value: this.form.value,
      start_date: this.form.start_date,
      end_date: this.form.end_date,
      is_active: this.form.is_active,
      product_id: this.form.product_id || null,
      category: this.form.category || null,
    };

    const obs = this.isEdit
      ? this.admin.updatePromotion(this.editId, data)
      : this.admin.createPromotion(data);

    obs.subscribe({
      next: () => {
        this.toast.show(this.t.get(this.isEdit ? 'admin.promotions.updateSuccess' : 'admin.promotions.addSuccess'), 'success');
        this.router.navigate(['/admin/promotions']);
      },
      error: () => {
        this.saving.set(false);
        this.toast.show(this.t.get('admin.promotions.genericError'), 'error');
      },
    });
  }

  private toLocalDatetime(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}
