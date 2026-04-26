import { Component, inject, signal, OnInit, ViewChild, ElementRef, HostListener, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminBoxTypeDetail } from '../../../../core/services/admin.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../core/services/translation.service';

interface SlotForm {
  id?: string;
  slot_key: string;
  label_ar: string;
  label_en: string;
  is_required: boolean;
  sort_order: number;
  filter_gender: string | null;
  isNew?: boolean;
}

@Component({
  selector: 'app-box-type-form',
  standalone: true,
  imports: [RouterLink, FormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <div class="flex items-center gap-4 mb-8">
        <a routerLink="/admin/box-types" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-medium transition-colors min-h-[44px]">
          <span>&larr;</span> {{ 'admin.boxTypeForm.backToBoxTypes' | t }}
        </a>
        <h1 class="font-playfair text-3xl font-bold text-foreground">{{ (isEdit() ? 'admin.boxTypeForm.editTitle' : 'admin.boxTypeForm.addTitle') | t }}</h1>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Box Type Form -->
        <!-- Box Type Form -->
        <div class="bg-background rounded-xl shadow-sm border border-border p-8 relative font-inter">
          <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <h2 class="font-playfair font-bold text-xl mb-6 relative z-10 border-b border-border pb-4">{{ 'admin.boxTypeForm.boxData' | t }}</h2>
          
          <div class="space-y-6 relative z-10">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-semibold text-foreground mb-2">{{ 'admin.boxTypeForm.nameLabel' | t }}</label>
                <input [(ngModel)]="form.name" class="w-full h-14 border border-border rounded-xl px-4 text-foreground bg-background shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300">
              </div>
              <div>
                <label class="block text-sm font-semibold text-foreground mb-2">{{ 'admin.boxTypeForm.nameEnLabel' | t }}</label>
                <input [(ngModel)]="form.name_en" dir="ltr" class="w-full h-14 border border-border rounded-xl px-4 text-foreground bg-background shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300">
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-semibold text-foreground mb-2">{{ 'admin.boxTypeForm.genderLabel' | t }}</label>
                <div class="relative" #genderDropdownRef>
                  <button type="button" (click)="toggleDropdown('gender')"
                    class="w-full h-14 rounded-xl px-4 text-sm text-foreground outline-none transition-all duration-300 shadow-inner cursor-pointer flex items-center justify-between gap-2"
                    [class.bg-muted]="openDropdown !== 'gender'"
                    [class.hover:bg-muted]="openDropdown !== 'gender'"
                    [class.bg-background]="openDropdown === 'gender'"
                    [class.ring-2]="openDropdown === 'gender'"
                    [class.ring-primary/20]="openDropdown === 'gender'"
                    [class.border-primary]="openDropdown === 'gender'">
                    <span class="text-foreground">{{ getGenderLabel(form.gender) }}</span>
                    <svg class="h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0" [class.rotate-180]="openDropdown === 'gender'" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                  </button>
                  @if (openDropdown === 'gender') {
                    <div class="absolute z-50 top-full mt-1 inset-x-0 bg-background rounded-xl shadow-lg border border-border overflow-hidden animate-[slideDown_150ms_ease-out]">
                      @for (opt of genderOptions; track opt.value) {
                        <button type="button" (click)="selectGender(opt.value)"
                          class="w-full px-4 py-3 text-sm text-start transition-colors duration-150 flex items-center justify-between"
                          [class.bg-primary/5]="form.gender === opt.value"
                          [class.text-primary]="form.gender === opt.value"
                          [class.font-medium]="form.gender === opt.value"
                          [class.hover:bg-muted]="form.gender !== opt.value">
                          {{ opt.labelKey | t }}
                          @if (form.gender === opt.value) {
                            <svg class="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                          }
                        </button>
                      }
                    </div>
                  }
                </div>
              </div>
              <div>
                <label class="block text-sm font-semibold text-foreground mb-2">{{ 'admin.boxTypeForm.basePriceLabel' | t }}</label>
                <input [(ngModel)]="form.base_price" type="number" min="0" class="w-full h-14 border border-border rounded-xl px-4 text-foreground bg-background shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 font-playfair font-bold text-lg">
              </div>
            </div>
            
            <div class="pt-2 border-t border-border">
              <label class="block text-sm font-semibold text-foreground mb-4">{{ 'admin.boxTypeForm.boxImage' | t }}</label>
              @if (form.image_url) {
                <div class="mb-4 relative inline-block group">
                  <img [src]="form.image_url" alt="Preview" class="w-32 h-32 rounded-xl object-cover shadow-sm border border-border">
                </div>
              }
              <div class="flex items-center gap-4">
                <label class="cursor-pointer inline-flex items-center justify-center h-12 px-6 border border-dashed border-border rounded-xl bg-muted/50 hover:bg-muted hover:border-primary text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-300">
                  <span>{{ 'admin.boxTypeForm.selectImage' | t }}</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" (change)="onFileSelected($event)" class="hidden">
                </label>
              </div>
            </div>
            
            <label class="flex items-center gap-3 cursor-pointer group mt-4">
              <div class="relative flex items-center justify-center">
                <input type="checkbox" [(ngModel)]="form.is_active" class="peer sr-only">
                <div class="w-6 h-6 border-2 border-border rounded peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                  <svg class="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
              </div>
              <span class="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{{ 'admin.boxTypeForm.active' | t }}</span>
            </label>
            
            <div class="pt-6 border-t border-border">
              <button (click)="saveBoxType()" [disabled]="saving()" class="h-14 px-10 bg-primary text-white rounded-xl font-semibold tracking-wide shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:bg-primary-dark transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none w-full sm:w-auto">
                {{ saving() ? ('admin.boxTypeForm.saving' | t) : ((isEdit() ? 'admin.boxTypeForm.saveUpdate' : 'admin.boxTypeForm.createBox') | t) }}
              </button>
            </div>
          </div>
        </div>

        <!-- Slots Management (only in edit mode) -->
        <!-- Slots Management (only in edit mode) -->
        @if (isEdit()) {
          <div class="bg-background rounded-xl shadow-sm border border-border p-8 relative font-inter">
            <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 border-b border-border pb-4 relative z-10 gap-4">
              <h2 class="font-playfair font-bold text-xl">{{ 'admin.boxTypeForm.slotsTitle' | t }}</h2>
              <button (click)="addSlot()" class="inline-flex items-center justify-center bg-muted text-foreground hover:bg-primary hover:text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors duration-300">
                {{ 'admin.boxTypeForm.addSlot' | t }}
              </button>
            </div>
            
            <div class="space-y-5 relative z-10">
              @for (slot of slots(); track $index) {
                <div class="border border-border bg-muted/50 rounded-xl p-5 shadow-sm hover:border-border transition-colors">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label class="block text-xs font-semibold text-foreground mb-1.5">{{ 'admin.boxTypeForm.slotKeyLabel' | t }}</label>
                      <input [(ngModel)]="slot.slot_key" class="w-full h-11 border border-border rounded-xl px-3 text-sm bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all" placeholder="watch, perfume...">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-foreground mb-1.5">{{ 'admin.boxTypeForm.slotDisplayLabel' | t }}</label>
                      <input [(ngModel)]="slot.label_ar" class="w-full h-11 border border-border rounded-xl px-3 text-sm bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all">
                    </div>
                  </div>
                  <div class="mb-4">
                    <label class="block text-xs font-semibold text-foreground mb-1.5">{{ 'admin.boxTypeForm.slotDisplayLabelEn' | t }}</label>
                    <input [(ngModel)]="slot.label_en" dir="ltr" class="w-full h-11 border border-border rounded-xl px-3 text-sm bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all">
                  </div>
                  
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label class="block text-xs font-semibold text-foreground mb-1.5">{{ 'admin.boxTypeForm.sortOrder' | t }}</label>
                      <input [(ngModel)]="slot.sort_order" type="number" class="w-full h-11 border border-border rounded-xl px-3 text-sm bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-foreground mb-1.5">{{ 'admin.boxTypeForm.slotGenderFilter' | t }}</label>
                      <div class="relative slot-gender-dropdown" #slotGenderRef>
                        <button type="button" (click)="toggleSlotGender($index)"
                          class="w-full h-11 rounded-xl px-3 text-sm text-foreground outline-none transition-all duration-300 shadow-inner cursor-pointer flex items-center justify-between gap-2"
                          [class.bg-muted]="openSlotGender !== $index"
                          [class.hover:bg-muted]="openSlotGender !== $index"
                          [class.bg-background]="openSlotGender === $index"
                          [class.ring-2]="openSlotGender === $index"
                          [class.ring-primary/20]="openSlotGender === $index"
                          [class.border-primary]="openSlotGender === $index">
                          <span class="text-foreground">{{ getSlotGenderLabel(slot.filter_gender) }}</span>
                          <svg class="h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0" [class.rotate-180]="openSlotGender === $index" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                        </button>
                        @if (openSlotGender === $index) {
                          <div class="absolute z-50 top-full mt-1 inset-x-0 bg-background rounded-xl shadow-lg border border-border overflow-hidden animate-[slideDown_150ms_ease-out]">
                            @for (opt of slotGenderOptions; track opt.value) {
                              <button type="button" (click)="selectSlotGender(slot, opt.value)"
                                class="w-full px-3 py-2.5 text-sm text-start transition-colors duration-150 flex items-center justify-between"
                                [class.bg-primary/5]="slot.filter_gender === opt.value"
                                [class.text-primary]="slot.filter_gender === opt.value"
                                [class.font-medium]="slot.filter_gender === opt.value"
                                [class.hover:bg-muted]="slot.filter_gender !== opt.value">
                                {{ opt.labelKey | t }}
                                @if (slot.filter_gender === opt.value) {
                                  <svg class="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                                }
                              </button>
                            }
                          </div>
                        }
                      </div>
                    </div>
                    <div class="flex items-center mt-6">
                      <label class="flex items-center gap-2.5 cursor-pointer group">
                        <div class="relative flex items-center justify-center">
                          <input type="checkbox" [(ngModel)]="slot.is_required" class="peer sr-only">
                          <div class="w-5 h-5 border-2 border-border rounded peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                            <svg class="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                          </div>
                        </div>
                        <span class="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{{ 'admin.boxTypeForm.slotRequired' | t }}</span>
                      </label>
                    </div>
                  </div>
                  
                  <div class="flex justify-end gap-3 pt-4 border-t border-border">
                    <button (click)="saveSlot(slot)" class="inline-flex items-center justify-center bg-muted text-foreground hover:bg-green-600 hover:text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-300">
                      {{ 'admin.boxTypeForm.saveChanges' | t }}
                    </button>
                    @if (!slot.isNew) {
                      <button (click)="deleteSlot(slot)" class="inline-flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-300">
                        {{ 'admin.boxTypeForm.deleteSlot' | t }}
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class BoxTypeFormComponent implements OnInit {
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private t = inject(TranslationService);

  @ViewChild('genderDropdownRef') genderDropdownRef!: ElementRef;

  isEdit = signal(false);
  saving = signal(false);
  boxTypeId = '';
  slots = signal<SlotForm[]>([]);
  openDropdown = '';
  openSlotGender: number | null = null;

  genderOptions = [
    { value: 'male', labelKey: 'admin.genders.male' },
    { value: 'female', labelKey: 'admin.genders.female' },
    { value: 'unisex', labelKey: 'admin.genders.unisex' },
  ];

  slotGenderOptions: { value: string | null; labelKey: string }[] = [
    { value: null, labelKey: 'admin.boxTypeForm.slotGenderAll' },
    { value: 'male', labelKey: 'admin.boxTypeForm.slotGenderMaleOnly' },
    { value: 'female', labelKey: 'admin.boxTypeForm.slotGenderFemaleOnly' },
  ];

  form = { name: '', name_en: '', gender: 'unisex', base_price: 0, image_url: '', is_active: true };

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    if (this.openDropdown && this.genderDropdownRef && !this.genderDropdownRef.nativeElement.contains(e.target)) {
      this.openDropdown = '';
    }
    if (this.openSlotGender !== null) {
      const target = e.target as HTMLElement;
      if (!target.closest('.slot-gender-dropdown')) {
        this.openSlotGender = null;
      }
    }
  }

  toggleDropdown(name: string): void {
    this.openDropdown = this.openDropdown === name ? '' : name;
    this.openSlotGender = null;
  }

  selectGender(value: string): void {
    this.form.gender = value;
    this.openDropdown = '';
  }

  getGenderLabel(value: string): string {
    const key = this.genderOptions.find(o => o.value === value)?.labelKey;
    return key ? this.t.get(key) : value;
  }

  toggleSlotGender(index: number): void {
    this.openSlotGender = this.openSlotGender === index ? null : index;
    this.openDropdown = '';
  }

  selectSlotGender(slot: SlotForm, value: string | null): void {
    slot.filter_gender = value;
    this.openSlotGender = null;
  }

  getSlotGenderLabel(value: string | null): string {
    const key = this.slotGenderOptions.find(o => o.value === value)?.labelKey;
    return key ? this.t.get(key) : this.t.get('admin.boxTypeForm.slotGenderAll');
  }

  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.boxTypeId = id;
      this.adminService.getBoxType(id).subscribe({
        next: (bt) => {
          this.form = { name: bt.name, name_en: bt.name_en ?? '', gender: bt.gender, base_price: bt.base_price, image_url: bt.image_url, is_active: bt.is_active };
          this.slots.set(bt.slots.map(s => ({ ...s })));
          this.cdr.markForCheck();
        },
      });
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.adminService.uploadProductImage(file).subscribe({
      next: (url) => this.form.image_url = url,
    });
  }

  saveBoxType(): void {
    this.saving.set(true);
    const obs = this.isEdit()
      ? this.adminService.updateBoxType(this.boxTypeId, this.form)
      : this.adminService.createBoxType(this.form);

    obs.subscribe({
      next: () => { this.saving.set(false); if (!this.isEdit()) this.router.navigate(['/admin/box-types']); },
      error: () => this.saving.set(false),
    });
  }

  addSlot(): void {
    this.slots.update(s => [...s, { slot_key: '', label_ar: '', label_en: '', is_required: false, sort_order: s.length + 1, filter_gender: null, isNew: true }]);
  }

  saveSlot(slot: SlotForm): void {
    const data = { slot_key: slot.slot_key, label_ar: slot.label_ar, label_en: slot.label_en, is_required: slot.is_required, sort_order: slot.sort_order, filter_gender: slot.filter_gender ?? undefined };
    if (slot.id && !slot.isNew) {
      this.adminService.updateSlot(this.boxTypeId, slot.id, data).subscribe({});
    } else {
      this.adminService.createSlot(this.boxTypeId, data).subscribe({
        next: () => this.reloadSlots(),
      });
    }
  }

  deleteSlot(slot: SlotForm): void {
    if (!slot.id) return;
    this.adminService.deleteSlot(this.boxTypeId, slot.id).subscribe({
      next: () => this.reloadSlots(),
    });
  }

  private reloadSlots(): void {
    this.adminService.getBoxType(this.boxTypeId).subscribe({
      next: (bt) => this.slots.set(bt.slots.map(s => ({ ...s }))),
    });
  }
}
