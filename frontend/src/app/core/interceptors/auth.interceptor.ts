import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Attach the in-memory CSRF token for state-changing requests.
  // document.cookie cannot read cookies set by the backend domain (cross-origin
  // cookie access is blocked by the browser), so we store the token in memory
  // after it is returned in the GET /api/auth/csrf response body.
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const csrfToken = authService.getCsrfToken();
    if (csrfToken) {
      headers['X-XSRF-TOKEN'] = csrfToken;
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
              const csrf = authService.getCsrfToken();
              if (csrf && req.method !== 'GET' && req.method !== 'HEAD') retryHeaders['X-XSRF-TOKEN'] = csrf;
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
            const csrf = authService.getCsrfToken();
            if (csrf && req.method !== 'GET' && req.method !== 'HEAD') retryHeaders['X-XSRF-TOKEN'] = csrf;
            const newReq = req.clone({ setHeaders: retryHeaders, withCredentials: true });
            return next(newReq);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
