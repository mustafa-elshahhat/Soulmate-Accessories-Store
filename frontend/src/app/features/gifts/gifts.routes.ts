import { Routes } from '@angular/router';

export const giftsRoutes: Routes = [
  {
    path: ':category',
    loadComponent: () => import('./gift-category.component').then(m => m.GiftCategoryComponent),
  },
];
