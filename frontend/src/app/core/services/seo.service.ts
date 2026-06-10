import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { TranslationService, Lang } from './translation.service';

interface SeoConfig {
  title: string;
  description: string;
  image?: string;
  url?: string;
  lang?: Lang;
  type?: string;
  noIndex?: boolean;
}

const DEFAULT_OG_IMAGE = 'https://soulmate-store.com/assets/images/logo-lg.webp';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private meta = inject(Meta);
  private title = inject(Title);
  private document = inject(DOCUMENT);
  private translationService = inject(TranslationService);
  private readonly BASE_URL = 'https://soulmate-store.com';

  updatePage(config: SeoConfig): void {
    const lang = config.lang || this.translationService.currentLang();
    const fullTitle = `${config.title} | Soulmate Store`;
    const canonicalUrl = config.url
      ? `${this.BASE_URL}${config.url}`
      : this.BASE_URL;

    // Title & Description
    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: config.description });

    // Robots
    if (config.noIndex) {
      this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    } else {
      this.meta.removeTag('name="robots"');
    }

    // Canonical
    this.setLinkTag('canonical', canonicalUrl);

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: config.title });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ property: 'og:type', content: config.type || 'website' });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ property: 'og:site_name', content: 'Soulmate Store' });
    this.meta.updateTag({ property: 'og:locale', content: lang === 'ar' ? 'ar_EG' : 'en_US' });
    this.meta.updateTag({ property: 'og:locale:alternate', content: lang === 'ar' ? 'en_US' : 'ar_EG' });
    const ogImage = config.image || DEFAULT_OG_IMAGE;
    this.meta.updateTag({ property: 'og:image', content: ogImage });
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });

    // Twitter Card
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: config.title });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });
    this.meta.updateTag({ name: 'twitter:image', content: ogImage });

    // Content-Language meta tag
    this.meta.updateTag({ httpEquiv: 'content-language', content: lang });

    // Update html lang and dir attributes
    const html = this.document.documentElement;
    if (html) {
      html.setAttribute('lang', lang);
      html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    }

    // hreflang
    this.updateHreflang(config.url || '/');
  }

  private updateHreflang(path: string): void {
    // Remove old hreflang links
    this.document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());

    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const pageUrl = `${this.BASE_URL}${cleanPath}`;
    const separator = cleanPath.includes('?') ? '&' : '?';

    const hreflangs: { hreflang: string; href: string }[] = [
      { hreflang: 'ar', href: `${pageUrl}${separator}hl=ar` },
      { hreflang: 'en', href: `${pageUrl}${separator}hl=en` },
      { hreflang: 'x-default', href: pageUrl },
    ];

    for (const { hreflang, href } of hreflangs) {
      const link = this.document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', hreflang);
      link.setAttribute('href', href);
      this.document.head.appendChild(link);
    }
  }

  private setLinkTag(rel: string, href: string): void {
    let link = this.document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', rel);
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }
}
