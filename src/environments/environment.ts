/**
 * Build production : frontend sur Vercel et backend distant.
 * Utiliser HTTPS cote backend pour eviter le blocage mixed-content depuis un frontend HTTPS.
 * La clé interne est alignée sur l’exemple backend (`dev-internal-api-key`) comme l’ancien `api.config.ts` ;
 * pour un deploiement reel, remplacer via `fileReplacements` / pipeline CI sans committer de secret.
 */
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.rene.it.com',
  internalApiKey: 'change-me-prod-api-key',
  googleAnalyticsId: 'G-XXXXXXXXXX'   // Remplacer par votre Measurement ID GA4
};
