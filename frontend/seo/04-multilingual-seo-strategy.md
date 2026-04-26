# Multilingual SEO Strategy — Soulmate Store

> hreflang implementation, language detection, indexing strategy.

---

## 1. URL Structure: Subfolder Approach

**Chosen approach: `/ar` and `/en` subfolders** (recommended by Google over subdomains or ccTLDs for multilingual sites on a single domain).

```
soulmate-store.com/ar/...   → Arabic (RTL, lang="ar")
soulmate-store.com/en/...   → English (LTR, lang="en")
```

**Why subfolders:**
- Inherits domain authority across all languages
- Easier to manage in a single Angular deployment
- Simpler analytics & Search Console setup
- Google explicitly recommends this for multilingual sites

---

## 2. hreflang Implementation

### Method: `<link>` tags in `<head>` (injected via SeoService)

Every indexable page must have **all 3 hreflang tags:**

```html
<!-- On /ar page -->
<link rel="alternate" hreflang="ar" href="https://soulmate-store.com/ar/">
<link rel="alternate" hreflang="en" href="https://soulmate-store.com/en/">
<link rel="alternate" hreflang="x-default" href="https://soulmate-store.com/ar/">
```

```html
<!-- On /en page -->
<link rel="alternate" hreflang="ar" href="https://soulmate-store.com/ar/">
<link rel="alternate" hreflang="en" href="https://soulmate-store.com/en/">
<link rel="alternate" hreflang="x-default" href="https://soulmate-store.com/ar/">
```

> `x-default` points to Arabic since it's the primary market.

### Dynamic Product Pages

```html
<!-- On /ar/products/marble-couple-mug -->
<link rel="alternate" hreflang="ar" href="https://soulmate-store.com/ar/products/marble-couple-mug">
<link rel="alternate" hreflang="en" href="https://soulmate-store.com/en/products/marble-couple-mug">
<link rel="alternate" hreflang="x-default" href="https://soulmate-store.com/ar/products/marble-couple-mug">
```

### Angular SeoService — hreflang Implementation

```typescript
// core/services/seo.service.ts
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

interface SeoConfig {
  title: string;
  description: string;
  image?: string;
  url?: string;
  lang?: 'ar' | 'en';
  noIndex?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private meta = inject(Meta);
  private title = inject(Title);
  private document = inject(DOCUMENT);
  private readonly BASE_URL = 'https://soulmate-store.com';

  updatePage(config: SeoConfig): void {
    const lang = config.lang || 'ar';
    const fullTitle = `${config.title} | Soulmate Store`;

    // Title
    this.title.setTitle(fullTitle);

    // Meta description
    this.meta.updateTag({ name: 'description', content: config.description });

    // Robots
    if (config.noIndex) {
      this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    } else {
      this.meta.removeTag('name="robots"');
    }

    // Canonical
    const canonicalUrl = config.url
      ? `${this.BASE_URL}${config.url}`
      : this.BASE_URL;
    this.updateCanonical(canonicalUrl);

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: config.title });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ property: 'og:site_name', content: 'Soulmate Store' });
    this.meta.updateTag({ property: 'og:locale', content: lang === 'ar' ? 'ar_EG' : 'en_US' });
    this.meta.updateTag({ property: 'og:locale:alternate', content: lang === 'ar' ? 'en_US' : 'ar_EG' });
    if (config.image) {
      this.meta.updateTag({ property: 'og:image', content: config.image });
      this.meta.updateTag({ property: 'og:image:width', content: '1200' });
      this.meta.updateTag({ property: 'og:image:height', content: '630' });
    }

    // Twitter Card
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: config.title });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });
    if (config.image) this.meta.updateTag({ name: 'twitter:image', content: config.image });

    // hreflang tags
    if (config.url) {
      this.updateHreflang(config.url, lang);
    }

    // HTML lang & dir
    this.document.documentElement.lang = lang;
    this.document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  private updateCanonical(url: string): void {
    let link = this.document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private updateHreflang(path: string, currentLang: 'ar' | 'en'): void {
    // Remove existing hreflang tags
    this.document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());

    // Derive the alternate path
    const pathWithoutLang = path.replace(/^\/(ar|en)/, '');
    const arUrl = `${this.BASE_URL}/ar${pathWithoutLang}`;
    const enUrl = `${this.BASE_URL}/en${pathWithoutLang}`;

    // Create hreflang elements
    const langs = [
      { hreflang: 'ar', href: arUrl },
      { hreflang: 'en', href: enUrl },
      { hreflang: 'x-default', href: arUrl }, // Arabic as default
    ];

    langs.forEach(({ hreflang, href }) => {
      const link = this.document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', hreflang);
      link.setAttribute('href', href);
      this.document.head.appendChild(link);
    });
  }
}
```

---

## 3. HTML Document Language & Direction

```typescript
// In CustomerLayoutComponent or AppComponent — set per route
ngOnInit(): void {
  this.route.data.subscribe(data => {
    const lang = data['lang'] || 'ar';
    const dir = data['dir'] || 'rtl';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  });
}
```

This makes the HTML output:
- `/ar` → `<html lang="ar" dir="rtl">`
- `/en` → `<html lang="en" dir="ltr">`

---

## 4. Multilingual Indexing Strategy

### Pages to Index (per language)

| Page | /ar | /en | Notes |
|------|-----|-----|-------|
| Homepage | Index | Index | Both languages |
| Products list | Index | Index | |
| Product detail | Index | Index | Same slug, different content |
| Category landing pages | Index | Index | 6 pages × 2 languages = 12 |
| Builder (step 1 only) | Index | Index | /builder/select only |
| Builder (steps 2-3) | **noindex** | **noindex** | Interactive, no SEO value |
| About / Contact | Index | Index | |
| Policies (privacy, terms, return) | Index | Index | Low priority |
| Auth (login, register, forgot) | **noindex** | **noindex** | Private |
| Profile / Orders / Notifications | **noindex** | **noindex** | Auth-protected |
| Cart / Checkout | **noindex** | **noindex** | Transactional, no SEO value |
| Admin | **noindex** | — | Block in robots.txt too |

### Implementation

```typescript
// For no-index pages (e.g., login)
this.seoService.updatePage({
  title: 'تسجيل الدخول',
  description: '',
  lang: 'ar',
  noIndex: true,
});
```

---

## 5. Language Switcher Component

A visible language switcher in the header/footer allows Google to discover alternate versions.

```html
<!-- In header navigation -->
@if (currentLang() === 'ar') {
  <a [routerLink]="getEnglishUrl()" class="text-sm font-inter text-muted-foreground hover:text-primary">
    English
  </a>
} @else {
  <a [routerLink]="getArabicUrl()" class="text-sm font-inter text-muted-foreground hover:text-primary">
    العربية
  </a>
}
```

```typescript
// Component logic
getEnglishUrl(): string {
  return this.router.url.replace(/^\/ar/, '/en');
}

getArabicUrl(): string {
  return this.router.url.replace(/^\/en/, '/ar');
}
```

---

## 6. Google Search Console Setup

1. **Add both URL prefixes:**
   - `https://soulmate-store.com/ar/`
   - `https://soulmate-store.com/en/`

2. **Submit multilingual sitemap** from root:
   - `https://soulmate-store.com/sitemap.xml`

3. **Set International Targeting:**
   - No geographic targeting (global audience)
   - Rely on hreflang for language targeting

---

## 7. Content Translation Strategy

| Content Type | Strategy |
|-------------|----------|
| UI strings (buttons, labels, nav) | Angular i18n or translation JSON files |
| Product names & descriptions | Backend: `name_ar`, `name_en`, `description_ar`, `description_en` fields |
| Meta titles & descriptions | Per-language SEO config objects |
| Static pages (about, policies) | Separate template content per language |
| User-generated (reviews) | Keep in original language, display as-is |
