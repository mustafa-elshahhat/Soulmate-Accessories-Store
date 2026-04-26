# Structured Data (Schema.org) — Bilingual Soulmate Store

> All schemas use JSON-LD. Language-aware via `inLanguage` property.
> Validated against: https://validator.schema.org/ and Google Rich Results Test

---

## 1. Organization Schema (inject once in index.html or homepage)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Soulmate Store",
  "alternateName": "سولميت ستور",
  "url": "https://soulmate-store.com",
  "logo": "https://soulmate-store.com/assets/images/logo.png",
  "description": "Soulmate Store specializes in personalized gifts, custom gift boxes, and engraved couple gifts.",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": ["Arabic", "English"]
  },
  "sameAs": [
    "https://www.instagram.com/soulmatestore",
    "https://www.facebook.com/soulmatestore",
    "https://www.tiktok.com/@soulmatestore"
  ]
}
```

---

## 2. WebSite Schema with SearchAction (homepage)

### Arabic version
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "سولميت ستور",
  "alternateName": "Soulmate Store",
  "url": "https://soulmate-store.com/ar/",
  "inLanguage": "ar",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://soulmate-store.com/ar/products?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

### English version
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Soulmate Store",
  "alternateName": "سولميت ستور",
  "url": "https://soulmate-store.com/en/",
  "inLanguage": "en",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://soulmate-store.com/en/products?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

---

## 3. Product Schema (every product page)

### Arabic `/ar/products/marble-couple-mug`
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "مج كابلز ماربل",
  "image": [
    "https://soulmate-store.com/assets/images/products/marble-couple-mug.jpg",
    "https://soulmate-store.com/assets/images/products/marble-couple-mug-2.jpg"
  ],
  "description": "مج كابلز بتصميم ماربل فاخر محفور عليه أسماءكم وتاريخ مميز. سيراميك عالي الجودة مع حفر أنيق.",
  "sku": "MUG-MARBLE-001",
  "inLanguage": "ar",
  "brand": {
    "@type": "Brand",
    "name": "Soulmate Store"
  },
  "category": "مجات مخصصة",
  "offers": {
    "@type": "Offer",
    "url": "https://soulmate-store.com/ar/products/marble-couple-mug",
    "priceCurrency": "EGP",
    "price": "120",
    "priceValidUntil": "2026-12-31",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": {
      "@type": "Organization",
      "name": "Soulmate Store"
    },
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingDestination": {
        "@type": "DefinedRegion",
        "addressCountry": "EG"
      },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "handlingTime": {
          "@type": "QuantitativeValue",
          "minValue": 1,
          "maxValue": 3,
          "unitCode": "DAY"
        },
        "transitTime": {
          "@type": "QuantitativeValue",
          "minValue": 2,
          "maxValue": 5,
          "unitCode": "DAY"
        }
      }
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "24",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "author": { "@type": "Person", "name": "أحمد" },
      "datePublished": "2026-01-15",
      "reviewBody": "مج جميل جداً، جودة الحفر ممتازة. مراتي فرحت جداً!"
    }
  ]
}
```

### English `/en/products/marble-couple-mug`
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Marble Couple Mug",
  "image": [
    "https://soulmate-store.com/assets/images/products/marble-couple-mug.jpg",
    "https://soulmate-store.com/assets/images/products/marble-couple-mug-2.jpg"
  ],
  "description": "Premium marble-finish couple mug personalized with your names and a special date. Crafted from high-quality ceramic with elegant engraving.",
  "sku": "MUG-MARBLE-001",
  "inLanguage": "en",
  "brand": {
    "@type": "Brand",
    "name": "Soulmate Store"
  },
  "category": "Personalized Mugs",
  "offers": {
    "@type": "Offer",
    "url": "https://soulmate-store.com/en/products/marble-couple-mug",
    "priceCurrency": "EGP",
    "price": "120",
    "priceValidUntil": "2026-12-31",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": {
      "@type": "Organization",
      "name": "Soulmate Store"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "24",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "author": { "@type": "Person", "name": "Ahmed" },
      "datePublished": "2026-01-15",
      "reviewBody": "Beautiful mug, the engraving quality is amazing. Perfect anniversary gift!"
    }
  ]
}
```

---

## 4. BreadcrumbList Schema (every page with breadcrumbs)

### Arabic
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "الرئيسية",
      "item": "https://soulmate-store.com/ar/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "المنتجات",
      "item": "https://soulmate-store.com/ar/products"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "مج كابلز ماربل",
      "item": "https://soulmate-store.com/ar/products/marble-couple-mug"
    }
  ]
}
```

### English
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://soulmate-store.com/en/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Products",
      "item": "https://soulmate-store.com/en/products"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Marble Couple Mug",
      "item": "https://soulmate-store.com/en/products/marble-couple-mug"
    }
  ]
}
```

---

## 5. FAQPage Schema (for landing pages)

### Arabic `/ar/custom-gift-box`
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "إزاي أبني بوكس هدايا مخصص؟",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "استخدم Gift Box Builder في 3 خطوات: اختر شكل البوكس (رجالي، حريمي، أو كابلز)، اختر المنتجات الفاخرة، وأضف الحفر بالاسم والتاريخ."
      }
    },
    {
      "@type": "Question",
      "name": "هل التغليف الفاخر مجاني؟",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "أيوه! كل طلب من سولميت ستور بيجي بتغليف هدايا فاخر مجاناً، جاهز إنك تهديه مباشرة."
      }
    },
    {
      "@type": "Question",
      "name": "بتشحنوا لأي مكان؟",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "حالياً بنشحن لكل محافظات مصر. شحن مجاني للطلبات فوق 1,500 ج.م."
      }
    }
  ]
}
```

### English `/en/custom-gift-box`
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does the Gift Box Builder work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our Gift Box Builder lets you create a personalized gift in 3 steps: Choose your box style (for him, for her, or couples), pick premium items to fill it, and add custom engraving with names and dates."
      }
    },
    {
      "@type": "Question",
      "name": "Is luxury gift wrapping included?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! Every order from Soulmate Store comes with complimentary luxury gift wrapping, making it ready to gift right out of the box."
      }
    },
    {
      "@type": "Question",
      "name": "Do you ship internationally?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Currently we ship across all governorates in Egypt. Free shipping on orders above 1,500 EGP."
      }
    }
  ]
}
```

---

## Enhanced StructuredDataService (Angular)

```typescript
// core/services/structured-data.service.ts
import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Product } from '../models/product.model';

interface BreadcrumbItem {
  name: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class StructuredDataService {
  private document = inject(DOCUMENT);
  private readonly BASE_URL = 'https://soulmate-store.com';

  setProductSchema(product: Product, lang: 'ar' | 'en', reviews?: { average: number; count: number }): void {
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: product.image_url,
      description: product.description,
      inLanguage: lang,
      brand: { '@type': 'Brand', name: 'Soulmate Store' },
      offers: {
        '@type': 'Offer',
        url: `${this.BASE_URL}/${lang}/products/${product.slug}`,
        priceCurrency: 'EGP',
        price: product.price.toString(),
        priceValidUntil: `${new Date().getFullYear()}-12-31`,
        availability: product.is_active ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@type': 'Organization', name: 'Soulmate Store' },
      },
    };
    if (reviews && reviews.count > 0) {
      schema['aggregateRating'] = {
        '@type': 'AggregateRating',
        ratingValue: reviews.average.toString(),
        reviewCount: reviews.count.toString(),
        bestRating: '5',
        worstRating: '1',
      };
    }
    this.setSchema('sd-product', schema);
  }

  setOrganizationSchema(): void {
    this.setSchema('sd-org', {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Soulmate Store',
      alternateName: 'سولميت ستور',
      url: this.BASE_URL,
      logo: `${this.BASE_URL}/assets/images/logo.png`,
      description: 'Personalized gifts, custom gift boxes, and engraved couple gifts.',
      contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', availableLanguage: ['Arabic', 'English'] },
    });
  }

  setWebSiteSchema(lang: 'ar' | 'en'): void {
    this.setSchema('sd-website', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: lang === 'ar' ? 'سولميت ستور' : 'Soulmate Store',
      url: `${this.BASE_URL}/${lang}/`,
      inLanguage: lang,
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${this.BASE_URL}/${lang}/products?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    });
  }

  setBreadcrumbSchema(items: BreadcrumbItem[]): void {
    this.setSchema('sd-breadcrumb', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item: `${this.BASE_URL}${item.url}`,
      })),
    });
  }

  setFAQSchema(faqs: Array<{ question: string; answer: string }>): void {
    this.setSchema('sd-faq', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(f => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    });
  }

  removeAllSchemas(): void {
    ['sd-product', 'sd-org', 'sd-website', 'sd-breadcrumb', 'sd-faq'].forEach(id => {
      this.document.getElementById(id)?.remove();
    });
  }

  private setSchema(id: string, data: Record<string, unknown>): void {
    let el = this.document.getElementById(id);
    if (!el) {
      el = this.document.createElement('script');
      el.id = id;
      el.setAttribute('type', 'application/ld+json');
      this.document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
  }
}
```
