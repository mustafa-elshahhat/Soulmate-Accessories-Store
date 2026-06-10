// Production environment. The apiUrl below is a safe local default;
// real deployments must provide API_BASE_URL at build time
// (scripts/set-env.mjs rewrites this file during `npm run build`).
export const environment = {
  production: true,
  apiUrl: 'http://localhost:5291',
};
