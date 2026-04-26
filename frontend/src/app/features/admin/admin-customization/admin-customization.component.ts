import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { FormatPricePipe } from '../../../shared/pipes/format-price.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';
import { ToastService } from '../../../shared/components/toast/toast.component';

interface CustomizationPrice {
  id: string;
  category: string;
  price: number;
  editing?: boolean;
  editPrice?: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  watch: 'admin.categories.watch',
  wallet: 'admin.categories.wallet',
  mug: 'admin.categories.mug',
  necklace: 'admin.categories.necklace',
  ring: 'admin.categories.ring',
};

@Component({
  selector: 'app-admin-customization',
  standalone: true,
  imports: [FormsModule, FormatPricePipe, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <h1 class="font-playfair text-3xl font-bold text-foreground mb-8">{{ 'admin.customization.title' | t }}</h1>

      @if (loading()) {
        <div class="flex justify-center py-20">
          <div class="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else {
        <!-- Existing prices table -->
        <div class="hidden md:block bg-background rounded-xl shadow-sm border border-border overflow-hidden font-inter mb-8">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-muted/80 border-b border-border">
                <tr>
                  <th class="text-start px-6 py-4 font-semibold text-muted-foreground">{{ 'admin.customization.category' | t }}</th>
                  <th class="text-start px-6 py-4 font-semibold text-muted-foreground">{{ 'admin.customization.price' | t }}</th>
                  <th class="text-start px-6 py-4 font-semibold text-muted-foreground">{{ 'admin.customization.actions' | t }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (item of prices(); track item.id) {
                  <tr class="hover:bg-muted/50 transition-colors duration-300">
                    <td class="px-6 py-4 font-semibold text-foreground text-base">{{ getCategoryLabel(item.category) }}</td>
                    <td class="px-6 py-4">
                      @if (item.editing) {
                        <input type="number" [(ngModel)]="item.editPrice" min="0" step="5"
                               class="w-28 h-10 rounded-xl bg-background border border-border px-3 text-center focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" dir="ltr">
                      } @else {
                        <span class="font-playfair font-semibold text-primary text-lg">{{ item.price | formatPrice }}</span>
                      }
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        @if (item.editing) {
                          <button (click)="saveEdit(item)" [disabled]="saving()"
                                  class="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-all duration-300 shadow-sm disabled:opacity-50">
                            @if (saving()) {
                              <div class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            }
                            {{ 'admin.customization.save' | t }}
                          </button>
                          <button (click)="cancelEdit(item)"
                                  class="h-9 px-4 rounded-xl bg-background border border-border text-xs font-semibold hover:bg-muted transition-all duration-300">{{ 'admin.customization.cancel' | t }}</button>
                        } @else {
                          <button (click)="startEdit(item)"
                                  class="h-9 px-4 rounded-xl bg-background border border-border text-xs font-semibold hover:border-primary/50 hover:text-primary transition-all duration-300">{{ 'admin.customization.edit' | t }}</button>
                          <button (click)="deletePrice(item)" [disabled]="saving()"
                                  class="h-9 px-4 rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 text-xs font-semibold transition-all duration-300 disabled:opacity-50">{{ 'admin.customization.delete' | t }}</button>
                        }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="3" class="px-6 py-16 text-center text-muted-foreground font-medium text-lg">{{ 'admin.customization.noPrices' | t }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <div class="md:hidden flex flex-col gap-4 font-inter mb-8">
          @if (prices().length === 0) {
            <div class="bg-background rounded-xl border border-border p-8 text-center shadow-sm">
              <p class="text-muted-foreground font-medium text-lg">{{ 'admin.customization.noPrices' | t }}</p>
            </div>
          } @else {
            @for (item of prices(); track item.id) {
              <div class="bg-background rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-all duration-300">
                <div class="flex justify-between items-center pb-3 border-b border-border/50 mb-3">
                  <span class="font-semibold text-foreground text-base">{{ getCategoryLabel(item.category) }}</span>
                </div>
                <div class="flex items-center justify-between mb-4">
                  <span class="text-sm text-muted-foreground">{{ 'admin.customization.price' | t }}</span>
                  @if (item.editing) {
                    <input type="number" [(ngModel)]="item.editPrice" min="0" step="5"
                           class="w-24 h-9 rounded-xl bg-background border border-border px-2 text-center text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" dir="ltr">
                  } @else {
                    <span class="font-playfair font-semibold text-primary text-lg">{{ item.price | formatPrice }}</span>
                  }
                </div>
                <div class="flex items-center gap-2 w-full">
                  @if (item.editing) {
                    <button (click)="saveEdit(item)" [disabled]="saving()"
                            class="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-all duration-300 shadow-sm disabled:opacity-50">
                      @if (saving()) {
                        <div class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      }
                      {{ 'admin.customization.save' | t }}
                    </button>
                    <button (click)="cancelEdit(item)"
                            class="flex-1 h-10 rounded-xl bg-background border border-border text-foreground text-xs font-semibold hover:bg-muted transition-all duration-300">{{ 'admin.customization.cancel' | t }}</button>
                  } @else {
                    <button (click)="startEdit(item)"
                            class="flex-1 h-10 rounded-xl bg-background border border-border text-foreground text-xs font-semibold hover:border-primary/50 hover:text-primary transition-all duration-300">{{ 'admin.customization.edit' | t }}</button>
                    <button (click)="deletePrice(item)" [disabled]="saving()"
                            class="flex-1 h-10 rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 text-xs font-semibold transition-all duration-300 disabled:opacity-50">{{ 'admin.customization.delete' | t }}</button>
                  }
                </div>
              </div>
            }
          }
        </div>

        <!-- Add new price -->
        @if (availableCategories().length > 0) {
          <div class="bg-background rounded-xl shadow-sm border border-border p-6 font-inter max-w-xl">
            <h2 class="font-playfair text-lg font-bold text-foreground mb-4">{{ 'admin.customization.addPriceTitle' | t }}</h2>
            <div class="flex flex-col sm:flex-row items-end gap-4">
              <div class="w-full sm:w-auto flex-1">
                <label class="block text-sm font-semibold text-foreground mb-2">{{ 'admin.customization.category' | t }}</label>
                <select [(ngModel)]="newCategory" class="w-full h-12 rounded-xl bg-background border border-border px-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                  <option value="">{{ 'admin.customization.selectCategory' | t }}</option>
                  @for (cat of availableCategories(); track cat) {
                    <option [value]="cat">{{ getCategoryLabel(cat) }}</option>
                  }
                </select>
              </div>
              <div class="w-full sm:w-auto">
                <label class="block text-sm font-semibold text-foreground mb-2">{{ 'admin.customization.priceLabel' | t }}</label>
                <input type="number" [(ngModel)]="newPrice" min="0" step="5"
                       class="w-full sm:w-28 h-12 rounded-xl bg-background border border-border px-3 text-center focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" dir="ltr">
              </div>
              <button (click)="addPrice()" [disabled]="saving() || !newCategory || newPrice <= 0"
                      class="w-full sm:w-auto h-12 px-6 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all duration-300 shadow-sm disabled:opacity-50 disabled:pointer-events-none">
                {{ 'admin.customization.add' | t }}
              </button>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class AdminCustomizationComponent implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private t = inject(TranslationService);

  prices = signal<CustomizationPrice[]>([]);
  loading = signal(true);
  saving = signal(false);

  newCategory = '';
  newPrice = 0;

  private allCategories = ['watch', 'wallet', 'mug', 'necklace', 'ring'];

  availableCategories = signal<string[]>([]);

  ngOnInit(): void {
    this.loadPrices();
  }

  getCategoryLabel(category: string): string {
    const key = CATEGORY_LABELS[category];
    return key ? this.t.get(key) : category;
  }

  startEdit(item: CustomizationPrice): void {
    item.editing = true;
    item.editPrice = item.price;
  }

  cancelEdit(item: CustomizationPrice): void {
    item.editing = false;
  }

  saveEdit(item: CustomizationPrice): void {
    if (!item.editPrice || item.editPrice <= 0) return;
    this.saving.set(true);
    this.adminService.upsertCustomizationPrice({ category: item.category, price: item.editPrice }).subscribe({
      next: () => {
        item.price = item.editPrice!;
        item.editing = false;
        this.saving.set(false);
        this.toast.show(this.t.get('admin.customization.updateSuccess'), 'success');
        this.cdr.markForCheck();
      },
      error: () => {
        this.saving.set(false);
        this.toast.show(this.t.get('admin.customization.updateError'), 'error');
        this.cdr.markForCheck();
      },
    });
  }

  deletePrice(item: CustomizationPrice): void {
    this.saving.set(true);
    this.adminService.deleteCustomizationPrice(item.id).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.show(this.t.get('admin.customization.deleteSuccess'), 'success');
        this.loadPrices();
      },
      error: () => {
        this.saving.set(false);
        this.toast.show(this.t.get('admin.customization.deleteError'), 'error');
        this.cdr.markForCheck();
      },
    });
  }

  addPrice(): void {
    if (!this.newCategory || this.newPrice <= 0) return;
    this.saving.set(true);
    this.adminService.upsertCustomizationPrice({ category: this.newCategory, price: this.newPrice }).subscribe({
      next: () => {
        this.saving.set(false);
        this.newCategory = '';
        this.newPrice = 0;
        this.toast.show(this.t.get('admin.customization.addSuccess'), 'success');
        this.loadPrices();
      },
      error: () => {
        this.saving.set(false);
        this.toast.show(this.t.get('admin.customization.addError'), 'error');
        this.cdr.markForCheck();
      },
    });
  }

  private loadPrices(): void {
    this.loading.set(true);
    this.adminService.getCustomizationPrices().subscribe({
      next: (data) => {
        this.prices.set(data);
        const usedCategories = new Set(data.map(d => d.category));
        this.availableCategories.set(this.allCategories.filter(c => !usedCategories.has(c)));
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading.set(false);
        this.cdr.markForCheck();
      },
    });
  }
}
