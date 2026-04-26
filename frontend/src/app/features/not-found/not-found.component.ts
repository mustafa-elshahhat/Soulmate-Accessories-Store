import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex flex-col bg-background">
      <!-- Header -->
      <header class="border-b border-border px-4 h-16 flex items-center">
        <a routerLink="/" class="block"><img src="/assets/images/logo-md.webp" srcset="/assets/images/logo-sm.webp 200w, /assets/images/logo-md.webp 400w" sizes="120px" alt="Soulmate" class="h-10 w-auto" /></a>
      </header>

      <!-- Content -->
      <main class="flex-1 flex items-center justify-center px-4">
        <div class="text-center max-w-lg">
          <!-- 404 Number -->
          <div class="mb-8">
            <h1 class="font-playfair text-8xl md:text-9xl font-bold text-primary leading-none">404</h1>
            <div class="h-1 w-16 bg-primary mx-auto mt-4 rounded-full"></div>
          </div>

          <!-- Message -->
          <h2 class="font-playfair text-2xl md:text-3xl font-bold text-foreground mb-4">{{ 'notFound.pageNotFound' | t }}</h2>
          <p class="text-muted-foreground mb-10 leading-relaxed">
            {{ 'notFound.description' | t }}
          </p>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              routerLink="/"
              class="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
            >
              {{ 'notFound.backToHome' | t }}
            </a>
            <a
              routerLink="/products"
              class="border border-primary text-primary px-8 py-3 rounded-xl font-semibold hover:bg-primary-light transition-colors"
            >
              {{ 'notFound.browseProducts' | t }}
            </a>
          </div>

          <!-- Helpful Links -->
          <div class="mt-12 pt-8 border-t border-border">
            <p class="text-sm text-muted-foreground mb-4">{{ 'notFound.tryThesePages' | t }}</p>
            <div class="flex flex-wrap justify-center gap-4">
              <a routerLink="/builder/select" class="text-sm text-primary hover:text-primary-dark font-medium transition-colors">{{ 'notFound.buildYourBox' | t }}</a>
              <a routerLink="/about" class="text-sm text-primary hover:text-primary-dark font-medium transition-colors">{{ 'notFound.aboutSoulmate' | t }}</a>
              <a routerLink="/contact" class="text-sm text-primary hover:text-primary-dark font-medium transition-colors">{{ 'notFound.contactUs' | t }}</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
})
export class NotFoundComponent implements OnInit {
  private seoService = inject(SeoService);
  private t = inject(TranslationService);

  ngOnInit(): void {
    this.seoService.updatePage({
      title: this.t.get('notFound.seo.title'),
      description: this.t.get('notFound.seo.description'),
    });
  }
}
