import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LanguageService } from '../../../core/services/Language/language-service';
import { SidebarNavItem } from '../../../core/models/navItem';
import { SuggestedUser } from '../../../core/models/user';
import { Friend } from '../../../core/services/Friend/friend';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  readonly lang = inject(LanguageService);
  private readonly router = inject(Router);
  private readonly friendService = inject(Friend);
  private readonly cookieService = inject(CookieService);

  readonly mainNavItems: SidebarNavItem[] = [
    { path: '/', icon: 'home', label: 'nav.feed' },
    { path: '/reels', icon: 'film', label: 'nav.reels' },
    { path: '/chat', icon: 'message', label: 'nav.chat' },
    { path: `/profile/${this.cookieService.get("userId")}`, icon: 'user', label: 'nav.profile' },
  ];

  readonly secondaryNavItems: SidebarNavItem[] = [
    { path: '/saved', icon: 'bookmark', label: 'nav.saved' },
    { path: '/friends', icon: 'users', label: 'profile.friends' },
  ];

  suggestedUsers = signal<SuggestedUser[]>([]);

  ngOnInit(): void {
    this.GetSuggestedUsers();
  }

  // Fetch suggested users from the Friend service and update the suggestedUsers signal
  GetSuggestedUsers(): void {
    this.friendService.GetSuggestedUsers({ pageIndex: 1, pageSize: 20 }).subscribe({
      next: (users) => {
        if (users.isSuccess) {
          // Update the suggestedUsers signal with the fetched data to trigger UI updates
          this.suggestedUsers.set(users.data.data);
        }
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  // Send a friend request to the specified user ID and update the suggested users list on success
  followUser(userId: string): void {
    this.friendService.SendFriendRequest(userId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          // Remove the user from suggested list or update state
          this.suggestedUsers.update(users => users.filter(u => u.userId !== userId));
        }
      },
      error: (err) => console.error('Error sending friend request:', err)
    });
  }

  // Check if the given path matches the current router URL to determine if a nav item is active
  isActive(path: string): boolean {
    return this.router.url === path;
  }
}
