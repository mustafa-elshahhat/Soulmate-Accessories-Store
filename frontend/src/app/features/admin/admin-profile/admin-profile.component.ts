import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-2xl mx-auto">
      <h1 class="font-playfair text-2xl md:text-3xl font-bold text-foreground mb-8">{{ 'admin.profile.title' | t }}</h1>

      <!-- Profile Info -->
      <section class="bg-background rounded-xl border border-border p-6 md:p-8 mb-6">
        <h2 class="font-playfair text-xl font-bold text-foreground mb-6">{{ 'admin.profile.personalInfo' | t }}</h2>

        @if (profileError()) {
          <div class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-6 text-sm">{{ profileError() }}</div>
        }

        <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()" class="space-y-5">
          <div>
            <label for="p-name" class="block text-sm font-semibold text-foreground mb-2">{{ 'admin.profile.fullName' | t }}</label>
            <input id="p-name" type="text" formControlName="name" autocomplete="name"
                   class="w-full h-12 rounded-xl border border-border px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-muted/50 focus:bg-background" />
            @if (profileForm.get('name')?.touched && profileForm.get('name')?.hasError('required')) {
              <p class="text-red-500 text-xs mt-1.5 font-medium">{{ 'admin.profile.nameRequired' | t }}</p>
            }
          </div>

          <div>
            <label class="block text-sm font-semibold text-muted-foreground mb-2">{{ 'admin.profile.email' | t }}</label>
            <input type="email" [value]="authService.user()?.email" disabled dir="ltr"
                   class="w-full h-12 rounded-xl border border-border bg-muted/50 px-4 text-muted-foreground cursor-not-allowed" />
          </div>

          <div>
            <label for="p-phone" class="block text-sm font-semibold text-foreground mb-2">{{ 'admin.profile.phone' | t }}</label>
            <input id="p-phone" type="tel" formControlName="phone" autocomplete="tel" dir="ltr"
                   class="w-full h-12 rounded-xl border border-border px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-muted/50 focus:bg-background" />
            @if (profileForm.get('phone')?.touched && profileForm.get('phone')?.hasError('required')) {
              <p class="text-red-500 text-xs mt-1.5 font-medium">{{ 'admin.profile.phoneRequired' | t }}</p>
            }
            @if (profileForm.get('phone')?.touched && profileForm.get('phone')?.hasError('pattern')) {
              <p class="text-red-500 text-xs mt-1.5 font-medium">{{ 'admin.profile.phoneInvalid' | t }}</p>
            }
          </div>

          <button type="submit" [disabled]="profileLoading()"
                  class="bg-primary text-white h-12 px-8 rounded-xl font-semibold shadow-sm hover:shadow-md hover:bg-primary-dark transition-all disabled:opacity-50">
            @if (profileLoading()) { {{ 'admin.profile.saving' | t }} } @else { {{ 'admin.profile.saveChanges' | t }} }
          </button>
        </form>
      </section>

      <!-- Change Password -->
      <section class="bg-background rounded-xl border border-border p-6 md:p-8">
        <h2 class="font-playfair text-xl font-bold text-foreground mb-6">{{ 'admin.profile.changePassword' | t }}</h2>

        @if (passwordError()) {
          <div class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-6 text-sm">{{ passwordError() }}</div>
        }

        <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" class="space-y-5">
          <div>
            <label for="currentPassword" class="block text-sm font-semibold text-foreground mb-2">{{ 'admin.profile.currentPassword' | t }}</label>
            <div class="relative">
              <input id="currentPassword" [type]="showCurrentPassword() ? 'text' : 'password'" formControlName="currentPassword" autocomplete="current-password" dir="ltr"
                     class="w-full h-12 rounded-xl border border-border px-4 ps-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-muted/50 focus:bg-background" />
              <button type="button" (click)="showCurrentPassword.set(!showCurrentPassword())" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                @if (showCurrentPassword()) {
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>
                } @else {
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                }
              </button>
            </div>
            @if (passwordForm.get('currentPassword')?.touched && passwordForm.get('currentPassword')?.hasError('required')) {
              <p class="text-red-500 text-xs mt-1.5 font-medium">{{ 'admin.profile.currentPasswordRequired' | t }}</p>
            }
          </div>

          <div>
            <label for="newPassword" class="block text-sm font-semibold text-foreground mb-2">{{ 'admin.profile.newPassword' | t }}</label>
            <div class="relative">
              <input id="newPassword" [type]="showNewPassword() ? 'text' : 'password'" formControlName="newPassword" autocomplete="new-password" [placeholder]="t.get('admin.profile.minLengthPlaceholder')" dir="ltr"
                     class="w-full h-12 rounded-xl border border-border px-4 ps-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-muted/50 focus:bg-background" />
              <button type="button" (click)="showNewPassword.set(!showNewPassword())" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                @if (showNewPassword()) {
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>
                } @else {
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                }
              </button>
            </div>
            @if (passwordForm.get('newPassword')?.touched && passwordForm.get('newPassword')?.hasError('required')) {
              <p class="text-red-500 text-xs mt-1.5 font-medium">{{ 'admin.profile.newPasswordRequired' | t }}</p>
            }
            @if (passwordForm.get('newPassword')?.touched && passwordForm.get('newPassword')?.hasError('minlength')) {
              <p class="text-red-500 text-xs mt-1.5 font-medium">{{ 'admin.profile.passwordMinLength' | t }}</p>
            }
          </div>

          <button type="submit" [disabled]="passwordLoading()"
                  class="bg-primary text-white h-12 px-8 rounded-xl font-semibold shadow-sm hover:shadow-md hover:bg-primary-dark transition-all disabled:opacity-50">
            @if (passwordLoading()) { {{ 'admin.profile.changingPassword' | t }} } @else { {{ 'admin.profile.changePasswordBtn' | t }} }
          </button>
        </form>
      </section>
    </div>
  `,
})
export class AdminProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  authService = inject(AuthService);
  private toast = inject(ToastService);
  t = inject(TranslationService);

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
        this.toast.show(this.t.get('admin.profile.updateSuccess'), 'success');
      },
      error: (err) => {
        this.profileLoading.set(false);
        this.profileError.set(err?.message || this.t.get('admin.profile.genericError'));
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
        this.toast.show(this.t.get('admin.profile.passwordChangeSuccess'), 'success');
      },
      error: (err) => {
        this.passwordLoading.set(false);
        this.passwordError.set(err?.message || this.t.get('admin.profile.genericError'));
      },
    });
  }
}
