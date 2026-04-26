import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Address } from '../../../../core/services/address.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-checkout-address-section',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-background rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-shadow duration-300 border border-border p-6 sm:p-8">
      <h2 class="font-playfair text-2xl font-semibold mb-6">{{ 'checkout.shippingAddress' | t }}</h2>

      @if (addresses.length > 0 && !showForm) {
        <div class="space-y-4 mb-6">
          @for (addr of addresses; track addr.id) {
            <div class="flex flex-col sm:flex-row items-start sm:items-center p-4 border rounded-xl hover:border-primary/50 text-start group focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2/50 hover:shadow-sm transition-all duration-300 ease-in-out gap-4"
                 [class.border-primary]="selectedId === addr.id"
                 [class.border-border]="selectedId !== addr.id"
                 [class.bg-primary/5]="selectedId === addr.id">
              <label class="flex items-start gap-4 cursor-pointer flex-1 w-full min-h-[44px]">
                <input type="radio" name="address" [value]="addr.id" [checked]="selectedId === addr.id"
                       (change)="onSelect(addr.id)" class="mt-1.5 w-4 h-4 text-primary focus:ring-primary border-border">
                <div class="flex-1">
                  <p class="font-semibold text-lg">{{ addr.label }}</p>
                  <p class="text-sm text-muted-foreground mt-1">
                    {{ currentLang === 'ar' ? addr.governorate_name : (addr.governorate_name_en || addr.governorate_name) }}
                    {{ addr.city ? ' - ' + addr.city : '' }}{{ addr.district ? ' - ' + addr.district : '' }} - {{ addr.street }}
                  </p>
                  <p class="text-sm text-muted-foreground">{{ 'checkout.building' | t }} {{ addr.building }} - {{ 'checkout.floor' | t }} {{ addr.floor }}</p>
                  @if (addr.apartment) {
                    <p class="text-sm text-muted-foreground">{{ 'checkout.apartment' | t }} {{ addr.apartment }}</p>
                  }
                  <p class="text-sm text-muted-foreground mt-1 font-medium">{{ addr.phone }}</p>
                </div>
              </label>
              <div class="flex gap-2 shrink-0 self-end sm:self-auto w-full sm:w-auto justify-end mt-2 sm:mt-0 pt-3 border-t sm:border-0 border-border sm:pt-0">
                <button (click)="onEdit(addr)" class="p-2 text-muted-foreground hover:text-primary transition-colors duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-muted" [title]="'checkout.editBtn' | t">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button (click)="onDelete(addr)" class="p-2 text-muted-foreground hover:text-destructive transition-colors duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-red-50" [title]="'checkout.deleteBtn' | t">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          }
        </div>
      }

      <ng-content></ng-content>

      @if (!showForm) {
        <button (click)="onAddNew()" class="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors duration-300 min-h-[44px] p-2 -ms-2 rounded-xl hover:bg-primary/5">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          {{ 'checkout.addNewAddress' | t }}
        </button>
      }
    </div>
  `
})
export class AddressSectionComponent {
  @Input() addresses: Address[] = [];
  @Input() selectedId: string | null = null;
  @Input() showForm = false;
  @Input() currentLang = 'ar';

  @Output() select = new EventEmitter<string>();
  @Output() edit = new EventEmitter<Address>();
  @Output() delete = new EventEmitter<Address>();
  @Output() addNew = new EventEmitter<void>();

  onSelect(id: string) { this.select.emit(id); }
  onEdit(addr: Address) { this.edit.emit(addr); }
  onDelete(addr: Address) { this.delete.emit(addr); }
  onAddNew() { this.addNew.emit(); }
}
