import { ErrorHandler, Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '../../shared/components/toast/toast.component';
import { TranslationService } from '../services/translation.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private platformId = inject(PLATFORM_ID);
  private toast = inject(ToastService);
  private t = inject(TranslationService);

  handleError(error: unknown): void {
    if (isPlatformBrowser(this.platformId)) {
      // Skip HTTP errors — they're already handled by the error interceptor
      if (error instanceof HttpErrorResponse) return;
      // Also skip errors whose rejection is an HTTP error (from unhandled Observable errors)
      const rejection = (error as any)?.rejection;
      if (rejection instanceof HttpErrorResponse) return;

      const message = error instanceof Error ? error.message : this.t.get('errors.unexpected');
      this.toast.show(message, 'error');
    }
  }
}
