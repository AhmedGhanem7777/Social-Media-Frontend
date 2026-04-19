import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Story {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  getUserStory(): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/api/Story/active-users`);
  }

  createStory(formData: FormData): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/api/Story`, formData);
  }
}