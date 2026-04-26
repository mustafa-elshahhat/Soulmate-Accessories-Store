import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BuilderService } from '../../../core/services/builder.service';
import { BuilderStateService } from '../../../core/services/builder-state.service';
import { NgOptimizedImage } from '@angular/common';
import { PreviewResponse } from '../../../core/models/box-type.model';
import { CartService } from '../../../core/services/cart.service';
import { FormatPricePipe } from '../../../shared/pipes/format-price.pipe';
import { BuilderStepsComponent } from '../../../shared/components/builder-steps/builder-steps.component';
import { SeoService } from '../../../core/services/seo.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';
import { AudioService } from '../../../core/services/audio.service';

@Component({
  selector: 'app-preview-screen',
  standalone: true,
  imports: [RouterLink, FormatPricePipe, BuilderStepsComponent, NgOptimizedImage, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-3xl mx-auto px-4 py-10 md:py-14">
      <!-- Header -->
      <div class="text-center mb-6">
        <p class="text-primary text-sm font-semibold tracking-widest uppercase mb-2">{{ 'builder.preview.stepLabel' | t }}</p>
        <h1 class="font-playfair text-3xl font-bold text-foreground mb-3">{{ 'builder.preview.title' | t }}</h1>
        <p class="text-muted-foreground max-w-md mx-auto">{{ 'builder.preview.subtitle' | t }}</p>
      </div>

      <app-builder-steps [currentStep]="4" />

      @if (loading()) {
        <div class="flex justify-center py-20">
          <div class="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (preview()) {
        <!-- Box type header card -->
        <div class="relative bg-background rounded-xl overflow-hidden shadow-sm border border-border mb-6">
          <div class="h-1 bg-gradient-to-l from-primary via-primary-light to-primary"></div>
          <div class="p-6 flex items-center gap-4">
            @if (boxImageUrl) {
              <div class="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0 relative">
                <img [ngSrc]="boxImageUrl" fill [alt]="currentLang() === 'ar' ? preview()!.box_type.name : (preview()!.box_type.name_en || preview()!.box_type.name)" sizes="10vw" class="object-cover" />
              </div>
            }
            <div>
              <p class="text-xs text-primary font-semibold tracking-wider uppercase mb-1">{{ 'builder.preview.boxType' | t }}</p>
              <h2 class="font-playfair text-xl font-bold text-foreground">{{ currentLang() === 'ar' ? preview()!.box_type.name : (preview()!.box_type.name_en || preview()!.box_type.name) }}</h2>
            </div>
          </div>
        </div>

        <!-- Selected products card -->
        <div class="bg-background rounded-xl border border-border shadow-sm overflow-hidden mb-6">
          <div class="px-6 pt-5 pb-3 border-b border-border">
            <h3 class="flex items-center gap-2 font-semibold text-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              {{ 'builder.preview.selectedProducts' | t }}
              <span class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{{ preview()!.selected_products.length }}</span>
            </h3>
          </div>
          <div class="divide-y divide-border">
            @for (p of preview()!.selected_products; track p.slot_id) {
                <div class="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors">
                <!-- Product image thumbnail -->
                @if (getProductImage(p.slot_id)) {
                  <div class="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0 ring-1 ring-border relative">
                    <img [ngSrc]="getProductImage(p.slot_id)" fill [alt]="currentLang() === 'ar' ? p.name : (p.name_en || p.name)" sizes="10vw" class="object-cover" />
                  </div>
                } @else {
                  <div class="w-14 h-14 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                }
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-muted-foreground mb-0.5">{{ currentLang() === 'ar' ? p.label_ar : p.label_en }}</p>
                  <p class="text-sm font-medium text-foreground truncate">{{ currentLang() === 'ar' ? p.name : (p.name_en || p.name) }}</p>
                </div>
                <span class="font-playfair font-bold text-sm text-foreground whitespace-nowrap">{{ p.price | formatPrice }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Customization card -->
        @if (preview()!.customization && (preview()!.customization!.name1 || preview()!.customization!.name2 || preview()!.customization!.date)) {
          <div class="bg-background rounded-xl border border-border shadow-sm overflow-hidden mb-6">
            <div class="px-6 pt-5 pb-3 border-b border-border">
              <h3 class="flex items-center gap-2 font-semibold text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                {{ 'builder.preview.customization' | t }}
              </h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-2 gap-4">
                @if (preview()!.customization!.name1) {
                  <div class="bg-muted rounded-xl p-4 text-center">
                    <p class="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{{ 'builder.preview.firstName' | t }}</p>
                    <p class="font-playfair text-lg font-bold text-foreground" dir="ltr">{{ preview()!.customization!.name1 }}</p>
                  </div>
                }
                @if (preview()!.customization!.name2) {
                  <div class="bg-muted rounded-xl p-4 text-center">
                    <p class="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{{ 'builder.preview.secondName' | t }}</p>
                    <p class="font-playfair text-lg font-bold text-foreground" dir="ltr">{{ preview()!.customization!.name2 }}</p>
                  </div>
                }
              </div>
              @if (preview()!.customization!.date) {
                <div class="bg-muted rounded-xl p-4 text-center mt-4">
                    <p class="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{{ 'builder.preview.date' | t }}</p>
                  <p class="font-playfair text-lg font-bold text-primary" dir="ltr">{{ preview()!.customization!.date }}</p>
                </div>
              }
              @if (preview()!.customization!.message) {
                <div class="bg-primary/5 border border-primary/10 rounded-xl p-4 mt-4 text-center">
                  <p class="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">{{ 'builder.preview.message' | t }}</p>
                  <p class="text-sm text-foreground italic leading-relaxed">"{{ preview()!.customization!.message }}"</p>
                </div>
              }
            </div>
          </div>
        }

        <!-- Customized products card -->
        @if (preview()!.customized_products.length) {
          <div class="bg-background rounded-xl border border-primary/20 shadow-sm overflow-hidden mb-6">
            <div class="px-6 pt-5 pb-3 border-b border-border">
              <h3 class="flex items-center gap-2 font-semibold text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                {{ 'builder.preview.customizedProducts' | t }}
                <span class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{{ preview()!.customized_products.length }}</span>
              </h3>
            </div>
            <div class="divide-y divide-border">
              @for (cp of preview()!.customized_products; track cp.slot_id) {
                <div class="flex items-center justify-between px-6 py-3">
                  <div>
                    <p class="text-sm font-medium text-foreground">{{ currentLang() === 'ar' ? cp.name : (cp.name_en || cp.name) }}</p>
                    <p class="text-xs text-muted-foreground">{{ 'builder.preview.customizationPrefix' | t }} {{ cp.category }}</p>
                  </div>
                  <span class="font-playfair font-bold text-sm text-primary whitespace-nowrap">+{{ cp.customization_price | formatPrice }}</span>
                </div>
              }
            </div>
          </div>
        }

        <!-- Price summary card -->
        <div class="bg-gradient-to-br from-primary-dark via-[#4A3B32] to-black rounded-3xl p-8 mb-10 text-white shadow-2xl relative overflow-hidden border border-white/10">
          <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div class="absolute bottom-0 left-0 w-40 h-40 bg-primary/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
          <div class="relative z-10 space-y-4 mb-6">
            <div class="flex justify-between items-center text-sm text-white/80 font-inter">
              <span>{{ 'builder.preview.basePrice' | t }}</span>
              <span class="font-medium tracking-wide">{{ preview()!.box_type.base_price | formatPrice }}</span>
            </div>
            @for (p of preview()!.selected_products; track p.slot_id) {
              <div class="flex justify-between items-center text-sm text-white/80 font-inter">
                <span>{{ currentLang() === 'ar' ? p.label_ar : p.label_en }}</span>
                <span class="font-medium tracking-wide">{{ p.price | formatPrice }}</span>
              </div>
            }
            @if (preview()!.customization_total > 0) {
              <div class="border-t border-white/10 pt-3 space-y-3">
                @for (cp of preview()!.customized_products; track cp.slot_id) {
                  <div class="flex justify-between items-center text-sm text-white/80 font-inter">
                    <span class="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      {{ 'builder.preview.customizationPrefix' | t }} {{ currentLang() === 'ar' ? cp.name : (cp.name_en || cp.name) }}
                    </span>
                    <span class="font-medium tracking-wide">+{{ cp.customization_price | formatPrice }}</span>
                  </div>
                }
              </div>
            }
          </div>
          <div class="relative z-10 border-t border-white/20 pt-6">
            <div class="flex justify-between items-end">
              <span class="text-lg font-semibold text-white/90">{{ 'builder.preview.initialTotal' | t }}</span>
              <span class="font-playfair text-4xl font-bold text-white drop-shadow-sm">{{ preview()!.total_price | formatPrice }}</span>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex gap-4">
          <button
            (click)="goBack()"
            class="flex-1 flex items-center justify-center gap-2 bg-background text-foreground border border-border h-14 rounded-xl font-medium shadow-sm hover:shadow hover:-translate-y-0.5 hover:bg-muted transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-border focus:ring-offset-2 min-h-[44px]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 rtl:rotate-180" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            {{ 'builder.preview.edit' | t }}
          </button>
          <button
            (click)="addToCart()"
            class="flex-[2] flex items-center justify-center gap-2 bg-primary text-white h-14 rounded-xl font-semibold text-lg tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-primary-dark transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
            {{ 'builder.preview.addToCart' | t }}
          </button>
        </div>
      } @else {
        <div class="text-center py-20">
          <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          </div>
          <p class="text-muted-foreground mb-4">{{ 'builder.preview.noPreviewData' | t }}</p>
          <a routerLink="/builder/select" class="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors">
            {{ 'builder.preview.startOver' | t }}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 rtl:rotate-180" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </a>
        </div>
      }
    </div>
  `,
})
export class PreviewScreenComponent implements OnInit {
  private router = inject(Router);
  private builderService = inject(BuilderService);
  private builderStateService = inject(BuilderStateService);
  private cartService = inject(CartService);
  private seoService = inject(SeoService);
  private t = inject(TranslationService);
  private audio = inject(AudioService);
  readonly currentLang = this.t.currentLang;

  loading = signal(true);
  preview = signal<PreviewResponse | null>(null);
  boxImageUrl = '';
  private productImages: Record<string, string> = {};

  ngOnInit(): void {
    this.seoService.updatePage({
      title: this.t.get('builder.seo.preview.title'),
      description: this.t.get('builder.seo.preview.description'),
      url: '/builder/preview',
    });
    const state = this.builderStateService.snapshot;
    if (!state.boxType) {
      this.router.navigate(['/builder/select']);
      return;
    }

    this.boxImageUrl = state.boxType.image_url;

    // Cache product images from state for thumbnail display
    for (const [slotId, product] of Object.entries(state.selectedProducts)) {
      this.productImages[slotId] = product.image_url;
    }

    const slots = this.builderStateService.getSlotSelections();
    const customization = state.customization;
    const customizedSlots = this.builderStateService.getCustomizedSlotIds();

    this.builderService.preview(state.boxType.id, slots, customization, customizedSlots).subscribe({
      next: (result) => {
        this.preview.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getProductImage(slotId: string): string {
    return this.productImages[slotId] || '';
  }

  goBack(): void {
    if (this.builderStateService.hasAnyCustomization()) {
      this.router.navigate(['/builder/personalize']);
    } else {
      this.router.navigate(['/builder/customize']);
    }
  }

  addToCart(): void {
    const state = this.builderStateService.snapshot;
    const prev = this.preview();
    if (!prev || !state.boxType) return;

    this.cartService.addItem({
      id: `box-${state.boxType.id}-${crypto.randomUUID()}`,
      type: 'box',
      name: prev.box_type.name,
      name_en: prev.box_type.name_en,
      image_url: state.boxType.image_url,
      unit_price: prev.total_price,
      quantity: 1,
      box_type_id: state.boxType.id,
      custom_data_json: JSON.stringify({
        slots: this.builderStateService.getSlotSelections(),
        customization: state.customization,
        customized_slots: this.builderStateService.getCustomizedSlotIds(),
      }),
    });

    this.audio.playCartSound();
    this.builderStateService.reset();
    this.router.navigate(['/cart']);
  }
}
