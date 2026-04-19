import { NgSwitch } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LanguageService } from '../../../core/services/Language/language-service';
import { BottomNavItem } from '../../../core/models/navItem';
import { CookieService } from 'ngx-cookie-service';
import { CreateReelModal } from '../create-reel-modal/create-reel-modal';

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, NgSwitch, CreateReelModal],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.css',
})
export class BottomNav {
  readonly lang = inject(LanguageService);
  private readonly router = inject(Router);
  private readonly cookieService = inject(CookieService);

  currentUserId = signal<string>(this.cookieService.get("userId"))

  readonly navItems: BottomNavItem[] = [
    { path: '/', label: 'nav.home' },
    { path: '/reels', label: 'nav.reels' },
    { path: '', label: 'feed.post', isCreate: true },
    { path: '/chat', label: 'nav.chat' },
    { path: `/profile`, label: 'nav.profile' },
  ];

  showReelModal = signal(false);

  // Get the link for a navigation item, handling dynamic paths like profile
  getLink(item: BottomNavItem) {
    if (item.path === '/profile') {
      return [item.path, this.currentUserId()];
    }
    return [item.path];
  }

  // Check if a navigation item is active based on the current URL
  isActive(path: string): boolean {
    if (path === '/') {
      return this.router.url === '/';
    }
    return this.router.url.startsWith(path);
  }

  // Open the create reel modal
  openCreateReel(): void {
    this.showReelModal.set(true);
  }
}
