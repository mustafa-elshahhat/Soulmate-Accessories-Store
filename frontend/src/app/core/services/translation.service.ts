import {
  Injectable,
  inject,
  signal,
  computed,
  PLATFORM_ID,
  Injector,
} from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

import ar from '../../../i18n/ar.json';
import en from '../../../i18n/en.json';

export type Lang = 'ar' | 'en';

type TranslationMap = Record<string, unknown>;

const TRANSLATIONS: Record<Lang, TranslationMap> = { ar, en };
const STORAGE_KEY = 'soulmate_lang';
const COOKIE_KEY = 'soulmate_lang';
const DEFAULT_LANG: Lang = 'en';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private injector = inject(Injector);

  readonly currentLang = signal<Lang>(this.determineInitialLang());
  readonly currentDir = computed(() => (this.currentLang() === 'ar' ? 'rtl' : 'ltr'));
  readonly currentLocale = computed(() => (this.currentLang() === 'ar' ? 'ar-EG' : 'en-US'));

  get(key: string, params?: Record<string, string | number>): string {
    const lang = this.currentLang();
    const value = this.resolve(TRANSLATIONS[lang], key);
    if (!value) return key;
    if (!params) return value;
    return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey: string) =>
      params[paramKey] !== undefined ? String(params[paramKey]) : `{{${paramKey}}}`,
    );
  }

  setLang(lang: Lang): void {
    if (lang === this.currentLang()) return;
    this.currentLang.set(lang);
    this.persist(lang);
    this.updateDocumentAttributes(lang);

    // Sync language preference to the backend for authenticated users
    if (isPlatformBrowser(this.platformId)) {
      import('./auth.service').then(m => {
        const authService = this.injector.get(m.AuthService, null);
        authService?.syncLang(lang);
      }).catch(() => { /* ignore */ });
    }
  }

  toggle(): void {
    this.setLang(this.currentLang() === 'ar' ? 'en' : 'ar');
  }

  initDocumentAttributes(): void {
    this.updateDocumentAttributes(this.currentLang());
    // Remove the lang-resolving class set by the inline script in index.html
    // to reveal content now that Angular has hydrated with the correct language.
    if (isPlatformBrowser(this.platformId)) {
      this.document.documentElement.classList.remove('lang-resolving');
    }
  }

  private resolve(obj: TranslationMap, path: string): string | undefined {
    const keys = path.split('.');
    let current: unknown = obj;
    for (const k of keys) {
      if (current == null || typeof current !== 'object') return undefined;
      current = (current as Record<string, unknown>)[k];
    }
    return typeof current === 'string' ? current : undefined;
  }

  private determineInitialLang(): Lang {
    if (!isPlatformBrowser(this.platformId)) {
      try {
        const request = this.injector.get(this.getRequestToken() as string, null);
        if (request) {
          const cookies =
            (request as { headers?: Record<string, string> }).headers?.['cookie'] ?? '';
          const match = cookies.match(new RegExp(`${COOKIE_KEY}=(ar|en)`));
          if (match) return match[1] as Lang;
        }
      } catch {
        /* REQUEST token not available */
      }
      return DEFAULT_LANG;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'ar' || stored === 'en') return stored;
    } catch {
      /* localStorage unavailable */
    }
    return DEFAULT_LANG;
  }

  private getRequestToken(): unknown {
    try {
      // Dynamic import to avoid compilation issues when @angular/ssr is not resolved
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require('@angular/ssr').REQUEST;
    } catch {
      return 'REQUEST';
    }
  }

  private persist(lang: Lang): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
    this.document.cookie = `${COOKIE_KEY}=${lang};path=/;max-age=31536000;SameSite=Lax`;
  }

  private updateDocumentAttributes(lang: Lang): void {
    this.document.documentElement.lang = lang;
    this.document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
}
