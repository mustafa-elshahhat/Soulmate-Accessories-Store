import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BuilderStateService } from '../../../core/services/builder-state.service';
import { BuilderStepsComponent } from '../../../shared/components/builder-steps/builder-steps.component';
import { SeoService } from '../../../core/services/seo.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-customization',
  standalone: true,
  imports: [ReactiveFormsModule, BuilderStepsComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-3xl mx-auto px-4 py-10 md:py-14">
      <!-- Header -->
      <div class="text-center mb-6">
        <p class="text-primary text-sm font-semibold tracking-widest uppercase mb-2">{{ 'builder.customization.stepLabel' | t }}</p>
        <h1 class="font-playfair text-3xl font-bold text-foreground mb-3">{{ 'builder.customization.title' | t }}</h1>
        <p class="text-muted-foreground max-w-md mx-auto">{{ 'builder.customization.subtitle' | t }}</p>
      </div>

      <app-builder-steps [currentStep]="3" />

      <!-- Customized products summary -->
      <div class="bg-primary/5 border border-primary/10 rounded-xl p-4 mb-6">
        <p class="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          {{ 'builder.customization.productsToCustomize' | t }}
        </p>
        @for (name of customizedProductNames(); track name) {
          <p class="text-xs text-muted-foreground me-6">• {{ name }}</p>
        }
      </div>

      <!-- Form card -->
      <div class="bg-background rounded-xl border border-border shadow-sm overflow-hidden">
        <!-- Decorative top bar -->
        <div class="h-1 bg-gradient-to-l from-primary via-primary-light to-primary"></div>

        <form [formGroup]="customForm" class="p-6 md:p-8 space-y-6">
          <!-- Names row -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="flex items-center gap-1.5 text-sm font-semibold text-foreground tracking-wide font-inter">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                {{ 'builder.customization.firstName' | t }}
                @if (hasCustomizations()) { <span class="text-primary">*</span> }
              </label>
              <input
                formControlName="name1"
                class="w-full h-12 rounded-xl border border-border px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 font-inter bg-muted/50 focus:bg-background"
                placeholder="Ahmed"
                dir="ltr"
              />
              @if (customForm.controls.name1.touched && customForm.controls.name1.invalid) {
                <p class="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                  {{ 'common.validation.required' | t }}
                </p>
              }
            </div>
            <div class="space-y-2">
              <label class="flex items-center gap-1.5 text-sm font-semibold text-foreground tracking-wide font-inter">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                {{ 'builder.customization.secondName' | t }}
                @if (hasCustomizations()) { <span class="text-primary">*</span> }
              </label>
              <input
                formControlName="name2"
                class="w-full h-12 rounded-xl border border-border px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 font-inter bg-muted/50 focus:bg-background"
                placeholder="Sara"
                dir="ltr"
              />
              @if (customForm.controls.name2.touched && customForm.controls.name2.invalid) {
                <p class="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                  {{ 'common.validation.required' | t }}
                </p>
              }
            </div>
          </div>

          <!-- Divider -->
          <div class="flex items-center gap-4">
            <div class="flex-1 h-px bg-border"></div>
            <span class="text-xs text-muted-foreground font-medium">{{ 'builder.customization.additionalDetails' | t }}</span>
            <div class="flex-1 h-px bg-border"></div>
          </div>

          <!-- Date -->
          <div class="space-y-2">
            <label class="flex items-center gap-1.5 text-sm font-semibold text-foreground tracking-wide font-inter">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {{ 'builder.customization.specialDate' | t }}
              @if (hasCustomizations()) { <span class="text-primary">*</span> }
            </label>
            <input
              formControlName="date"
              type="text"
              class="w-full h-12 rounded-xl border border-border px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 font-inter bg-muted/50 focus:bg-background"
              placeholder="12.06.2024"
              dir="ltr"
            />
            @if (customForm.controls.date.touched && customForm.controls.date.invalid) {
              <p class="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                {{ 'common.validation.required' | t }}
              </p>
            }
          </div>

          <!-- Message -->
          <div class="space-y-2">
            <label class="flex items-center justify-between text-sm font-semibold text-foreground tracking-wide font-inter">
              <span class="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                {{ 'builder.customization.specialMessage' | t }}
              </span>
              <span class="text-xs text-muted-foreground font-normal">{{ 'common.optional' | t }}</span>
            </label>
            <textarea
              formControlName="message"
              rows="3"
              maxlength="200"
              class="w-full rounded-xl border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 resize-none font-inter bg-muted/50 focus:bg-background"
              [placeholder]="'builder.customization.messagePlaceholder' | t"
            ></textarea>
            <p class="text-[11px] text-muted-foreground text-end">{{ customForm.controls.message.value.length || 0 }} / 200</p>
          </div>
        </form>
      </div>

      <!-- Action buttons -->
      <div class="flex gap-4 mt-8">
        <button
          (click)="goBack()"
            class="flex-1 flex items-center justify-center gap-2 bg-background text-foreground border border-border h-14 rounded-xl font-medium shadow-sm hover:shadow hover:-translate-y-0.5 hover:bg-muted transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-border focus:ring-offset-2 min-h-[44px]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 rtl:rotate-180" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          {{ 'common.goBack' | t }}
        </button>
        <button
          (click)="goToPreview()"
          [disabled]="customForm.invalid"
          class="flex-1 flex items-center justify-center gap-2 bg-primary text-white h-14 rounded-xl font-semibold tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-primary-dark transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          {{ 'builder.customization.showPreview' | t }}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 rtl:rotate-180" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  `,
})
export class CustomizationComponent implements OnInit {
  private router = inject(Router);
  private builderState = inject(BuilderStateService);
  private fb = inject(FormBuilder);
  private seoService = inject(SeoService);
  private t = inject(TranslationService);

  hasCustomizations = signal(false);
  customizedProductNames = signal<string[]>([]);

  customForm = this.fb.nonNullable.group({
    name1: ['', Validators.required],
    name2: ['', Validators.required],
    date: ['', Validators.required],
    message: [''],
  });

  ngOnInit(): void {
    this.seoService.updatePage({
      title: this.t.get('builder.seo.customization.title'),
      description: this.t.get('builder.seo.customization.description'),
      url: '/builder/personalize',
    });
    if (!this.builderState.snapshot.boxType) {
      this.router.navigate(['/builder/select']);
      return;
    }

    if (!this.builderState.canProceedFromSlots()) {
      this.router.navigate(['/builder/customize']);
      return;
    }

    // Skip customization step entirely if no products are toggled for customization
    if (!this.builderState.hasAnyCustomization()) {
      this.router.navigate(['/builder/preview']);
      return;
    }

    // Check if any products are being customized
    const hasCustom = true;
    this.hasCustomizations.set(hasCustom);

    // Collect customized product names for display
    const state = this.builderState.snapshot;
    const names = this.builderState.getCustomizedSlotIds()
      .map(slotId => state.selectedProducts[slotId]?.name)
      .filter(Boolean);
    this.customizedProductNames.set(names);

    // Restore previous customization if user navigated back
    const prev = this.builderState.snapshot.customization;
    if (prev.name1 || prev.name2 || prev.date || prev.message) {
      this.customForm.patchValue(prev);
    }
  }

  goBack(): void {
    this.saveCustomization();
    this.router.navigate(['/builder/customize']);
  }

  goToPreview(): void {
    this.saveCustomization();
    this.router.navigate(['/builder/preview']);
  }

  skipToPreview(): void {
    this.router.navigate(['/builder/preview']);
  }

  private saveCustomization(): void {
    const val = this.customForm.getRawValue();
    this.builderState.setCustomization(val);
  }
}
