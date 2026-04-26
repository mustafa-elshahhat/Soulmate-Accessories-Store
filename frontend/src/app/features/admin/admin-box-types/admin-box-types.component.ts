import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, AdminBoxType } from '../../../core/services/admin.service';
import { FormatPricePipe } from '../../../shared/pipes/format-price.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-admin-box-types',
  standalone: true,
  imports: [RouterLink, FormatPricePipe, TranslatePipe, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <div class="flex items-center justify-between mb-8">
        <h1 class="font-playfair text-3xl font-bold text-foreground">{{ 'admin.boxTypes.title' | t }}</h1>
        <a routerLink="/admin/box-types/new" class="inline-flex items-center justify-center bg-primary text-white h-12 px-6 rounded-xl font-medium tracking-wide shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:bg-primary-dark transition-all duration-300 font-inter">{{ 'admin.boxTypes.addBoxType' | t }}</a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-inter">
        @for (bt of boxTypes(); track bt.id) {
          <div class="bg-background rounded-xl border border-border p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            @if (bt.image_url) {
              <img [ngSrc]="bt.image_url" [alt]="currentLang() === 'ar' ? bt.name : (bt.name_en || bt.name)" class="w-full h-48 rounded-xl object-cover mb-5 bg-muted border border-border relative z-10 transition-transform duration-500 group-hover:scale-105" width="400" height="192">
            }
            <div class="flex justify-between items-start mb-3 relative z-10">
              <h3 class="font-playfair font-bold text-xl text-foreground">{{ currentLang() === 'ar' ? bt.name : (bt.name_en || bt.name) }}</h3>
              <span class="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border"
                    [class.bg-green-50]="bt.is_active" [class.text-green-700]="bt.is_active" [class.border-green-200]="bt.is_active"
                    [class.bg-red-50]="!bt.is_active" [class.text-red-700]="!bt.is_active" [class.border-red-200]="!bt.is_active">
                {{ (bt.is_active ? 'admin.boxTypes.active' : 'admin.boxTypes.inactive') | t }}
              </span>
            </div>
            <p class="text-sm font-medium text-muted-foreground mt-2 relative z-10">{{ 'admin.boxTypes.genderLabel' | t }} <span class="text-foreground">{{ getGenderLabel(bt.gender) }}</span></p>
            <p class="text-sm font-medium text-muted-foreground mt-2 relative z-10">{{ 'admin.boxTypes.basePrice' | t }} <span class="font-bold font-playfair text-primary text-base">{{ bt.base_price | formatPrice }}</span></p>
            <p class="text-sm font-medium text-muted-foreground mt-2 relative z-10">{{ 'admin.boxTypes.slotsCount' | t }} <span class="text-foreground font-semibold">{{ bt.slots_count }}</span></p>
            <div class="flex justify-end gap-3 mt-6 pt-5 border-t border-border relative z-10">
              <a [routerLink]="['/admin/box-types', bt.id, 'edit']" class="inline-flex items-center justify-center bg-muted text-foreground hover:bg-primary hover:text-white px-5 py-2 rounded-xl text-xs font-semibold transition-colors duration-300">{{ 'admin.boxTypes.edit' | t }}</a>
              @if (bt.is_active) {
                <button (click)="deactivate(bt)" class="inline-flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-5 py-2 rounded-xl text-xs font-semibold transition-colors duration-300">{{ 'admin.boxTypes.deactivate' | t }}</button>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class AdminBoxTypesComponent implements OnInit {
  private adminService = inject(AdminService);
  private t = inject(TranslationService);
  readonly currentLang = this.t.currentLang;
  boxTypes = signal<AdminBoxType[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.adminService.getBoxTypes().subscribe({ next: (data) => this.boxTypes.set(data) });
  }

  deactivate(bt: AdminBoxType): void {
    this.adminService.updateBoxType(bt.id, {
      name: bt.name,
      gender: bt.gender,
      base_price: bt.base_price,
      image_url: bt.image_url,
      is_active: false,
    }).subscribe({ next: () => this.load() });
  }

  getGenderLabel(gender: string): string {
    const key = gender === 'male' ? 'admin.genders.male' : gender === 'female' ? 'admin.genders.female' : 'admin.genders.unisex';
    return this.t.get(key);
  }
}
