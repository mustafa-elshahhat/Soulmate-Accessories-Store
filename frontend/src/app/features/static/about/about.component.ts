import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../../core/services/seo.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: fadeInUp 0.7s ease-out both; }
    .fade-up-d1 { animation: fadeInUp 0.7s 0.1s ease-out both; }
    .fade-up-d2 { animation: fadeInUp 0.7s 0.2s ease-out both; }
    .fade-up-d3 { animation: fadeInUp 0.7s 0.3s ease-out both; }
    .fade-up-d4 { animation: fadeInUp 0.7s 0.4s ease-out both; }
    .feature-card { transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
    .feature-card:hover { transform: translateY(-6px); }
  `,
  template: `
    <!-- Hero -->
    <section class="relative bg-gradient-to-br from-[#121212] via-[#1A1A1A] to-[#121212] overflow-hidden">
      <div class="absolute inset-0 border-b border-border/10 bg-[url('/assets/images/grid-pattern.svg')] opacity-5"></div>
      <div class="absolute top-10 end-10 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div class="absolute bottom-10 start-10 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div class="absolute bottom-10 start-10 w-48 h-48 bg-[#C8A96E]/5 rounded-full blur-3xl"></div>
      <div class="max-w-[1280px] mx-auto px-4 py-16 md:py-24 text-center relative z-10">
        <p class="fade-up text-[#C8A96E] text-sm tracking-[0.2em] uppercase mb-4 font-medium">{{ 'about.hero.label' | t }}</p>
        <h1 class="fade-up-d1 font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5">{{ 'about.hero.title' | t }}</h1>
        <div class="fade-up-d2 w-12 h-px bg-[#C8A96E] mx-auto mb-6"></div>
        <p class="fade-up-d3 text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed">
          {{ 'about.hero.subtitle' | t }}
        </p>
      </div>
    </section>

    <!-- Story -->
    <section class="max-w-[1280px] mx-auto px-4 py-14 md:py-20">
      <div class="max-w-3xl mx-auto text-center">
        <p class="text-lg md:text-xl text-foreground leading-relaxed mb-6">
          {{ 'about.story.intro' | t }}
        </p>
        <p class="text-muted-foreground leading-relaxed text-base md:text-lg">
          {{ 'about.story.body' | t }}
        </p>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="bg-muted/50">
      <div class="max-w-[1280px] mx-auto px-4 py-14 md:py-20">
        <div class="text-center mb-12">
          <p class="text-[#C8A96E] text-sm tracking-[0.15em] uppercase mb-3 font-medium">{{ 'about.features.label' | t }}</p>
          <h2 class="font-playfair text-2xl md:text-3xl font-bold text-foreground">{{ 'about.features.title' | t }}</h2>
          <div class="w-10 h-px bg-[#C8A96E] mx-auto mt-4"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="feature-card bg-background border border-border rounded-xl p-6 text-center shadow-sm hover:shadow-xl hover:border-[#C8A96E]/30">
            <div class="w-14 h-14 bg-[#C8A96E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-[#C8A96E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <h3 class="font-playfair text-lg font-bold text-foreground mb-2">{{ 'about.features.variety.title' | t }}</h3>
            <p class="text-sm text-muted-foreground">{{ 'about.features.variety.description' | t }}</p>
          </div>
          <div class="feature-card bg-background border border-border rounded-xl p-6 text-center shadow-sm hover:shadow-xl hover:border-[#C8A96E]/30">
            <div class="w-14 h-14 bg-[#C8A96E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-[#C8A96E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"/>
              </svg>
            </div>
            <h3 class="font-playfair text-lg font-bold text-foreground mb-2">{{ 'about.features.customization.title' | t }}</h3>
            <p class="text-sm text-muted-foreground">{{ 'about.features.customization.description' | t }}</p>
          </div>
          <div class="feature-card bg-background border border-border rounded-xl p-6 text-center shadow-sm hover:shadow-xl hover:border-[#C8A96E]/30">
            <div class="w-14 h-14 bg-[#C8A96E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-[#C8A96E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
              </svg>
            </div>
            <h3 class="font-playfair text-lg font-bold text-foreground mb-2">{{ 'about.features.quality.title' | t }}</h3>
            <p class="text-sm text-muted-foreground">{{ 'about.features.quality.description' | t }}</p>
          </div>
          <div class="feature-card bg-background border border-border rounded-xl p-6 text-center shadow-sm hover:shadow-xl hover:border-[#C8A96E]/30">
            <div class="w-14 h-14 bg-[#C8A96E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-[#C8A96E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/>
              </svg>
            </div>
            <h3 class="font-playfair text-lg font-bold text-foreground mb-2">{{ 'about.features.delivery.title' | t }}</h3>
            <p class="text-sm text-muted-foreground">{{ 'about.features.delivery.description' | t }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Vision -->
    <section class="max-w-[1280px] mx-auto px-4 py-14 md:py-20">
      <div class="max-w-3xl mx-auto">
        <div class="relative border-e-2 border-[#C8A96E]/30 pe-8">
          <div class="absolute top-0 end-[-5px] w-2 h-2 rounded-full bg-[#C8A96E]"></div>
          <h2 class="font-playfair text-2xl md:text-3xl font-bold text-foreground mb-5">{{ 'about.vision.title' | t }}</h2>
          <p class="text-muted-foreground leading-relaxed text-base md:text-lg">
            {{ 'about.vision.body' | t }}
          </p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="relative bg-gradient-to-br from-[#121212] via-[#1A1A1A] to-[#121212] overflow-hidden">
      <div class="absolute top-0 start-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div class="max-w-[1280px] mx-auto px-4 py-16 md:py-20 text-center relative z-10">
        <h2 class="font-playfair text-2xl md:text-3xl font-bold text-white mb-4">{{ 'about.cta.title' | t }}</h2>
        <p class="text-neutral-400 mb-8 max-w-lg mx-auto">{{ 'about.cta.subtitle' | t }}</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a routerLink="/builder/select" class="bg-[#C8A96E] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#A88B4A] transition-colors">
            {{ 'about.cta.buildBox' | t }}
          </a>
          <a routerLink="/products" class="border border-[#C8A96E]/50 text-[#C8A96E] px-8 py-3 rounded-xl font-semibold hover:bg-[#C8A96E]/10 transition-colors">
            {{ 'about.cta.browseProducts' | t }}
          </a>
        </div>
      </div>
    </section>
  `,
})
export class AboutComponent implements OnInit {
  private seoService = inject(SeoService);
  private t = inject(TranslationService);

  ngOnInit(): void {
    this.seoService.updatePage({
      title: this.t.get('about.seo.title'),
      description: this.t.get('about.seo.description'),
      url: '/about',
    });
  }
}
