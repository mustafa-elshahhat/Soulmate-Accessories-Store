import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '../../pipes/translate.pipe';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, TranslatePipe],
  template: `
    <div class="p-6">
      <h2 class="font-playfair text-xl font-bold text-foreground mb-3">{{ data.title }}</h2>
      <p class="text-muted-foreground text-sm mb-6">{{ data.message }}</p>
      <div class="flex items-center justify-end gap-3">
        <button (click)="dialogRef.close(false)"
                class="px-6 py-2.5 rounded-xl text-sm font-semibold border border-border text-muted-foreground hover:bg-muted transition-colors">
          {{ data.cancelText || ('common.cancel' | t) }}
        </button>
        <button (click)="dialogRef.close(true)"
                class="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
                [class.bg-destructive]="data.destructive"
                [class.hover:bg-red-700]="data.destructive"
                [class.bg-primary]="!data.destructive"
                [class.hover:bg-primary-dark]="!data.destructive">
          {{ data.confirmText || ('common.confirm' | t) }}
        </button>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  data: ConfirmDialogData = inject(MAT_DIALOG_DATA);
}
