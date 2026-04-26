import { Component, inject, signal, OnInit, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductService } from '../../core/services/product.service';
import { SeoService } from '../../core/services/seo.service';
import { StructuredDataService } from '../../core/services/structured-data.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { Product } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeInLeft {
      from { opacity: 0; transform: translateX(-40px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes fadeInRight {
      from { opacity: 0; transform: translateX(40px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.92); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-12px); }
    }
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    .hero-text { animation: fadeInRight 0.8s ease-out both; }
    .hero-text-delay-1 { animation: fadeInRight 0.8s 0.15s ease-out both; }
    .hero-text-delay-2 { animation: fadeInRight 0.8s 0.3s ease-out both; }
    .hero-text-delay-3 { animation: fadeInRight 0.8s 0.45s ease-out both; }
    .hero-image { animation: fadeInLeft 0.9s 0.2s ease-out both; }
    .hero-float { animation: float 5s ease-in-out infinite; }
    .hero-badge {
      animation: fadeInRight 0.8s ease-out both;
    }
    @keyframes bounceDown {
      0%, 100% { transform: translateY(0); opacity: 0.6; }
      50% { transform: translateY(6px); opacity: 1; }
    }
    .scroll-hint { animation: bounceDown 2s ease-in-out infinite 1.5s; opacity: 0; }
    .step-card { transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease; }
    .step-card:hover { transform: translateY(-8px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
    .bg-grid-pattern {
      background-image: linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 32px 32px;
    }
    .glass-panel {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
  `,
  template: `
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-[#121212] via-[#1A1A1A] to-[#121212] overflow-hidden">
      <!-- Subtle decorative elements -->
      <div class="absolute inset-0 bg-grid-pattern opacity-60"></div>
      <div class="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div class="absolute bottom-10 left-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div class="max-w-[1280px] mx-auto px-6 lg:px-8 py-12 md:py-20 lg:py-24 relative z-10">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-12 lg:gap-16 items-center">

          <!-- Text Content (Right side in RTL) -->
          <div class="order-2 md:order-1 text-center md:text-start">
            <!-- Badge -->
            <span class="hero-badge inline-block text-primary text-[11px] tracking-[0.2em] font-semibold uppercase mb-5 md:mb-6 font-inter px-4 py-1.5 rounded-full border border-primary/30">
              {{ 'home.hero.badge' | t }}
            </span>

            <h1 class="hero-text-delay-1 font-playfair text-[1.75rem] sm:text-[2.25rem] md:text-[2.75rem] lg:text-[3.25rem] font-bold text-white mb-4 md:mb-5 leading-[1.2]">
              {{ 'home.hero.titleLine1' | t }}<br/>
              <span class="text-primary">{{ 'home.hero.titleLine2' | t }}</span>
            </h1>

            <p class="hero-text-delay-2 text-[14px] md:text-base text-white/70 max-w-lg md:max-w-none mb-6 md:mb-8 leading-relaxed font-inter mx-auto md:mx-0">
              {{ 'home.hero.description' | t }}
            </p>

            <div class="hero-text-delay-3 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <a
                routerLink="/builder/select"
                class="bg-primary text-white h-11 md:h-12 px-8 rounded-lg font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 hover:bg-primary-dark transition-all duration-300 flex items-center justify-center"
              >
                {{ 'home.hero.ctaBuildBox' | t }}
              </a>
              <a
                routerLink="/products"
                class="border border-white/20 text-white h-11 md:h-12 px-8 rounded-lg font-medium text-sm hover:bg-white/5 hover:border-primary hover:text-primary transition-all duration-300 flex items-center justify-center"
              >
                {{ 'home.hero.ctaBrowse' | t }}
              </a>
            </div>
          </div>

          <!-- Image (Left side in RTL) -->
          <div class="order-1 md:order-2 flex justify-center">
            <div class="hero-image relative">
              <!-- Decorative glow behind image -->
              <div class="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent rounded-3xl blur-2xl scale-105"></div>

              <picture class="relative block hero-float">
                <source srcset="/assets/images/hero-bg-sm.webp" media="(max-width: 640px)" type="image/webp">
                <source srcset="/assets/images/hero-bg-md.webp" media="(max-width: 1024px)" type="image/webp">
                <source srcset="/assets/images/hero-bg-lg.webp" type="image/webp">
                <img
                  src="/assets/images/hero-bg-lg.webp"
                  [alt]="'home.hero.imageAlt' | t"
                  width="960"
                  height="960"
                  class="relative w-full max-w-[220px] sm:max-w-[280px] md:max-w-[400px] lg:max-w-[480px] h-auto rounded-2xl shadow-2xl shadow-black/30"
                  loading="eager"
                  fetchpriority="high"
                />
              </picture>

              <!-- Floating accent dots -->
              <div class="absolute -top-3 -start-3 w-6 h-6 bg-primary/25 rounded-full animate-pulse"></div>
              <div class="absolute -bottom-4 -end-4 w-10 h-10 bg-primary/15 rounded-full animate-pulse" style="animation-delay: 1s"></div>
            </div>
          </div>

        </div>
      </div>

      <!-- Scroll hint -->
      <div class="hidden md:flex justify-center pb-6">
        <div class="scroll-hint text-white/30">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg>
        </div>
      </div>
    </section>

    <!-- Featured Products Section -->
    <section class="relative py-16 md:py-24 overflow-hidden">
      <!-- Subtle background decoration -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-3xl"></div>
      <div class="max-w-[1280px] mx-auto px-4 relative">
        <div class="text-center mb-12 md:mb-16">
          <h2 class="font-playfair text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            {{ 'home.featured.title' | t }}
          </h2>
          <div class="w-12 h-[2px] bg-primary/40 mx-auto mt-4"></div>
        </div>

        @if (productsLoading()) {
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            @for (i of skeletonItems; track i) {
              <div class="bg-background rounded-xl shadow-sm border border-border overflow-hidden flex flex-col">
                <div class="aspect-square bg-muted animate-pulse"></div>
                <div class="p-5 md:p-6 space-y-3">
                  <div class="h-5 bg-muted rounded animate-pulse w-3/4"></div>
                  <div class="h-4 bg-muted rounded animate-pulse"></div>
                  <div class="h-4 bg-muted rounded animate-pulse w-2/3"></div>
                  <div class="flex gap-0.5">
                    @for (s of [1,2,3,4,5]; track s) {
                      <div class="w-4 h-4 bg-muted rounded-full animate-pulse"></div>
                    }
                  </div>
                  <div class="pt-2">
                    <div class="h-3 bg-muted rounded animate-pulse w-10 mb-1"></div>
                    <div class="h-6 bg-muted rounded animate-pulse w-20"></div>
                  </div>
                  <div class="h-12 bg-muted rounded-xl animate-pulse mt-2"></div>
                </div>
              </div>
            }
          </div>
        } @else if (featuredProducts().length > 0) {
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            @for (product of featuredProducts(); track product.id) {
              <app-product-card [product]="product"></app-product-card>
            }
          </div>

          <div class="text-center mt-12 md:mt-16">
            <a
              routerLink="/products"
              class="group inline-flex items-center justify-center gap-2 h-12 px-10 border border-primary text-primary rounded-xl font-semibold text-sm tracking-wide hover:bg-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
            >
              {{ 'home.featured.viewAll' | t }}
              <svg class="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
            </a>
          </div>
        } @else {
          <div class="text-center py-16">
            <div class="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-primary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/></svg>
            </div>
            <p class="text-muted-foreground">{{ 'home.featured.empty' | t }}</p>
          </div>
        }
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="relative bg-gradient-to-b from-[#FAFAF8] to-white py-16 md:py-24 overflow-hidden">
      <div class="absolute top-0 start-0 w-full h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent"></div>
      <div class="max-w-[1280px] mx-auto px-4">
        <div class="text-center mb-12 md:mb-16">
          <h2 class="font-playfair text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            {{ 'home.howItWorks.title' | t }}
          </h2>
          <div class="w-12 h-[2px] bg-primary/40 mx-auto mt-4"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <!-- Step 1 -->
          <div class="text-center p-8 md:p-10 rounded-xl bg-background border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 step-card relative group">
            <div class="absolute inset-0 rounded-xl bg-gradient-to-b from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="relative z-10">
              <div class="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark text-white rounded-xl flex items-center justify-center mx-auto mb-6 text-xl font-bold font-playfair shadow-md shadow-primary/20">
                1
              </div>
              <h3 class="font-playfair text-lg font-semibold text-foreground mb-3">{{ 'home.howItWorks.step1Title' | t }}</h3>
              <p class="text-muted-foreground leading-relaxed text-[13px]">
                {{ 'home.howItWorks.step1Desc' | t }}
              </p>
            </div>
          </div>

          <!-- Step 2 -->
          <div class="text-center p-8 md:p-10 rounded-xl bg-background border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 step-card relative group">
            <div class="absolute inset-0 rounded-xl bg-gradient-to-b from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="relative z-10">
              <div class="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark text-white rounded-xl flex items-center justify-center mx-auto mb-6 text-xl font-bold font-playfair shadow-md shadow-primary/20">
                2
              </div>
              <h3 class="font-playfair text-lg font-semibold text-foreground mb-3">{{ 'home.howItWorks.step2Title' | t }}</h3>
              <p class="text-muted-foreground leading-relaxed text-[13px]">
                {{ 'home.howItWorks.step2Desc' | t }}
              </p>
            </div>
          </div>

          <!-- Step 3 -->
          <div class="text-center p-8 md:p-10 rounded-xl bg-background border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 step-card relative group">
            <div class="absolute inset-0 rounded-xl bg-gradient-to-b from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="relative z-10">
              <div class="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark text-white rounded-xl flex items-center justify-center mx-auto mb-6 text-xl font-bold font-playfair shadow-md shadow-primary/20">
                3
              </div>
              <h3 class="font-playfair text-lg font-semibold text-foreground mb-3">{{ 'home.howItWorks.step3Title' | t }}</h3>
              <p class="text-muted-foreground leading-relaxed text-[13px]">
                {{ 'home.howItWorks.step3Desc' | t }}
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- Bottom CTA Section -->
    <section class="relative bg-gradient-to-br from-[#121212] via-[#1A1A1A] to-[#121212] overflow-hidden">
      <!-- Decorative elements -->
      <div class="absolute inset-0 bg-grid-pattern opacity-60"></div>
      <div class="absolute top-10 right-10 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div class="absolute bottom-10 left-10 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div class="max-w-[1280px] mx-auto px-6 lg:px-8 py-16 md:py-24 relative z-10">
        <!-- Text content centered -->
        <div class="text-center mb-12 md:mb-16 max-w-2xl mx-auto">
          <span class="inline-block text-primary text-[11px] tracking-[0.2em] font-semibold uppercase mb-5 font-inter px-4 py-1.5 rounded-full border border-primary/30">
            {{ 'home.cta.badge' | t }}
          </span>
          <h2 class="font-playfair text-2xl sm:text-3xl md:text-[2.5rem] font-bold text-white mb-4 leading-[1.2]">
            {{ 'home.cta.titlePart1' | t }} <span class="text-primary">{{ 'home.cta.titlePart2' | t }}</span>
          </h2>
          <p class="text-[14px] md:text-base text-white/70 leading-relaxed font-inter max-w-lg mx-auto">
            {{ 'home.cta.description' | t }}
          </p>
        </div>

        <!-- 3 Box Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <!-- Male Box -->
          <a routerLink="/builder/select" class="group relative rounded-2xl overflow-hidden aspect-[4/5] sm:aspect-[3/4] shadow-2xl" [attr.aria-label]="'home.cta.boxMaleAria' | t">
            <img src="/assets/images/box-male-sm.webp" srcset="/assets/images/box-male-sm.webp 450w, /assets/images/box-male-md.webp 700w, /assets/images/box-male.webp 1229w" sizes="(max-width: 640px) 100vw, 33vw" [alt]="'home.cta.boxMaleAlt' | t" width="600" height="750" class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" loading="lazy" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>
            <div class="absolute bottom-0 right-0 left-0 p-5 md:p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
              <div class="glass-panel p-5 rounded-xl border border-white/10 shadow-lg relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span class="relative z-10 text-[10px] tracking-[0.2em] uppercase text-primary font-inter font-bold">{{ 'home.cta.boxMaleLabel' | t }}</span>
                <h3 class="relative z-10 font-playfair text-white text-xl md:text-2xl font-bold mt-2 drop-shadow-md">{{ 'home.cta.boxMaleTitle' | t }}</h3>
                <div class="relative z-10 flex items-center gap-2 mt-3 text-white/70 text-sm font-inter group-hover:text-primary transition-colors">
                  <span class="font-medium">{{ 'home.cta.discover' | t }}</span>
                  <svg class="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                </div>
              </div>
            </div>
          </a>

          <!-- Female Box -->
          <a routerLink="/builder/select" class="group relative rounded-2xl overflow-hidden aspect-[4/5] sm:aspect-[3/4] shadow-2xl" [attr.aria-label]="'home.cta.boxFemaleAria' | t">
            <img src="/assets/images/box-female-sm.webp" srcset="/assets/images/box-female-sm.webp 450w, /assets/images/box-female-md.webp 700w, /assets/images/box-female.webp 1229w" sizes="(max-width: 640px) 100vw, 33vw" [alt]="'home.cta.boxFemaleAlt' | t" width="600" height="750" class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" loading="lazy" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>
            <div class="absolute bottom-0 right-0 left-0 p-5 md:p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
              <div class="glass-panel p-5 rounded-xl border border-white/10 shadow-lg relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span class="relative z-10 text-[10px] tracking-[0.2em] uppercase text-primary font-inter font-bold">{{ 'home.cta.boxFemaleLabel' | t }}</span>
                <h3 class="relative z-10 font-playfair text-white text-xl md:text-2xl font-bold mt-2 drop-shadow-md">{{ 'home.cta.boxFemaleTitle' | t }}</h3>
                <div class="relative z-10 flex items-center gap-2 mt-3 text-white/70 text-sm font-inter group-hover:text-primary transition-colors">
                  <span class="font-medium">{{ 'home.cta.discover' | t }}</span>
                  <svg class="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                </div>
              </div>
            </div>
          </a>

          <!-- Couple Box -->
          <a routerLink="/builder/select" class="group relative rounded-2xl overflow-hidden aspect-[4/5] sm:aspect-[3/4] shadow-2xl" [attr.aria-label]="'home.cta.boxCoupleAria' | t">
            <img src="/assets/images/box-couple-sm.webp" srcset="/assets/images/box-couple-sm.webp 450w, /assets/images/box-couple-md.webp 700w, /assets/images/box-couple.webp 1229w" sizes="(max-width: 640px) 100vw, 33vw" [alt]="'home.cta.boxCoupleAlt' | t" width="600" height="750" class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" loading="lazy" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>
            <div class="absolute bottom-0 right-0 left-0 p-5 md:p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
              <div class="glass-panel p-5 rounded-xl border border-white/10 shadow-lg relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span class="relative z-10 text-[10px] tracking-[0.2em] uppercase text-primary font-inter font-bold">{{ 'home.cta.boxCoupleLabel' | t }}</span>
                <h3 class="relative z-10 font-playfair text-white text-xl md:text-2xl font-bold mt-2 drop-shadow-md">{{ 'home.cta.boxCoupleTitle' | t }}</h3>
                <div class="relative z-10 flex items-center gap-2 mt-3 text-white/70 text-sm font-inter group-hover:text-primary transition-colors">
                  <span class="font-medium">{{ 'home.cta.discover' | t }}</span>
                  <svg class="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  `,
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private seoService = inject(SeoService);
  private structuredData = inject(StructuredDataService);
  private t = inject(TranslationService);
  private destroyRef = inject(DestroyRef);

  featuredProducts = signal<Product[]>([]);
  productsLoading = signal(true);
  readonly skeletonItems = [1, 2, 3, 4];

  ngOnInit(): void {
    this.seoService.updatePage({
      title: this.t.get('home.seo.title'),
      description: this.t.get('home.seo.description'),
      url: '/',
      lang: this.t.currentLang(),
    });

    this.structuredData.setOrganizationSchema();
    this.structuredData.setWebSiteSchema(this.t.currentLang());

    this.productService.getAll({ page: 1, limit: 4 }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.featuredProducts.set(res.data);
        this.productsLoading.set(false);
      },
      error: () => {
        this.productsLoading.set(false);
      },
    });
  }
}
