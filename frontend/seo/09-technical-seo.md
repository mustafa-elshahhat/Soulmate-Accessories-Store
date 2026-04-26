# Technical SEO Recommendations — Soulmate Store

> Prioritized improvements for Core Web Vitals, page speed, mobile SEO, and bilingual indexing.
> Based on analysis of the live Angular 19 SSR codebase.

---

## 1. Core Web Vitals

### LCP (Largest Contentful Paint) — Target: < 2.5s

| Issue | Current State | Fix |
|-------|--------------|-----|
| Hero image preloaded | Already using `<link rel="preload">` with media queries | No change needed |
| Font preloading | Already preloading `inter-400.woff2` and `playfair-display-700.woff2` | No change needed |
| SSR/Prerender enabled | Public pages use `RenderMode.Prerender` | No change needed |
| **Product images not preloaded** | Product detail uses `NgOptimizedImage` with `priority` | Consider adding `fetchpriority="high"` to first product image in list views |
| **Third-party blocking** | No external CDN calls (fonts self-hosted, icons local) | Already optimized |

### CLS (Cumulative Layout Shift) — Target: < 0.1

| Issue | Current State | Fix |
|-------|--------------|-----|
| Font metric fallbacks | Already using `ascent-override`, `descent-override`, `size-adjust` | No change needed |
| Image dimensions | Already specifying `width` and `height` on all images | No change needed |
| **Missing `aspect-ratio` on dynamic images** | Product cards use `aspect-square` class | No change needed |
| **Skeleton loaders** | Already implemented for product grids | No change needed |

### INP (Interaction to Next Paint) — Target: < 200ms

| Issue | Current State | Fix |
|-------|--------------|-----|
| `ChangeDetectionStrategy.OnPush` | Already used in all components | No change needed |
| Lazy loading routes | Already using `loadComponent`/`loadChildren` | No change needed |
| **Add to Cart animation** | Uses `AudioContext` — lightweight | No change needed |

**Verdict: Core Web Vitals are already well-optimized. Focus remaining effort on SEO metadata and bilingual infrastructure.**

---

## 2. Page Speed Optimizations

### Image Optimization

| Action | Priority | Details |
|--------|----------|---------|
| Use WebP everywhere | Already done | All hero/box images are `.webp` |
| Responsive `srcset` | Already done | Using `srcset` with `sizes` on hero and box images |
| `loading="lazy"` | Already done | On below-fold images |
| `fetchpriority="high"` | Already done | On hero image |
| **Add AVIF format** | Medium | Add `<source type="image/avif">` inside `<picture>` for 30-50% smaller files than WebP. Angular CLI supports AVIF generation. |
| **OG images: Create per-language** | High | Create `og-homepage-ar.jpg` and `og-homepage-en.jpg` with localized text overlay |

### Bundle Optimization

```
Current architecture (already optimized):
- Standalone components with lazy loading
- Route-based code splitting via loadComponent/loadChildren
- Tailwind CSS with purging (only used classes in production)
- No external CSS/JS CDNs
```

| Action | Priority | Details |
|--------|----------|---------|
| **Enable Brotli compression** | High | Configure Vercel/server to serve `.br` compressed assets. ~15-20% smaller than gzip. |
| **Set Cache-Control headers** | High | Static assets: `Cache-Control: public, max-age=31536000, immutable`. HTML: `Cache-Control: public, max-age=0, s-maxage=86400`. |
| **Preconnect to API** | Medium | Add `<link rel="preconnect" href="https://api.soulmate-store.com">` in `index.html` |
| **Preconnect to Cloudinary** | Medium | If using Cloudinary for images: `<link rel="preconnect" href="https://res.cloudinary.com">` |

---

## 3. Mobile SEO

| Issue | Priority | Fix |
|-------|----------|-----|
| Viewport meta | Already set | `<meta name="viewport" content="width=device-width, initial-scale=1">` |
| Responsive design | Already done | Tailwind breakpoints, mobile-first grid |
| Touch targets | Already done | All buttons/links have `min-w-[44px] min-h-[44px]` |
| Bottom nav bar | Already done | Mobile fixed bottom navigation |
| Safe area insets | Already done | `pb-[calc(0.5rem+env(safe-area-inset-bottom))]` |
| **Add `theme-color`** | Medium | Add `<meta name="theme-color" content="#1A1A1A">` for browser UI coloring |
| **Add `apple-mobile-web-app-title`** | Low | `<meta name="apple-mobile-web-app-title" content="Soulmate">` |

---

## 4. Internal Linking Strategy

### Current Issues
- No category landing pages exist (e.g., `/couple-gifts`, `/birthday-gifts`)
- Footer links only point to `/products`, `/builder/select`, `/about`, `/contact`, policies
- No breadcrumb navigation on product pages (UI exists but no schema)
- No "related products" cross-linking to category pages

### Recommended Fixes

| Action | Priority | Details |
|--------|----------|---------|
| **Create 6 category landing pages** | Critical | `/custom-gift-box`, `/personalized-mug`, `/couple-gifts`, `/birthday-gifts`, `/anniversary-gifts`, `/photo-gifts` — each with unique H1, description, and curated product grid |
| **Add category links to footer** | High | Add "Shop" section with links to all category pages (as described in the product page template) |
| **Add breadcrumbs with schema** | High | `Home > Products > [Product Name]` with `BreadcrumbList` JSON-LD |
| **Cross-link category pages** | Medium | Each category page should link to 2-3 related categories (e.g., `/couple-gifts` links to `/anniversary-gifts` and `/personalized-mug`) |
| **Language switcher in header** | Critical | Visible link to alternate language version (`/ar` <-> `/en`) |

---

## 5. Canonical URLs & Duplicate Content Prevention

### Issues to Fix

| Issue | Fix |
|-------|-----|
| **No `<link rel="canonical">` on any page** | Add canonical via `SeoService.updatePage()` — see implementation in `04-multilingual-seo-strategy.md` |
| **Root `/` serves same content as `/ar`** | Redirect `/` to `/ar` via 302. Do NOT serve duplicate content on root. |
| **Query params create duplicate pages** | Block `?sort=`, `?page=`, `?limit=` in robots.txt. Add `rel="canonical"` pointing to base URL without params. |
| **Product pages exist without language prefix** | After migration, redirect old `/products/:slug` to `/ar/products/:slug` with 301 |

### Canonical URL Rules

```
Page: /ar/products?page=2&sort=price
Canonical: /ar/products  (strip pagination & sort params)

Page: /en/products?gender=male
Canonical: /en/products?gender=male  (keep meaningful filters)

Page: /ar/products/marble-couple-mug
Canonical: /ar/products/marble-couple-mug  (self-referencing)
```

---

## 6. Indexing Strategy

### Google Search Console Setup

1. **Verify property:** `https://soulmate-store.com`
2. **Submit sitemap:** `https://soulmate-store.com/sitemap.xml`
3. **Request indexing** for high-priority pages:
   - `/ar/`
   - `/en/`
   - `/ar/custom-gift-box`
   - `/en/custom-gift-box`
   - `/ar/couple-gifts`
   - `/en/couple-gifts`

### Meta Robots Strategy

| Page Type | Directive |
|-----------|-----------|
| Homepage, Products, Categories, Builder entry | `index, follow` (default) |
| Product detail pages | `index, follow` |
| About, Contact | `index, follow` |
| Policies (privacy, terms, return) | `index, nofollow` |
| Auth pages (login, register, forgot/reset password) | `noindex, nofollow` |
| Protected pages (profile, orders, notifications, cart, checkout) | `noindex, nofollow` |
| Builder steps 2-3 (customize, preview) | `noindex, nofollow` |
| Admin | `noindex, nofollow` + blocked in robots.txt |

---

## 7. index.html Updates Required

```html
<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>Soulmate Store</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="سولميت ستور — هدايا مخصصة وبوكسات هدايا فاخرة">

  <!-- NEW: Theme color -->
  <meta name="theme-color" content="#1A1A1A">
  <meta name="apple-mobile-web-app-title" content="Soulmate">

  <!-- Favicon -->
  <link rel="icon" type="image/png" href="/assets/images/favicon.png">
  <link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png">

  <!-- Font preloads -->
  <link rel="preload" href="/assets/fonts/inter-400.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/playfair-display-700.woff2" as="font" type="font/woff2" crossorigin>

  <!-- Hero image preloads -->
  <link rel="preload" as="image" type="image/webp" href="/assets/images/hero-bg-sm.webp" media="(max-width: 640px)">
  <link rel="preload" as="image" type="image/webp" href="/assets/images/hero-bg-md.webp" media="(min-width: 641px) and (max-width: 1024px)">
  <link rel="preload" as="image" type="image/webp" href="/assets/images/hero-bg-lg.webp" media="(min-width: 1025px)">

  <!-- NEW: Preconnect to API -->
  <link rel="preconnect" href="https://api.soulmate-store.com">

  <!-- NEW: Organization schema (global) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Soulmate Store",
    "alternateName": "سولميت ستور",
    "url": "https://soulmate-store.com",
    "logo": "https://soulmate-store.com/assets/images/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["Arabic", "English"]
    }
  }
  </script>
</head>
<body>
  <app-root></app-root>
</body>
</html>
```

---

## 8. 301 Redirect Plan (Migration from old URLs)

When migrating from the current non-prefixed URLs to `/ar` + `/en`:

```
301 Permanent Redirects:
/                      → /ar/
/products              → /ar/products
/products/:slug        → /ar/products/:slug
/builder/select        → /ar/builder/select
/builder/customize     → /ar/builder/customize
/builder/preview       → /ar/builder/preview
/about                 → /ar/about
/contact               → /ar/contact
/privacy               → /ar/privacy
/terms                 → /ar/terms
/return-policy         → /ar/return-policy
/login                 → /ar/login
/register              → /ar/register
/cart                  → /ar/cart
/checkout              → /ar/checkout
/orders                → /ar/orders
/profile               → /ar/profile
/notifications         → /ar/notifications
```

**Vercel implementation:**
```json
// vercel.json
{
  "redirects": [
    { "source": "/products/:slug", "destination": "/ar/products/:slug", "statusCode": 301 },
    { "source": "/products", "destination": "/ar/products", "statusCode": 301 },
    { "source": "/builder/:path*", "destination": "/ar/builder/:path*", "statusCode": 301 },
    { "source": "/about", "destination": "/ar/about", "statusCode": 301 },
    { "source": "/contact", "destination": "/ar/contact", "statusCode": 301 },
    { "source": "/privacy", "destination": "/ar/privacy", "statusCode": 301 },
    { "source": "/terms", "destination": "/ar/terms", "statusCode": 301 },
    { "source": "/return-policy", "destination": "/ar/return-policy", "statusCode": 301 },
    { "source": "/login", "destination": "/ar/login", "statusCode": 301 },
    { "source": "/register", "destination": "/ar/register", "statusCode": 301 }
  ]
}
```

---

## 9. Implementation Priority Checklist

### Phase 1 — Critical (Week 1)
- [ ] Add `/ar` and `/en` route prefixes
- [ ] Implement hreflang tags via `SeoService`
- [ ] Add `<link rel="canonical">` to all pages
- [ ] Create `robots.txt` and deploy
- [ ] Create `sitemap.xml` and deploy
- [ ] Set up 301 redirects for old URLs
- [ ] Add Organization schema to `index.html`

### Phase 2 — High Priority (Week 2)
- [ ] Create 6 category landing pages (both languages)
- [ ] Enhance `StructuredDataService` with all schema types
- [ ] Add breadcrumb schema to product pages
- [ ] Add language switcher to header
- [ ] Add category links to footer
- [ ] Submit sitemap to Google Search Console

### Phase 3 — Medium Priority (Week 3-4)
- [ ] Add FAQ schema to category landing pages
- [ ] Create per-language OG images
- [ ] Enable Brotli compression
- [ ] Add `Cache-Control` headers
- [ ] Add `<meta name="theme-color">`
- [ ] Add AVIF image format support
- [ ] Backend: add `name_en`, `description_en` fields to Product model

### Phase 4 — Ongoing
- [ ] Monitor Search Console for indexing issues
- [ ] Track keyword rankings for AR + EN terms
- [ ] A/B test meta descriptions for CTR optimization
- [ ] Add blog content targeting informational keywords
- [ ] Build backlinks to category landing pages
