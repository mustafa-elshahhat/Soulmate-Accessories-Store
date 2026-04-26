import { ChangeDetectionStrategy, Component, inject, signal, OnInit, PLATFORM_ID, DestroyRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PaymentService, PaymentInfo } from '../../../core/services/payment.service';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';
import { FormatPricePipe } from '../../../shared/pipes/format-price.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';
import { ToastService } from '../../../shared/components/toast/toast.component';

type PaymentMethod = 'vodafone_cash' | 'instapay';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [RouterLink, FormatPricePipe, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-2xl mx-auto px-4 py-12">
      <h1 class="font-playfair text-4xl font-bold text-foreground mb-8">{{ 'payment.pageTitle' | t }}</h1>

      @if (order()) {
        <!-- Amount to transfer -->
        <div class="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-6">
          <p class="text-sm text-muted-foreground mb-1">{{ 'payment.amountToTransfer' | t }}</p>
          <p class="text-3xl font-bold text-primary">{{ order()!.total_price + order()!.shipping_cost | formatPrice }}</p>
          <p class="text-xs text-muted-foreground mt-1">{{ 'payment.orderNumberPrefix' | t }} {{ order()!.order_number }}</p>
        </div>

        <!-- Transfer instructions -->
        <div class="bg-background rounded-xl border border-border p-6 mb-6">
          <h2 class="text-lg font-bold mb-4">{{ 'payment.paymentSteps' | t }}</h2>
          <ol class="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
            <li>{{ 'payment.step1' | t }}</li>
            <li>{{ 'payment.step2Prefix' | t }} (<span class="font-bold text-foreground">{{ order()!.total_price + order()!.shipping_cost | formatPrice }}</span>) {{ 'payment.step2Suffix' | t }}</li>
            <li>{{ 'payment.step3' | t }}</li>
            <li>{{ 'payment.step4' | t }}</li>
          </ol>
        </div>
      }

      @if (paymentInfo()) {
        <div class="bg-background rounded-xl border border-border p-6 mb-6">
          <h2 class="text-lg font-bold mb-4">{{ 'payment.transferNumbers' | t }}</h2>
          <div class="space-y-3">
            @if (paymentInfo()!.vodafone_cash_number) {
              <div class="flex justify-between items-center p-4 bg-red-50 rounded-xl">
                <div>
                  <span class="font-medium block">{{ 'payment.vodafoneCash' | t }}</span>
                  <span class="text-xs text-muted-foreground">Vodafone Cash</span>
                </div>
                <div class="text-end">
                  <span class="font-bold text-lg block" dir="ltr">{{ paymentInfo()!.vodafone_cash_number }}</span>
                  <button (click)="copyNumber(paymentInfo()!.vodafone_cash_number)" class="text-xs text-primary hover:underline">{{ 'payment.copyNumber' | t }}</button>
                </div>
              </div>
            }
            @if (paymentInfo()!.instapay_number) {
              <div class="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                <div>
                  <span class="font-medium block">{{ 'payment.instapay' | t }}</span>
                  <span class="text-xs text-muted-foreground">InstaPay</span>
                </div>
                <div class="text-end">
                  <span class="font-bold text-lg block" dir="ltr">{{ paymentInfo()!.instapay_number }}</span>
                  <button (click)="copyNumber(paymentInfo()!.instapay_number)" class="text-xs text-primary hover:underline">{{ 'payment.copyNumber' | t }}</button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      @if (fileError()) {
        <div class="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
          <p class="text-sm text-red-700">{{ fileError() }}</p>
        </div>
      }

      <div class="bg-background rounded-xl border border-border p-6">
        <h2 class="text-lg font-bold mb-4">{{ 'payment.uploadReceiptImage' | t }}</h2>

        <!-- Payment method -->
        <div class="mb-6">
          <label class="block text-sm font-medium mb-2">{{ 'payment.paymentMethod' | t }}</label>
          <div class="flex gap-4">
            <label class="flex items-center gap-2 p-3 border rounded-xl cursor-pointer hover:border-primary/50 text-start group focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition flex-1"
                   [class.border-primary]="selectedMethod() === 'vodafone_cash'"
                   [class.bg-primary/5]="selectedMethod() === 'vodafone_cash'">
              <input type="radio" name="method" value="vodafone_cash" [checked]="selectedMethod() === 'vodafone_cash'"
                     (change)="selectedMethod.set('vodafone_cash')">
              <span>{{ 'payment.vodafoneCash' | t }}</span>
            </label>
            <label class="flex items-center gap-2 p-3 border rounded-xl cursor-pointer hover:border-primary/50 text-start group focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition flex-1"
                   [class.border-primary]="selectedMethod() === 'instapay'"
                   [class.bg-primary/5]="selectedMethod() === 'instapay'">
              <input type="radio" name="method" value="instapay" [checked]="selectedMethod() === 'instapay'"
                     (change)="selectedMethod.set('instapay')">
              <span>{{ 'payment.instapay' | t }}</span>
            </label>
          </div>
        </div>

        <!-- File upload -->
        <div class="mb-6">
          <label class="block text-sm font-medium mb-2">{{ 'payment.receiptImage' | t }}</label>
          <div class="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 text-start group focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition"
               (click)="fileInput.click()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
            @if (previewUrl()) {
              <img [src]="previewUrl()" class="max-h-48 mx-auto mb-3 rounded-xl" alt="preview">
              <p class="text-sm text-muted-foreground">{{ selectedFile()?.name }}</p>
              <button (click)="clearFile($event)" class="text-xs text-destructive hover:underline mt-2">{{ 'payment.remove' | t }}</button>
            } @else {
              <svg class="w-12 h-12 text-border mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-muted-foreground mb-2">{{ 'payment.dragOrClick' | t }}</p>
              <p class="text-xs text-muted-foreground">{{ 'payment.fileTypeHint' | t }}</p>
            }
          </div>
          <input #fileInput type="file" accept="image/jpeg,image/png,image/webp" class="hidden" (change)="onFileSelect($event)">
        </div>

        <button (click)="upload()" [disabled]="!selectedFile() || !selectedMethod() || uploading()"
                class="w-full bg-primary text-white py-3 rounded-xl hover:bg-primary/90 transition font-medium disabled:opacity-50">
          @if (uploading()) { {{ 'payment.uploading' | t }} } @else { {{ 'payment.uploadBtn' | t }} }
        </button>
      </div>

      <div class="mt-6 text-center">
        <a [routerLink]="['/orders', orderId]" class="text-sm text-muted-foreground hover:text-foreground">← {{ 'payment.backToOrderDetails' | t }}</a>
      </div>
    </div>
  `,
})
export class PaymentComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private paymentService = inject(PaymentService);
  private orderService = inject(OrderService);
  private toast = inject(ToastService);
  private t = inject(TranslationService);
  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);

  orderId = '';
  order = signal<Order | null>(null);
  paymentInfo = signal<PaymentInfo | null>(null);
  selectedMethod = signal<PaymentMethod>('vodafone_cash');
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  uploading = signal(false);
  fileError = signal<string | null>(null);

  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly MAX_SIZE = 5 * 1024 * 1024;

  ngOnInit(): void {
    this.orderId = this.route.snapshot.queryParamMap.get('orderId') ?? '';
    if (!this.orderId) {
      this.router.navigate(['/orders']);
      return;
    }

    this.orderService.getById(this.orderId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (order) => this.order.set(order),
    });

    this.paymentService.getPaymentInfo().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (info) => this.paymentInfo.set(info),
    });
  }

  copyNumber(number: string): void {
    if (isPlatformBrowser(this.platformId)) {
      navigator.clipboard.writeText(number).then(() => {
        this.toast.show(this.t.get('payment.toast.numberCopied'), 'success');
      }).catch(() => {
        this.toast.show(this.t.get('payment.toast.numberCopied'), 'warning');
      });
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.setFile(file);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.setFile(file);
  }

  clearFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.fileError.set(null);
  }

  private setFile(file: File): void {
    this.fileError.set(null);

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      this.fileError.set(this.t.get('payment.toast.unsupportedFormat'));
      return;
    }
    if (file.size > this.MAX_SIZE) {
      this.fileError.set(this.t.get('payment.toast.fileTooLarge'));
      return;
    }

    this.selectedFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  upload(): void {
    const file = this.selectedFile();
    if (!file || !this.orderId || this.uploading()) return;

    this.uploading.set(true);
    this.paymentService.uploadReceipt(this.orderId, this.selectedMethod(), file).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.toast.show(this.t.get('payment.toast.uploadSuccess'), 'success');
        this.router.navigate(['/orders', this.orderId]);
      },
      error: () => {
        this.uploading.set(false);
        this.toast.show(this.t.get('payment.toast.uploadError'), 'error');
      },
    });
  }
}
