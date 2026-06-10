import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

/** Flushes the /api/cart GET request that AuthService triggers via
 *  CartService.loadFromServer() after a successful login/register. */
function flushCartRequest(httpMock: HttpTestingController): void {
  httpMock.expectOne((r) => r.url.includes('/api/cart')).flush({
    success: true,
    data: { items_json: '[]', updated_at: '2026-01-01T00:00:00Z' },
  });
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start unauthenticated', () => {
    expect(service.isLoggedIn()).toBe(false);
    expect(service.getAccessToken()).toBeNull();
    expect(service.user()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  describe('register', () => {
    it('should store access token and user on success', () => {
      const mockResponse = {
        success: true,
        data: {
          access_token: 'test-jwt-token',
          user: { id: '1', name: 'Test', email: 'test@test.com', phone: '01012345678', role: 'customer', created_at: '2026-01-01' },
        },
      };

      service.register({ name: 'Test', email: 'test@test.com', password: '12345678', phone: '01012345678' }).subscribe((res) => {
        expect(res.access_token).toBe('test-jwt-token');
        expect(res.user.email).toBe('test@test.com');
      });

      const req = httpMock.expectOne((r) => r.url.includes('/api/auth/register'));
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
      flushCartRequest(httpMock);

      expect(service.isLoggedIn()).toBe(true);
      expect(service.getAccessToken()).toBe('test-jwt-token');
      expect(service.user()?.email).toBe('test@test.com');
    });
  });

  describe('login', () => {
    it('should store access token and user on success', () => {
      const mockResponse = {
        success: true,
        data: {
          access_token: 'login-jwt-token',
          user: { id: '1', name: 'Test', email: 'login@test.com', phone: '01012345678', role: 'customer', created_at: '2026-01-01' },
        },
      };

      service.login({ email: 'login@test.com', password: '12345678' }).subscribe((res) => {
        expect(res.access_token).toBe('login-jwt-token');
      });

      const req = httpMock.expectOne((r) => r.url.includes('/api/auth/login'));
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
      flushCartRequest(httpMock);

      expect(service.isLoggedIn()).toBe(true);
      expect(service.user()?.email).toBe('login@test.com');
    });
  });

  describe('getMe', () => {
    it('should fetch and store current user', () => {
      const mockResponse = {
        success: true,
        data: { id: '1', name: 'Me', email: 'me@test.com', phone: '01012345678', role: 'customer', created_at: '2026-01-01' },
      };

      service.getMe().subscribe((user) => {
        expect(user.name).toBe('Me');
      });

      const req = httpMock.expectOne((r) => r.url.includes('/api/auth/me'));
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      expect(service.user()?.name).toBe('Me');
    });
  });

  describe('logout', () => {
    it('should clear access token and user', () => {
      const mockLogin = {
        success: true,
        data: {
          access_token: 'token',
          user: { id: '1', name: 'T', email: 'e@t.com', phone: '01012345678', role: 'customer', created_at: '2026-01-01' },
        },
      };
      service.login({ email: 'e@t.com', password: 'p' }).subscribe();
      httpMock.expectOne((r) => r.url.includes('/api/auth/login')).flush(mockLogin);
      flushCartRequest(httpMock);

      expect(service.isLoggedIn()).toBe(true);

      service.logout().subscribe();
      httpMock.expectOne((r) => r.url.includes('/api/auth/csrf')).flush({
        success: true,
        data: { csrf_token: 'test-csrf-token' },
      });
      httpMock.expectOne((r) => r.url.includes('/api/auth/logout')).flush(null);

      expect(service.isLoggedIn()).toBe(false);
      expect(service.getAccessToken()).toBeNull();
      expect(service.user()).toBeNull();
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin role', () => {
      const mockResponse = {
        success: true,
        data: {
          access_token: 'admin-token',
          user: { id: '1', name: 'Admin', email: 'admin@test.com', phone: '01012345678', role: 'admin', created_at: '2026-01-01' },
        },
      };

      service.login({ email: 'admin@test.com', password: 'p' }).subscribe();
      httpMock.expectOne((r) => r.url.includes('/api/auth/login')).flush(mockResponse);
      flushCartRequest(httpMock);

      expect(service.isAdmin()).toBe(true);
    });

    it('should return false for customer role', () => {
      const mockResponse = {
        success: true,
        data: {
          access_token: 'cust-token',
          user: { id: '1', name: 'Cust', email: 'cust@test.com', phone: '01012345678', role: 'customer', created_at: '2026-01-01' },
        },
      };

      service.login({ email: 'cust@test.com', password: 'p' }).subscribe();
      httpMock.expectOne((r) => r.url.includes('/api/auth/login')).flush(mockResponse);
      flushCartRequest(httpMock);

      expect(service.isAdmin()).toBe(false);
    });
  });

  describe('forgotPassword', () => {
    it('should POST to forgot-password endpoint', () => {
      service.forgotPassword('forgot@test.com').subscribe((msg) => {
        expect(msg).toBe('Check your email');
      });

      const req = httpMock.expectOne((r) => r.url.includes('/api/auth/forgot-password'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'forgot@test.com', lang: 'ar' });
      req.flush({ success: true, data: {}, message: 'Check your email' });
    });
  });

  describe('changePassword', () => {
    it('should PUT to change-password endpoint', () => {
      service.changePassword('old', 'new').subscribe();

      const req = httpMock.expectOne((r) => r.url.includes('/api/auth/change-password'));
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ current_password: 'old', new_password: 'new' });
      req.flush({ success: true, data: {}, message: 'done' });
    });
  });

  describe('updateProfile', () => {
    it('should update user and return updated data', () => {
      const mockResponse = {
        success: true,
        data: { id: '1', name: 'Updated', email: 'e@t.com', phone: '01099999999', role: 'customer', created_at: '2026-01-01' },
      };

      service.updateProfile('Updated', '01099999999').subscribe((user) => {
        expect(user.name).toBe('Updated');
        expect(user.phone).toBe('01099999999');
      });

      const req = httpMock.expectOne((r) => r.url.includes('/api/auth/profile'));
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);

      expect(service.user()?.name).toBe('Updated');
    });
  });
});
