import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContactService } from '../../../core/services/contact.service';
import { SeoService } from '../../../core/services/seo.service';
import { ToastService } from '../../../shared/components/toast/toast.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';
import { CONTACT } from '../../../core/constants/contact';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: fadeInUp 0.7s ease-out both; }
    .fade-up-d1 { animation: fadeInUp 0.7s 0.1s ease-out both; }
    .fade-up-d2 { animation: fadeInUp 0.7s 0.2s ease-out both; }
    .contact-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .contact-card:hover { transform: translateY(-3px); border-color: rgba(200,169,110,0.3); }
  `,
  template: `
    <!-- Hero -->
    <section class="relative bg-gradient-to-br from-[#1A1A1A] via-[#242424] to-[#1A1A1A] overflow-hidden">
      <div class="absolute top-10 right-10 w-64 h-64 bg-[#C8A96E]/8 rounded-full blur-3xl"></div>
      <div class="absolute bottom-10 left-10 w-48 h-48 bg-[#C8A96E]/5 rounded-full blur-3xl"></div>
      <div class="max-w-[1280px] mx-auto px-4 py-16 md:py-24 text-center relative z-10">
        <p class="fade-up text-[#C8A96E] text-sm tracking-[0.2em] uppercase mb-4 font-medium">{{ 'contact.hero.label' | t }}</p>
        <h1 class="fade-up-d1 font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5">{{ 'contact.hero.title' | t }}</h1>
        <div class="fade-up-d2 w-12 h-px bg-[#C8A96E] mx-auto mb-6"></div>
        <p class="text-lg text-neutral-300 max-w-2xl mx-auto">
          {{ 'contact.hero.subtitle' | t }}
        </p>
      </div>
    </section>

    <section class="max-w-[1280px] mx-auto px-4 py-14 md:py-20">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
        <!-- Contact Info -->
        <div>
          <p class="text-[#C8A96E] text-sm tracking-[0.15em] uppercase mb-3 font-medium">{{ 'contact.info.label' | t }}</p>
          <h2 class="font-playfair text-xl md:text-2xl font-bold text-foreground mb-8">{{ 'contact.info.title' | t }}</h2>
          <div class="space-y-4">
            <div class="contact-card flex items-start gap-4 p-5 bg-background border border-border rounded-xl shadow-sm">
              <div class="w-11 h-11 bg-[#C8A96E]/10 rounded-full flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#C8A96E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                </svg>
              </div>
              <div>
                <p class="font-medium text-foreground">{{ 'contact.info.email' | t }}</p>
                <p class="text-muted-foreground text-sm mt-1" dir="ltr">{{ contact.EMAIL }}</p>
              </div>
            </div>
            <div class="contact-card flex items-start gap-4 p-5 bg-background border border-border rounded-xl shadow-sm">
              <div class="w-11 h-11 bg-[#C8A96E]/10 rounded-full flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#C8A96E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <p class="font-medium text-foreground">{{ 'contact.info.workingHours' | t }}</p>
                <p class="text-muted-foreground text-sm mt-1">{{ 'contact.info.workingHoursValue' | t }}</p>
              </div>
            </div>
          </div>

          <!-- FAQ Hint -->
          <div class="mt-8 p-6 border border-[#C8A96E]/20 rounded-xl bg-[#C8A96E]/5">
            <h3 class="font-playfair text-lg font-bold text-foreground mb-2">{{ 'contact.faq.title' | t }}</h3>
            <p class="text-sm text-muted-foreground mb-4">
              {{ 'contact.faq.hint' | t }}
            </p>
            <div class="flex flex-wrap gap-2">
              <a routerLink="/return-policy" class="text-sm text-[#C8A96E] hover:text-[#A88B4A] font-medium transition-colors">{{ 'contact.faq.returnPolicy' | t }}</a>
              <span class="text-border">|</span>
              <a routerLink="/terms" class="text-sm text-[#C8A96E] hover:text-[#A88B4A] font-medium transition-colors">{{ 'contact.faq.terms' | t }}</a>
              <span class="text-border">|</span>
              <a routerLink="/privacy" class="text-sm text-[#C8A96E] hover:text-[#A88B4A] font-medium transition-colors">{{ 'contact.faq.privacy' | t }}</a>
            </div>
          </div>
        </div>

        <!-- Contact Form -->
        <div>
          <div class="bg-background border border-border rounded-xl p-6 md:p-8 shadow-sm">
            <p class="text-[#C8A96E] text-sm tracking-[0.15em] uppercase mb-3 font-medium">{{ 'contact.form.label' | t }}</p>
            <h2 class="font-playfair text-xl md:text-2xl font-bold text-foreground mb-8">{{ 'contact.form.title' | t }}</h2>
            <div class="space-y-5">
              <div>
                <label for="contact-name" class="block text-sm font-medium text-foreground mb-1.5">{{ 'contact.form.name' | t }}</label>
                <input
                  id="contact-name"
                  [formControl]="contactForm.controls.name"
                  class="w-full border border-border rounded-xl px-4 h-11 focus:ring-2 focus:ring-[#C8A96E]/30 focus:border-[#C8A96E] outline-none transition-all duration-300"
                  [placeholder]="'contact.form.namePlaceholder' | t"
                >
              </div>
              <div>
                <label for="contact-email" class="block text-sm font-medium text-foreground mb-1.5">{{ 'contact.form.email' | t }}</label>
                <input
                  id="contact-email"
                  [formControl]="contactForm.controls.email"
                  type="email"
                  class="w-full border border-border rounded-xl px-4 h-11 focus:ring-2 focus:ring-[#C8A96E]/30 focus:border-[#C8A96E] outline-none transition-all duration-300"
                  placeholder="example&#64;email.com"
                  dir="ltr"
                >
              </div>
              <div>
                <label for="contact-message" class="block text-sm font-medium text-foreground mb-1.5">{{ 'contact.form.message' | t }}</label>
                <textarea
                  id="contact-message"
                  [formControl]="contactForm.controls.message"
                  rows="5"
                  class="w-full border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#C8A96E]/30 focus:border-[#C8A96E] outline-none transition-all duration-300 resize-none"
                  [placeholder]="'contact.form.messagePlaceholder' | t"
                ></textarea>
              </div>
              @if (sent()) {
                <div class="bg-green-50 border border-green-200 rounded-xl p-3" role="alert">
                  <p class="text-green-700 text-sm">{{ 'contact.form.successMessage' | t }}</p>
                </div>
              }
              <button
                (click)="send()"
                [disabled]="sending()"
                class="w-full bg-[#C8A96E] text-white py-3 rounded-xl font-semibold hover:bg-[#A88B4A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                @if (sending()) { {{ 'contact.form.sending' | t }} } @else { {{ 'contact.form.send' | t }} }
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ContactComponent implements OnInit {
  private contactService = inject(ContactService);
  private seoService = inject(SeoService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private t = inject(TranslationService);
  readonly contact = CONTACT;

  sent = signal(false);
  sending = signal(false);
  contactForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    message: ['', Validators.required],
  });

  ngOnInit(): void {
    this.seoService.updatePage({
      title: this.t.get('contact.seo.title'),
      description: this.t.get('contact.seo.description'),
      url: '/contact',
    });
  }

  send(): void {
    if (this.contactForm.invalid) {
      this.toast.show(this.t.get('contact.form.validationWarning'), 'warning');
      return;
    }

    this.sending.set(true);
    const { name, email, message } = this.contactForm.getRawValue();

    this.contactService.send({ name, email, message }).subscribe({
      next: () => {
        this.sent.set(true);
        this.sending.set(false);
        this.contactForm.reset();
        this.toast.show(this.t.get('contact.form.successMessage'), 'success');
      },
      error: () => {
        this.sending.set(false);
      },
    });
  }
}
