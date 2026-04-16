import { HttpBackend, HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, filter, switchMap, take, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { buildApiUrl } from '../core/api.config';

interface RefreshResponse {
  session: { session_id: string; account_id: string; access_expires_at: string; refresh_expires_at: string };
  tokens: { access_token: string };
}

// Shared state across all interceptor invocations within the same app instance.
let _refreshing = false;
const _refreshDone$ = new BehaviorSubject<string | null>(null);

/** Returns a bare HttpClient that bypasses the interceptor chain (avoids circular calls). */
function _bareHttp(backend: HttpBackend): HttpClient {
  return new HttpClient(backend);
}

/**
 * Catches 401 responses, silently refreshes the access token via the HTTP-only
 * refresh-token cookie, updates localStorage, then retries the original request.
 * If the refresh itself fails (expired / missing cookie), clears the session and
 * redirects to /login.
 *
 * Safe against concurrent 401 bursts: only one refresh call is made; other
 * failing requests queue behind it and are retried once the new token arrives.
 */
export const tokenRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const backend = inject(HttpBackend);

  // Skip the refresh endpoint itself and public auth endpoints to avoid loops.
  const skipRefresh =
    req.url.includes('/api/v1/identity/refresh') ||
    req.url.includes('/api/v1/identity/login') ||
    req.url.includes('/api/v1/identity/register') ||
    req.url.includes('/api/v1/identity/verify-email') ||
    req.url.includes('/api/v1/identity/reset-password');

  if (skipRefresh) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      const hasLocalToken = !!localStorage.getItem('token');
      if (!hasLocalToken) {
        return throwError(() => error);
      }

      if (_refreshing) {
        // Another request already triggered a refresh — wait for it to finish.
        return _refreshDone$.pipe(
          filter((token): token is string => token !== null),
          take(1),
          switchMap((newToken) => {
            if (!newToken) {
              // Refresh failed in the other branch — propagate the original 401.
              return throwError(() => error);
            }
            return next(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }));
          })
        );
      }

      _refreshing = true;
      _refreshDone$.next(null);

      return _bareHttp(backend)
        .post<RefreshResponse>(
          buildApiUrl('/api/v1/identity/refresh'),
          {},
          { withCredentials: true }
        )
        .pipe(
          switchMap((response) => {
            const newToken = response.tokens.access_token;
            localStorage.setItem('token', newToken);
            _refreshing = false;
            _refreshDone$.next(newToken);
            return next(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }));
          }),
          catchError((refreshError) => {
            _refreshing = false;
            _refreshDone$.next('');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
    })
  );
};
