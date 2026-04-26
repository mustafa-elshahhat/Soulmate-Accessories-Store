import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SeoService } from '../../../core/services/seo.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <h1 class="font-playfair text-3xl font-bold text-foreground text-center mb-4">
          {{ 'auth.forgotPassword.title' | t }}
        </h1>
        <p class="text-muted-foreground text-center text-sm mb-8">
          {{ 'auth.forgotPassword.subtitle' | t }}
        </p>

        @if (successMessage()) {
          <div class="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-6 text-sm">
            {{ successMessage() }}
          </div>
        }

        @if (errorMessage()) {
          <div class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
            {{ errorMessage() }}
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
          <div>
            <label for="email" class="block text-sm font-medium text-foreground mb-1">
              {{ 'auth.forgotPassword.emailLabel' | t }}
            </label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="w-full rounded-lg border border-border shadow-sm px-4 py-3 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
              placeholder="example@email.com"
              dir="ltr"
            />
            @if (form.get('email')?.touched && form.get('email')?.hasError('required')) {
              <p class="text-red-500 text-xs mt-1">{{ 'auth.forgotPassword.emailRequired' | t }}</p>
            }
            @if (form.get('email')?.touched && form.get('email')?.hasError('email')) {
              <p class="text-red-500 text-xs mt-1">{{ 'auth.forgotPassword.emailInvalid' | t }}</p>
            }
          </div>

          <button
            type="submit"
            [disabled]="loading()"
            class="w-full bg-primary text-white py-3.5 rounded-xl font-medium tracking-wide shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:bg-primary-dark transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            @if (loading()) {
              <span>{{ 'auth.forgotPassword.loading' | t }}</span>
            } @else {
              <span>{{ 'auth.forgotPassword.submit' | t }}</span>
            }
          </button>
        </form>

        <p class="text-center text-sm text-muted-foreground mt-6">
          <a routerLink="/login" class="text-primary font-medium hover:underline">{{ 'auth.forgotPassword.backToLogin' | t }}</a>
        </p>
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private t = inject(TranslationService);
  private seoService = inject(SeoService);

  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    this.seoService.updatePage({
      title: this.t.get('forgotPassword.seo.title'),
      description: this.t.get('forgotPassword.seo.description'),
      url: '/forgot-password',
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.authService.forgotPassword(this.form.getRawValue().email, this.t.currentLang()).subscribe({
      next: (msg) => {
        this.loading.set(false);
        this.successMessage.set(msg || this.t.get('auth.forgotPassword.successMessage'));
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.message || this.t.get('auth.forgotPassword.genericError'));
      },
    });
  }
}
