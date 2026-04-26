import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { AddressService, Address, CreateAddressDto } from '../../core/services/address.service';
import { OrderService } from '../../core/services/order.service';
import { GovernorateService, Governorate } from '../../core/services/governorate.service';
import { CouponService } from '../../core/services/coupon.service';
import { CouponValidationResult } from '../../core/models/coupon.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';
import { ToastService } from '../../shared/components/toast/toast.component';
import { AudioService } from '../../core/services/audio.service';
import { MapAddress } from '../../shared/components/map-picker/map-picker.component';
import { AddressSectionComponent } from './components/address-section/address-section.component';
import { AddressFormComponent } from './components/address-form/address-form.component';
import { OrderSummaryComponent } from './components/order-summary/order-summary.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    TranslatePipe,
    AddressSectionComponent,
    AddressFormComponent,
    OrderSummaryComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-[1280px] mx-auto px-4 py-8 md:py-16 font-inter text-foreground">
      <h1 class="font-playfair text-3xl md:text-5xl font-bold mb-10 text-center">{{ 'checkout.pageTitle' | t }}</h1>

      @if (cart.items().length === 0) {
        <div class="text-center py-24 bg-background rounded-xl shadow-sm border border-border max-w-2xl mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mx-auto text-border mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p class="text-muted-foreground text-xl mb-8 font-medium">{{ 'checkout.emptyCart' | t }}</p>
          <a routerLink="/products" class="inline-flex items-center justify-center bg-primary text-white h-14 px-10 rounded-xl hover:bg-primary-dark transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5">{{ 'checkout.startShopping' | t }}</a>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-6">
            <app-checkout-address-section
              [addresses]="addresses()"
              [selectedId]="selectedAddressId()"
              [showForm]="showAddressForm()"
              [currentLang]="currentLang()"
              (select)="selectedAddressId.set($event)"
              (edit)="editAddress($event)"
              (delete)="deleteAddress($event)"
              (addNew)="openNewAddressForm()">

              @if (showAddressForm()) {
                <app-checkout-address-form
                  [form]="addressForm"
                  [isEditing]="!!editingAddressId()"
                  [saving]="savingAddress()"
                  [canCancel]="addresses().length > 0"
                  [governorates]="governorates()"
                  [selectedGovId]="selectedGovernorateId()"
                  [currentLang]="currentLang()"
                  [mapLat]="mapLat()"
                  [mapLng]="mapLng()"
                  (cancel)="cancelAddressForm()"
                  (save)="saveAddress()"
                  (selectGov)="selectGovernorate($event)"
                  (locationChange)="onLocationChange($event)"
                  (addressDetected)="onAddressDetected($event)" />
              }
            </app-checkout-address-section>
          </div>

          <div>
            <app-checkout-order-summary
              [items]="cart.items()"
              [subtotal]="cart.totalPrice()"
              [shippingCost]="shippingCost()"
              [total]="orderTotal()"
              [appliedCoupon]="appliedCoupon()"
              [(couponCode)]="couponCode"
              [applyingCoupon]="applyingCoupon()"
              [loading]="loading()"
              [canPlaceOrder]="!!selectedAddressId()"
              [currentLang]="currentLang()"
              (applyCoupon)="applyCoupon()"
              (removeCoupon)="removeCoupon()"
              (placeOrder)="placeOrder()" />
          </div>
        </div>
      }
    </div>
  `,
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private addressService = inject(AddressService);
  private orderService = inject(OrderService);
  private governorateService = inject(GovernorateService);
  private couponService = inject(CouponService);
  private toast = inject(ToastService);
  private audio = inject(AudioService);
  private t = inject(TranslationService);
  readonly currentLang = this.t.currentLang;
  cart = inject(CartService);

  addresses = signal<Address[]>([]);
  governorates = signal<Governorate[]>([]);
  selectedAddressId = signal<string | null>(null);
  selectedGovernorateId = signal<string | null>(null);
  govDropdownOpen = signal(false);
  showAddressForm = signal(false);
  loading = signal(false);
  savingAddress = signal(false);
  editingAddressId = signal<string | null>(null);
  mapLat = signal(30.044);
  mapLng = signal(31.235);
  couponCode = '';
  applyingCoupon = signal(false);
  appliedCoupon = signal<CouponValidationResult | null>(null);

  selectedGovernorate = computed(() => {
    const id = this.selectedGovernorateId();
    return id ? this.governorates().find(g => g.id === id) ?? null : null;
  });

  shippingCost = computed(() => {
    if (this.showAddressForm()) {
      return this.selectedGovernorate()?.shipping_cost ?? 0;
    }
    const addrId = this.selectedAddressId();
    const addr = this.addresses().find(a => a.id === addrId);
    return addr?.shipping_cost ?? 0;
  });

  orderTotal = computed(() => {
    const subtotal = this.cart.totalPrice() + this.shippingCost();
    const discount = this.appliedCoupon()?.discount_amount ?? 0;
    return Math.max(0, subtotal - discount);
  });

  addressForm = this.fb.group({
    label: ['', Validators.required],
    city: [''],
    district: [''],
    street: ['', Validators.required],
    building: ['', Validators.required],
    floor: ['', Validators.required],
    apartment: [''],
    phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
  });

  ngOnInit(): void {
    this.governorateService.getAll().subscribe({
      next: (govs) => this.governorates.set(govs),
    });
    this.addressService.getAll().subscribe({
      next: (addrs) => {
        this.addresses.set(addrs);
        const defaultAddr = addrs.find(a => a.is_default) ?? addrs[0];
        if (defaultAddr) this.selectedAddressId.set(defaultAddr.id);
        if (addrs.length === 0) this.showAddressForm.set(true);
      },
    });
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    const t = e.target as HTMLElement;
    if (!t.closest('.relative')) this.govDropdownOpen.set(false);
  }

  selectGovernorate(gov: Governorate): void {
    this.selectedGovernorateId.set(gov.id);
    this.govDropdownOpen.set(false);
  }

  onLocationChange(pos: { lat: number; lng: number }): void {
    this.mapLat.set(pos.lat);
    this.mapLng.set(pos.lng);
  }

  onAddressDetected(addr: MapAddress): void {
    this.addressForm.patchValue({
      street: addr.street || this.addressForm.value.street,
      city: addr.city || this.addressForm.value.city,
      district: addr.district || this.addressForm.value.district,
      label: addr.label || this.addressForm.value.label,
    });
    if (addr.governorate) {
      const govName = addr.governorate.toLowerCase().trim();
      const normalize = (s: string) => s.toLowerCase().replace(/[-_\s]+/g, ' ').replace(/el /g, 'al ').trim();
      const normGov = normalize(govName);
      const match = this.governorates().find(g => {
        const en = normalize(g.name_en ?? '');
        const ar = g.name?.trim() ?? '';
        return en === normGov || ar === govName
          || normGov.includes(en) || en.includes(normGov)
          || govName.includes(ar);
      });
      if (match) {
        this.selectGovernorate(match);
      }
    }
  }

  openNewAddressForm(): void {
    this.editingAddressId.set(null);
    this.selectedGovernorateId.set(null);
    this.addressForm.reset();
    this.mapLat.set(30.044);
    this.mapLng.set(31.235);
    this.showAddressForm.set(true);
  }

  editAddress(addr: Address): void {
    this.editingAddressId.set(addr.id);
    this.selectedGovernorateId.set(addr.governorate_id);
    this.addressForm.patchValue({
      label: addr.label,
      city: addr.city || '',
      district: addr.district || '',
      street: addr.street,
      building: addr.building,
      floor: addr.floor,
      apartment: addr.apartment ?? '',
      phone: addr.phone,
    });
    this.mapLat.set(addr.lat || 30.044);
    this.mapLng.set(addr.lng || 31.235);
    this.showAddressForm.set(true);
  }

  deleteAddress(addr: Address): void {
    if (!confirm(this.t.get('checkout.confirmDeleteAddress'))) return;
    this.addressService.delete(addr.id).subscribe({
      next: () => {
        const updated = this.addresses().filter(a => a.id !== addr.id);
        this.addresses.set(updated);
        if (this.selectedAddressId() === addr.id) {
          this.selectedAddressId.set(updated[0]?.id ?? null);
        }
        this.toast.show(this.t.get('checkout.toast.addressDeleted'), 'success');
      },
    });
  }

  cancelAddressForm(): void {
    this.showAddressForm.set(false);
    this.editingAddressId.set(null);
    this.selectedGovernorateId.set(null);
    this.addressForm.reset();
  }

  saveAddress(): void {
    if (this.addressForm.invalid || !this.selectedGovernorateId()) return;

    this.savingAddress.set(true);
    const formVal = this.addressForm.value;
    const dto: CreateAddressDto = {
      label: formVal.label!,
      governorate_id: this.selectedGovernorateId()!,
      city: formVal.city || '',
      district: formVal.district || '',
      street: formVal.street!,
      building: formVal.building!,
      floor: formVal.floor!,
      apartment: formVal.apartment || undefined,
      phone: formVal.phone!,
      lat: this.mapLat(),
      lng: this.mapLng(),
      is_default: this.addresses().length === 0,
    };

    const editId = this.editingAddressId();
    if (editId) {
      this.addressService.update(editId, dto).subscribe({
        next: (addr) => {
          this.addresses.set(this.addresses().map(a => a.id === editId ? addr : a));
          this.showAddressForm.set(false);
          this.editingAddressId.set(null);
          this.addressForm.reset();
          this.savingAddress.set(false);
          this.toast.show(this.t.get('checkout.toast.addressUpdated'), 'success');
        },
        error: () => this.savingAddress.set(false),
      });
    } else {
      this.addressService.create(dto).subscribe({
        next: (addr) => {
          this.addresses.set([...this.addresses(), addr]);
          this.selectedAddressId.set(addr.id);
          this.showAddressForm.set(false);
          this.addressForm.reset();
          this.savingAddress.set(false);
        },
        error: () => this.savingAddress.set(false),
      });
    }
  }

  applyCoupon(): void {
    const code = this.couponCode.trim();
    if (!code || this.applyingCoupon()) return;

    this.applyingCoupon.set(true);
    this.couponService.validate(code, this.cart.totalPrice()).subscribe({
      next: (res) => {
        this.applyingCoupon.set(false);
        const result = res.data;
        if (result.valid) {
          this.appliedCoupon.set(result);
          this.couponCode = '';
          this.toast.show(this.t.get('checkout.coupon.applied'), 'success');
        } else {
          const errorKey = result.error_code === 'COUPON_EXPIRED' ? 'checkout.coupon.expired'
            : result.error_code === 'COUPON_MAX_USES' ? 'checkout.coupon.usageLimitReached'
            : result.error_code === 'MIN_ORDER_AMOUNT' ? 'checkout.coupon.minOrderNotMet'
            : 'checkout.coupon.invalid';
          this.toast.show(this.t.get(errorKey), 'error');
        }
      },
      error: () => {
        this.applyingCoupon.set(false);
        this.toast.show(this.t.get('checkout.coupon.invalid'), 'error');
      },
    });
  }

  removeCoupon(): void {
    this.appliedCoupon.set(null);
    this.couponCode = '';
  }

  placeOrder(): void {
    const addressId = this.selectedAddressId();
    if (!addressId || this.loading()) return;

    this.loading.set(true);
    const items = this.cart.items().map(item => ({
      product_id: item.product_id ?? null,
      box_type_id: item.box_type_id ?? null,
      quantity: item.quantity,
      custom_data_json: item.custom_data_json,
    }));

    const coupon = this.appliedCoupon();
    this.orderService.create({ address_id: addressId, items, coupon_code: coupon?.code }).subscribe({
      next: (order) => {
        this.cart.clear();
        this.audio.playOrderSuccessSound();
        this.router.navigate(['/checkout/confirmation'], { queryParams: { orderId: order.id } });
      },
      error: () => {
        this.loading.set(false);
        this.toast.show(this.t.get('checkout.toast.orderCreationError'), 'error');
      },
    });
  }
}
