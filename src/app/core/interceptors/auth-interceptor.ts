import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { Account } from '../services/Account/account';
import { Router } from '@angular/router';

let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const cookieService = inject(CookieService);
  const authService = inject(Account);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Check for 401 Unauthorized errors, excluding auth-related endpoints
      const isAuthError = error.status === 401;
      const isRefreshRequest = req.url.includes('/api/Account/refresh');
      const isLoginRequest = req.url.includes('/api/Account/login');

      // If it's an auth error and not a refresh or login request, attempt to refresh the token
      if (isAuthError && !isRefreshRequest && !isLoginRequest) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          const token = cookieService.get('token');
          const refreshToken = cookieService.get('refreshToken');

          // If no tokens are present, we can't refresh
          if (!token || !refreshToken) {
            isRefreshing = false;
            authService.clearAuthData();
            router.navigate(['/login']);
            return throwError(() => error);
          }

          // Attempt to refresh the token
          return authService.RefreshToken({ token, refreshToken }).pipe(
            switchMap((res: any) => {
              isRefreshing = false;

              const newToken = res.data.token;
              const newRefreshToken = res.data.refreshToken;

              // Store the new tokens as requested by the user
              cookieService.set('token', newToken);
              cookieService.set('refreshToken', newRefreshToken);

              // Notify all queued requests about the new token
              refreshTokenSubject.next(newToken);

              // Retry the original request with the new token
              return next(req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              }));
            }),
            catchError((err) => {
              isRefreshing = false;
              // If refresh fails, log out the user
              authService.clearAuthData();
              router.navigate(['/login']);
              return throwError(() => err);
            })
          );
        } else {
          // If a refresh is already in progress, wait for the new token
          return refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap(token => {
              return next(req.clone({
                setHeaders: {
                  Authorization: `Bearer ${token}`
                }
              }));
            })
          );
        }
      }

      // For all other errors, just throw them
      return throwError(() => error);
    })
  );
};

