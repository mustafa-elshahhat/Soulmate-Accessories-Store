import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../../core/services/seo.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-return-policy',
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
        <p class="fade-up text-[#C8A96E] text-sm tracking-[0.2em] uppercase mb-4 font-medium">{{ 'returnPolicy.hero.label' | t }}</p>
        <h1 class="fade-up-d1 font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5">{{ 'returnPolicy.hero.title' | t }}</h1>
        <div class="fade-up-d2 w-12 h-px bg-[#C8A96E] mx-auto mb-6"></div>
        <p class="text-neutral-400 text-sm">{{ 'returnPolicy.hero.lastUpdated' | t }}</p>
      </div>
    </section>

    <section class="max-w-[1280px] mx-auto px-4 py-14 md:py-20">
      <div class="max-w-3xl mx-auto">
        <!-- Intro -->
        <p class="text-lg md:text-xl text-foreground leading-relaxed mb-12 text-center">
          {{ 'returnPolicy.intro' | t }}
        </p>

        <div class="space-y-6">
          <!-- Section 1 -->
          <div class="policy-section border border-border rounded-xl p-6 md:p-8">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-8 h-8 bg-[#C8A96E]/10 rounded-full flex items-center justify-center shrink-0">
                <span class="text-[#C8A96E] text-sm font-bold">1</span>
              </div>
              <h2 class="font-playfair text-xl md:text-2xl font-bold text-foreground">{{ 'returnPolicy.section1.title' | t }}</h2>
            </div>
            <div class="space-y-3 text-muted-foreground">
              <div class="flex items-start gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-[#C8A96E] mt-2.5 shrink-0"></span>
                <p>{{ 'returnPolicy.section1.item1' | t }}</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-[#C8A96E] mt-2.5 shrink-0"></span>
                <p>{{ 'returnPolicy.section1.item2Prefix' | t }} <strong class="text-foreground">{{ 'returnPolicy.section1.item2Days' | t }}</strong> {{ 'returnPolicy.section1.item2Suffix' | t }}</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-[#C8A96E] mt-2.5 shrink-0"></span>
                <p>{{ 'returnPolicy.section1.item3' | t }}</p>
              </div>
            </div>
            <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-5">
              <p class="text-sm text-amber-800">
                <strong>{{ 'common.alert' | t }}</strong>
                {{ 'returnPolicy.section1.alert' | t }}
              </p>
            </div>
          </div>

          <!-- Section 2: Steps -->
          <div class="policy-section border border-border rounded-xl p-6 md:p-8">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-8 h-8 bg-[#C8A96E]/10 rounded-full flex items-center justify-center shrink-0">
                <span class="text-[#C8A96E] text-sm font-bold">2</span>
              </div>
              <h2 class="font-playfair text-xl md:text-2xl font-bold text-foreground">{{ 'returnPolicy.section2.title' | t }}</h2>
            </div>
            <div class="space-y-5">
              <div class="flex items-start gap-4">
                <div class="w-9 h-9 bg-[#C8A96E] text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</div>
                <div>
                  <p class="font-medium text-foreground">{{ 'returnPolicy.section2.step1Title' | t }}</p>
                  <p class="text-sm text-muted-foreground mt-1">{{ 'returnPolicy.section2.step1Desc' | t }}</p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="w-9 h-9 bg-[#C8A96E] text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</div>
                <div>
                  <p class="font-medium text-foreground">{{ 'returnPolicy.section2.step2Title' | t }}</p>
                  <p class="text-sm text-muted-foreground mt-1">{{ 'returnPolicy.section2.step2Desc' | t }}</p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="w-9 h-9 bg-[#C8A96E] text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</div>
                <div>
                  <p class="font-medium text-foreground">{{ 'returnPolicy.section2.step3Title' | t }}</p>
                  <p class="text-sm text-muted-foreground mt-1">{{ 'returnPolicy.section2.step3Desc' | t }}</p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="w-9 h-9 bg-[#C8A96E] text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">4</div>
                <div>
                  <p class="font-medium text-foreground">{{ 'returnPolicy.section2.step4Title' | t }}</p>
                  <p class="text-sm text-muted-foreground mt-1">{{ 'returnPolicy.section2.step4Desc' | t }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 3 -->
          <div class="policy-section border border-border rounded-xl p-6 md:p-8">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-8 h-8 bg-[#C8A96E]/10 rounded-full flex items-center justify-center shrink-0">
                <span class="text-[#C8A96E] text-sm font-bold">3</span>
              </div>
              <h2 class="font-playfair text-xl md:text-2xl font-bold text-foreground">{{ 'returnPolicy.section3.title' | t }}</h2>
            </div>
            <p class="text-muted-foreground">
              {{ 'returnPolicy.section3.body' | t }}
            </p>
          </div>

          <!-- Section 4 -->
          <div class="policy-section border border-border rounded-xl p-6 md:p-8">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-8 h-8 bg-[#C8A96E]/10 rounded-full flex items-center justify-center shrink-0">
                <span class="text-[#C8A96E] text-sm font-bold">4</span>
              </div>
              <h2 class="font-playfair text-xl md:text-2xl font-bold text-foreground">{{ 'returnPolicy.section4.title' | t }}</h2>
            </div>
            <div class="space-y-3 text-muted-foreground">
              <div class="flex items-start gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-destructive mt-2.5 shrink-0"></span>
                <p>{{ 'returnPolicy.section4.item1' | t }}</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-destructive mt-2.5 shrink-0"></span>
                <p>{{ 'returnPolicy.section4.item2' | t }}</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-destructive mt-2.5 shrink-0"></span>
                <p>{{ 'returnPolicy.section4.item3' | t }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div class="mt-12 relative bg-gradient-to-br from-[#1A1A1A] via-[#242424] to-[#1A1A1A] rounded-xl p-8 md:p-10 text-center overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#C8A96E]/30 to-transparent"></div>
          <p class="text-white font-playfair text-lg font-bold mb-2">{{ 'returnPolicy.cta.title' | t }}</p>
          <p class="text-neutral-400 text-sm mb-6">{{ 'returnPolicy.cta.subtitle' | t }}</p>
          <a routerLink="/contact" class="inline-block bg-[#C8A96E] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#A88B4A] transition-colors">
            {{ 'returnPolicy.cta.contactUs' | t }}
          </a>
        </div>
      </div>
    </section>
  `,
})
export class ReturnPolicyComponent implements OnInit {
  private seoService = inject(SeoService);
  private t = inject(TranslationService);

  ngOnInit(): void {
    this.seoService.updatePage({
      title: this.t.get('returnPolicy.seo.title'),
      description: this.t.get('returnPolicy.seo.description'),
      url: '/return-policy',
    });
  }
}
