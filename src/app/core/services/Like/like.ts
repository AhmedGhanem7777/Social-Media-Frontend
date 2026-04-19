import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { ToogleLikeRequest } from '../../models/like';
import { UserReactionRequest } from '../../models/reactions';

@Injectable({
  providedIn: 'root',
})
export class Like {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  ToogleLike(toogleLike: ToogleLikeRequest): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/api/Like/toggle`, toogleLike);
  }

  GetUserReactions(usersReaction: UserReactionRequest): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/api/Like/users?contentType=${usersReaction.contentType}&contentId=${usersReaction.contentId}&pageIndex=${usersReaction.pageIndex}&pageSize=${usersReaction.pageSize}`);
  }
}
