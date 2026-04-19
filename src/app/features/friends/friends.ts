import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { LanguageService } from '../../core/services/Language/language-service';
import { Friend as FriendService } from '../../core/services/Friend/friend';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FriendData } from '../../core/models/friend';
import { FriendsTab } from '../../core/models/tab';

@Component({
  selector: 'app-friends',
  imports: [RouterLink],
  templateUrl: './friends.html',
  styleUrl: './friends.css',
})
export class Friends implements OnInit {
  readonly lang = inject(LanguageService);
  readonly friendService = inject(FriendService);
  readonly cookieService = inject(CookieService);
  private readonly route = inject(ActivatedRoute);

  activeTab = signal<FriendsTab>('all');
  searchQuery = signal('');

  readonly allFriends = signal<FriendData[]>([]);
  readonly friendRequests = signal<FriendData[]>([]);
  readonly suggestions = signal<FriendData[]>([]);
  readonly searchResults = signal<FriendData[]>([]);

  isLoading = signal(false);

  readonly tabs = [
    { id: 'all' as FriendsTab, label: this.lang.t('friends.allFriends'), badge: 0 },
    { id: 'requests' as FriendsTab, label: this.lang.t('friends.requests'), badge: this.friendRequests().length },
    { id: 'suggestions' as FriendsTab, label: this.lang.t('friends.suggestions'), badge: 0 },
  ];

  readonly filteredFriends = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const friends = this.allFriends();
    if (!q) return friends;
    return friends.filter(f =>
      f.displayName.toLowerCase().includes(q) ||
      f.username.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    // Listen to query params for search and tab changes
    this.route.queryParams.subscribe(params => {
      const q = params['q'];
      const tab = params['tab'];
      if (q) {
        this.searchQuery.set(q);
      }
      if (tab) {
        this.activeTab.set((tab === 'search' ? 'all' : tab) as FriendsTab);
      }
    });

    // Initial data load
    this.GetMyFriends();
  }

  // Get friends
  GetMyFriends(): void {
    this.friendService.GetFriends({ userId: this.cookieService.get('userId'), pageIndex: 1, pageSize: 20 }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          // Assuming the API returns an array of friends
          this.allFriends.set(res.data.data);
        }
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  // Get pending requests
  GetPendingRequests(): void {
    this.friendService.GetPendingRequests({ pageIndex: 1, pageSize: 20 }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          // Assuming the API returns an array of friend requests
          this.friendRequests.set(res.data.data);
        }
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  // Get suggested friends
  GetSuggestedFriends(): void {
    this.friendService.GetSuggestedUsers({ pageIndex: 1, pageSize: 20 }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          // Assuming the API returns an array of suggested users
          this.suggestions.set(res.data.data);
        }
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  // Actions on friends (Delete friend)
  unfriend(id: string): void {
    this.friendService.RemoveFriend(id).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          // Refresh the friends list after unfriending
          this.GetMyFriends();
        }
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  // Actions on friend requests (Add friend)
  addFriend(id: string): void {
    this.friendService.SendFriendRequest(id).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          // Refresh the friend requests list after adding a friend
          this.GetSuggestedFriends();
        }
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  // Accept friend requests
  acceptRequest(id: string): void {
    this.friendService.AcceptFriendRequest(id).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          // Refresh the friends list after accepting a request
          this.GetPendingRequests();
        }
      }, error: (err) => {
        console.log(err);
      }
    })
  }

  // Decline friend requests
  declineRequest(id: string): void {
    this.friendService.RejectFriendRequest(id).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          // Refresh the friend requests list after declining a request
          this.GetPendingRequests();
        }
      }, error: (err) => {
        console.log(err);
      }
    })
  }

  // Handle searching for users
  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery.set(query);

    if (query.length > 2) {
      // this.SearchUsers(query);
    } else {
      this.searchResults.set([]);
    }
  }
}
