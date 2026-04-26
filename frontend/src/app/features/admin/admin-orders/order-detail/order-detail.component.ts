import { Component, inject, signal, OnInit, HostListener, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminOrderDetail } from '../../../../core/services/admin.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { FormatPricePipe } from '../../../../shared/pipes/format-price.pipe';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { STATUS_KEY_MAP, STATUS_COLOR } from '../../../../shared/constants/order-status.constants';

const PAYMENT_STATUS_MAP: Record<string, string> = { pending: 'admin.paymentStatus.pending', verified: 'admin.paymentStatus.verified', rejected: 'admin.paymentStatus.rejected' };

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule, FormatPricePipe, TranslatePipe, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (order(); as o) {
      <div>
        <div class="flex items-center gap-4 mb-8">
          <a routerLink="/admin/orders" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-medium transition-colors min-h-[44px]">
            <span>&larr;</span> {{ 'admin.orderDetail.orders' | t }}
          </a>
          <h1 class="font-playfair text-3xl font-bold text-foreground">{{ 'admin.orderDetail.orderTitle' | t }} #{{ o.order_number }}</h1>
          <span class="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border" [class]="getStatusColor(o.status) + ' border-current'">
            {{ getStatusLabel(o.status) }}
          </span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Items -->
            <div class="bg-background rounded-xl shadow-sm border border-border p-8 relative overflow-hidden group hover:shadow-md transition-shadow duration-300 font-inter">
              <div class="absolute top-0 end-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <h2 class="font-playfair font-bold text-xl mb-6 border-b border-muted pb-4 relative z-10">{{ 'admin.orderDetail.products' | t }}</h2>
              <div class="space-y-5 relative z-10">
                @for (item of o.items; track item.id) {
                  <div class="border-b border-muted last:border-0 pb-5 last:pb-0">
                    <!-- Item header -->
                    <div class="flex justify-between items-start gap-4">
                      <div class="flex items-center gap-3 min-w-0">
                        @if (item.product_image_url) {
                          <img [ngSrc]="item.product_image_url" [alt]="currentLang() === 'ar' ? item.product_name : (item.product_name_en || item.product_name)" class="w-14 h-14 rounded-lg object-cover border border-border flex-shrink-0" width="56" height="56" />
                        } @else {
                          <div class="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                          </div>
                        }
                        <div class="min-w-0">
                          <p class="font-semibold text-foreground truncate">{{ (currentLang() === 'ar' ? item.product_name : (item.product_name_en || item.product_name)) || (currentLang() === 'ar' ? item.box_type_name : (item.box_type_name_en || item.box_type_name)) || (item.product_id ? ('admin.orderDetail.product' | t) : ('admin.orderDetail.customBox' | t)) }}</p>
                          <p class="text-xs text-muted-foreground mt-0.5">
                            {{ item.product_id ? ('admin.orderDetail.product' | t) : ('admin.orderDetail.customBox' | t) }}
                            <span class="mx-1">·</span>
                            {{ 'admin.orderDetail.quantity' | t }}: {{ item.quantity }}
                          </p>
                        </div>
                      </div>
                      <span class="font-playfair font-bold text-lg text-primary whitespace-nowrap">{{ item.unit_price * item.quantity | formatPrice }}</span>
                    </div>

                    <!-- Box: Slot Products -->
                    @if (item.slot_products && item.slot_products.length > 0) {
                      <div class="mt-3 me-[4.25rem] space-y-2">
                        <p class="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                          {{ 'admin.orderDetail.boxContents' | t }}
                        </p>
                        @for (sp of item.slot_products; track sp.product_name) {
                          <div class="flex items-center gap-2.5 bg-muted/50 rounded-lg p-2 border border-border/50">
                            <img [ngSrc]="sp.product_image_url" [alt]="currentLang() === 'ar' ? sp.product_name : (sp.product_name_en || sp.product_name)" class="w-9 h-9 rounded-md object-cover border border-border flex-shrink-0" width="36" height="36" />
                            <div class="flex-1 min-w-0">
                              <p class="text-sm font-medium text-foreground truncate">{{ currentLang() === 'ar' ? sp.product_name : (sp.product_name_en || sp.product_name) }}</p>
                              <div class="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{{ currentLang() === 'ar' ? sp.slot_label : (sp.slot_label_en || sp.slot_label) }}</span>
                                <span>·</span>
                                <span>{{ sp.product_price | formatPrice }}</span>
                                @if (sp.is_customized) {
                                  <span class="inline-flex items-center gap-0.5 text-primary font-semibold">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    {{ 'admin.orderDetail.customization' | t }} +{{ sp.customization_price | formatPrice }}
                                  </span>
                                }
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                    }

                    <!-- Customization Details (names/date/message) -->
                    @if (parseCustomData(item.custom_data_json); as cd) {
                      @if (cd.hasData) {
                        <div class="mt-3 me-[4.25rem] bg-primary/[0.03] border border-primary/10 rounded-lg p-3 space-y-2">
                          <p class="text-xs font-semibold text-primary flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            {{ 'admin.orderDetail.customizationData' | t }}
                          </p>
                          @if (cd.name1 || cd.name2 || cd.name) {
                            <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                              @if (cd.name) {
                                <span class="text-foreground"><span class="text-muted-foreground">{{ 'admin.orderDetail.name' | t }}:</span> {{ cd.name }}</span>
                              }
                              @if (cd.name1) {
                                <span class="text-foreground"><span class="text-muted-foreground">{{ 'admin.orderDetail.firstName' | t }}:</span> {{ cd.name1 }}</span>
                              }
                              @if (cd.name2) {
                                <span class="text-foreground"><span class="text-muted-foreground">{{ 'admin.orderDetail.secondName' | t }}:</span> {{ cd.name2 }}</span>
                              }
                            </div>
                          }
                          @if (cd.date) {
                            <p class="text-sm text-foreground"><span class="text-muted-foreground">{{ 'admin.orderDetail.date' | t }}:</span> {{ cd.date }}</p>
                          }
                          @if (cd.message) {
                            <p class="text-sm text-foreground"><span class="text-muted-foreground">{{ 'admin.orderDetail.message' | t }}:</span> "{{ cd.message }}"</p>
                          }
                        </div>
                      }
                    }
                  </div>
                }
              </div>
              <div class="border-t border-muted mt-6 pt-5 space-y-3 text-sm relative z-10">
                <div class="flex justify-between text-muted-foreground font-medium"><span>{{ 'admin.orderDetail.shipping' | t }}</span><span class="text-foreground">{{ o.shipping_cost | formatPrice }}</span></div>
                <div class="flex justify-between font-bold text-lg items-end mt-2"><span class="text-foreground">{{ 'admin.orderDetail.total' | t }}</span><span class="font-playfair text-2xl text-primary">{{ o.total_price | formatPrice }}</span></div>
              </div>
            </div>

            <!-- Payments -->
            <div class="bg-background rounded-xl shadow-sm border border-border p-8 relative overflow-hidden group hover:shadow-md transition-shadow duration-300 font-inter">
              <div class="absolute top-0 end-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <h2 class="font-playfair font-bold text-xl mb-6 border-b border-muted pb-4 relative z-10">{{ 'admin.orderDetail.payments' | t }}</h2>
              <div class="relative z-10">
                @for (pay of o.payments; track pay.id) {
                  <div class="border border-border rounded-xl p-5 mb-4 last:mb-0 shadow-sm bg-muted/50">
                    <div class="flex justify-between items-center mb-3">
                      <div>
                        <span class="font-semibold text-foreground tracking-wide text-base">{{ pay.method }}</span>
                        <span class="text-xs font-medium text-muted-foreground me-3">{{ 'admin.orderDetail.attempt' | t }} {{ pay.attempt_number }}</span>
                      </div>
                      <span class="text-xs px-3 py-1.5 rounded-full font-semibold tracking-wide border"
                            [class.bg-yellow-50]="pay.status === 'pending'" [class.text-yellow-700]="pay.status === 'pending'" [class.border-yellow-200]="pay.status === 'pending'"
                            [class.bg-green-50]="pay.status === 'verified'" [class.text-green-700]="pay.status === 'verified'" [class.border-green-200]="pay.status === 'verified'"
                            [class.bg-red-50]="pay.status === 'rejected'" [class.text-red-700]="pay.status === 'rejected'" [class.border-red-200]="pay.status === 'rejected'">
                        {{ getPaymentStatus(pay.status) | t }}
                      </span>
                    </div>
                    @if (pay.screenshot_url) {
                      <a [href]="pay.screenshot_url" target="_blank" rel="noopener noreferrer"
                         class="inline-flex items-center text-primary font-medium hover:underline text-sm mb-2 hover:opacity-80 transition-opacity">{{ 'admin.orderDetail.viewReceipt' | t }}</a>
                    }
                    @if (pay.admin_note) {
                      <p class="text-sm font-medium text-muted-foreground mt-2 bg-background p-3 rounded-xl border border-border">{{ 'admin.orderDetail.adminNote' | t }}: <span class="text-foreground">{{ pay.admin_note }}</span></p>
                    }
                    @if (pay.status === 'pending') {
                      <div class="flex gap-3 mt-4 pt-4 border-t border-border/60">
                        <button (click)="verifyPayment(pay.id, 'verify')" class="flex-1 bg-green-50 text-green-700 border border-green-200 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-600 hover:text-white transition-colors duration-300">{{ 'admin.orderDetail.acceptPayment' | t }}</button>
                        <button (click)="showRejectModal.set(pay.id)" class="flex-1 bg-red-50 text-red-700 border border-red-200 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 hover:text-white transition-colors duration-300">{{ 'admin.orderDetail.rejectPayment' | t }}</button>
                      </div>
                    }
                  </div>
                }
                @if (o.payments.length === 0) {
                  <p class="text-muted-foreground text-sm font-medium text-center py-4 bg-muted rounded-xl border border-border">{{ 'admin.orderDetail.noPayments' | t }}</p>
                }
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6 font-inter">
            <!-- Update Status -->
            <div class="bg-background rounded-xl shadow-sm border border-border p-8 relative group hover:shadow-md transition-shadow duration-300">
              <div class="absolute top-0 end-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <h2 class="font-playfair font-bold text-xl mb-6 relative z-10">{{ 'admin.orderDetail.updateStatus' | t }}</h2>
              <div class="relative z-10">
                <div class="relative mb-4" #statusDropdownRef>
                  <button type="button" (click)="toggleStatusDropdown()"
                    class="w-full h-14 rounded-xl px-4 text-sm text-foreground outline-none transition-all duration-300 shadow-inner cursor-pointer flex items-center justify-between gap-2 font-medium"
                    [class.bg-muted]="!statusDropdownOpen()"
                    [class.hover:bg-muted]="!statusDropdownOpen()"
                    [class.bg-background]="statusDropdownOpen()"
                    [class.ring-2]="statusDropdownOpen()"
                    [class.ring-primary/20]="statusDropdownOpen()"
                    [class.border-primary]="statusDropdownOpen()">
                    <span class="text-foreground">{{ getStatusLabel(newStatus) }}</span>
                    <svg class="h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0" [class.rotate-180]="statusDropdownOpen()" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                  </button>
                  @if (statusDropdownOpen()) {
                    <div class="absolute z-50 top-full mt-1 inset-x-0 bg-background rounded-xl shadow-lg border border-border overflow-hidden animate-[slideDown_150ms_ease-out]">
                      @for (opt of statusOptions; track opt.value) {
                        <button type="button" (click)="selectStatus(opt.value)" class="w-full px-4 py-3 text-sm text-start transition-colors duration-150 flex items-center justify-between"
                          [class.bg-primary/5]="newStatus === opt.value"
                          [class.text-primary]="newStatus === opt.value"
                          [class.font-medium]="newStatus === opt.value"
                          [class.hover:bg-muted]="newStatus !== opt.value">
                          {{ opt.label | t }}
                          @if (newStatus === opt.value) {
                            <svg class="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                          }
                        </button>
                      }
                    </div>
                  }
                </div>
                <textarea [(ngModel)]="adminNote" [placeholder]="'admin.orderDetail.adminNotePlaceholder' | t" rows="3"
                          class="w-full rounded-xl border border-border px-4 py-3 mb-4 text-sm font-medium shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 resize-none"></textarea>
                <button (click)="updateStatus()" class="w-full h-14 flex items-center justify-center bg-primary text-white rounded-xl font-semibold tracking-wide shadow hover:shadow-lg hover:-translate-y-0.5 hover:bg-primary-dark transition-all duration-300">{{ 'admin.orderDetail.saveUpdate' | t }}</button>
              </div>
            </div>

            <!-- Customer -->
            <div class="bg-background rounded-xl shadow-sm border border-border p-8 relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
              <div class="absolute top-0 end-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <h2 class="font-playfair font-bold text-xl mb-5 relative z-10 border-b border-muted pb-3">{{ 'admin.orderDetail.customer' | t }}</h2>
              <div class="space-y-2 relative z-10">
                <p class="font-semibold text-foreground text-lg">{{ o.customer.name }}</p>
                <p class="text-sm font-medium text-muted-foreground" dir="ltr">{{ o.customer.email }}</p>
                <p class="text-sm font-medium text-muted-foreground" dir="ltr">{{ o.customer.phone }}</p>
              </div>
            </div>

            <!-- Address -->
            @if (o.address) {
              <div class="bg-background rounded-xl shadow-sm border border-border p-8 relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
                <div class="absolute top-0 end-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <h2 class="font-playfair font-bold text-xl mb-5 relative z-10 border-b border-muted pb-3">{{ 'admin.orderDetail.address' | t }}</h2>
                <div class="space-y-2 relative z-10">
                  <p class="font-semibold text-foreground">{{ o.address.label }}</p>
                  <p class="text-sm font-medium text-muted-foreground leading-relaxed">{{ currentLang() === 'ar' ? o.address.governorate_name : (o.address.governorate_name_en || o.address.governorate_name) }}{{ o.address.city ? ' - ' + o.address.city : '' }}{{ o.address.district ? ' - ' + o.address.district : '' }}</p>
                  <p class="text-sm font-medium text-muted-foreground leading-relaxed">{{ o.address.street }}</p>
                  <p class="text-sm font-medium text-muted-foreground leading-relaxed">{{ 'admin.orderDetail.building' | t }} {{ o.address.building }}، {{ 'admin.orderDetail.floor' | t }} {{ o.address.floor }}</p>
                  <p class="text-sm font-medium text-muted-foreground" dir="ltr">{{ o.address.phone }}</p>
                  @if (o.address.lat && o.address.lng) {
                    <a [href]="'https://www.google.com/maps?q=' + o.address.lat + ',' + o.address.lng"
                       target="_blank" rel="noopener noreferrer"
                       class="inline-flex items-center gap-2 mt-3 px-4 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-sm font-semibold transition-colors duration-200">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
                      {{ 'admin.orderDetail.viewOnMap' | t }}
                    </a>
                  }
                </div>
              </div>
            }

            <div class="bg-muted rounded-xl p-6 border border-border text-sm font-medium text-muted-foreground space-y-2 shadow-sm">
              <p>{{ 'admin.orderDetail.orderDate' | t }}: <span class="text-foreground tracking-wide">{{ o.created_at | date:'medium' }}</span></p>
              @if (o.admin_note) {
                <p class="pt-2 border-t border-border/60 mt-2">{{ 'admin.orderDetail.adminNoteLabel' | t }}: <span class="text-foreground text-sm font-semibold">{{ o.admin_note }}</span></p>
              }
              @if (o.cancel_reason) {
                <p class="pt-2 border-t border-red-200/50 mt-2 text-red-600 font-semibold bg-red-50/50 -mx-6 -mb-6 p-6 rounded-b-2xl">{{ 'admin.orderDetail.cancelReason' | t }}: {{ o.cancel_reason }}</p>
              }
            </div>
          </div>
        </div>

        <!-- Reject Modal -->
        @if (showRejectModal()) {
          <div class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" (click)="showRejectModal.set(null)">
            <div class="bg-background rounded-xl p-6 w-full max-w-md" (click)="$event.stopPropagation()">
              <h3 class="font-bold text-lg mb-4">{{ 'admin.orderDetail.rejectReason' | t }}</h3>
              <textarea [(ngModel)]="rejectNote" [placeholder]="'admin.orderDetail.rejectReasonPlaceholder' | t" rows="3"
                        class="w-full border rounded-xl px-3 py-2 mb-4"></textarea>
              <div class="flex gap-3 justify-end">
                <button (click)="showRejectModal.set(null)" class="px-4 py-2 border rounded-xl">{{ 'admin.orderDetail.cancel' | t }}</button>
                <button (click)="confirmReject()" class="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700">{{ 'admin.orderDetail.confirmReject' | t }}</button>
              </div>
            </div>
          </div>
        }
      </div>
    }
  `,
})
export class OrderDetailComponent implements OnInit {
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);
  private t = inject(TranslationService);
  readonly currentLang = this.t.currentLang;

  order = signal<AdminOrderDetail | null>(null);
  showRejectModal = signal<string | null>(null);
  statusDropdownOpen = signal(false);
  newStatus = '';
  adminNote = '';
  rejectNote = '';

  @ViewChild('statusDropdownRef') statusDropdownRef!: ElementRef;

  statusOptions = [
    { value: 'pending', label: 'status.pending' },
    { value: 'payment_review', label: 'status.paymentReview' },
    { value: 'processing', label: 'status.processing' },
    { value: 'shipped', label: 'status.shipped' },
    { value: 'delivered', label: 'status.delivered' },
    { value: 'cancelled', label: 'status.cancelled' },
  ];

  toggleStatusDropdown(): void {
    this.statusDropdownOpen.set(!this.statusDropdownOpen());
  }

  selectStatus(value: string): void {
    this.newStatus = value;
    this.statusDropdownOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    if (this.statusDropdownOpen() && this.statusDropdownRef && !this.statusDropdownRef.nativeElement.contains(event.target)) {
      this.statusDropdownOpen.set(false);
    }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.adminService.getOrder(id).subscribe({
      next: (o) => {
        this.order.set(o);
        this.newStatus = o.status;
      },
    });
  }

  updateStatus(): void {
    const o = this.order();
    if (!o) return;
    this.adminService.updateOrderStatus(o.id, this.newStatus, this.adminNote || undefined).subscribe({
      next: () => {
        this.order.set({ ...o, status: this.newStatus, admin_note: this.adminNote || o.admin_note });
        this.adminNote = '';
      },
    });
  }

  verifyPayment(paymentId: string, action: 'verify' | 'reject'): void {
    this.adminService.verifyPayment(paymentId, action).subscribe({ next: () => this.reloadOrder() });
  }

  confirmReject(): void {
    const paymentId = this.showRejectModal();
    if (!paymentId) return;
    this.adminService.verifyPayment(paymentId, 'reject', this.rejectNote || undefined).subscribe({
      next: () => { this.showRejectModal.set(null); this.rejectNote = ''; this.reloadOrder(); },
    });
  }

  private reloadOrder(): void {
    const o = this.order();
    if (!o) return;
    this.adminService.getOrder(o.id).subscribe({ next: (data) => this.order.set(data) });
  }

  getStatusLabel(s: string): string { return this.t.get(STATUS_KEY_MAP[s] ?? s); }
  getStatusColor(s: string): string { return STATUS_COLOR[s] ?? 'bg-muted text-foreground'; }
  getPaymentStatus(s: string): string { return PAYMENT_STATUS_MAP[s] ?? s; }

  parseCustomData(json: string): { hasData: boolean; name?: string; name1?: string; name2?: string; date?: string; message?: string } {
    try {
      const data = JSON.parse(json || '{}');
      // Box order: customization is nested under "customization" key
      const c = data.customization ?? data;
      const name = c.name || '';
      const name1 = c.name1 || '';
      const name2 = c.name2 || '';
      const date = c.date || '';
      const message = c.message || '';
      const hasData = !!(name || name1 || name2 || date || message);
      return { hasData, name: name || undefined, name1: name1 || undefined, name2: name2 || undefined, date: date || undefined, message: message || undefined };
    } catch {
      return { hasData: false };
    }
  }
}
