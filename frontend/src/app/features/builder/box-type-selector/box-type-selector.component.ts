import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { BuilderService } from '../../../core/services/builder.service';
import { BuilderStateService } from '../../../core/services/builder-state.service';
import { NgOptimizedImage } from '@angular/common';
import { BoxType } from '../../../core/models/box-type.model';
import { FormatPricePipe } from '../../../shared/pipes/format-price.pipe';
import { BuilderStepsComponent } from '../../../shared/components/builder-steps/builder-steps.component';
import { SeoService } from '../../../core/services/seo.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-box-type-selector',
  standalone: true,
  imports: [FormatPricePipe, BuilderStepsComponent, NgOptimizedImage, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-[1280px] mx-auto px-4 py-10 md:py-14">
      <!-- Header -->
      <div class="text-center mb-6">
        <p class="text-primary text-sm font-semibold tracking-widest uppercase mb-2">{{ 'builder.boxSelector.pageSubtitle' | t }}</p>
        <h1 class="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-3">{{ 'builder.boxSelector.title' | t }}</h1>
        <p class="text-muted-foreground max-w-md mx-auto">{{ 'builder.boxSelector.subtitle' | t }}</p>
      </div>

      <app-builder-steps [currentStep]="1" />

      @if (loading()) {
        <div class="flex justify-center py-20">
          <div class="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          @for (box of boxTypes(); track box.id) {
            <button
              (click)="selectBox(box)"
              class="group relative bg-background rounded-xl overflow-hidden text-start focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-4 transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl"
            >
              <!-- Image with overlay -->
              <div class="relative aspect-[3/4] bg-muted overflow-hidden">
                @if (box.image_url) {
                  <img
                    [ngSrc]="box.image_url"
                    fill
                    [alt]="currentLang() === 'ar' ? box.name : (box.name_en || box.name)"
                    class="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                }
                <!-- Gradient overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                <!-- Gender badge -->
                <div class="absolute top-4 start-4">
                  <span class="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                    {{ (box.gender === 'male' ? 'common.gender.male' : box.gender === 'female' ? 'common.gender.female' : 'common.gender.unisex') | t }}
                  </span>
                </div>

                <!-- Content overlay at bottom -->
                <div class="absolute bottom-0 inset-x-0 p-5 text-white">
                  <h3 class="font-playfair text-2xl font-bold mb-1.5 drop-shadow-lg">{{ currentLang() === 'ar' ? box.name : (box.name_en || box.name) }}</h3>
                  <div class="flex items-baseline gap-1.5">
                    <span class="text-xs text-white/70">{{ 'builder.boxSelector.startingFrom' | t }}</span>
                    <span class="font-playfair text-xl font-bold text-primary-light">{{ box.base_price | formatPrice }}</span>
                  </div>
                </div>
              </div>

              <!-- Hover ring indicator -->
<div class="absolute inset-0 rounded-xl ring-0 ring-primary/0 group-hover:ring-2 group-hover:ring-primary/60 transition-all duration-300 pointer-events-none"></div>

              <!-- Arrow indicator -->
              <div class="absolute bottom-5 end-5 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </div>
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class BoxTypeSelectorComponent implements OnInit {
  private builderService = inject(BuilderService);
  private builderState = inject(BuilderStateService);
  private router = inject(Router);
  private seoService = inject(SeoService);
  private t = inject(TranslationService);
  readonly currentLang = this.t.currentLang;

  boxTypes = signal<BoxType[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.seoService.updatePage({
      title: this.t.get('builder.seo.boxSelector.title'),
      description: this.t.get('builder.seo.boxSelector.description'),
      url: '/builder/select',
    });
    this.builderService.getBoxTypes().subscribe({
      next: (types) => {
        this.boxTypes.set(types);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  selectBox(box: BoxType): void {
    this.builderState.setBoxType(box);
    this.router.navigate(['/builder/customize']);
  }
}
