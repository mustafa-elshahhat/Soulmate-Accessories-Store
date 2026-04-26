import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../../core/services/seo.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-privacy',
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
    .policy-section { transition: all 0.3s ease; }
    .policy-section:hover { border-color: rgba(200,169,110,0.3); }
  `,
  template: `
    <!-- Hero -->
    <section class="relative bg-gradient-to-br from-[#1A1A1A] via-[#242424] to-[#1A1A1A] overflow-hidden">
      <div class="absolute top-10 right-10 w-64 h-64 bg-[#C8A96E]/8 rounded-full blur-3xl"></div>
      <div class="absolute bottom-10 left-10 w-48 h-48 bg-[#C8A96E]/5 rounded-full blur-3xl"></div>
      <div class="max-w-[1280px] mx-auto px-4 py-16 md:py-24 text-center relative z-10">
        <p class="fade-up text-[#C8A96E] text-sm tracking-[0.2em] uppercase mb-4 font-medium">{{ 'privacy.hero.label' | t }}</p>
        <h1 class="fade-up-d1 font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5">{{ 'privacy.hero.title' | t }}</h1>
        <div class="fade-up-d2 w-12 h-px bg-[#C8A96E] mx-auto mb-6"></div>
        <p class="text-neutral-400 text-sm">{{ 'privacy.hero.lastUpdated' | t }}</p>
      </div>
    </section>

    <section class="max-w-[1280px] mx-auto px-4 py-14 md:py-20">
      <div class="max-w-3xl mx-auto">
        <!-- Intro -->
        <p class="text-lg md:text-xl text-foreground leading-relaxed mb-12 text-center">
          {{ 'privacy.intro' | t }}
        </p>

        <div class="space-y-6">
          <!-- Section 1 -->
          <div class="policy-section border border-border rounded-xl p-6 md:p-8">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-8 h-8 bg-[#C8A96E]/10 rounded-full flex items-center justify-center shrink-0">
                <span class="text-[#C8A96E] text-sm font-bold">1</span>
              </div>
              <h2 class="font-playfair text-xl md:text-2xl font-bold text-foreground">{{ 'privacy.section1.title' | t }}</h2>
            </div>
            <div class="space-y-3 text-muted-foreground">
              <div class="flex items-start gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-[#C8A96E] mt-2.5 shrink-0"></span>
                <p>{{ 'privacy.section1.item1' | t }}</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-[#C8A96E] mt-2.5 shrink-0"></span>
                <p>{{ 'privacy.section1.item2' | t }}</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-[#C8A96E] mt-2.5 shrink-0"></span>
                <p>{{ 'privacy.section1.item3' | t }}</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-[#C8A96E] mt-2.5 shrink-0"></span>
                <p>{{ 'privacy.section1.item4' | t }}</p>
              </div>
            </div>
          </div>

          <!-- Section 2 -->
          <div class="policy-section border border-border rounded-xl p-6 md:p-8">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-8 h-8 bg-[#C8A96E]/10 rounded-full flex items-center justify-center shrink-0">
                <span class="text-[#C8A96E] text-sm font-bold">2</span>
              </div>
              <h2 class="font-playfair text-xl md:text-2xl font-bold text-foreground">{{ 'privacy.section2.title' | t }}</h2>
            </div>
            <div class="space-y-3 text-muted-foreground">
              <div class="flex items-start gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-[#C8A96E] mt-2.5 shrink-0"></span>
                <p>{{ 'privacy.section2.item1' | t }}</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-[#C8A96E] mt-2.5 shrink-0"></span>
                <p>{{ 'privacy.section2.item2' | t }}</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-[#C8A96E] mt-2.5 shrink-0"></span>
                <p>{{ 'privacy.section2.item3' | t }}</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-[#C8A96E] mt-2.5 shrink-0"></span>
                <p>{{ 'privacy.section2.item4' | t }}</p>
              </div>
            </div>
          </div>

          <!-- Section 3 -->
          <div class="policy-section border border-border rounded-xl p-6 md:p-8">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-8 h-8 bg-[#C8A96E]/10 rounded-full flex items-center justify-center shrink-0">
                <span class="text-[#C8A96E] text-sm font-bold">3</span>
              </div>
              <h2 class="font-playfair text-xl md:text-2xl font-bold text-foreground">{{ 'privacy.section3.title' | t }}</h2>
            </div>
            <p class="text-muted-foreground mb-4">
              {{ 'privacy.section3.body' | t }}
            </p>
            <div class="bg-[#C8A96E]/5 border border-[#C8A96E]/20 rounded-xl p-4">
              <p class="text-sm text-muted-foreground">
                <strong class="text-foreground">{{ 'common.note' | t }}</strong>
                {{ 'privacy.section3.note' | t }}
              </p>
            </div>
          </div>

          <!-- Section 4 -->
          <div class="policy-section border border-border rounded-xl p-6 md:p-8">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-8 h-8 bg-[#C8A96E]/10 rounded-full flex items-center justify-center shrink-0">
                <span class="text-[#C8A96E] text-sm font-bold">4</span>
              </div>
              <h2 class="font-playfair text-xl md:text-2xl font-bold text-foreground">{{ 'privacy.section4.title' | t }}</h2>
            </div>
            <p class="text-muted-foreground">
              {{ 'privacy.section4.body' | t }}
            </p>
          </div>

          <!-- Section 5 -->
          <div class="policy-section border border-border rounded-xl p-6 md:p-8">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-8 h-8 bg-[#C8A96E]/10 rounded-full flex items-center justify-center shrink-0">
                <span class="text-[#C8A96E] text-sm font-bold">5</span>
              </div>
              <h2 class="font-playfair text-xl md:text-2xl font-bold text-foreground">{{ 'privacy.section5.title' | t }}</h2>
            </div>
            <div class="space-y-3 text-muted-foreground">
              <div class="flex items-start gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-[#C8A96E] mt-2.5 shrink-0"></span>
                <p>{{ 'privacy.section5.item1' | t }}</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-[#C8A96E] mt-2.5 shrink-0"></span>
                <p>{{ 'privacy.section5.item2' | t }}</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-[#C8A96E] mt-2.5 shrink-0"></span>
                <p>{{ 'privacy.section5.item3' | t }}</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-[#C8A96E] mt-2.5 shrink-0"></span>
                <p>{{ 'privacy.section5.item4' | t }}</p>
              </div>
            </div>
          </div>

          <!-- Section 6 -->
          <div class="policy-section border border-border rounded-xl p-6 md:p-8">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-8 h-8 bg-[#C8A96E]/10 rounded-full flex items-center justify-center shrink-0">
                <span class="text-[#C8A96E] text-sm font-bold">6</span>
              </div>
              <h2 class="font-playfair text-xl md:text-2xl font-bold text-foreground">{{ 'privacy.section6.title' | t }}</h2>
            </div>
            <p class="text-muted-foreground mb-4">
              {{ 'privacy.section6.body' | t }}
            </p>
            <a routerLink="/contact" class="inline-flex items-center gap-2 text-[#C8A96E] hover:text-[#A88B4A] font-medium transition-colors">
              {{ 'common.contactPage' | t }}
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class PrivacyComponent implements OnInit {
  private seoService = inject(SeoService);
  private t = inject(TranslationService);

  ngOnInit(): void {
    this.seoService.updatePage({
      title: this.t.get('privacy.seo.title'),
      description: this.t.get('privacy.seo.description'),
      url: '/privacy',
    });
  }
}
