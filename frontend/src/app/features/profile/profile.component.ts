import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-2xl mx-auto px-4 py-12">
      <!-- Page Header -->
      <div class="text-center mb-10">
        <p class="text-primary text-sm font-semibold tracking-widest uppercase mb-2">{{ 'profile.pageSubtitle' | t }}</p>
        <h1 class="font-playfair text-3xl md:text-4xl font-bold text-foreground">{{ 'profile.pageTitle' | t }}</h1>
      </div>

      <!-- Profile Info -->
      <section class="bg-background rounded-xl shadow-sm border border-border p-8 mb-8 relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
        <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" aria-hidden="true"></div>
        <h2 class="font-playfair text-2xl font-bold text-foreground mb-6 relative z-10">{{ 'profile.personalInfo' | t }}</h2>

        @if (profileError()) {
          <div class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-6 text-sm relative z-10">
            {{ profileError() }}
          </div>
        }

        <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()" class="space-y-5 relative z-10">
          <div>
            <label for="p-name" class="block text-sm font-semibold text-foreground tracking-wide font-inter mb-2">{{ 'profile.fullName' | t }}</label>
            <input
              id="p-name"
              type="text"
              formControlName="name"
              class="w-full h-14 rounded-xl border border-border px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 font-inter bg-muted/50 focus:bg-background"
            />
            @if (profileForm.get('name')?.touched && profileForm.get('name')?.hasError('required')) {
              <p class="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">{{ 'profile.nameRequired' | t }}</p>
            }
          </div>

          <div>
            <label class="block text-sm font-semibold text-muted-foreground tracking-wide font-inter mb-2">{{ 'profile.email' | t }}</label>
            <input
              type="email"
              [value]="authService.user()?.email"
              disabled
              class="w-full h-14 rounded-xl border border-border bg-muted/50 px-4 text-muted-foreground cursor-not-allowed font-inter"
              dir="ltr"
            />
          </div>

          <div>
            <label for="p-phone" class="block text-sm font-semibold text-foreground tracking-wide font-inter mb-2">{{ 'profile.phone' | t }}</label>
            <input
              id="p-phone"
              type="tel"
              formControlName="phone"
              class="w-full h-14 rounded-xl border border-border px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 font-inter bg-muted/50 focus:bg-background"
              dir="ltr"
            />
            @if (profileForm.get('phone')?.touched && profileForm.get('phone')?.hasError('required')) {
              <p class="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">{{ 'profile.phoneRequired' | t }}</p>
            }
            @if (profileForm.get('phone')?.touched && profileForm.get('phone')?.hasError('pattern')) {
              <p class="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">{{ 'profile.phonePattern' | t }}</p>
            }
          </div>

          <button
            type="submit"
            [disabled]="profileLoading()"
            class="bg-primary text-white h-14 px-8 mt-2 rounded-xl font-semibold tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-primary-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            @if (profileLoading()) {
              <span>{{ 'profile.saving' | t }}</span>
            } @else {
              <span>{{ 'profile.saveChanges' | t }}</span>
            }
          </button>
        </form>
      </section>

      <!-- Change Password -->
      <section class="bg-background rounded-xl shadow-sm border border-border p-8 relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
        <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" aria-hidden="true"></div>
        <h2 class="font-playfair text-2xl font-bold text-foreground mb-6 relative z-10">{{ 'profile.changePassword' | t }}</h2>

        @if (passwordError()) {
          <div class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-6 text-sm relative z-10">
            {{ passwordError() }}
          </div>
        }

        <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" class="space-y-5 relative z-10">
          <div>
            <label for="currentPassword" class="block text-sm font-semibold text-foreground tracking-wide font-inter mb-2">
              {{ 'profile.currentPassword' | t }}
            </label>
            <div class="relative">
              <input
                id="currentPassword"
                [type]="showCurrentPassword() ? 'text' : 'password'"
                formControlName="currentPassword"
                autocomplete="current-password"
                class="w-full h-14 rounded-xl border border-border px-4 ps-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 font-inter bg-muted/50 focus:bg-background"
                dir="ltr"
              />
              <button type="button" (click)="showCurrentPassword.set(!showCurrentPassword())" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center" [attr.aria-label]="'profile.togglePasswordVisibility' | t">
                @if (showCurrentPassword()) {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                }
              </button>
            </div>
            @if (passwordForm.get('currentPassword')?.touched && passwordForm.get('currentPassword')?.hasError('required')) {
              <p class="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">{{ 'profile.currentPasswordRequired' | t }}</p>
            }
          </div>

          <div>
            <label for="newPassword" class="block text-sm font-semibold text-foreground tracking-wide font-inter mb-2">
              {{ 'profile.newPassword' | t }}
            </label>
            <div class="relative">
              <input
                id="newPassword"
                [type]="showNewPassword() ? 'text' : 'password'"
                formControlName="newPassword"
                autocomplete="new-password"
                class="w-full h-14 rounded-xl border border-border px-4 ps-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 font-inter bg-muted/50 focus:bg-background"
                [placeholder]="'profile.minLengthPlaceholder' | t"
                dir="ltr"
              />
              <button type="button" (click)="showNewPassword.set(!showNewPassword())" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center" [attr.aria-label]="'profile.togglePasswordVisibility' | t">
                @if (showNewPassword()) {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                }
              </button>
            </div>
            @if (passwordForm.get('newPassword')?.touched && passwordForm.get('newPassword')?.hasError('required')) {
              <p class="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">{{ 'profile.newPasswordRequired' | t }}</p>
            }
            @if (passwordForm.get('newPassword')?.touched && passwordForm.get('newPassword')?.hasError('minlength')) {
              <p class="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">{{ 'profile.passwordMinLength' | t }}</p>
            }
          </div>

          <button
            type="submit"
            [disabled]="passwordLoading()"
            class="bg-primary text-white h-14 px-8 mt-2 rounded-xl font-semibold tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-primary-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            @if (passwordLoading()) {
              <span>{{ 'profile.changingPassword' | t }}</span>
            } @else {
              <span>{{ 'profile.changePasswordBtn' | t }}</span>
            }
          </button>
        </form>
      </section>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  authService = inject(AuthService);
  private toast = inject(ToastService);
  private t = inject(TranslationService);

  profileLoading = signal(false);
  profileError = signal('');
  passwordLoading = signal(false);
  passwordError = signal('');
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);

  profileForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
  });

  passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  ngOnInit(): void {
    const user = this.authService.user();
    if (user) {
      this.profileForm.patchValue({ name: user.name, phone: user.phone });
    } else {
      this.authService.getMe().subscribe(u => {
        this.profileForm.patchValue({ name: u.name, phone: u.phone });
      });
    }
  }

  onUpdateProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.profileLoading.set(true);
    this.profileError.set('');

    const { name, phone } = this.profileForm.getRawValue();
    this.authService.updateProfile(name, phone).subscribe({
      next: () => {
        this.profileLoading.set(false);
        this.toast.show(this.t.get('profile.toast.profileUpdated'), 'success');
      },
      error: (err) => {
        this.profileLoading.set(false);
        this.profileError.set(err?.message || this.t.get('profile.toast.genericError'));
      },
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.passwordLoading.set(true);
    this.passwordError.set('');

    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.passwordLoading.set(false);
        this.passwordForm.reset();
        this.toast.show(this.t.get('profile.toast.passwordChanged'), 'success');
      },
      error: (err) => {
        this.passwordLoading.set(false);
        this.passwordError.set(err?.message || this.t.get('profile.toast.genericError'));
      },
    });
  }
}
