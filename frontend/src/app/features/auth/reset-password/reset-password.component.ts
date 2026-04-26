import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SeoService } from '../../../core/services/seo.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <h1 class="font-playfair text-3xl font-bold text-foreground text-center mb-8">
          {{ 'auth.resetPassword.title' | t }}
        </h1>

        @if (successMessage()) {
          <div class="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-6 text-sm text-center">
            <p>{{ successMessage() }}</p>
            <a routerLink="/login" class="text-primary font-medium hover:underline mt-2 inline-block">
              {{ 'auth.resetPassword.loginLink' | t }}
            </a>
          </div>
        } @else {
          @if (errorMessage()) {
            <div class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
              {{ errorMessage() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <label for="newPassword" class="block text-sm font-medium text-foreground mb-1">
                {{ 'auth.resetPassword.newPasswordLabel' | t }}
              </label>
              <div class="relative">
                <input
                  id="newPassword"
                  [type]="showNewPassword() ? 'text' : 'password'"
                  formControlName="newPassword"
                  autocomplete="new-password"
                  class="w-full rounded-lg border border-border shadow-sm px-4 ps-12 py-3 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                  [placeholder]="'auth.resetPassword.newPasswordPlaceholder' | t"
                  dir="ltr"
                />
                <button type="button" (click)="showNewPassword.set(!showNewPassword())" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  @if (showNewPassword()) {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  }
                </button>
              </div>
              @if (form.get('newPassword')?.touched && form.get('newPassword')?.hasError('required')) {
                <p class="text-red-500 text-xs mt-1">{{ 'auth.resetPassword.passwordRequired' | t }}</p>
              }
              @if (form.get('newPassword')?.touched && form.get('newPassword')?.hasError('minlength')) {
                <p class="text-red-500 text-xs mt-1">{{ 'auth.resetPassword.passwordMinlength' | t }}</p>
              }
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-foreground mb-1">
                {{ 'auth.resetPassword.confirmPasswordLabel' | t }}
              </label>
              <div class="relative">
                <input
                  id="confirmPassword"
                  [type]="showConfirmPassword() ? 'text' : 'password'"
                  formControlName="confirmPassword"
                  autocomplete="new-password"
                  class="w-full rounded-lg border border-border shadow-sm px-4 ps-12 py-3 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                  [placeholder]="'auth.resetPassword.confirmPasswordPlaceholder' | t"
                  dir="ltr"
                />
                <button type="button" (click)="showConfirmPassword.set(!showConfirmPassword())" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  @if (showConfirmPassword()) {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  }
                </button>
              </div>
              @if (form.get('confirmPassword')?.touched && passwordMismatch()) {
                <p class="text-red-500 text-xs mt-1">{{ 'auth.resetPassword.passwordMismatch' | t }}</p>
              }
            </div>

            <button
              type="submit"
              [disabled]="loading()"
              class="w-full bg-primary text-white py-3.5 rounded-xl font-medium tracking-wide shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:bg-primary-dark transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              @if (loading()) {
                <span>{{ 'auth.resetPassword.loading' | t }}</span>
              } @else {
                <span>{{ 'auth.resetPassword.submit' | t }}</span>
              }
            </button>
          </form>
        }
      </div>
    </div>
  `,
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private t = inject(TranslationService);
  private seoService = inject(SeoService);

  private token = '';
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  form = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.seoService.updatePage({
      title: this.t.get('resetPassword.seo.title'),
      description: this.t.get('resetPassword.seo.description'),
      url: '/reset-password',
    });

    this.token = this.route.snapshot.queryParams['token'] || '';
    if (!this.token) {
      this.errorMessage.set(this.t.get('auth.resetPassword.invalidLink'));
    }
  }

  passwordMismatch(): boolean {
    return this.form.value.newPassword !== this.form.value.confirmPassword;
  }

  onSubmit(): void {
    if (this.form.invalid || this.passwordMismatch()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.resetPassword(this.token, this.form.getRawValue().newPassword).subscribe({
      next: (msg) => {
        this.loading.set(false);
        this.successMessage.set(msg || this.t.get('auth.resetPassword.successMessage'));
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.message || this.t.get('auth.resetPassword.expiredLink'));
      },
    });
  }
}
