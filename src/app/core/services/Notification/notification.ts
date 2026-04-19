import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { NotificationRequest } from '../../models/notification';

@Injectable({
  providedIn: 'root',
})
export class Notification {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;
  unreadCountRefreshTrigger = signal(0);

  notifyUnreadCountChanged(): void {
    this.unreadCountRefreshTrigger.update(v => v + 1);
  }

  GetNotifications(notificationRequest: NotificationRequest): Observable<any> {
    let params: any = {
      pageIndex: notificationRequest.pageIndex,
      pageSize: notificationRequest.pageSize
    };

    if (notificationRequest.Type !== undefined && notificationRequest.Type !== 0) {
      params.Type = notificationRequest.Type;
    }

    if (notificationRequest.IsRead !== undefined) {
      params.IsRead = notificationRequest.IsRead;
    }

    return this.httpClient.get(`${this.baseUrl}/api/Notifications`, { params });
  }

  GetUnreadCount(): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/api/Notifications/unread-count`);
  }

  ReadNotification(notificationId: number): Observable<any> {
    return this.httpClient.patch(`${this.baseUrl}/api/Notifications/${notificationId}/read`, {});
  }

  ReadAllNotifications(): Observable<any> {
    return this.httpClient.patch(`${this.baseUrl}/api/Notifications/read-all`, {});
  }

  DeleteNotification(notificationId: number): Observable<any> {
    return this.httpClient.delete(`${this.baseUrl}/api/Notifications/${notificationId}`);
  }
}
