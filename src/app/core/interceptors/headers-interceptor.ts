import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

export const headersInterceptor: HttpInterceptorFn = (req, next) => {
  const cookieService = inject(CookieService);
  const lang = localStorage.getItem('lang') || 'en';

  // Determine if the request is an authentication-related request
  const isAuthRequest = req.url.includes('/login') ||
    req.url.includes('/refresh') ||
    req.url.includes('/register');

  // Clone the request to add the new headers
  req = req.clone({
    setHeaders: {
      'Accept-Language': lang,
      ...(!isAuthRequest && cookieService.check('token') && { Authorization: `Bearer ${cookieService.get('token')}` }),
    }
  });

  return next(req);
};