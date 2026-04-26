import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Parameterized routes → render on server at request time
  { path: 'products/:slug', renderMode: RenderMode.Server },
  { path: 'gifts/:category', renderMode: RenderMode.Server },
  { path: 'orders/:id', renderMode: RenderMode.Server },
  { path: 'admin/orders/:id', renderMode: RenderMode.Server },
  { path: 'admin/products/:id/edit', renderMode: RenderMode.Server },
  { path: 'admin/box-types/:id/edit', renderMode: RenderMode.Server },

  // Auth pages → client-side only
  { path: 'login', renderMode: RenderMode.Client },
  { path: 'register', renderMode: RenderMode.Client },
  { path: 'forgot-password', renderMode: RenderMode.Client },
  { path: 'reset-password', renderMode: RenderMode.Client },

  // Auth-protected routes → client-side only
  { path: 'checkout/**', renderMode: RenderMode.Client },
  { path: 'orders', renderMode: RenderMode.Client },
  { path: 'notifications', renderMode: RenderMode.Client },
  { path: 'profile', renderMode: RenderMode.Client },
  { path: 'admin/**', renderMode: RenderMode.Client },

  // All other public pages → prerender
  { path: '**', renderMode: RenderMode.Prerender },
];
