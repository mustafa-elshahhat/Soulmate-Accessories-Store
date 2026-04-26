import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/components/toast/toast.component';
import { TranslationService } from '../services/translation.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);
  const t = inject(TranslationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = error.error?.message;

      switch (error.status) {
        case 400:
          toast.show(message || t.get('errors.invalidData'), 'error');
          break;
        case 401:
          break;
        case 403:
          toast.show(t.get('errors.forbidden'), 'error');
          break;
        case 404:
          break;
        case 409:
          toast.show(message || t.get('errors.conflict'), 'error');
          break;
        case 429:
          toast.show(t.get('errors.tooManyRequests'), 'warning');
          break;
        case 0:
          toast.show(t.get('errors.noConnection'), 'error');
          break;
        default:
          if (error.status >= 500) {
            toast.show(t.get('errors.serverError'), 'error');
          }
          break;
      }
      return throwError(() => error.error);
    })
  );
};
