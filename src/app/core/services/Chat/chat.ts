import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { ConversationRequest, ReactRequest, SendMessageRequest } from '../../models/chat';

@Injectable({
  providedIn: 'root',
})
export class Chat {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  GetAllUsersChat(): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/api/Chat/all-conversations`);
  }

  SendMessage(request: SendMessageRequest): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/api/Chat/send`, request);
  }

  GetConversationWithUser(request: ConversationRequest): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/api/Chat/conversation?id=${request.userId}&pageIndex=${request.pageIndex}&pageSize=${request.pageSize}`);
  }

  MarkMessagesAsRead(userId: string): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/api/Chat/mark-read/${userId}`, {});
  }

  DeleteMessage(messageId: string): Observable<any> {
    return this.httpClient.delete(`${this.baseUrl}/api/Chat/message/${messageId}`);
  }

  ReactToMessage(reactRequest: ReactRequest): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/api/Chat/react?messageId=${reactRequest.messageId}&reactionType=${reactRequest.reactionType}`, {});
  }
}
