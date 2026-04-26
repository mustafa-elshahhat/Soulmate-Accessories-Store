import { Routes } from '@angular/router';

export const ordersRoutes: Routes = [
  { path: '', loadComponent: () => import('./orders.component').then(m => m.OrdersComponent) },
  { path: ':id', loadComponent: () => import('./order-detail/order-detail.component').then(m => m.OrderDetailComponent) },
];
