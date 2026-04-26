import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

/**
 * Admin guard that waits for auth initialization before deciding.
 * Uses the cached user from tryAutoLogin() instead of making a
 * redundant getMe() call on every navigation.
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If auth is already initialized, check synchronously
  if (authService.initialized()) {
    if (authService.isAdmin()) return true;
    if (authService.isAuthenticated()) {
      return router.createUrlTree(['/']);
    }
    return router.createUrlTree(['/login']);
  }

  // Wait for auth initialization to complete (during SSR hydration / first load)
  return authService.whenReady$.pipe(
    take(1),
    map(() => {
      if (authService.isAdmin()) return true;
      if (authService.isAuthenticated()) {
        return router.createUrlTree(['/']);
      }
      return router.createUrlTree(['/login']);
    })
  );
};

