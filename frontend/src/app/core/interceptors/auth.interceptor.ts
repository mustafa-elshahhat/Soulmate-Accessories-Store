import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

function getXsrfToken(platformId: object): string | null {
  if (!isPlatformBrowser(platformId)) return null;
  const match = document.cookie.split(';').find(c => c.trim().startsWith('XSRF-TOKEN='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const platformId = inject(PLATFORM_ID);
  const token = authService.getAccessToken();

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Manually attach XSRF token for state-changing requests (POST/PUT/PATCH/DELETE)
  // Angular's built-in XSRF interceptor can be unreliable with withFetch()
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const xsrfToken = getXsrfToken(platformId);
    if (xsrfToken) {
      headers['X-XSRF-TOKEN'] = xsrfToken;
    }
  }

  let authReq = req.clone({ withCredentials: true });
  if (Object.keys(headers).length > 0) {
    authReq = authReq.clone({ setHeaders: headers });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status === 401 &&
        !req.url.includes('/auth/refresh') &&
        !req.url.includes('/auth/login') &&
        authService.isLoggedIn()
      ) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.refreshToken().pipe(
            switchMap((response) => {
              isRefreshing = false;
              refreshTokenSubject.next(response.access_token);
              const retryHeaders: Record<string, string> = { Authorization: `Bearer ${response.access_token}` };
              const xsrf = getXsrfToken(platformId);
              if (xsrf && req.method !== 'GET' && req.method !== 'HEAD') retryHeaders['X-XSRF-TOKEN'] = xsrf;
              const newReq = req.clone({ setHeaders: retryHeaders, withCredentials: true });
              return next(newReq);
            }),
            catchError((refreshError) => {
              isRefreshing = false;
              refreshTokenSubject.next('');
              authService.clearAccessToken();
              return throwError(() => refreshError);
            })
          );
        }

        // Queue requests while refresh is in progress
        return refreshTokenSubject.pipe(
          filter((token) => token !== null),
          take(1),
          switchMap((newToken) => {
            if (!newToken) {
              return throwError(() => error);
            }
            const retryHeaders: Record<string, string> = { Authorization: `Bearer ${newToken}` };
            const xsrf = getXsrfToken(platformId);
            if (xsrf && req.method !== 'GET' && req.method !== 'HEAD') retryHeaders['X-XSRF-TOKEN'] = xsrf;
            const newReq = req.clone({ setHeaders: retryHeaders, withCredentials: true });
            return next(newReq);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
