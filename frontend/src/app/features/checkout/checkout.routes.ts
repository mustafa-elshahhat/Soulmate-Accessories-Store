import { Routes } from '@angular/router';

export const checkoutRoutes: Routes = [
  { path: '', loadComponent: () => import('./checkout.component').then(m => m.CheckoutComponent) },
  { path: 'confirmation', loadComponent: () => import('./confirmation/confirmation.component').then(m => m.ConfirmationComponent) },
  { path: 'payment', loadComponent: () => import('./payment/payment.component').then(m => m.PaymentComponent) },
];
