import { Component, inject, signal, OnInit, computed, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BuilderService } from '../../../core/services/builder.service';
import { BuilderStateService } from '../../../core/services/builder-state.service';
import { NgOptimizedImage } from '@angular/common';
import { BoxSlot, SlotProduct } from '../../../core/models/box-type.model';
import { FormatPricePipe } from '../../../shared/pipes/format-price.pipe';
import { BuilderStepsComponent } from '../../../shared/components/builder-steps/builder-steps.component';
import { forkJoin } from 'rxjs';
import { SeoService } from '../../../core/services/seo.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-slot-picker',
  standalone: true,
  imports: [FormatPricePipe, BuilderStepsComponent, NgOptimizedImage, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-[1280px] mx-auto px-4 py-10 md:py-14">
      <!-- Header -->
      <div class="text-center mb-6">
        <p class="text-primary text-sm font-semibold tracking-widest uppercase mb-2">{{ 'builder.slotPicker.stepLabel' | t }}</p>
        <h1 class="font-playfair text-3xl font-bold text-foreground mb-3">{{ 'builder.slotPicker.title' | t }}</h1>
        <p class="text-muted-foreground max-w-md mx-auto">{{ 'builder.slotPicker.subtitle' | t }}</p>
      </div>

      <app-builder-steps [currentStep]="2" />

      @if (loading()) {
        <div class="flex justify-center py-20">
          <div class="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else {
        <!-- Slots progress mini-bar -->
        <div class="flex items-center gap-3 mb-8 p-4 bg-gradient-to-l from-primary/5 to-transparent rounded-xl border border-primary/10">
          <div class="flex items-center gap-1.5">
            @for (slot of slots(); track slot.id) {
              <div
                class="w-3 h-3 rounded-full transition-all duration-300"
                [class]="selectedProducts()[slot.id] ? 'bg-primary scale-110' : 'bg-border'"
              ></div>
            }
          </div>
          <span class="text-sm text-muted-foreground">
            {{ filledSlotsCount() }} / {{ slots().length }} {{ 'builder.slotPicker.slotsSelected' | t }}
          </span>
        </div>

        @for (slot of slots(); track slot.id; let idx = $index) {
          <section class="mb-10">
            <!-- Slot header -->
            <div class="flex items-center gap-3 mb-4">
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-300"
                [class]="selectedProducts()[slot.id] ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'"
              >
                @if (selectedProducts()[slot.id]) {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                } @else {
                  {{ idx + 1 }}
                }
              </div>
              <div>
                <h2 class="font-playfair font-bold text-lg text-foreground">
                  {{ currentLang() === 'ar' ? slot.label_ar : slot.label_en }}
                  @if (slot.is_required) {
                    <span class="text-primary text-sm font-sans">*</span>
                  }
                </h2>
                @if (selectedProducts()[slot.id]) {
                  <p class="text-xs text-primary">✓ {{ currentLang() === 'ar' ? selectedProducts()[slot.id].name : (selectedProducts()[slot.id].name_en || selectedProducts()[slot.id].name) }}</p>
                }
              </div>
            </div>

            <!-- Products grid -->
            <div class="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-none">
              @for (product of getSlotProducts(slot.id); track product.id) {
                <button
                  (click)="selectProduct(slot.id, product)"
                  class="group/card flex-shrink-0 w-40 md:w-48 rounded-xl overflow-hidden text-start transition-all duration-300 snap-start relative"
                  [class]="isSelected(slot.id, product.id)
                    ? 'ring-2 ring-primary shadow-lg shadow-primary/10 bg-background scale-[1.02]'
                    : 'bg-background border border-border hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5'"
                >
                  <!-- Product image -->
                  <div class="relative aspect-square bg-muted overflow-hidden">
                    @if (product.image_url) {
                      <img
                        [ngSrc]="product.image_url"
                        fill
                        [alt]="currentLang() === 'ar' ? product.name : (product.name_en || product.name)"
                        class="object-cover transition-transform duration-500 group-hover/card:scale-105"
                        [class.animate-[imageFly_0.6s_cubic-bezier(0.2,1,0.3,1)_forwards]]="isAnimating(slot.id, product.id)"
                      />
                    }
                    <!-- Customizable badge -->
                    @if (product.is_customizable) {
                      <div class="absolute top-2 end-2 z-10">
                        <span class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/90 text-white text-[10px] font-bold shadow-md backdrop-blur-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          {{ 'builder.slotPicker.customizableBadge' | t }}
                        </span>
                      </div>
                    }
                    <!-- Selected overlay -->
                    @if (isSelected(slot.id, product.id)) {
                      <div class="absolute inset-0 bg-primary/10 flex items-center justify-center pointer-events-none">
                        <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg animate-[ping_0.3s_cubic-bezier(0,0,0.2,1)_1]">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    }
                  </div>

                  <!-- Product info -->
                  <div class="p-3">
                    <p class="text-sm font-medium text-foreground line-clamp-2 leading-snug mb-1.5">{{ currentLang() === 'ar' ? product.name : (product.name_en || product.name) }}</p>
                    <div class="flex items-center gap-1.5">
                      <p class="font-playfair text-primary font-bold text-sm">{{ product.price | formatPrice }}</p>
                      @if (product.is_customizable && product.customization_price > 0) {
                        <span class="text-[10px] text-muted-foreground font-medium">({{ 'builder.slotPicker.customizationPricePrefix' | t }} +{{ product.customization_price | formatPrice }})</span>
                      }
                    </div>
                  </div>
                </button>
              }
              @if (getSlotProducts(slot.id).length === 0) {
                <div class="flex items-center gap-2 text-muted-foreground text-sm py-8 px-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  {{ 'builder.slotPicker.noProductsAvailable' | t }}
                </div>
              }
            </div>

            <!-- Customization toggle -->
            @if (selectedProducts()[slot.id]) {
              @if (selectedProducts()[slot.id].is_customizable) {
                <div class="mt-1 mx-1">
                  <button
                    (click)="toggleCustomization(slot.id)"
                    class="flex items-center gap-3 w-full p-3 rounded-xl border transition-all duration-300"
                    [class]="customizedSlots()[slot.id]
                      ? 'bg-primary/5 border-primary/30 shadow-sm'
                      : 'bg-muted/50 border-border hover:border-primary/20'"
                  >
                    <div
                      class="flex items-center justify-center w-5 h-5 rounded border-2 transition-all duration-300 flex-shrink-0"
                      [class]="customizedSlots()[slot.id]
                        ? 'bg-primary border-primary'
                        : 'border-border'"
                    >
                      @if (customizedSlots()[slot.id]) {
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                      }
                    </div>
                    <div class="flex-1 text-start">
                      <span class="text-sm font-medium text-foreground">{{ 'builder.slotPicker.customizeThisProduct' | t }}</span>
                      <span class="text-xs text-primary font-bold font-playfair me-1">(+{{ selectedProducts()[slot.id].customization_price | formatPrice }})</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                </div>
              } @else {
                <div class="mt-1 mx-1 flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border/50">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-muted-foreground flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                  <span class="text-xs text-muted-foreground">{{ 'builder.slotPicker.customizationNotAvailable' | t }}</span>
                </div>
              }
            }
          </section>
        }
      }

    </div>

    <!-- Sticky bottom bar -->
    <div class="sticky bottom-0 z-40 bg-background/90 backdrop-blur-xl border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <div class="flex items-center justify-between max-w-[1280px] mx-auto px-6 py-4">
          <div>
            <p class="text-xs text-muted-foreground mb-0.5 tracking-wider font-inter">{{ 'builder.slotPicker.boxTotal' | t }}</p>
            <p class="font-playfair text-2xl font-bold text-primary">{{ totalPrice() | formatPrice }}</p>
          </div>
          <button
            (click)="goToCustomization()"
            [disabled]="!canProceed()"
            class="bg-primary text-white h-14 px-8 rounded-xl font-semibold tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-primary-dark transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
          >
            {{ 'builder.slotPicker.nextCustomization' | t }}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 rtl:rotate-180" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes imageFly {
      0% { transform: scale(1) translateY(0); opacity: 1; }
      50% { transform: scale(0.6) translateY(-40px) translateX(-20px); opacity: 0.8; }
      100% { transform: scale(0.2) translateY(-80px) translateX(-40px); opacity: 0; }
    }
  `]
})
export class SlotPickerComponent implements OnInit {
  private router = inject(Router);
  private builderService = inject(BuilderService);
  private builderState = inject(BuilderStateService);
  private seoService = inject(SeoService);
  private t = inject(TranslationService);
  private destroyRef = inject(DestroyRef);
  readonly currentLang = this.t.currentLang;
  loading = signal(true);
  slots = signal<BoxSlot[]>([]);
  slotProductsMap = signal<Record<string, SlotProduct[]>>({});
  selectedProducts = signal<Record<string, SlotProduct>>({});
  customizedSlots = signal<Record<string, boolean>>({});
  totalPrice = signal(0);
  filledSlotsCount = computed(() => Object.keys(this.selectedProducts()).length);
  animatingSlotId = signal<string | null>(null);
  animatingProductId = signal<string | null>(null);

  ngOnInit(): void {
    this.seoService.updatePage({
      title: this.t.get('builder.seo.slotPicker.title'),
      description: this.t.get('builder.seo.slotPicker.description'),
      url: '/builder/customize',
    });
    const state = this.builderState.snapshot;
    if (!state.boxType) {
      this.router.navigate(['/builder/select']);
      return;
    }

    // Restore selections if user navigated back
    if (Object.keys(state.selectedProducts).length > 0) {
      this.selectedProducts.set({ ...state.selectedProducts });
    }
    if (Object.keys(state.customizedSlots).length > 0) {
      this.customizedSlots.set({ ...state.customizedSlots });
    }

    this.builderService.getSlots(state.boxType.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (slots) => {
        this.slots.set(slots);
        this.builderState.setSlots(slots);
        this.loadSlotProducts(slots);
      },
      error: () => {
        this.loading.set(false);
      },
    });

    this.recalcTotal();
  }

  private loadSlotProducts(slots: BoxSlot[]): void {
    const requests: Record<string, ReturnType<BuilderService['getProductsForSlot']>> = {};
    for (const slot of slots) {
      requests[slot.id] = this.builderService.getProductsForSlot(slot.id);
    }

    forkJoin(requests).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (results) => {
        this.slotProductsMap.set(results);
        for (const [slotId, products] of Object.entries(results)) {
          this.builderState.setSlotProducts(slotId, products);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getSlotProducts(slotId: string): SlotProduct[] {
    return this.slotProductsMap()[slotId] || [];
  }

  isSelected(slotId: string, productId: string): boolean {
    return this.selectedProducts()[slotId]?.id === productId;
  }

  selectProduct(slotId: string, product: SlotProduct): void {
    if (this.isSelected(slotId, product.id)) return;
    
    // Trigger Gamified Animation
    this.animatingSlotId.set(slotId);
    this.animatingProductId.set(product.id);
    setTimeout(() => {
      this.animatingSlotId.set(null);
      this.animatingProductId.set(null);
      
      // Update state after animation visually hides
      this.selectedProducts.update(current => ({ ...current, [slotId]: product }));
      this.customizedSlots.update(current => {
        const updated = { ...current };
        delete updated[slotId];
        return updated;
      });
      this.builderState.selectProduct(slotId, product);
      this.recalcTotal();
    }, 300); // Set timeout short to feel snappy
  }
  
  isAnimating(slotId: string, productId: string): boolean {
    return this.animatingSlotId() === slotId && this.animatingProductId() === productId;
  }

  toggleCustomization(slotId: string): void {
    const current = this.customizedSlots()[slotId] ?? false;
    this.customizedSlots.update(c => ({ ...c, [slotId]: !current }));
    this.builderState.toggleCustomization(slotId, !current);
    this.recalcTotal();
  }

  private recalcTotal(): void {
    this.totalPrice.set(this.builderState.getTotalPrice());
  }

  canProceed(): boolean {
    const requiredSlots = this.slots().filter(s => s.is_required);
    return requiredSlots.every(s => this.selectedProducts()[s.id]);
  }

  goToCustomization(): void {
    if (this.builderState.hasAnyCustomization()) {
      this.router.navigate(['/builder/personalize']);
    } else {
      this.router.navigate(['/builder/preview']);
    }
  }
}
