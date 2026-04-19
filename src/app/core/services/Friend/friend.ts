import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { Pagination } from '../../models/Pagination';
import { FriendRequest } from '../../models/friend';

@Injectable({
  providedIn: 'root',
})
export class Friend {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  GetSuggestedUsers(paging: Pagination): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/api/Friends/suggestions?PageIndex=${paging.pageIndex}&PageSize=${paging.pageSize}`);
  }

  GetFriends(friendRequest: FriendRequest): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/api/Friends?userId=${friendRequest.userId}&PageIndex=${friendRequest.pageIndex}&PageSize=${friendRequest.pageSize}`)
  }

  GetPendingRequests(paging: Pagination): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/api/Friends/requests?PageIndex=${paging.pageIndex}&PageSize=${paging.pageSize}`);
  }

  SendFriendRequest(addresseeId: string): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/api/Friends/request/${addresseeId}`, {});
  }

  AcceptFriendRequest(requesterId: string): Observable<any> {
    return this.httpClient.patch(`${this.baseUrl}/api/Friends/accept/${requesterId}`, {});
  }

  RejectFriendRequest(requesterId: string): Observable<any> {
    return this.httpClient.patch(`${this.baseUrl}/api/Friends/reject/${requesterId}`, {});
  }

  RemoveFriend(friendId: string): Observable<any> {
    return this.httpClient.delete(`${this.baseUrl}/api/Friends/unfriend/${friendId}`);
  }
}
