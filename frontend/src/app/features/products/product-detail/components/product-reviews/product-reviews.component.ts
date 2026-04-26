import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductReviewsSummary, Review } from '../../../../../core/models/review.model';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [FormsModule, TranslatePipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mt-24">
      <h2 class="font-playfair text-2xl md:text-3xl font-bold text-foreground mb-8 text-center border-b border-border pb-4">{{ 'productDetail.reviewsTitle' | t }}</h2>

      @if (summary) {
        <div class="flex flex-col sm:flex-row items-center gap-6 mb-10 bg-background p-6 md:p-8 rounded-xl shadow-sm border border-border">
          <div class="text-center">
            <p class="font-playfair text-5xl font-bold text-primary">{{ summary.average_rating }}</p>
            <div class="flex items-center justify-center gap-0.5 mt-2">
              @for (s of [1,2,3,4,5]; track s) {
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" [class.text-amber-400]="s <= Math.round(summary.average_rating)" [class.text-border]="s > Math.round(summary.average_rating)" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              }
            </div>
            <p class="text-sm text-muted-foreground mt-1 font-inter">{{ summary.total_reviews }} {{ 'productDetail.reviewCountSuffix' | t }}</p>
          </div>
        </div>
      }

      @if (isAuthenticated) {
        <div class="bg-background p-6 md:p-8 rounded-xl shadow-sm border border-border mb-8 font-inter relative overflow-hidden">
          <div class="absolute top-0 start-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
          <h3 class="font-playfair text-xl font-bold mb-6 text-foreground relative z-10 border-b border-border pb-4">
            {{ userReview ? ('productDetail.editReview' | t) : ('productDetail.addReview' | t) }}
          </h3>
          <div class="space-y-4 relative z-10">
            <div>
              <label class="block text-sm font-semibold text-foreground mb-3">{{ 'productDetail.ratingLabel' | t }}</label>
              <div class="flex items-center gap-1">
                @for (s of [1,2,3,4,5]; track s) {
                  <button (click)="ratingChange.emit(s)" class="p-0.5 transition-transform hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 transition-colors duration-150 cursor-pointer" [class.text-amber-400]="s <= rating" [class.text-border]="s > rating" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </button>
                }
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-foreground mb-2">{{ 'productDetail.commentLabel' | t }}</label>
              <textarea [(ngModel)]="comment" (ngModelChange)="commentChange.emit($event)" rows="3" [placeholder]="'productDetail.commentPlaceholder' | t" class="w-full bg-muted border-transparent rounded-lg p-4 text-foreground shadow-sm focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 placeholder:text-muted-foreground resize-none"></textarea>
            </div>
            <div class="flex gap-3">
              <button
                (click)="onSave()"
                [disabled]="rating === 0 || submitting"
                class="bg-primary text-white h-12 px-8 rounded-xl font-semibold hover:bg-primary-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                @if (submitting) {
                  <div class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                }
                {{ userReview ? ('productDetail.updateReviewBtn' | t) : ('productDetail.submitReviewBtn' | t) }}
              </button>
              @if (userReview) {
                <button
                  (click)="onDelete()"
                  [disabled]="submitting"
                  class="bg-red-50 text-red-600 h-12 px-6 rounded-xl font-semibold hover:bg-red-100 transition-all duration-300 disabled:opacity-50"
                >
                  {{ 'productDetail.deleteReviewBtn' | t }}
                </button>
              }
            </div>
          </div>
        </div>
      } @else {
        <div class="bg-muted p-6 rounded-xl text-center mb-8 font-inter">
          <p class="text-muted-foreground">{{ 'productDetail.loginToReview' | t }}
            <a routerLink="/login" class="text-primary font-semibold hover:underline me-1">{{ 'productDetail.loginLink' | t }}</a>
          </p>
        </div>
      }

      @if (summary && summary.reviews.length > 0) {
        <div class="space-y-4">
          @for (review of summary.reviews; track review.id) {
            <div class="bg-background p-6 rounded-xl shadow-sm border border-border font-inter">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span class="text-primary font-bold text-sm">{{ review.user_name.charAt(0) }}</span>
                  </div>
                  <div>
                    <p class="font-semibold text-foreground text-sm">{{ review.user_name }}</p>
                    <p class="text-xs text-muted-foreground">{{ review.created_at | date:'longDate' }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-0.5">
                  @for (s of [1,2,3,4,5]; track s) {
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" [class.text-amber-400]="s <= review.rating" [class.text-border]="s > review.rating" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  }
                </div>
              </div>
              @if (review.comment) {
                <p class="text-muted-foreground text-sm leading-relaxed">{{ review.comment }}</p>
              }
            </div>
          }
        </div>
      } @else if (summary) {
        <p class="text-center text-muted-foreground font-inter py-8">{{ 'productDetail.noReviews' | t }}</p>
      }
    </div>
  `
})
export class ProductReviewsComponent {
  @Input() summary: ProductReviewsSummary | null = null;
  @Input() userReview: Review | null = null;
  @Input() isAuthenticated = false;
  @Input() rating = 0;
  @Input() comment = '';
  @Input() submitting = false;

  @Output() ratingChange = new EventEmitter<number>();
  @Output() commentChange = new EventEmitter<string>();
  @Output() save = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  Math = Math;

  onSave() { this.save.emit(); }
  onDelete() { this.delete.emit(); }
}
