import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { guestGuard } from './core/guards/guest.guard';
import { customerGuard } from './core/guards/customer.guard';
import { AppLayoutComponent } from './layouts/guest-layout/guest-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

// ─── Shared page definitions ───
const publicPages: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'products', loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent) },
  { path: 'products/:slug', loadComponent: () => import('./features/products/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
  { path: 'builder', loadChildren: () => import('./features/builder/builder.routes').then(m => m.builderRoutes) },
  { path: 'gifts', loadChildren: () => import('./features/gifts/gifts.routes').then(m => m.giftsRoutes) },
  { path: 'cart', loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent) },
  { path: 'about', loadComponent: () => import('./features/static/about/about.component').then(m => m.AboutComponent) },
  { path: 'privacy', loadComponent: () => import('./features/static/privacy/privacy.component').then(m => m.PrivacyComponent) },
  { path: 'terms', loadComponent: () => import('./features/static/terms/terms.component').then(m => m.TermsComponent) },
  { path: 'return-policy', loadComponent: () => import('./features/static/return-policy/return-policy.component').then(m => m.ReturnPolicyComponent) },
  { path: 'contact', loadComponent: () => import('./features/static/contact/contact.component').then(m => m.ContactComponent) },
];

const protectedPages: Routes = [
  { path: 'checkout', canActivate: [customerGuard], loadChildren: () => import('./features/checkout/checkout.routes').then(m => m.checkoutRoutes) },
  { path: 'orders', canActivate: [customerGuard], loadChildren: () => import('./features/orders/orders.routes').then(m => m.ordersRoutes) },
  { path: 'notifications', canActivate: [customerGuard], children: [{ path: '', loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent) }] },
  { path: 'profile', canActivate: [customerGuard], children: [{ path: '', loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) }] },
  { path: 'wishlist', canActivate: [customerGuard], children: [{ path: '', loadComponent: () => import('./features/wishlist/wishlist.component').then(m => m.WishlistComponent) }] },
];

export const routes: Routes = [
  // ─── Auth Layout ───
  {
    path: 'login',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [{ path: '', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) }],
  },
  {
    path: 'register',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [{ path: '', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) }],
  },
  {
    path: 'forgot-password',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [{ path: '', loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) }],
  },
  {
    path: 'reset-password',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [{ path: '', loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) }],
  },

  // ─── Admin Layout ───
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes),
  },

  // ─── App Layout (unified layout for guest + customer) ───
  // Conditionally shows auth UI based on authService state:
  //   Guest → Login icon
  //   Customer → Notifications + Account menu
  // Single layout avoids SSR hydration flicker caused by layout swapping.
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      ...publicPages,
      ...protectedPages,
    ],
  },

  // ─── 404 ───
  { path: '**', loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent) },
];
