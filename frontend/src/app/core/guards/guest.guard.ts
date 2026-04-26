import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

/**
 * Guest guard — redirects authenticated users away from auth pages (login, register, etc.)
 * If the user is already logged in, they are redirected to the home page.
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If auth is already initialized, check synchronously
  if (authService.initialized()) {
    if (!authService.isAuthenticated()) return true;
    return router.createUrlTree(['/']);
  }

  // Wait for auth initialization to complete
  return authService.whenReady$.pipe(
    take(1),
    map(() => {
      if (!authService.isAuthenticated()) return true;
      return router.createUrlTree(['/']);
    })
  );
};
