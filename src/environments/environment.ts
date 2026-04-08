/**
 * Build production : même origine que l’API (reverse proxy) ou adapter `apiBaseUrl`.
 * La clé interne est alignée sur l’exemple backend (`dev-internal-api-key`) comme l’ancien `api.config.ts` ;
 * pour un deploiement reel, remplacer via `fileReplacements` / pipeline CI sans committer de secret.
 */
export const environment = {
  production: true,
  apiBaseUrl: '',
  internalApiKey: 'dev-internal-api-key',
  googleAnalyticsId: 'G-XXXXXXXXXX'   // Remplacer par votre Measurement ID GA4
};
