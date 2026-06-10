import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Product } from '../models/product.model';
import { ProductReviewsSummary } from '../models/review.model';

interface BreadcrumbItem {
  name: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class StructuredDataService {
  private document = inject(DOCUMENT);
  private readonly BASE_URL = 'https://soulmate-store.com';

  setProductSchema(product: Product, lang: 'ar' | 'en' = 'ar', reviews?: ProductReviewsSummary): void {
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: product.image_url,
      description: product.description,
      inLanguage: lang,
      brand: {
        '@type': 'Brand',
        name: 'Soulmate Store',
      },
      offers: {
        '@type': 'Offer',
        url: `${this.BASE_URL}/${lang}/products/${product.slug}`,
        priceCurrency: 'EGP',
        price: product.price.toString(),
        priceValidUntil: `${new Date().getFullYear()}-12-31`,
        availability: product.is_active
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: {
          '@type': 'Organization',
          name: 'Soulmate Store',
        },
      },
    };

    if (reviews && reviews.total_reviews > 0) {
      schema['aggregateRating'] = {
        '@type': 'AggregateRating',
        ratingValue: reviews.average_rating.toString(),
        reviewCount: reviews.total_reviews.toString(),
        bestRating: '5',
        worstRating: '1',
      };

      schema['review'] = reviews.reviews.slice(0, 5).map((r) => ({
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.rating.toString(),
          bestRating: '5',
        },
        author: {
          '@type': 'Person',
          name: r.user_name,
        },
        datePublished: r.created_at.split('T')[0],
        ...(r.comment ? { reviewBody: r.comment } : {}),
      }));
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
      logo: `${this.BASE_URL}/assets/images/logo-lg.webp`,
      description: 'Personalized gifts, custom gift boxes, and engraved couple gifts.',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: ['Arabic', 'English'],
      },
    });
  }

  setWebSiteSchema(lang: 'ar' | 'en' = 'ar'): void {
    this.setSchema('sd-website', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: lang === 'ar' ? 'سولميت ستور' : 'Soulmate Store',
      url: `${this.BASE_URL}/${lang}/`,
      inLanguage: lang,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${this.BASE_URL}/${lang}/products?q={search_term_string}`,
        },
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

  setFAQSchema(faqs: { question: string; answer: string }[]): void {
    this.setSchema('sd-faq', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer,
        },
      })),
    });
  }

  removeAllSchemas(): void {
    const ids = ['sd-product', 'sd-org', 'sd-website', 'sd-breadcrumb', 'sd-faq'];
    for (const id of ids) {
      this.document.getElementById(id)?.remove();
    }
  }

  /** @deprecated Use removeAllSchemas() instead */
  removeSchema(): void {
    this.document.getElementById('structured-data')?.remove();
    this.removeAllSchemas();
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
