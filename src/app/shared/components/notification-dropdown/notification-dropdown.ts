import { Component, inject, OnInit, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Notification as NotificationService } from '../../../core/services/Notification/notification';
import { LanguageService } from '../../../core/services/Language/language-service';
import { Notification } from '../../../core/models/notification';
import { PostDatePipe } from '../../../shared/pipes/post-date-pipe';

@Component({
  selector: 'app-notification-dropdown',
  imports: [RouterLink, PostDatePipe],
  templateUrl: './notification-dropdown.html',
  styleUrl: './notification-dropdown.css',
})
export class NotificationDropdown implements OnInit {
  readonly notificationService = inject(NotificationService);
  readonly lang = inject(LanguageService);

  notifications = signal<Notification[]>([]);
  isLoading = signal(false);
  close = output<void>();

  ngOnInit(): void {
    this.loadNotifications();
  }

  // Load latest 5 unread notifications
  loadNotifications(): void {
    this.isLoading.set(true);
    this.notificationService.GetNotifications({ IsRead: false, Type: 0, pageIndex: 1, pageSize: 5 }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.notifications.set(res.data.data);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  // Mark a single notification as read
  markAsRead(id: number): void {
    const notif = this.notifications().find(n => n.id === id);
    if (!notif || notif.isRead) return;

    this.notificationService.ReadNotification(id).subscribe((res) => {
      if (res.isSuccess) {
        this.notifications.update(list =>
          list.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
        this.notificationService.notifyUnreadCountChanged();
      }
    });
  }

  // Delete a notification
  deleteNotification(event: MouseEvent, id: number): void {
    event.stopPropagation();
    this.notificationService.DeleteNotification(id).subscribe((res) => {
      if (res.isSuccess) {
        const notif = this.notifications().find(n => n.id === id);
        if (notif && !notif.isRead) {
          this.notificationService.notifyUnreadCountChanged();
        }
        this.notifications.update(list => list.filter(n => n.id !== id));
      }
    });
  }

  // Mark all notifications as read
  markAllRead(): void {
    this.notificationService.ReadAllNotifications().subscribe((res) => {
      if (res.isSuccess) {
        this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
        this.notificationService.notifyUnreadCountChanged();
      }
    });
  }

  // Close the dropdown
  onClose(): void {
    this.close.emit();
  }

  // Helpers
  getBadgeClass(type: number | string): string {
    const map: Record<number, string> = {
      1: 'bg-blue-500',   // NewPost
      2: 'bg-purple-500', // NewStory
      3: 'bg-orange-500', // NewReel
      4: 'bg-green-500',  // NewFollower
      5: 'bg-red-500',    // Like
      6: 'bg-blue-600',   // Comment
      7: 'bg-sky-500',    // Message
      8: 'bg-pink-500',   // Share
    };
    return map[Number(type)] ?? 'bg-primary';
  }

  getIcon(type: number | string): string {
    const size = 'class="w-3 h-3 text-white"';
    const t = Number(type);
    switch (t) {
      case 1: return `<svg xmlns="http://www.w3.org/2000/svg" ${size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`; // Post
      case 2: return `<svg xmlns="http://www.w3.org/2000/svg" ${size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a7 7 0 1 0 10 10"/></svg>`; // Story
      case 3: return `<svg xmlns="http://www.w3.org/2000/svg" ${size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 8 6 4-6 4Z"/></svg>`; // Reel
      case 4: return `<svg xmlns="http://www.w3.org/2000/svg" ${size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>`; // Follow
      case 5: return `<svg xmlns="http://www.w3.org/2000/svg" ${size} viewBox="0 0 24 24" fill="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`; // Like
      case 6: return `<svg xmlns="http://www.w3.org/2000/svg" ${size} viewBox="0 0 24 24" fill="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`; // Comment
      case 7: return `<svg xmlns="http://www.w3.org/2000/svg" ${size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>`; // Message
      case 8: return `<svg xmlns="http://www.w3.org/2000/svg" ${size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>`; // Share
      default: return '';
    }
  }
}
