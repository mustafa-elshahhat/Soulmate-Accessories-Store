import { TestBed } from '@angular/core/testing';
import { API_BASE_URL, apiEndpoint, resolveApiBaseUrl } from './api-base-url.token';

describe('API base URL configuration', () => {
  it('resolves the configured production API URL', () => {
    expect(resolveApiBaseUrl({ production: true, apiUrl: 'https://soulmate.runasp.net/' })).toBe('https://soulmate.runasp.net');
  });

  it('allows the configured local backend URL in development', () => {
    expect(resolveApiBaseUrl({ production: false, apiUrl: 'http://localhost:5291' })).toBe('http://localhost:5291');
  });

  it('fails production configuration clearly when API_BASE_URL is absent', () => {
    expect(() => resolveApiBaseUrl({ production: true, apiUrl: '' })).toThrowError(/production API base URL is not configured/);
  });

  it('rejects localhost as a production API URL', () => {
    expect(() => resolveApiBaseUrl({ production: true, apiUrl: 'http://localhost:5291' })).toThrowError(/local development host/);
  });

  it('preserves the /api prefix exactly once when building endpoints', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: API_BASE_URL, useValue: 'https://soulmate.runasp.net' }],
    });

    const endpoint = TestBed.runInInjectionContext(() => apiEndpoint('/api/products'));

    expect(endpoint).toBe('https://soulmate.runasp.net/api/products');
  });
});
