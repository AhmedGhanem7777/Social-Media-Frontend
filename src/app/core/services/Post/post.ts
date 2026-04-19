import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreatePostRequest, PostData, PostShareData } from '../../models/post';

@Injectable({
  providedIn: 'root',
})
export class Post {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  GetPostsForSpecificUser(postData: PostData): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/api/Post?userId=${postData.userId}&PageIndex=${postData.pageIndex}&PageSize=${postData.pageSize}`)
  }

  SharePost(postData: PostShareData): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/api/Post/share`, postData);
  }

  GetPostById(postId: number): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/api/Post/${postId}`);
  }

  DeletePost(postId: number): Observable<any> {
    return this.httpClient.delete(`${this.baseUrl}/api/Post/${postId}`);
  }

  CreatePost(createPost: FormData): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/api/Post`, createPost);
  }
}
