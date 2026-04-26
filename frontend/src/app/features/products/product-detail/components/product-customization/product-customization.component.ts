import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { FormatPricePipe } from '../../../../../shared/pipes/format-price.pipe';

@Component({
  selector: 'app-product-customization',
  standalone: true,
  imports: [FormsModule, TranslatePipe, FormatPricePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!isCustomizable) {
      <div class="relative mb-8 rounded-xl overflow-hidden">
        <div class="p-8 bg-muted/30 border border-border rounded-xl backdrop-blur-sm">
          <div class="flex flex-col items-center justify-center gap-3 py-4 opacity-50">
            <div class="w-14 h-14 rounded-full bg-border/50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
            </div>
            <div class="text-center">
              <p class="font-playfair font-bold text-foreground/60 text-lg">{{ 'productDetail.notCustomizableTitle' | t }}</p>
              <p class="text-sm text-muted-foreground mt-1">{{ 'productDetail.notCustomizableDesc' | t }}</p>
            </div>
          </div>
          <div class="mt-4 space-y-4 pointer-events-none select-none" aria-hidden="true">
            <div class="h-12 bg-border/30 rounded-lg blur-[2px]"></div>
            <div class="h-12 bg-border/30 rounded-lg blur-[2px]"></div>
            <div class="h-20 bg-border/30 rounded-lg blur-[2px]"></div>
          </div>
        </div>
      </div>
    } @else {
      <div class="mb-8 rounded-xl border border-border overflow-hidden font-inter transition-all duration-500" [class.shadow-sm]="enabled" [class.border-primary/30]="enabled">
        <button (click)="onToggle()" class="w-full flex items-center justify-between p-5 transition-all duration-300 cursor-pointer group" [class.bg-primary/5]="enabled" [class.bg-background]="!enabled">
          <div class="flex items-center gap-4">
            <div class="flex items-center justify-center w-6 h-6 rounded border-2 transition-all duration-300 flex-shrink-0" [class.bg-primary]="enabled" [class.border-primary]="enabled" [class.border-border]="!enabled">
              @if (enabled) {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
              }
            </div>
            <div class="text-start">
              <span class="font-playfair font-bold text-foreground">{{ 'productDetail.customizeProduct' | t }}</span>
              <span class="text-xs text-primary font-bold font-playfair me-2">(+{{ price | formatPrice }})</span>
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary/60 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        </button>

        @if (!enabled) {
          <div class="px-5 pb-5 pointer-events-none select-none" aria-hidden="true">
            <div class="space-y-3 opacity-40">
              <div class="h-12 bg-border/40 rounded-lg blur-[2px]"></div>
              <div class="h-12 bg-border/40 rounded-lg blur-[2px]"></div>
              <div class="h-16 bg-border/40 rounded-lg blur-[2px]"></div>
            </div>
            <p class="text-center text-xs text-muted-foreground mt-3">{{ 'productDetail.customizeHint' | t }}</p>
          </div>
        } @else {
          <div class="px-5 pb-6 bg-primary/[0.02] border-t border-primary/10">
            <div class="absolute top-0 start-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
            <div class="space-y-5 pt-5 relative z-10">
              <div>
                <label class="block text-sm font-semibold text-foreground mb-2">{{ 'productDetail.customNameLabel' | t }}</label>
                <input type="text" [(ngModel)]="customName" (ngModelChange)="customNameChange.emit($event)" [placeholder]="'productDetail.customNamePlaceholder' | t" class="w-full h-14 bg-muted border-transparent rounded-lg px-4 text-foreground shadow-sm focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 placeholder:text-muted-foreground">
              </div>
              <div>
                <label class="block text-sm font-semibold text-foreground mb-2">{{ 'productDetail.customDateLabel' | t }}</label>
                <input type="text" [(ngModel)]="customDate" (ngModelChange)="customDateChange.emit($event)" [placeholder]="'productDetail.customDatePlaceholder' | t" class="w-full h-14 bg-muted border-transparent rounded-lg px-4 text-foreground shadow-sm focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 placeholder:text-muted-foreground">
              </div>
              <div>
                <label class="block text-sm font-semibold text-foreground mb-2">{{ 'productDetail.customMessageLabel' | t }}</label>
                <textarea [(ngModel)]="customMessage" (ngModelChange)="customMessageChange.emit($event)" rows="3" [placeholder]="'productDetail.customMessagePlaceholder' | t" class="w-full bg-muted border-transparent rounded-lg p-4 text-foreground shadow-sm focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 placeholder:text-muted-foreground resize-none"></textarea>
              </div>
            </div>
          </div>
        }
      </div>
    }
  `
})
export class ProductCustomizationComponent {
  @Input() isCustomizable = false;
  @Input() price = 0;
  @Input() enabled = false;
  @Input() customName = '';
  @Input() customDate = '';
  @Input() customMessage = '';

  @Output() toggle = new EventEmitter<void>();
  @Output() customNameChange = new EventEmitter<string>();
  @Output() customDateChange = new EventEmitter<string>();
  @Output() customMessageChange = new EventEmitter<string>();

  onToggle() { this.toggle.emit(); }
}
