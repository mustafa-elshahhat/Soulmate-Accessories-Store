# Bilingual Site Architecture — Soulmate Store

> URL structure using `/ar` and `/en` language prefixes.
> Default language: Arabic (`/ar`). English: `/en`.

---

## Full URL Map

```
soulmate-store.com/
│
├── /ar/                                → الصفحة الرئيسية (Arabic Homepage)
│   ├── /ar/products                    → جميع المنتجات
│   ├── /ar/products/:slug              → تفاصيل المنتج
│   ├── /ar/custom-gift-box             → صفحة بوكس الهدايا المخصص
│   ├── /ar/personalized-mug            → صفحة المجات المخصصة
│   ├── /ar/couple-gifts                → هدايا الكابلز
│   ├── /ar/birthday-gifts              → هدايا عيد الميلاد
│   ├── /ar/anniversary-gifts           → هدايا الذكرى السنوية
│   ├── /ar/photo-gifts                 → هدايا بالصور
│   ├── /ar/builder/select              → بناء البوكس (خطوة 1)
│   ├── /ar/builder/customize           → تخصيص البوكس (خطوة 2)
│   ├── /ar/builder/preview             → معاينة البوكس (خطوة 3)
│   ├── /ar/about                       → عن سولميت
│   ├── /ar/contact                     → تواصل معنا
│   ├── /ar/privacy                     → سياسة الخصوصية
│   ├── /ar/terms                       → الشروط والأحكام
│   └── /ar/return-policy               → سياسة الإرجاع
│
├── /en/                                → Homepage (English)
│   ├── /en/products                    → All Products
│   ├── /en/products/:slug              → Product Detail
│   ├── /en/custom-gift-box             → Custom Gift Boxes
│   ├── /en/personalized-mug            → Personalized Mugs
│   ├── /en/couple-gifts                → Couple Gifts
│   ├── /en/birthday-gifts              → Birthday Gifts
│   ├── /en/anniversary-gifts           → Anniversary Gifts
│   ├── /en/photo-gifts                 → Photo Gifts
│   ├── /en/builder/select              → Gift Box Builder (Step 1)
│   ├── /en/builder/customize           → Customize Box (Step 2)
│   ├── /en/builder/preview             → Preview Box (Step 3)
│   ├── /en/about                       → About Soulmate
│   ├── /en/contact                     → Contact Us
│   ├── /en/privacy                     → Privacy Policy
│   ├── /en/terms                       → Terms & Conditions
│   └── /en/return-policy               → Return Policy
│
├── /ar/login                           → تسجيل الدخول (no-index)
├── /ar/register                        → حساب جديد (no-index)
├── /en/login                           → Login (no-index)
├── /en/register                        → Register (no-index)
│
├── /sitemap.xml                        → Multilingual Sitemap
└── /robots.txt                         → Robots
```

---

## Root URL Redirect Strategy

```
soulmate-store.com/  →  302 redirect based on:
  1. Accept-Language header detection
  2. Default fallback: /ar (primary market is Arabic)
```

**Implementation (Angular):**
```typescript
// app.routes.ts — root redirect
{ path: '', redirectTo: '/ar', pathMatch: 'full' },
```

**Implementation (Server-side — Vercel/Nginx):**
```json
// vercel.json
{
  "rewrites": [
    { "source": "/", "destination": "/ar" }
  ]
}
```

---

## Page Hierarchy & Internal Linking

```
                    ┌──────────────┐
                    │   Homepage   │
                    │  /ar  /en    │
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   ┌─────────────┐ ┌─────────────┐ ┌───────────────┐
   │  Products   │ │  Builder    │ │  Category     │
   │  /products  │ │  /builder/  │ │  Landing      │
   │             │ │  select     │ │  Pages        │
   └──────┬──────┘ └─────────────┘ └───────┬───────┘
          │                                │
          ▼                    ┌───────────┼───────────┐
   ┌─────────────┐            ▼           ▼           ▼
   │  Product    │     /couple-gifts  /birthday-  /anniversary-
   │  Detail     │                    gifts       gifts
   │  /:slug     │
   └─────────────┘
```

### Internal Linking Rules

1. **Every page** links to both language versions via hreflang and a visible language switcher
2. **Homepage** links to: Products, Builder, all Category Landing Pages
3. **Category landing pages** link to: relevant product detail pages, Builder, other categories
4. **Product detail pages** link to: 4 related products, parent category, Builder
5. **Builder** links to: Products catalog (for item selection), Homepage
6. **Footer** (all pages) links to: all categories, about, contact, policies
7. **Breadcrumbs** on every page (except homepage): `Home > Category > Product`

---

## Angular Route Configuration

```typescript
// app.routes.ts
export const routes: Routes = [
  // Root redirect
  { path: '', redirectTo: '/ar', pathMatch: 'full' },

  // Arabic routes
  {
    path: 'ar',
    component: CustomerLayoutComponent,
    data: { lang: 'ar', dir: 'rtl' },
    children: [
      { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
      { path: 'products', loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent) },
      { path: 'products/:slug', loadComponent: () => import('./features/products/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
      { path: 'custom-gift-box', loadComponent: () => import('./features/landing/custom-gift-box/custom-gift-box.component').then(m => m.CustomGiftBoxComponent) },
      { path: 'personalized-mug', loadComponent: () => import('./features/landing/personalized-mug/personalized-mug.component').then(m => m.PersonalizedMugComponent) },
      { path: 'couple-gifts', loadComponent: () => import('./features/landing/couple-gifts/couple-gifts.component').then(m => m.CoupleGiftsComponent) },
      { path: 'birthday-gifts', loadComponent: () => import('./features/landing/birthday-gifts/birthday-gifts.component').then(m => m.BirthdayGiftsComponent) },
      { path: 'anniversary-gifts', loadComponent: () => import('./features/landing/anniversary-gifts/anniversary-gifts.component').then(m => m.AnniversaryGiftsComponent) },
      { path: 'photo-gifts', loadComponent: () => import('./features/landing/photo-gifts/photo-gifts.component').then(m => m.PhotoGiftsComponent) },
      { path: 'builder', loadChildren: () => import('./features/builder/builder.routes').then(m => m.builderRoutes) },
      { path: 'cart', loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent) },
      { path: 'about', loadComponent: () => import('./features/static/about/about.component').then(m => m.AboutComponent) },
      { path: 'contact', loadComponent: () => import('./features/static/contact/contact.component').then(m => m.ContactComponent) },
      { path: 'privacy', loadComponent: () => import('./features/static/privacy/privacy.component').then(m => m.PrivacyComponent) },
      { path: 'terms', loadComponent: () => import('./features/static/terms/terms.component').then(m => m.TermsComponent) },
      { path: 'return-policy', loadComponent: () => import('./features/static/return-policy/return-policy.component').then(m => m.ReturnPolicyComponent) },
      // Auth (no-index)
      { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
      // Protected
      { path: 'checkout', canActivate: [authGuard], loadChildren: () => import('./features/checkout/checkout.routes').then(m => m.checkoutRoutes) },
      { path: 'orders', canActivate: [authGuard], loadChildren: () => import('./features/orders/orders.routes').then(m => m.ordersRoutes) },
      { path: 'profile', canActivate: [authGuard], loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'notifications', canActivate: [authGuard], loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent) },
    ],
  },

  // English routes (mirrors Arabic structure)
  {
    path: 'en',
    component: CustomerLayoutComponent,
    data: { lang: 'en', dir: 'ltr' },
    children: [
      // Same lazy-loaded components — they read `lang` from route data
      // and render content accordingly
      { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
      { path: 'products', loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent) },
      { path: 'products/:slug', loadComponent: () => import('./features/products/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
      { path: 'custom-gift-box', loadComponent: () => import('./features/landing/custom-gift-box/custom-gift-box.component').then(m => m.CustomGiftBoxComponent) },
      { path: 'personalized-mug', loadComponent: () => import('./features/landing/personalized-mug/personalized-mug.component').then(m => m.PersonalizedMugComponent) },
      { path: 'couple-gifts', loadComponent: () => import('./features/landing/couple-gifts/couple-gifts.component').then(m => m.CoupleGiftsComponent) },
      { path: 'birthday-gifts', loadComponent: () => import('./features/landing/birthday-gifts/birthday-gifts.component').then(m => m.BirthdayGiftsComponent) },
      { path: 'anniversary-gifts', loadComponent: () => import('./features/landing/anniversary-gifts/anniversary-gifts.component').then(m => m.AnniversaryGiftsComponent) },
      { path: 'photo-gifts', loadComponent: () => import('./features/landing/photo-gifts/photo-gifts.component').then(m => m.PhotoGiftsComponent) },
      { path: 'builder', loadChildren: () => import('./features/builder/builder.routes').then(m => m.builderRoutes) },
      { path: 'cart', loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent) },
      { path: 'about', loadComponent: () => import('./features/static/about/about.component').then(m => m.AboutComponent) },
      { path: 'contact', loadComponent: () => import('./features/static/contact/contact.component').then(m => m.ContactComponent) },
      { path: 'privacy', loadComponent: () => import('./features/static/privacy/privacy.component').then(m => m.PrivacyComponent) },
      { path: 'terms', loadComponent: () => import('./features/static/terms/terms.component').then(m => m.TermsComponent) },
      { path: 'return-policy', loadComponent: () => import('./features/static/return-policy/return-policy.component').then(m => m.ReturnPolicyComponent) },
      { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
      { path: 'checkout', canActivate: [authGuard], loadChildren: () => import('./features/checkout/checkout.routes').then(m => m.checkoutRoutes) },
      { path: 'orders', canActivate: [authGuard], loadChildren: () => import('./features/orders/orders.routes').then(m => m.ordersRoutes) },
      { path: 'profile', canActivate: [authGuard], loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'notifications', canActivate: [authGuard], loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent) },
    ],
  },

  // Admin (language-independent)
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes),
  },

  { path: '**', loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent) },
];
```

---

## Server Routes (SSR) Update

```typescript
// app.routes.server.ts
export const serverRoutes: ServerRoute[] = [
  // Dynamic product pages — SSR at request time
  { path: 'ar/products/:slug', renderMode: RenderMode.Server },
  { path: 'en/products/:slug', renderMode: RenderMode.Server },
  { path: 'ar/orders/:id', renderMode: RenderMode.Server },
  { path: 'en/orders/:id', renderMode: RenderMode.Server },

  // Auth-protected → client only
  { path: 'ar/checkout/**', renderMode: RenderMode.Client },
  { path: 'en/checkout/**', renderMode: RenderMode.Client },
  { path: 'ar/orders', renderMode: RenderMode.Client },
  { path: 'en/orders', renderMode: RenderMode.Client },
  { path: 'ar/notifications', renderMode: RenderMode.Client },
  { path: 'en/notifications', renderMode: RenderMode.Client },
  { path: 'ar/profile', renderMode: RenderMode.Client },
  { path: 'en/profile', renderMode: RenderMode.Client },
  { path: 'admin/**', renderMode: RenderMode.Client },

  // All other public pages → prerender for max SEO
  { path: '**', renderMode: RenderMode.Prerender },
];
```
