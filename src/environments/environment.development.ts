/**
 * Développement : requêtes relatives /api/... proxifiées vers le backend (voir proxy.conf.json).
 * Pour appeler directement le backend sans proxy (CORS), définir apiBaseUrl sur http://localhost:8005.
 */
export const environment = {
  production: false,
  apiBaseUrl: '',
  internalApiKey: 'dev-internal-api-key',
  googleAnalyticsId: ''   // Laisser vide en dev pour ne pas polluer les données GA4
};
