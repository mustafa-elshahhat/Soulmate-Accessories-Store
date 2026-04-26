# Website Analysis — Soulmate Store

> Auto-generated bilingual SEO analysis based on full codebase audit.

---

## 1. What the Website Does

**Soulmate Store** is a luxury e-commerce platform specializing in **personalized gifts**. Its core feature is the **Gift Box Builder** — an interactive 3-step flow where customers:

1. **Choose a box type** (For Him / For Her / Couples)
2. **Fill it with premium items** from the catalog (perfumes, candles, chocolates, accessories)
3. **Add personalization** — custom engraving (name + date) and a handwritten gift card message

The store also sells **standalone products** (mugs, wallets, watches, necklaces, bracelets) that can be individually customized and purchased.

---

## 2. Main Topics & Categories

| Topic | Products | Keywords Potential |
|-------|----------|-------------------|
| Custom Gift Boxes | Build-your-own gift boxes (male, female, couples) | Very High |
| Personalized Mugs | Engraved ceramic mugs with names & dates | Very High |
| Couple Gifts | Matching gifts for him & her | High |
| Gifts for Him | Wallets, watches, chains, perfumes | High |
| Gifts for Her | Necklaces, bracelets, perfumes, candles | High |
| Birthday Gifts | Curated birthday gift sets | High |
| Anniversary Gifts | Romantic & milestone gifts | High |
| Photo Gifts | Photo-printed mugs and items | Medium |

---

## 3. Search Intent Analysis

| User Intent | Example Query (EN) | Example Query (AR) | Page to Target |
|-------------|--------------------|--------------------|----------------|
| Transactional | "buy personalized gift box" | "شراء بوكس هدايا مخصص" | /builder/select |
| Transactional | "custom engraved mug" | "مج محفور عليه اسم" | /products (mug filter) |
| Commercial Investigation | "best couple gifts 2026" | "أفضل هدايا للكابلز" | /couple-gifts |
| Informational | "gift ideas for boyfriend" | "أفكار هدايا لحبيبي" | /birthday-gifts |
| Navigational | "soulmate store" | "سولميت ستور" | / (homepage) |

---

## 4. SEO Opportunities

### High Priority
- **Bilingual content** — The site is currently Arabic-only. Adding `/en` doubles the indexable pages and captures English-speaking searchers globally.
- **Category landing pages** — No dedicated `/couple-gifts`, `/birthday-gifts`, `/anniversary-gifts` pages exist. These are high-volume keyword targets.
- **Structured data gaps** — Current `StructuredDataService` only has basic Product schema. Missing: Organization, WebSite, BreadcrumbList, AggregateRating, Review, FAQPage.
- **hreflang missing** — No hreflang tags for bilingual indexing.

### Medium Priority
- **Missing canonical URLs** — No `<link rel="canonical">` on any page.
- **Weak meta descriptions** — Current homepage description is generic Arabic-only.
- **No sitemap.xml or robots.txt served** — Need to be deployed to production.
- **Product page SEO** — No breadcrumb schema, no offer schema with `priceValidUntil`.

### Already Strong
- **Angular SSR** — Prerendering enabled for public pages (`RenderMode.Prerender`).
- **Self-hosted fonts** with `font-display: swap` and metric fallbacks — good for CLS.
- **Responsive images** with `<picture>`, `srcset`, `sizes`, and WebP format.
- **Semantic HTML** — proper `<header>`, `<main>`, `<footer>`, `<nav>` usage.
- **Image optimization** — `loading="lazy"`, `fetchpriority="high"`, explicit `width`/`height`.

---

## 5. Current Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 19 (standalone components, signals, SSR) |
| Backend | ASP.NET Core (.NET 9) |
| Styling | Tailwind CSS |
| Fonts | Self-hosted Playfair Display + Inter (woff2) |
| Images | WebP with responsive srcset |
| Deployment | Vercel (frontend), Azure/custom (backend) |
| Rendering | SSR for dynamic routes, Prerender for static, Client for auth-protected |
