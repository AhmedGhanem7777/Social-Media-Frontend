import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { SaveRequest } from '../../models/save';

@Injectable({
  providedIn: 'root',
})
export class Save {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  ToogleSaveItem(saveRequest: SaveRequest): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/api/Save/toggle?`, saveRequest);
  }

  GetSaveItems(contentType: number): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/api/Save/items?contentType=${contentType}`);
  }
}
