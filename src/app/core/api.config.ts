const DEFAULT_API_BASE_URL = 'http://localhost:8005';
const DEFAULT_INTERNAL_API_KEY = 'dev-internal-api-key';

export const apiConfig = {
  baseUrl: DEFAULT_API_BASE_URL,
  internalApiKey: DEFAULT_INTERNAL_API_KEY
};

export function buildApiUrl(path: string): string {
  const normalizedBaseUrl = apiConfig.baseUrl.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!normalizedBaseUrl) {
    return normalizedPath;
  }
  if (normalizedPath === normalizedBaseUrl || normalizedPath.startsWith(`${normalizedBaseUrl}/`)) {
    return normalizedPath;
  }
  return `${normalizedBaseUrl}${normalizedPath}`;
}
