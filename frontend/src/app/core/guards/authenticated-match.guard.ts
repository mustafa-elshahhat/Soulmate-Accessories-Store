import { CanMatchFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

/**
 * canMatch guard — returns true when the user is a non-admin authenticated user.
 * Admin users fall through to the AppLayout for public browsing pages,
 * preventing them from accessing customer-only pages (checkout, orders, etc.).
 */
export const authenticatedMatch: CanMatchFn = () => {
  const authService = inject(AuthService);

  if (authService.initialized()) {
    return authService.isAuthenticated() && !authService.isAdmin();
  }

  return authService.whenReady$.pipe(
    take(1),
    map(() => authService.isAuthenticated() && !authService.isAdmin()),
  );
};
