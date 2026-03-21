import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { apiConfig } from '../core/api.config';
import { AuthService } from '../services/auth.service';

export const apiAuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(apiConfig.baseUrl)) {
    return next(req);
  }

  const authService = inject(AuthService);
  const token = authService.getToken();

  let headers = req.headers;

  if (apiConfig.internalApiKey && !headers.has('X-Api-Key')) {
    headers = headers.set('X-Api-Key', apiConfig.internalApiKey);
  }

  if (token && !headers.has('Authorization')) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  return next(
    req.clone({
      headers,
      withCredentials: true
    })
  );
};
