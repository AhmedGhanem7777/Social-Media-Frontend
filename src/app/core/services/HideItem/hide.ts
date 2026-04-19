import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { HideItemRequest } from '../../models/hide';

@Injectable({
  providedIn: 'root',
})
export class Hide {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  ToogleHideItem(hideRequest: HideItemRequest): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/api/Hide/toggle`, hideRequest);
  }
}
