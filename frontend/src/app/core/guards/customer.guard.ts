import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

/**
 * Blocks admin users from accessing customer-only routes like
 * checkout, orders, profile and notifications.
 * Admins are redirected to /admin.
 */
export const customerGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const check = () => {
    if (!authService.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }
    if (authService.isAdmin()) {
      return router.createUrlTree(['/admin']);
    }
    return true;
  };

  if (authService.initialized()) {
    return check();
  }

  return authService.whenReady$.pipe(
    take(1),
    map(() => check()),
  );
};
