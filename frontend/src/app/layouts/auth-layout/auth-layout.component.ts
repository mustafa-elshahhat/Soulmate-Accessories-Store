import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { LanguageSwitcherComponent } from '../../shared/components/language-switcher/language-switcher.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, TranslatePipe, LanguageSwitcherComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    @keyframes pageEnter {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: linear-gradient(135deg, #FAFAF8 0%, #F5F0E8 50%, #FAF7F2 100%);
    }
    main {
      animation: pageEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
  `],
  template: `
    <!-- Minimal Auth Header -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border/50">
      <nav class="max-w-[1280px] mx-auto flex items-center justify-between px-6 lg:px-8 h-14 md:h-[72px]">
        <a routerLink="/" class="block shrink-0">
          <img src="/assets/images/logo-md.webp"
               srcset="/assets/images/logo-sm.webp 200w, /assets/images/logo-md.webp 400w, /assets/images/logo-lg.webp 800w"
               sizes="(max-width: 768px) 100px, 130px"
               alt="Soulmate" width="150" height="82"
               class="h-9 md:h-12 w-auto" />
        </a>
        <div class="flex items-center gap-3">
          <app-language-switcher />
          <a routerLink="/"
             [attr.aria-label]="'nav.backToHome' | t"
             class="text-foreground/60 hover:text-primary transition-colors duration-200 p-1.5">
            <svg class="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
          </a>
        </div>
      </nav>
    </header>

    <!-- Auth Page Content -->
    <main class="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
      <router-outlet />
    </main>

    <!-- Minimal Footer -->
    <footer class="py-6 text-center font-inter text-[11px] text-foreground/40 tracking-wide">
      <p>{{ 'footer.copyright' | t }}</p>
    </footer>
  `,
})
export class AuthLayoutComponent {}
