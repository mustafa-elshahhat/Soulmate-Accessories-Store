import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-product-images',
  standalone: true,
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-4 relative">
      <div class="absolute -inset-4 bg-primary/5 rounded-[2rem] blur-2xl -z-10 pointer-events-none"></div>
      <div class="aspect-square bg-background rounded-2xl overflow-hidden shadow-lg border border-border/60 relative group">
        @if (imageUrl) {
          <img
            [ngSrc]="imageUrl"
            fill
            priority
            [alt]="altText"
            sizes="(max-width: 768px) 100vw, 50vw"
            class="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        }
      </div>
      <!-- Gallery Thumbnails -->
      <div class="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
        <button class="w-20 h-20 md:w-24 md:h-24 rounded-xl border-2 border-primary overflow-hidden shrink-0 relative">
          <img [ngSrc]="imageUrl" fill [alt]="altText" sizes="15vw" class="object-cover" />
        </button>
      </div>
    </div>
  `
})
export class ProductImagesComponent {
  @Input() imageUrl = '';
  @Input() altText = '';
}
