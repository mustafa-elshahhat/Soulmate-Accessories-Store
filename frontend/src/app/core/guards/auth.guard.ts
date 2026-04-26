import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

/**
 * Auth guard that waits for session restoration before deciding.
 * Prevents false redirects to /login during SSR hydration.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If auth is already initialized, check synchronously
  if (authService.initialized()) {
    if (authService.isAuthenticated()) return true;
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  // Wait for auth initialization to complete
  return authService.whenReady$.pipe(
    take(1),
    map(() => {
      if (authService.isAuthenticated()) return true;
      return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    })
  );
};

