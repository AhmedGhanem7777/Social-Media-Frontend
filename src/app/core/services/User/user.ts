import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { signal } from '@angular/core';
import { SearchRequest } from '../../models/user';
import { Platform } from '../../models/social';

@Injectable({
  providedIn: 'root',
})
export class User {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;
  private readonly cookieService = inject(CookieService);
  
  currentUserProfilePicture = signal<string>(this.cookieService.get('profilePicture') || '');

  updateProfilePicture(url: string): void {
    this.currentUserProfilePicture.set(url);
    this.cookieService.set('profilePicture', url);
  }

  getUserProfile(userId: string): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/api/User/profile/${userId}`);
  }

  updateUserProfile(payload: FormData): Observable<any> {
    return this.httpClient.put(`${this.baseUrl}/api/User/me`, payload);
  }

  updateLinks(socialLinks: Platform[]): Observable<any> {
    return this.httpClient.put(`${this.baseUrl}/api/User/me/social-links`, socialLinks);
  }

  searchUsers(searchRequest: SearchRequest): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/api/User/search?query=${searchRequest.query}&pageIndex=${searchRequest.pageIndex}&pageSize=${searchRequest.pageSize}`);
  }
}
