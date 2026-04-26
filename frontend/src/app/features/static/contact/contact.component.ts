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
            <a [href]="contact.WHATSAPP_URL" target="_blank" rel="noopener noreferrer"
               class="contact-card flex items-start gap-4 p-5 bg-background border border-border rounded-xl shadow-sm block"
               [attr.aria-label]="'contact.info.whatsappAriaLabel' | t">
              <div class="w-11 h-11 bg-[#25D366]/10 rounded-full flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div>
                <p class="font-medium text-foreground">{{ 'contact.info.whatsapp' | t }}</p>
                <p class="text-muted-foreground text-sm mt-1" dir="ltr">{{ contact.WHATSAPP_PHONE }}</p>
              </div>
            </a>
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
