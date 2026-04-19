import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { CreateCommentRequest, GetCommentsRequest, GetRepliesRequest } from '../../models/comment';
import { Observable } from 'rxjs';
import { UserCommented } from '../../models/user';

@Injectable({
  providedIn: 'root',
})
export class Comment {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  GetCommentsForContent(request: GetCommentsRequest): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/api/Comment?ContentType=${request.contentType}&ContentId=${request.contentId}&PageIndex=${request.pageIndex}&PageSize=${request.pageSize}`);
  }

  GetRepliesForComment(repliesRequest: GetRepliesRequest): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/api/Comment/replies?commentId=${repliesRequest.commentId}&pageIndex=${repliesRequest.pageIndex}&pageSize=${repliesRequest.pageSize}`);
  }

  CreateComment(request: CreateCommentRequest): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/api/Comment`, request);
  }

  GetUsersWhoCommented(users: UserCommented): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/api/Comment/users?ContentType=${users.contentType}&ContentId=${users.contentId}&PageIndex=${users.pageIndex}&PageSize=${users.pageSize}`);
  }
}
