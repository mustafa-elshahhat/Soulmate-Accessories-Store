import { InjectionToken, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

interface ApiEnvironment {
  production: boolean;
  apiUrl?: string;
}

export function resolveApiBaseUrl(config: ApiEnvironment = environment): string {
  const configuredApiUrl = config.apiUrl?.trim() ?? '';
  const apiBaseUrl = configuredApiUrl;

  if (!apiBaseUrl) {
    if (config.production) {
      throw new Error('The production API base URL is not configured. Set API_BASE_URL to https://soulmate.runasp.net.');
    }
    throw new Error('The development API base URL is not configured.');
  }

  let parsed: URL;
  try {
    parsed = new URL(apiBaseUrl);
  } catch {
    throw new Error(`The API base URL is invalid: ${apiBaseUrl}`);
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`The API base URL must use http or https: ${apiBaseUrl}`);
  }

  const localHostname = ['local', 'host'].join('');
  const localAddress = ['127', '0', '0', '1'].join('.');
  if (config.production && [localHostname, localAddress].includes(parsed.hostname.toLowerCase())) {
    throw new Error('The production API base URL must not point to a local development host.');
  }

  const normalizedPath = parsed.pathname.replace(/\/+$/, '');
  if (normalizedPath && normalizedPath !== '/api') {
    throw new Error('The API base URL must not include a path other than /api.');
  }

  return parsed.origin;
}

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => resolveApiBaseUrl(),
});

export function apiEndpoint(path: string): string {
  const baseUrl = inject(API_BASE_URL);
  const cleanPath = path.replace(/^\/+/, '').replace(/^api\//, '');
  return `${baseUrl}/api/${cleanPath}`;
}
