import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { Reaction, REACTIONS } from '../../models/reactions';

@Injectable({
  providedIn: 'root',
})
export class Enum {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  reactionTypes = signal<Reaction[]>(REACTIONS);

  GetSocialPlatforms(): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/api/Enums/social-platforms`)
  }

  GetContentType(): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/api/Enums/content-type`)
  }

  GetNotificationType(): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/api/Enums/notification-type`)
  }

  GetReactionTypes(): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/api/Enums/reaction-type`)
  }
}
