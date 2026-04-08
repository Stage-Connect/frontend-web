import { environment } from '../../environments/environment';

export const apiConfig = {
  baseUrl: environment.apiBaseUrl,
  internalApiKey: environment.internalApiKey
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

/** Indique si l’URL cible l’API backend (auth + X-Api-Key). */
export function isBackendApiUrl(url: string): boolean {
  const base = apiConfig.baseUrl.replace(/\/+$/, '');
  if (base) {
    return url.startsWith(base);
  }
  try {
    const parsed = new URL(url);
    return parsed.pathname.startsWith('/api/');
  } catch {
    return url.startsWith('/api/');
  }
}
