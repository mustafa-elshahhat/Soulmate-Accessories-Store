import { Component, inject, signal, OnInit, HostListener, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AdminService, AdminOrder } from '../../../core/services/admin.service';
import { TranslationService } from '../../../core/services/translation.service';
import { FormatPricePipe } from '../../../shared/pipes/format-price.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { STATUS_KEY_MAP, STATUS_COLOR } from '../../../shared/constants/order-status.constants';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, FormatPricePipe, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <h1 class="font-playfair text-3xl font-bold text-foreground mb-6">{{ 'admin.orders.title' | t }}</h1>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-4 mb-8">
        <input [(ngModel)]="searchQuery" (keyup.enter)="search()" [placeholder]="'admin.orders.searchPlaceholder' | t"
               class="flex-1 min-w-0 h-14 rounded-xl border border-border px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 font-inter">
        <div class="relative w-full sm:w-auto sm:min-w-[200px]" #statusDropdownRef>
          <button (click)="toggleStatusDropdown()"
            class="w-full h-14 rounded-xl px-4 text-sm text-foreground outline-none transition-all duration-300 shadow-inner cursor-pointer flex items-center justify-between gap-2 font-inter"
            [class.bg-muted]="!statusDropdownOpen()"
            [class.hover:bg-muted]="!statusDropdownOpen()"
            [class.bg-background]="statusDropdownOpen()"
            [class.ring-2]="statusDropdownOpen()"
            [class.ring-primary/20]="statusDropdownOpen()"
            [class.border-primary]="statusDropdownOpen()">
            <span [class.text-foreground]="statusFilter" [class.text-muted-foreground]="!statusFilter">{{ getStatusLabel(statusFilter) || ('admin.orders.allStatuses' | t) }}</span>
            <svg class="h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0" [class.rotate-180]="statusDropdownOpen()" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </button>
          @if (statusDropdownOpen()) {
            <div class="absolute z-50 top-full mt-1 inset-x-0 bg-background rounded-xl shadow-lg border border-border overflow-hidden animate-[slideDown_150ms_ease-out]">
              @for (opt of statusOptions; track opt.value) {
                <button (click)="selectStatus(opt.value)" class="w-full px-4 py-3 text-sm text-start transition-colors duration-150 flex items-center justify-between"
                  [class.bg-primary/5]="statusFilter === opt.value"
                  [class.text-primary]="statusFilter === opt.value"
                  [class.font-medium]="statusFilter === opt.value"
                  [class.hover:bg-muted]="statusFilter !== opt.value">
                  {{ opt.label }}
                  @if (statusFilter === opt.value) {
                    <svg class="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                  }
                </button>
              }
            </div>
          }
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="hidden md:block bg-background rounded-xl shadow-sm border border-border overflow-hidden font-inter">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-muted/80 border-b border-border">
              <tr>
                <th class="text-start px-6 py-4 font-semibold text-muted-foreground">{{ 'admin.orders.orderNumber' | t }}</th>
                <th class="text-start px-6 py-4 font-semibold text-muted-foreground">{{ 'admin.orders.customer' | t }}</th>
                <th class="text-start px-6 py-4 font-semibold text-muted-foreground">{{ 'admin.orders.amount' | t }}</th>
                <th class="text-start px-6 py-4 font-semibold text-muted-foreground">{{ 'admin.orders.status' | t }}</th>
                <th class="text-start px-6 py-4 font-semibold text-muted-foreground">{{ 'admin.orders.date' | t }}</th>
                <th class="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              @for (order of orders(); track order.id) {
                <tr class="border-b border-muted last:border-0 hover:bg-muted/50 transition-colors">
                  <td class="px-6 py-4 font-medium text-foreground">#{{ order.order_number }}</td>
                  <td class="px-6 py-4">
                    <div class="font-medium text-foreground">{{ order.customer_name }}</div>
                    <div class="text-xs text-muted-foreground mt-0.5">{{ order.customer_email }}</div>
                  </td>
                  <td class="px-6 py-4 font-playfair font-bold text-primary text-base">{{ order.total_price | formatPrice }}</td>
                  <td class="px-6 py-4">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold tracking-wide border" [class]="getStatusColor(order.status) + ' border-current'">
                      {{ getStatusLabel(order.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-muted-foreground">{{ order.created_at | date:'shortDate' }}</td>
                  <td class="px-6 py-4 text-end">
                    <a [routerLink]="['/admin/orders', order.id]" class="inline-flex items-center justify-center bg-muted text-foreground hover:bg-primary hover:text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors duration-300">{{ 'admin.orders.view' | t }}</a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile Cards -->
      <div class="md:hidden flex flex-col gap-4 font-inter">
        @for (order of orders(); track order.id) {
          <div class="bg-background rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-all duration-300">
            <div class="flex justify-between items-start mb-3">
              <div>
                <span class="font-bold text-foreground">#{{ order.order_number }}</span>
                <span class="text-xs text-muted-foreground block mt-1">{{ order.created_at | date:'shortDate' }}</span>
              </div>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide border shrink-0 text-center" [class]="getStatusColor(order.status) + ' border-current'">
                {{ getStatusLabel(order.status) }}
              </span>
            </div>
            
            <div class="mb-3">
              <div class="font-medium text-foreground text-sm">{{ order.customer_name }}</div>
              <div class="text-xs text-muted-foreground">{{ order.customer_email }}</div>
            </div>
            
            <div class="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
              <div class="font-playfair font-bold text-primary text-lg">{{ order.total_price | formatPrice }}</div>
              <a [routerLink]="['/admin/orders', order.id]" class="inline-flex items-center justify-center bg-muted text-foreground hover:bg-primary hover:text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors duration-300">{{ 'admin.orders.view' | t }}</a>
            </div>
          </div>
        }
      </div>

      @if (totalPages() > 1) {
        <div class="flex justify-center gap-2 mt-6">
          @for (p of pageNumbers(); track p) {
            <button (click)="goToPage(p)" class="w-8 h-8 rounded-xl text-sm"
                    [class.bg-primary]="p === page" [class.text-white]="p === page"
                    [class.border]="p !== page" [class.border-border]="p !== page">{{ p }}</button>
          }
        </div>
      }
    </div>
  `,
})
export class AdminOrdersComponent implements OnInit {
  private adminService = inject(AdminService);
  private t = inject(TranslationService);

  orders = signal<AdminOrder[]>([]);
  page = 1;
  totalPages = signal(1);
  searchQuery = '';
  statusFilter = '';
  statusDropdownOpen = signal(false);

  @ViewChild('statusDropdownRef') statusDropdownRef!: ElementRef;

  get statusOptions() {
    return [
      { value: '', label: this.t.get('admin.orders.allStatuses') },
      { value: 'pending', label: this.t.get('status.pending') },
      { value: 'payment_review', label: this.t.get('status.paymentReview') },
      { value: 'processing', label: this.t.get('status.processing') },
      { value: 'shipped', label: this.t.get('status.shipped') },
      { value: 'delivered', label: this.t.get('status.delivered') },
      { value: 'cancelled', label: this.t.get('status.cancelled') },
    ];
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  toggleStatusDropdown(): void {
    this.statusDropdownOpen.set(!this.statusDropdownOpen());
  }

  selectStatus(value: string): void {
    this.statusFilter = value;
    this.statusDropdownOpen.set(false);
    this.search();
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    if (this.statusDropdownOpen() && this.statusDropdownRef && !this.statusDropdownRef.nativeElement.contains(event.target)) {
      this.statusDropdownOpen.set(false);
    }
  }

  search(): void {
    this.page = 1;
    this.loadOrders();
  }

  goToPage(p: number): void {
    this.page = p;
    this.loadOrders();
  }

  loadOrders(): void {
    this.adminService.getOrders(this.page, 20, this.statusFilter || undefined, this.searchQuery || undefined).subscribe({
      next: (res) => {
        this.orders.set(res.data);
        this.totalPages.set(res.meta.total_pages);
      },
    });
  }

  pageNumbers(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  getStatusLabel(s: string): string { return this.t.get(STATUS_KEY_MAP[s] ?? s); }
  getStatusColor(s: string): string { return STATUS_COLOR[s] ?? 'bg-muted text-foreground'; }
}
