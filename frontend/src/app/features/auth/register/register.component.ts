import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SeoService } from '../../../core/services/seo.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-muted/20">
      <!-- Decorative UI Background -->
      <div class="absolute top-0 start-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div class="absolute top-[10%] end-[5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px] animate-pulse" style="animation-duration: 5s;"></div>
        <div class="absolute bottom-[10%] start-[10%] w-[35%] h-[35%] rounded-full bg-primary/8 blur-[100px] animate-pulse" style="animation-duration: 7s;"></div>
      </div>

      <div class="w-full max-w-md bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-2xl shadow-xl border border-white/50 relative z-10 transition-all duration-300 hover:shadow-2xl">
        <!-- Decorative subtle element -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-light via-primary to-primary-dark"></div>

        <div class="text-center mb-10">
          <h1 class="font-playfair text-3xl font-bold text-foreground mb-3 tracking-wide">
            {{ 'auth.register.title' | t }}
          </h1>
          <p class="text-muted-foreground font-inter text-sm">{{ 'auth.register.subtitle' | t }}</p>
        </div>

        @if (errorMessage()) {
          <div class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
            {{ errorMessage() }}
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="space-y-2">
            <label for="name" class="block text-sm font-semibold text-foreground tracking-wide font-inter">
              {{ 'auth.register.nameLabel' | t }}
            </label>
            <input
              id="name"
              type="text"
              formControlName="name"
              autocomplete="name"
              class="w-full h-12 rounded-xl border border-border/60 px-4 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 font-inter bg-white/50 focus:bg-white shadow-sm"
              [placeholder]="'auth.register.namePlaceholder' | t"
            />
            @if (form.get('name')?.touched && form.get('name')?.hasError('required')) {
              <p class="text-red-500 text-xs mt-1.5 font-medium">{{ 'auth.register.nameRequired' | t }}</p>
            }
          </div>

          <div class="space-y-2">
            <label for="email" class="block text-sm font-semibold text-foreground tracking-wide font-inter">
              {{ 'auth.register.emailLabel' | t }}
            </label>
            <input
              id="email"
              type="email"
              formControlName="email"
              autocomplete="email"
              class="w-full h-12 rounded-xl border border-border/60 px-4 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 font-inter bg-white/50 focus:bg-white shadow-sm"
              placeholder="example@email.com"
              dir="ltr"
            />
            @if (form.get('email')?.touched && form.get('email')?.hasError('required')) {
              <p class="text-red-500 text-xs mt-1.5 font-medium">{{ 'auth.register.emailRequired' | t }}</p>
            }
            @if (form.get('email')?.touched && form.get('email')?.hasError('email')) {
              <p class="text-red-500 text-xs mt-1.5 font-medium">{{ 'auth.register.emailInvalid' | t }}</p>
            }
          </div>

          <div class="space-y-2">
            <label for="phone" class="block text-sm font-semibold text-foreground tracking-wide font-inter">
              {{ 'auth.register.phoneLabel' | t }}
            </label>
            <input
              id="phone"
              type="tel"
              formControlName="phone"
              autocomplete="tel"
              class="w-full h-12 rounded-xl border border-border/60 px-4 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 font-inter bg-white/50 focus:bg-white shadow-sm"
              placeholder="01XXXXXXXXX"
              dir="ltr"
            />
            @if (form.get('phone')?.touched && form.get('phone')?.hasError('required')) {
              <p class="text-red-500 text-xs mt-1.5 font-medium">{{ 'auth.register.phoneRequired' | t }}</p>
            }
            @if (form.get('phone')?.touched && form.get('phone')?.hasError('pattern')) {
              <p class="text-red-500 text-xs mt-1.5 font-medium">{{ 'auth.register.phonePattern' | t }}</p>
            }
          </div>

          <div class="space-y-2">
            <label for="password" class="block text-sm font-semibold text-foreground tracking-wide font-inter">
              {{ 'auth.register.passwordLabel' | t }}
            </label>
            <div class="relative">
              <input
                id="password"
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="password"
                autocomplete="new-password"
                class="w-full h-12 rounded-xl border border-border/60 px-4 ps-12 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 font-inter bg-white/50 focus:bg-white shadow-sm"
                [placeholder]="'auth.register.passwordPlaceholder' | t"
                dir="ltr"
              />
              <button type="button" (click)="showPassword.set(!showPassword())" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                @if (showPassword()) {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                }
              </button>
            </div>
            @if (form.get('password')?.touched && form.get('password')?.hasError('required')) {
              <p class="text-red-500 text-xs mt-1.5 font-medium">{{ 'auth.register.passwordRequired' | t }}</p>
            }
            @if (form.get('password')?.touched && form.get('password')?.hasError('minlength')) {
              <p class="text-red-500 text-xs mt-1.5 font-medium">{{ 'auth.register.passwordMinlength' | t }}</p>
            }
          </div>

          <button
            type="submit"
            [disabled]="loading() || form.invalid"
            class="w-full bg-primary text-white h-14 rounded-xl font-semibold tracking-wide text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-primary-dark transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2 mt-4"
          >
            @if (loading()) {
              <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>{{ 'auth.register.loading' | t }}</span>
            } @else {
              <span>{{ 'auth.register.submit' | t }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 rtl:rotate-180" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
            }
          </button>
        </form>

        <div class="mt-8 pt-8 border-t border-border">
          <p class="text-center text-sm text-muted-foreground font-inter">
            {{ 'auth.register.hasAccount' | t }}
            <a routerLink="/login" class="text-primary font-semibold hover:text-primary-dark transition-colors ms-1">{{ 'auth.register.loginLink' | t }}</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private t = inject(TranslationService);
  private seoService = inject(SeoService);

  loading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  ngOnInit(): void {
    this.seoService.updatePage({
      title: this.t.get('register.seo.title'),
      description: this.t.get('register.seo.description'),
      url: '/register',
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.register(this.form.getRawValue()).subscribe({
      next: () => {
        // replaceUrl removes the register page from history
        this.router.navigateByUrl('/', { replaceUrl: true });
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.message || this.t.get('auth.register.genericError'));
      },
    });
  }
}
