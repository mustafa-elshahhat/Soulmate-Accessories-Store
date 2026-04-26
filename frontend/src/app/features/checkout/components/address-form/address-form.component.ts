import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MapPickerComponent, MapAddress } from '../../../../shared/components/map-picker/map-picker.component';
import { Governorate } from '../../../../core/services/governorate.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { FormatPricePipe } from '../../../../shared/pipes/format-price.pipe';

@Component({
  selector: 'app-checkout-address-form',
  standalone: true,
  imports: [ReactiveFormsModule, MapPickerComponent, TranslatePipe, FormatPricePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6 bg-muted/50 p-6 sm:p-8 rounded-xl border border-border">
      <h3 class="font-playfair font-semibold text-xl mb-6">{{ isEditing ? ('checkout.editAddress' | t) : ('checkout.newAddress' | t) }}</h3>

      <app-map-picker
        [initialLat]="mapLat"
        [initialLng]="mapLng"
        (locationChange)="onLocChange($event)"
        (addressDetected)="onAddrDetect($event)" />

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-semibold mb-2 text-foreground">{{ 'checkout.addressLabel' | t }}</label>
          <input formControlName="label" class="w-full h-12 rounded-xl bg-background border border-border px-4 focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 shadow-sm" [placeholder]="'checkout.addressLabelPlaceholder' | t">
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2 text-foreground">{{ 'checkout.governorate' | t }}</label>
          <div class="relative">
            <button type="button" (click)="toggleGovDropdown()"
                    class="w-full h-12 rounded-xl bg-background border px-4 text-start flex items-center justify-between outline-none transition-all duration-300 shadow-sm"
                    [class.border-primary]="govOpen" [class.ring-2]="govOpen" [class.ring-primary/20]="govOpen"
                    [class.border-border]="!govOpen">
              <span [class.text-muted-foreground]="!selectedGov">{{ (currentLang === 'ar' ? selectedGov?.name : (selectedGov?.name_en || selectedGov?.name)) || ('checkout.selectGovernorate' | t) }}</span>
              <svg class="w-4 h-4 text-muted-foreground transition-transform duration-200" [class.rotate-180]="govOpen" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg>
            </button>
            @if (govOpen) {
              <div class="absolute z-50 mt-1 w-full bg-background rounded-xl border border-border shadow-xl max-h-60 overflow-y-auto animate-[slideDown_150ms_ease-out]">
                @for (gov of governorates; track gov.id) {
                  <button type="button" (click)="onSelectGov(gov)"
                          class="w-full px-4 py-3 text-start text-sm hover:bg-primary/5 transition-colors flex items-center justify-between"
                          [class.bg-primary/5]="selectedGovId === gov.id" [class.font-semibold]="selectedGovId === gov.id" [class.text-primary]="selectedGovId === gov.id">
                    <span>{{ currentLang === 'ar' ? gov.name : (gov.name_en || gov.name) }}</span>
                    <span class="text-xs text-muted-foreground font-playfair">{{ gov.shipping_cost | formatPrice }} {{ 'checkout.shippingSuffix' | t }}</span>
                  </button>
                }
              </div>
            }
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-semibold mb-2 text-foreground">{{ 'checkout.city' | t }}</label>
          <input formControlName="city" class="w-full h-12 rounded-xl bg-background border border-border px-4 focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 shadow-sm">
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2 text-foreground">{{ 'checkout.district' | t }}</label>
          <input formControlName="district" class="w-full h-12 rounded-xl bg-background border border-border px-4 focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 shadow-sm">
        </div>
      </div>
      <div>
        <label class="block text-sm font-semibold mb-2 text-foreground">{{ 'checkout.street' | t }}</label>
        <input formControlName="street" class="w-full h-12 rounded-xl bg-background border border-border px-4 focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 shadow-sm">
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <label class="block text-sm font-semibold mb-2 text-foreground">{{ 'checkout.buildingLabel' | t }}</label>
          <input formControlName="building" class="w-full h-12 rounded-xl bg-background border border-border px-4 focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 shadow-sm">
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2 text-foreground">{{ 'checkout.floorLabel' | t }}</label>
          <input formControlName="floor" class="w-full h-12 rounded-xl bg-background border border-border px-4 focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 shadow-sm">
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2 text-foreground">{{ 'checkout.apartmentLabel' | t }}</label>
          <input formControlName="apartment" class="w-full h-12 rounded-xl bg-background border border-border px-4 focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 shadow-sm">
        </div>
      </div>
      <div>
        <label class="block text-sm font-semibold mb-2 text-foreground">{{ 'checkout.phone' | t }}</label>
        <input formControlName="phone" class="w-full h-12 rounded-xl bg-background border border-border px-4 focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 shadow-sm" dir="ltr" placeholder="01XXXXXXXXX">
      </div>

      <div class="flex flex-col sm:flex-row gap-4 pt-4 mt-6 border-t border-border">
        <button type="submit" [disabled]="form.invalid || !selectedGovId || saving"
                class="flex-1 sm:flex-none bg-primary text-white h-14 px-8 rounded-xl font-semibold tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-primary-dark transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center">
          @if (saving) {
            <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin ms-2"></div>
            <span>{{ 'checkout.saving' | t }}</span>
          } @else if (isEditing) {
            {{ 'checkout.editAddressBtn' | t }}
          } @else {
            {{ 'checkout.saveAddressBtn' | t }}
          }
        </button>
        @if (canCancel) {
          <button type="button" (click)="onCancel()" class="flex-1 sm:flex-none h-14 px-8 bg-background border border-border rounded-xl hover:bg-muted transition-colors duration-300 font-semibold text-foreground">{{ 'checkout.cancelBtn' | t }}</button>
        }
      </div>
    </form>
  `
})
export class AddressFormComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() isEditing = false;
  @Input() saving = false;
  @Input() canCancel = false;
  @Input() governorates: Governorate[] = [];
  @Input() selectedGovId: string | null = null;
  @Input() currentLang = 'ar';
  @Input() mapLat = 30.044;
  @Input() mapLng = 31.235;

  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() selectGov = new EventEmitter<Governorate>();
  @Output() locationChange = new EventEmitter<{ lat: number; lng: number }>();
  @Output() addressDetected = new EventEmitter<MapAddress>();

  govOpen = false;

  get selectedGov() {
    return this.governorates.find(g => g.id === this.selectedGovId);
  }

  toggleGovDropdown() { this.govOpen = !this.govOpen; }
  onSelectGov(gov: Governorate) {
    this.selectGov.emit(gov);
    this.govOpen = false;
  }
  onLocChange(pos: { lat: number; lng: number }) { this.locationChange.emit(pos); }
  onAddrDetect(addr: MapAddress) { this.addressDetected.emit(addr); }
  onCancel() { this.cancel.emit(); }
  onSubmit() { this.save.emit(); }
}
