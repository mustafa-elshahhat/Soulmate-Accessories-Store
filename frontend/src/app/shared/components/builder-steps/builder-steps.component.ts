import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-builder-steps',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav aria-label="Builder progress" class="w-full max-w-3xl mx-auto mb-14 mt-6 px-4">
      <!-- Progress bar background -->
      <div class="relative">
        <!-- Track -->
        <div class="absolute top-6 right-[calc(12.5%+16px)] left-[calc(12.5%+16px)] h-0.5 bg-border rounded-full"></div>
        <!-- Filled track -->
        <div
          class="absolute top-6 right-[calc(12.5%+16px)] h-0.5 bg-gradient-to-l from-primary to-primary-dark rounded-full transition-all duration-700 ease-out"
          [style.width.%]="((currentStep - 1) / (steps.length - 1)) * (100 - 25)"
        ></div>

        <!-- Steps -->
        <div class="relative flex justify-between">
          @for (step of steps; track step.num) {
            <div class="flex flex-col items-center gap-3 flex-1" [attr.aria-current]="currentStep === step.num ? 'step' : null">
              <!-- Circle -->
              <div class="relative">
                @if (currentStep === step.num) {
                  <div class="absolute inset-0 -m-1.5 rounded-full bg-primary/20 animate-pulse"></div>
                }
                <div
                  class="relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-500 ease-out"
                  [class]="getCircleClasses(step.num)"
                >
                  @if (currentStep > step.num) {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  } @else {
                    <span [innerHTML]="step.icon"></span>
                  }
                </div>
              </div>
              <!-- Label + description -->
              <div class="text-center">
                <p
                  class="text-sm font-medium transition-colors duration-300"
                  [class]="currentStep === step.num ? 'text-primary font-semibold' : currentStep > step.num ? 'text-primary/70' : 'text-muted-foreground'"
                >
                  {{ step.label | t }}
                </p>
                <p
                  class="text-[11px] mt-0.5 transition-colors duration-300 hidden sm:block"
                  [class]="currentStep >= step.num ? 'text-muted-foreground' : 'text-border'"
                >
                  {{ step.desc | t }}
                </p>
              </div>
            </div>
          }
        </div>
      </div>
    </nav>
  `,
})
export class BuilderStepsComponent {
  @Input() currentStep = 1;

  readonly steps = [
    { num: 1, label: 'builder.steps.step1Label', desc: 'builder.steps.step1Desc', icon: '&#x1F381;' },
    { num: 2, label: 'builder.steps.step2Label', desc: 'builder.steps.step2Desc', icon: '&#x2728;' },
    { num: 3, label: 'builder.steps.step3Label', desc: 'builder.steps.step3Desc', icon: '&#x270F;&#xFE0F;' },
    { num: 4, label: 'builder.steps.step4Label', desc: 'builder.steps.step4Desc', icon: '&#x2705;' },
  ];

  getCircleClasses(stepNum: number): string {
    if (this.currentStep > stepNum) {
      return 'bg-primary text-white border-primary shadow-md';
    }
    if (this.currentStep === stepNum) {
      return 'bg-primary text-white border-primary shadow-lg shadow-primary/30 scale-110';
    }
    return 'bg-background text-muted-foreground border-border';
  }
}
