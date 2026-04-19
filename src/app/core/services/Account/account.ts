import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ForgotPasswordData, LoginData, RefreshTokenRequest, RegisterData, ResetPasswordData, RevokeTokenDto } from '../../models/account';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class Account {
  private readonly httpClient = inject(HttpClient);
  private readonly cookieService = inject(CookieService);
  private readonly baseUrl = environment.baseUrl;

  Login(loginData: LoginData): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/api/Account/login`, loginData);
  }

  Register(registerData: FormData): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/api/Account/register`, registerData);
  }

  ForgotPassword(forgotPasswordData: ForgotPasswordData): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/api/Account/forgot-password`, forgotPasswordData);
  }

  ResetPassword(resetData: ResetPasswordData): Observable<any> {
    return this.httpClient.put(`${this.baseUrl}/api/Account/reset-password`, resetData);
  }

  RefreshToken(data: RefreshTokenRequest): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/api/Account/refresh`, data);
  }

  RevokeToken(data: RevokeTokenDto): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/api/Account/revoke-refresh-token`, data);
  }

  logout(): Observable<any> {
    const token = this.cookieService.get('token');
    const refreshToken = this.cookieService.get('refreshToken');
    return this.RevokeToken({ token, refreshToken }).pipe(
      tap(() => {
        this.clearAuthData();
      })
    );
  }

  clearAuthData(): void {
    this.cookieService.delete('token');
    this.cookieService.delete('refreshToken');
    this.cookieService.delete('userId');
    this.cookieService.delete('isLogin');
  }
}