import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-center" [class.py-12]="fullPage" role="status">
      <div class="animate-spin rounded-full border-2 border-primary border-t-transparent"
           [class.h-8]="size === 'md'" [class.w-8]="size === 'md'"
           [class.h-5]="size === 'sm'" [class.w-5]="size === 'sm'"
           [class.h-12]="size === 'lg'" [class.w-12]="size === 'lg'">
      </div>
      <span class="sr-only">{{ 'common.loading' | t }}</span>
    </div>
  `,
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() fullPage = false;
}
