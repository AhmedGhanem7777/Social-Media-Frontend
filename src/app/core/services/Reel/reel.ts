import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { CreateReelRequest, ShareRequest } from '../../models/reel';

@Injectable({
  providedIn: 'root',
})
export class Reel {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  GetReelById(reelId: number): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/api/Reel/${reelId}`);
  }

  ShareReel(shareRequest: ShareRequest): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/api/Reel/share`, shareRequest);
  }

  CreateReel(createReel: FormData): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/api/Reel`, createReel);
  }
}

