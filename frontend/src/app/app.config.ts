import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners, APP_INITIALIZER, inject } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { GlobalErrorHandler } from './core/handlers/global-error-handler';
import { AuthService } from './core/services/auth.service';
import { TranslationService } from './core/services/translation.service';
import { lastValueFrom } from 'rxjs';

function initializeAuth(): () => Promise<void> {
  const authService = inject(AuthService);
  return () => lastValueFrom(authService.tryAutoLogin()).then(() => {});
}

function initializeTranslation(): () => void {
  const translationService = inject(TranslationService);
  return () => translationService.initDocumentAttributes();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    { provide: APP_INITIALIZER, useFactory: initializeTranslation, multi: true },
    { provide: APP_INITIALIZER, useFactory: initializeAuth, multi: true },
  ]
};
