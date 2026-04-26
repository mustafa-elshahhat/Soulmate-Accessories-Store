import { Component, inject, signal, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { BoxReviewAdmin } from '../../../core/models/box-review.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';
import { ToastService } from '../../../shared/components/toast/toast.component';

@Component({
  selector: 'app-admin-box-reviews',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 md:p-8 font-inter">
      <h1 class="font-playfair text-2xl md:text-3xl font-bold text-foreground mb-8">{{ 'admin.boxReviews.title' | t }}</h1>

      @if (reviews().length === 0) {
        <div class="text-center py-16 text-muted-foreground">{{ 'admin.boxReviews.noReviews' | t }}</div>
      } @else {
        <div class="bg-background rounded-xl border border-border overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-muted/50">
                <tr>
                  <th class="text-start p-4 font-semibold">{{ 'admin.boxReviews.user' | t }}</th>
                  <th class="text-start p-4 font-semibold">{{ 'admin.boxReviews.boxType' | t }}</th>
                  <th class="text-start p-4 font-semibold">{{ 'admin.boxReviews.rating' | t }}</th>
                  <th class="text-start p-4 font-semibold">{{ 'admin.boxReviews.comment' | t }}</th>
                  <th class="text-start p-4 font-semibold">{{ 'admin.boxReviews.date' | t }}</th>
                  <th class="p-4"></th>
                </tr>
              </thead>
              <tbody>
                @for (review of reviews(); track review.id) {
                  <tr class="border-t border-border hover:bg-muted/30 transition-colors">
                    <td class="p-4 font-medium">{{ review.user_name }}</td>
                    <td class="p-4 text-muted-foreground">{{ review.box_type_name }}</td>
                    <td class="p-4">
                      <div class="flex items-center gap-0.5">
                        @for (s of [1,2,3,4,5]; track s) {
                          <svg class="w-4 h-4" [class.text-amber-400]="s <= review.rating" [class.text-border]="s > review.rating" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        }
                      </div>
                    </td>
                    <td class="p-4 text-muted-foreground max-w-xs truncate">{{ review.comment || '-' }}</td>
                    <td class="p-4 text-muted-foreground text-xs">{{ formatDate(review.created_at) }}</td>
                    <td class="p-4">
                      <button (click)="deleteReview(review)" class="text-red-500 hover:underline text-sm font-medium">{{ 'admin.boxReviews.delete' | t }}</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminBoxReviewsComponent implements OnInit {
  private admin = inject(AdminService);
  private toast = inject(ToastService);
  private t = inject(TranslationService);
  private cdr = inject(ChangeDetectorRef);

  reviews = signal<BoxReviewAdmin[]>([]);

  ngOnInit(): void {
    this.admin.getBoxReviews().subscribe({
      next: (data) => { this.reviews.set(data); this.cdr.markForCheck(); },
    });
  }

  deleteReview(review: BoxReviewAdmin): void {
    if (!confirm(this.t.get('admin.boxReviews.deleteConfirm'))) return;
    this.admin.deleteBoxReview(review.id).subscribe({
      next: () => {
        this.reviews.set(this.reviews().filter(r => r.id !== review.id));
        this.toast.show(this.t.get('admin.boxReviews.deleteSuccess'), 'success');
      },
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(this.t.currentLocale(), { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
