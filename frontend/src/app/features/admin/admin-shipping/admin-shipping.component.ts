import { ChangeDetectionStrategy, Component, inject, signal, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { FormatPricePipe } from '../../../shared/pipes/format-price.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';
import { ToastService } from '../../../shared/components/toast/toast.component';

interface Governorate {
  id: string;
  name: string;
  name_en: string;
  shipping_cost: number;
  is_active: boolean;
  editing?: boolean;
  editCost?: number;
}

@Component({
  selector: 'app-admin-shipping',
  standalone: true,
  imports: [FormsModule, FormatPricePipe, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <h1 class="font-playfair text-3xl font-bold text-foreground mb-8">{{ 'admin.shipping.title' | t }}</h1>

      @if (loading()) {
        <div class="flex justify-center py-20">
          <div class="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else {
        <div class="hidden md:block bg-background rounded-xl shadow-sm border border-border overflow-hidden font-inter">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-muted/80 border-b border-border">
                <tr>
                  <th class="text-start px-6 py-4 font-semibold text-muted-foreground">{{ 'admin.shipping.governorate' | t }}</th>
                  <th class="text-start px-6 py-4 font-semibold text-muted-foreground">{{ 'admin.shipping.shippingCost' | t }}</th>
                  <th class="text-start px-6 py-4 font-semibold text-muted-foreground">{{ 'admin.shipping.status' | t }}</th>
                  <th class="text-start px-6 py-4 font-semibold text-muted-foreground">{{ 'admin.shipping.actions' | t }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (gov of governorates(); track gov.id) {
                  <tr class="hover:bg-muted/50 transition-colors duration-300">
                    <td class="px-6 py-4 font-semibold text-foreground text-base">{{ currentLang() === 'ar' ? gov.name : (gov.name_en || gov.name) }}</td>
                    <td class="px-6 py-4">
                      @if (gov.editing) {
                        <input type="number" [(ngModel)]="gov.editCost" min="0" step="5"
                               class="w-28 h-10 rounded-xl bg-background border border-border px-3 text-center focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" dir="ltr">
                      } @else {
                        <span class="font-playfair font-semibold text-primary text-lg">{{ gov.shipping_cost | formatPrice }}</span>
                      }
                    </td>
                    <td class="px-6 py-4">
                      @if (gov.is_active) {
                        <span class="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border bg-green-50 text-green-700 border-green-200">{{ 'admin.shipping.enabled' | t }}</span>
                      } @else {
                        <span class="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border bg-red-50 text-red-700 border-red-200">{{ 'admin.shipping.disabled' | t }}</span>
                      }
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        @if (gov.editing) {
                          <button (click)="save(gov)" [disabled]="saving()"
                                  class="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-all duration-300 shadow-sm disabled:opacity-50">
                            @if (saving()) {
                              <div class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            }
                            {{ 'admin.shipping.save' | t }}
                          </button>
                          <button (click)="cancelEdit(gov)"
                                  class="h-9 px-4 rounded-xl bg-background border border-border text-xs font-semibold hover:bg-muted transition-all duration-300">{{ 'admin.shipping.cancel' | t }}</button>
                        } @else {
                          <button (click)="startEdit(gov)"
                                  class="h-9 px-4 rounded-xl bg-background border border-border text-xs font-semibold hover:border-primary/50 hover:text-primary transition-all duration-300">{{ 'admin.shipping.edit' | t }}</button>
                          <button (click)="toggleActive(gov)" [disabled]="saving()"
                                  class="h-9 px-4 rounded-xl text-xs font-semibold transition-all duration-300 disabled:opacity-50"
                                  [class]="gov.is_active ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100' : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'">
                            {{ gov.is_active ? ('admin.shipping.deactivate' | t) : ('admin.shipping.activate' | t) }}
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="px-6 py-16 text-center text-muted-foreground font-medium text-lg">{{ 'admin.shipping.noGovernorates' | t }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <div class="md:hidden flex flex-col gap-4 font-inter">
          @if (governorates().length === 0) {
            <div class="bg-background rounded-xl border border-border p-8 text-center shadow-sm">
              <p class="text-muted-foreground font-medium text-lg">{{ 'admin.shipping.noGovernorates' | t }}</p>
            </div>
          } @else {
            @for (gov of governorates(); track gov.id) {
              <div class="bg-background rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-all duration-300">
                <div class="flex justify-between items-center pb-3 border-b border-border/50 mb-3">
                  <span class="font-semibold text-foreground text-base">{{ currentLang() === 'ar' ? gov.name : (gov.name_en || gov.name) }}</span>
                  @if (gov.is_active) {
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide border bg-green-50 text-green-700 border-green-200">{{ 'admin.shipping.enabled' | t }}</span>
                  } @else {
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide border bg-red-50 text-red-700 border-red-200">{{ 'admin.shipping.disabled' | t }}</span>
                  }
                </div>
                
                <div class="flex items-center justify-between mb-4">
                  <span class="text-sm text-muted-foreground">{{ 'admin.shipping.shippingCost' | t }}</span>
                  @if (gov.editing) {
                    <input type="number" [(ngModel)]="gov.editCost" min="0" step="5"
                           class="w-24 h-9 rounded-xl bg-background border border-border px-2 text-center text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" dir="ltr">
                  } @else {
                    <span class="font-playfair font-semibold text-primary text-lg">{{ gov.shipping_cost | formatPrice }}</span>
                  }
                </div>
                
                <div class="flex items-center gap-2 w-full">
                  @if (gov.editing) {
                    <button (click)="save(gov)" [disabled]="saving()"
                            class="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-all duration-300 shadow-sm disabled:opacity-50">
                      @if (saving()) {
                        <div class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      }
                      {{ 'admin.shipping.save' | t }}
                    </button>
                    <button (click)="cancelEdit(gov)"
                            class="flex-1 h-10 rounded-xl bg-background border border-border text-foreground text-xs font-semibold hover:bg-muted transition-all duration-300">{{ 'admin.shipping.cancel' | t }}</button>
                  } @else {
                    <button (click)="startEdit(gov)"
                            class="flex-1 h-10 rounded-xl bg-background border border-border text-foreground text-xs font-semibold hover:border-primary/50 hover:text-primary transition-all duration-300">{{ 'admin.shipping.edit' | t }}</button>
                    <button (click)="toggleActive(gov)" [disabled]="saving()"
                            class="flex-1 h-10 rounded-xl text-xs font-semibold transition-all duration-300 disabled:opacity-50"
                            [class]="gov.is_active ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100' : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'">
                      {{ gov.is_active ? ('admin.shipping.deactivate' | t) : ('admin.shipping.activate' | t) }}
                    </button>
                  }
                </div>
              </div>
            }
          }
        </div>
      }
    </div>
  `,
})
export class AdminShippingComponent implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private t = inject(TranslationService);
  readonly currentLang = this.t.currentLang;

  governorates = signal<Governorate[]>([]);
  loading = signal(true);
  saving = signal(false);

  ngOnInit(): void {
    this.loadGovernorates();
  }

  startEdit(gov: Governorate): void {
    gov.editing = true;
    gov.editCost = gov.shipping_cost;
  }

  cancelEdit(gov: Governorate): void {
    gov.editing = false;
  }

  save(gov: Governorate): void {
    this.saving.set(true);
    this.adminService.updateGovernorate(gov.id, { shipping_cost: gov.editCost!, is_active: gov.is_active }).subscribe({
      next: () => {
        gov.shipping_cost = gov.editCost!;
        gov.editing = false;
        this.saving.set(false);
        this.toast.show(this.t.get('admin.shipping.updateSuccess'), 'success');
        this.cdr.markForCheck();
      },
      error: () => {
        this.saving.set(false);
        this.toast.show(this.t.get('admin.shipping.updateError'), 'error');
      },
    });
  }

  toggleActive(gov: Governorate): void {
    this.saving.set(true);
    this.adminService.updateGovernorate(gov.id, { shipping_cost: gov.shipping_cost, is_active: !gov.is_active }).subscribe({
      next: () => {
        gov.is_active = !gov.is_active;
        this.saving.set(false);
        this.toast.show(gov.is_active ? this.t.get('admin.shipping.activateSuccess') : this.t.get('admin.shipping.deactivateSuccess'), 'success');
        this.cdr.markForCheck();
      },
      error: () => {
        this.saving.set(false);
        this.toast.show(this.t.get('admin.shipping.genericError'), 'error');
      },
    });
  }

  private loadGovernorates(): void {
    this.loading.set(true);
    this.adminService.getGovernorates().subscribe({
      next: (data) => {
        this.governorates.set(data);
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => this.loading.set(false),
    });
  }
}
