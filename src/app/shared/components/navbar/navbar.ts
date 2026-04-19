import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../../core/services/Theme/theme-service';
import { LanguageService } from '../../../core/services/Language/language-service';
import { NavItem } from '../../../core/models/navItem';
import { Account } from '../../../core/services/Account/account';
import { CookieService } from 'ngx-cookie-service';
import { User } from '../../../core/services/User/user';
import { Subscription } from 'rxjs';

import { CreateReelModal } from '../create-reel-modal/create-reel-modal';
import { Notification as NotificationService } from '../../../core/services/Notification/notification';
import { NotificationDropdown } from '../notification-dropdown/notification-dropdown';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, CreateReelModal, NotificationDropdown],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  readonly lang = inject(LanguageService);
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly accountService = inject(Account);
  private readonly cookieService = inject(CookieService);
  private readonly userService = inject(User);
  readonly notificationService = inject(NotificationService);

  showReelModal = signal(false);
  showProfileMenu = signal(false);
  showNotifications = signal(false);
  showMobileMenu = signal(false);
  currentUserId = signal<string>('');
  profilePicture = this.userService.currentUserProfilePicture;
  unreadCount = signal<number>(0);

  // Search
  searchQuery = signal('');
  searchResults = signal<any[]>([]);
  showSearchResults = signal(false);
  isSearching = signal(false);

  readonly navItems: NavItem[] = [
    { path: '/', icon: 'home', label: 'nav.home' },
    { path: '/reels', icon: 'film', label: 'nav.reels' },
    { path: '/chat', icon: 'message', label: 'nav.chat' },
  ];

  constructor() {
    // Effect to refresh unread notification count whenever the trigger is updated
    effect(() => {
      this.notificationService.unreadCountRefreshTrigger();
      this.GetUnreadCount();
    });

    effect((onCleanup) => {
      const query = this.searchQuery();
      let sub: Subscription | undefined;

      if (!query.trim()) {
        this.searchResults.set([]);
        this.showSearchResults.set(false);
        this.isSearching.set(false);
        return;
      }

      const timeoutId = setTimeout(() => {
        this.isSearching.set(true);
        sub = this.userService.searchUsers({ query, pageIndex: 1, pageSize: 6 }).subscribe({
          next: (res) => {
            if (res && res.isSuccess) {
              const users = res.data?.data || res.data || [];
              this.searchResults.set(Array.isArray(users) ? users : []);
              this.showSearchResults.set(true);
            } else {
              this.searchResults.set([]);
              this.showSearchResults.set(false);
            }
            this.isSearching.set(false);
          },
          error: () => {
            this.searchResults.set([]);
            this.showSearchResults.set(false);
            this.isSearching.set(false);
          }
        });
      }, 300);

      onCleanup(() => {
        clearTimeout(timeoutId);
        if (sub) {
          sub.unsubscribe();
        }
      });
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.currentUserId.set(this.cookieService.get("userId"));
  }

  // Method to handle user logout
  LogOut(): void {
    this.showProfileMenu.set(false);
    this.accountService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // Even if revoke fails, clear local auth data and redirect
        this.accountService.clearAuthData();
        this.router.navigate(['/login']);
      }
    });
  }

  // Method to refresh unread notification count
  GetUnreadCount(): void {
    this.notificationService.GetUnreadCount().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.unreadCount.set(res.data);
        }
      },
      error: (err) => console.error('Error fetching unread count:', err)
    });
  }

  // Method to handle search input changes
  onSearchInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery.set(query);
  }

  // Method to navigate to a user's profile page from search results
  navigateToProfile(userId: string): void {
    this.closeSearch();
    this.closeMobileMenu();
    this.router.navigate(['/profile', userId]);
  }

  // Method to close search results dropdown
  closeSearch(): void {
    this.showSearchResults.set(false);
    this.searchQuery.set('');
    this.searchResults.set([]);
  }

  // Method to check if a nav item is active based on the current route
  isActive(path: string): boolean {
    return this.router.url === path;
  }

  toggleLanguage(): void {
    this.lang.setLanguage(this.lang.language() === 'en' ? 'ar' : 'en');
  }

  toggleProfileMenu(): void {
    this.showProfileMenu.update(v => !v);
  }

  toggleMobileMenu(): void {
    this.showMobileMenu.update(v => !v);
  }

  closeMobileMenu(): void {
    this.showMobileMenu.set(false);
  }

  closeProfileMenu(): void {
    this.showProfileMenu.set(false);
  }

  openCreateReel(): void {
    this.showReelModal.set(true);
  }
}
