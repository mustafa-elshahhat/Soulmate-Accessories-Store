import { Component, inject, signal, OnInit, HostListener, ElementRef, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [RouterLink, FormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <div class="flex items-center gap-4 mb-8">
        <a routerLink="/admin/products" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-medium transition-colors min-h-[44px]">
          <span>&larr;</span> {{ 'admin.productForm.backToProducts' | t }}
        </a>
        <h1 class="font-playfair text-3xl font-bold text-foreground">{{ (isEdit() ? 'admin.productForm.editTitle' : 'admin.productForm.addTitle') | t }}</h1>
      </div>

      <div class="bg-background rounded-xl shadow-sm border border-border p-8 max-w-3xl relative overflow-hidden font-inter">
        <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div class="space-y-6 relative z-10">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-foreground mb-2">{{ 'admin.productForm.nameLabel' | t }}</label>
              <input [(ngModel)]="form.name" class="w-full h-14 border border-border rounded-xl px-4 text-foreground bg-background shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300">
            </div>
            <div>
              <label class="block text-sm font-semibold text-foreground mb-2">{{ 'admin.productForm.nameEnLabel' | t }}</label>
              <input [(ngModel)]="form.name_en" dir="ltr" class="w-full h-14 border border-border rounded-xl px-4 text-foreground bg-background shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300">
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-foreground mb-2">{{ 'admin.productForm.descriptionLabel' | t }}</label>
              <textarea [(ngModel)]="form.description" rows="4" class="w-full border border-border rounded-xl px-4 py-3 text-foreground bg-background shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 resize-none"></textarea>
            </div>
            <div>
              <label class="block text-sm font-semibold text-foreground mb-2">{{ 'admin.productForm.descriptionEnLabel' | t }}</label>
              <textarea [(ngModel)]="form.description_en" dir="ltr" rows="4" class="w-full border border-border rounded-xl px-4 py-3 text-foreground bg-background shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 resize-none"></textarea>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-foreground mb-2">{{ 'admin.productForm.priceLabel' | t }}</label>
              <input [(ngModel)]="form.price" type="number" min="0" class="w-full h-14 border border-border rounded-xl px-4 text-foreground bg-background shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 font-playfair font-bold text-lg">
            </div>
            <div>
              <label class="block text-sm font-semibold text-foreground mb-2">{{ 'admin.productForm.stockQuantityLabel' | t }}</label>
              <input [(ngModel)]="form.stock_quantity" type="number" min="0" class="w-full h-14 border border-border rounded-xl px-4 text-foreground bg-background shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 font-playfair font-bold text-lg">
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-foreground mb-2">{{ 'admin.productForm.categoryLabel' | t }}</label>
              <div class="relative" #categoryDropdownRef>
                <button type="button" (click)="toggleDropdown('category')"
                  class="w-full h-14 rounded-xl px-4 text-sm text-foreground outline-none transition-all duration-300 shadow-inner cursor-pointer flex items-center justify-between gap-2"
                  [class.bg-muted]="openDropdown !== 'category'"
                  [class.hover:bg-muted]="openDropdown !== 'category'"
                  [class.bg-background]="openDropdown === 'category'"
                  [class.ring-2]="openDropdown === 'category'"
                  [class.ring-primary/20]="openDropdown === 'category'"
                  [class.border-primary]="openDropdown === 'category'">
                  <span [class.text-foreground]="form.category" [class.text-muted-foreground]="!form.category">{{ getCategoryLabel() }}</span>
                  <svg aria-hidden="true" class="h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0" [class.rotate-180]="openDropdown === 'category'" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
                @if (openDropdown === 'category') {
                  <div class="absolute z-50 top-full mt-1 inset-x-0 bg-background rounded-xl shadow-lg border border-border overflow-hidden animate-[slideDown_150ms_ease-out]">
                    @for (opt of categoryOptions; track opt.value) {
                      <button type="button" (click)="selectCategory(opt.value)"
                        class="w-full px-4 py-3 text-sm text-start transition-colors duration-150 flex items-center justify-between"
                        [class.bg-primary/5]="form.category === opt.value"
                        [class.text-primary]="form.category === opt.value"
                        [class.font-medium]="form.category === opt.value"
                        [class.hover:bg-muted]="form.category !== opt.value">
                        {{ opt.label | t }}
                        @if (form.category === opt.value) {
                          <svg aria-hidden="true" class="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                        }
                      </button>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-foreground mb-2">{{ 'admin.productForm.genderLabel' | t }}</label>
              <div class="relative" #genderDropdownRef>
                <button type="button" (click)="toggleDropdown('gender')"
                  class="w-full h-14 rounded-xl px-4 text-sm text-foreground outline-none transition-all duration-300 shadow-inner cursor-pointer flex items-center justify-between gap-2"
                  [class.bg-muted]="openDropdown !== 'gender'"
                  [class.hover:bg-muted]="openDropdown !== 'gender'"
                  [class.bg-background]="openDropdown === 'gender'"
                  [class.ring-2]="openDropdown === 'gender'"
                  [class.ring-primary/20]="openDropdown === 'gender'"
                  [class.border-primary]="openDropdown === 'gender'">
                  <span class="text-foreground">{{ getGenderLabel() }}</span>
                  <svg aria-hidden="true" class="h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0" [class.rotate-180]="openDropdown === 'gender'" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
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
                        {{ opt.label | t }}
                        @if (form.gender === opt.value) {
                          <svg aria-hidden="true" class="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                        }
                      </button>
                    }
                  </div>
                }
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-4 sm:gap-6 min-h-[56px] mt-7 md:mt-0 py-2 md:py-0">
              <label class="flex items-center gap-3 cursor-pointer group">
                <div class="relative flex items-center justify-center">
                  <input type="checkbox" [(ngModel)]="form.is_standalone" class="peer sr-only">
                  <div class="w-6 h-6 border-2 border-border rounded peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                    <svg aria-hidden="true" class="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                </div>
                <span class="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{{ 'admin.productForm.standalone' | t }}</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer group">
                <div class="relative flex items-center justify-center">
                  <input type="checkbox" [(ngModel)]="form.is_builder_item" class="peer sr-only">
                  <div class="w-6 h-6 border-2 border-border rounded peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                    <svg aria-hidden="true" class="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                </div>
                <span class="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{{ 'admin.productForm.boxComponent' | t }}</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer group">
                <div class="relative flex items-center justify-center">
                  <input type="checkbox" [(ngModel)]="form.is_active" class="peer sr-only">
                  <div class="w-6 h-6 border-2 border-border rounded peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                    <svg aria-hidden="true" class="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                </div>
                <span class="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{{ 'admin.productForm.active' | t }}</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer group">
                <div class="relative flex items-center justify-center">
                  <input type="checkbox" [(ngModel)]="form.is_customizable" class="peer sr-only">
                  <div class="w-6 h-6 border-2 border-border rounded peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                    <svg aria-hidden="true" class="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                </div>
                <span class="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{{ 'admin.productForm.customizable' | t }}</span>
              </label>
            </div>
          </div>

          <!-- Image Upload -->
          <div class="pt-2 border-t border-border">
            <label class="block text-sm font-semibold text-foreground mb-4">{{ 'admin.productForm.productImage' | t }}</label>
            @if (form.image_url) {
              <div class="mb-4 relative inline-block group">
                <img [src]="form.image_url" alt="Preview" class="w-40 h-40 rounded-xl object-cover shadow-sm border border-border">
                <div class="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span class="text-white text-sm font-medium">{{ 'admin.productForm.currentImage' | t }}</span>
                </div>
              </div>
            }
            <div class="flex items-center gap-4">
              <label class="cursor-pointer inline-flex items-center justify-center h-12 px-6 border border-dashed border-border rounded-xl bg-muted/50 hover:bg-muted hover:border-primary text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-300">
                <span>{{ 'admin.productForm.selectNewImage' | t }}</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" (change)="onFileSelected($event)" class="hidden">
              </label>
              @if (uploading()) {
                <div class="flex items-center gap-2 text-sm text-primary font-medium">
                  <div class="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span>{{ 'admin.productForm.uploading' | t }}</span>
                </div>
              }
            </div>
          </div>

          <div class="flex items-center gap-4 pt-8 border-t border-border mt-2">
            <button (click)="save()" [disabled]="saving()"
                    class="h-14 px-10 bg-primary text-white rounded-xl font-semibold tracking-wide shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:bg-primary-dark transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none">
              {{ (saving() ? 'admin.productForm.saving' : (isEdit() ? 'admin.productForm.saveUpdate' : 'admin.productForm.addProduct')) | t }}
            </button>
            <a routerLink="/admin/products" class="h-14 px-8 border border-border text-foreground rounded-xl font-medium flex items-center justify-center hover:bg-muted hover:border-primary/50 transition-all duration-300">{{ 'admin.productForm.cancel' | t }}</a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProductFormComponent implements OnInit {
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEdit = signal(false);
  saving = signal(false);
  uploading = signal(false);
  productId = '';
  openDropdown = '';

  @ViewChild('categoryDropdownRef') categoryDropdownRef!: ElementRef;
  @ViewChild('genderDropdownRef') genderDropdownRef!: ElementRef;

  private t = inject(TranslationService);

  categoryOptions = [
    { value: 'watch', label: 'admin.categories.watch' },
    { value: 'wallet', label: 'admin.categories.wallet' },
    { value: 'mug', label: 'admin.categories.mug' },
    { value: 'necklace', label: 'admin.categories.necklace' },
    { value: 'ring', label: 'admin.categories.ring' },
  ];

  genderOptions = [
    { value: 'male', label: 'admin.genders.male' },
    { value: 'female', label: 'admin.genders.female' },
  ];

  getCategoryLabel(): string {
    const key = this.categoryOptions.find(o => o.value === this.form.category)?.label;
    return key ? this.t.get(key) : this.t.get('admin.productForm.selectCategory');
  }

  getGenderLabel(): string {
    const key = this.genderOptions.find(o => o.value === this.form.gender)?.label;
    return key ? this.t.get(key) : this.t.get('admin.productForm.selectGender');
  }

  toggleDropdown(name: string): void {
    this.openDropdown = this.openDropdown === name ? '' : name;
  }

  selectCategory(value: string): void {
    this.form.category = value;
    this.openDropdown = '';
  }

  selectGender(value: string): void {
    this.form.gender = value;
    this.openDropdown = '';
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    if (this.openDropdown === 'category' && this.categoryDropdownRef && !this.categoryDropdownRef.nativeElement.contains(event.target)) {
      this.openDropdown = '';
    }
    if (this.openDropdown === 'gender' && this.genderDropdownRef && !this.genderDropdownRef.nativeElement.contains(event.target)) {
      this.openDropdown = '';
    }
  }

  form = {
    name: '',
    name_en: '',
    description: '',
    description_en: '',
    price: 0,
    image_url: '',
    category: '',
    gender: 'male',
    is_standalone: false,
    is_builder_item: false,
    is_active: true,
    is_customizable: false,
    stock_quantity: 0,
  };

  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.productId = id;
      this.adminService.getProduct(id).subscribe({
        next: (p) => {
          this.form = {
            name: p.name,
            name_en: p.name_en ?? '',
            description: p.description,
            description_en: p.description_en ?? '',
            price: p.price,
            image_url: p.image_url,
            category: p.category,
            gender: p.gender,
            is_standalone: p.is_standalone,
            is_builder_item: p.is_builder_item,
            is_active: p.is_active,
            is_customizable: p.is_customizable ?? false,
            stock_quantity: p.stock_quantity ?? 0,
          };
          this.cdr.markForCheck();
        },
      });
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.adminService.uploadProductImage(file).subscribe({
      next: (url) => { this.form.image_url = url; this.uploading.set(false); },
      error: () => this.uploading.set(false),
    });
  }

  save(): void {
    this.saving.set(true);
    const obs = this.isEdit()
      ? this.adminService.updateProduct(this.productId, this.form)
      : this.adminService.createProduct(this.form);

    obs.subscribe({
      next: () => { this.saving.set(false); this.router.navigate(['/admin/products']); },
      error: () => this.saving.set(false),
    });
  }
}
