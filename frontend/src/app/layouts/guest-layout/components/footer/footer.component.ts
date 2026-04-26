import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="bg-muted/30 pt-20 pb-10 md:pb-16 font-inter border-t border-border mt-auto">
      <div class="max-w-[1440px] mx-auto px-4 md:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <!-- Brand Info -->
          <div class="flex flex-col gap-6">
            <a routerLink="/" class="flex items-center gap-2 group">
              <img src="/assets/images/logo-sm-light.webp" srcset="/assets/images/logo-sm-light.webp 200w, /assets/images/logo-md-light.webp 400w" sizes="40px" alt="Soulmate" class="h-10 md:h-12 w-auto" />
              <div class="flex flex-col">
                <span class="font-playfair text-2xl font-bold tracking-tight text-primary">Soulmate</span>
                <span class="text-xs tracking-[0.2em] text-muted-foreground uppercase mt-1">{{ 'common.accessories' | t }}</span>
              </div>
            </a>
            <p class="text-muted-foreground leading-relaxed">{{ 'footer.brandDescription' | t }}</p>
            <div class="flex items-center gap-4">
              <a href="#" class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300" aria-label="Facebook"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg></a>
              <a href="#" class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300" aria-label="Instagram"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="flex flex-col gap-6 lg:ps-12">
            <h4 class="font-playfair text-lg font-bold text-foreground">{{ 'footer.quickLinksTitle' | t }}</h4>
            <nav class="flex flex-col gap-4">
              <a routerLink="/products" class="text-muted-foreground hover:text-primary transition-colors">{{ 'nav.products' | t }}</a>
              <a routerLink="/categories" class="text-muted-foreground hover:text-primary transition-colors">{{ 'nav.categories' | t }}</a>
              <a routerLink="/offers" class="text-muted-foreground hover:text-primary transition-colors">{{ 'nav.offers' | t }}</a>
              <a routerLink="/boxes" class="text-muted-foreground hover:text-primary transition-colors">{{ 'nav.boxes' | t }}</a>
            </nav>
          </div>

          <!-- Customer Service -->
          <div class="flex flex-col gap-6 lg:ps-6">
            <h4 class="font-playfair text-lg font-bold text-foreground">{{ 'footer.customerServiceTitle' | t }}</h4>
            <nav class="flex flex-col gap-4">
              <a routerLink="/contact" class="text-muted-foreground hover:text-primary transition-colors">{{ 'nav.contact' | t }}</a>
              <a routerLink="/faq" class="text-muted-foreground hover:text-primary transition-colors">{{ 'footer.faq' | t }}</a>
              <a routerLink="/shipping-policy" class="text-muted-foreground hover:text-primary transition-colors">{{ 'footer.shippingPolicy' | t }}</a>
              <a routerLink="/privacy-policy" class="text-muted-foreground hover:text-primary transition-colors">{{ 'footer.privacyPolicy' | t }}</a>
            </nav>
          </div>

          <!-- Contact Info -->
          <div class="flex flex-col gap-6">
            <h4 class="font-playfair text-lg font-bold text-foreground">{{ 'footer.contactUsTitle' | t }}</h4>
            <ul class="flex flex-col gap-4">
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-primary mt-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <span class="text-muted-foreground text-sm leading-relaxed">{{ 'footer.address' | t }}</span>
              </li>
              <li class="flex items-center gap-3">
                <svg class="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                <a href="tel:+201000000000" class="text-muted-foreground hover:text-primary transition-colors text-sm">0100 000 0000</a>
              </li>
              <li class="flex items-center gap-3">
                <svg class="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <a href="mailto:info@soulmate.com" class="text-muted-foreground hover:text-primary transition-colors text-sm">info&#64;soulmate.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div class="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
          <p>{{ 'footer.copyright' | t }} &copy; {{ currentYear }} Soulmate.</p>
          <div class="flex items-center gap-6">
            <img src="/assets/images/payment-methods.webp" alt="Payment Methods" class="h-6 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" />
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
