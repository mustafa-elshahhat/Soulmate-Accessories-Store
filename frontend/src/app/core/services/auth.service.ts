import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, ReplaySubject, switchMap } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { ApiResponse } from '../models/api-response.model';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';
import { CartService } from './cart.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private cartService = inject(CartService);
  private apiUrl = `${inject(API_BASE_URL)}/api/auth`;
  private accessToken: string | null = null;
  /** In-memory CSRF token fetched from GET /api/auth/csrf (response body).
   *  Using the response body instead of document.cookie because the cookie is
   *  set by the backend domain and is not readable cross-origin via JS. */
  private csrfToken: string | null = null;
  private static readonly SESSION_KEY = 'has_session';

  /** Tracks whether the initial session restoration attempt has completed */
  private _initialized = signal(false);
  readonly initialized = this._initialized.asReadonly();

  /** Observable that emits once when auth initialization is complete */
  private _ready$ = new ReplaySubject<boolean>(1);
  readonly whenReady$ = this._ready$.asObservable();

  private currentUser = signal<User | null>(null);
  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  /** True while the initial session restoration is in progress */
  readonly authLoading = computed(() => !this._initialized());

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, data).pipe(
      map(res => {
        this.accessToken = res.data.access_token;
        this.currentUser.set(res.data.user);
        this.setSessionFlag();
        return res.data;
      }),
      tap(() => this.onAuthSuccess())
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, data).pipe(
      map(res => {
        this.accessToken = res.data.access_token;
        this.currentUser.set(res.data.user);
        this.setSessionFlag();
        return res.data;
      }),
      tap(() => this.onAuthSuccess())
    );
  }

  getMe(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/me`).pipe(
      map(res => {
        this.currentUser.set(res.data);
        return res.data;
      })
    );
  }

  refreshToken(): Observable<AuthResponse> {
    return this.ensureCsrfToken().pipe(
      switchMap(() => this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/refresh`, {}).pipe(
        map(res => {
          this.accessToken = res.data.access_token;
          this.currentUser.set(res.data.user);
          return res.data;
        })
      ))
    );
  }

  /** Try to restore session on app startup */
  tryAutoLogin(): Observable<boolean> {
    if (!isPlatformBrowser(this.platformId) || !this.hasSessionFlag()) {
      this._initialized.set(true);
      this._ready$.next(true);
      return of(false);
    }
    return this.ensureCsrfToken().pipe(
      switchMap(() => this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/refresh`, {}).pipe(
        map(res => {
          this.accessToken = res.data.access_token;
          this.currentUser.set(res.data.user);
          this._initialized.set(true);
          this._ready$.next(true);
          return true;
        }),
        tap(success => {
          if (success) this.onAuthSuccess();
        }),
        catchError(() => {
          this.clearSessionFlag();
          this._initialized.set(true);
          this._ready$.next(true);
          return of(false);
        })
      ))
    );
  }

  logout(): Observable<void> {
    return this.ensureCsrfToken().pipe(
      switchMap(() => this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
        tap(() => {
          this.accessToken = null;
          this.currentUser.set(null);
          this.clearSessionFlag();
          this.cartService.setAuthenticated(false);
          this.cartService.clearLocal();
        })
      ))
    );
  }

  getCsrfToken(): string | null {
    return this.csrfToken;
  }

  private ensureCsrfToken(): Observable<void> {
    return this.http.get<ApiResponse<{ csrf_token: string }>>(`${this.apiUrl}/csrf`).pipe(
      tap(res => { this.csrfToken = res.data.csrf_token; }),
      map(() => undefined)
    );
  }

  forgotPassword(email: string, lang = 'ar'): Observable<string> {
    return this.http.post<ApiResponse<object>>(`${this.apiUrl}/forgot-password`, { email, lang }).pipe(
      map(res => res.message ?? '')
    );
  }

  syncLang(lang: string): void {
    if (!this.isLoggedIn()) return;
    this.http.patch<ApiResponse<object>>(`${this.apiUrl}/lang`, { lang }).subscribe();
  }

  resetPassword(token: string, newPassword: string): Observable<string> {
    return this.http.post<ApiResponse<object>>(`${this.apiUrl}/reset-password`, { token, new_password: newPassword }).pipe(
      map(res => res.message ?? '')
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<string> {
    return this.http.put<ApiResponse<object>>(`${this.apiUrl}/change-password`, {
      current_password: currentPassword,
      new_password: newPassword
    }).pipe(
      map(res => res.message ?? '')
    );
  }

  updateProfile(name: string, phone: string): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/profile`, { name, phone }).pipe(
      map(res => {
        this.currentUser.set(res.data);
        return res.data;
      })
    );
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isLoggedIn(): boolean {
    return this.accessToken !== null;
  }

  clearAccessToken(): void {
    this.accessToken = null;
    this.currentUser.set(null);
    this.clearSessionFlag();
    this.cartService.setAuthenticated(false);
    this.cartService.clearLocal();
  }

  /** Called after successful login / register / auto-login */
  private onAuthSuccess(): void {
    this.cartService.setAuthenticated(true);
    this.cartService.loadFromServer();
  }

  private hasSessionFlag(): boolean {
    try { return localStorage.getItem(AuthService.SESSION_KEY) === '1'; } catch { return false; }
  }

  private setSessionFlag(): void {
    try { localStorage.setItem(AuthService.SESSION_KEY, '1'); } catch {}
  }

  private clearSessionFlag(): void {
    try {
      localStorage.removeItem(AuthService.SESSION_KEY);
      if (isPlatformBrowser(this.platformId)) {
        document.body.classList.remove('has-session');
      }
    } catch {}
  }
}
