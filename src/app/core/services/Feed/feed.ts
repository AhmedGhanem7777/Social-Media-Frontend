import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { Pagination } from '../../models/Pagination';
import { FeedStoriesRequest } from '../../models/user';

@Injectable({
  providedIn: 'root',
})
export class Feed {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  GetFeedReels(pagination: Pagination): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/api/Feed/reels?pageIndex=${pagination.pageIndex}&pageSize=${pagination.pageSize}`);
  }

  GetFeedStories(feedStoriesRequest: FeedStoriesRequest): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/api/Feed/stories?pageIndex=${feedStoriesRequest.pageIndex}&pageSize=${feedStoriesRequest.pageSize}&userId=${feedStoriesRequest.userId}`);
  }

  GetFeedPosts(pagination: Pagination): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/api/Feed/posts?pageIndex=${pagination.pageIndex}&pageSize=${pagination.pageSize}`);
  }
}
