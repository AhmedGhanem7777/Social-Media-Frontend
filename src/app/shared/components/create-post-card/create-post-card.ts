import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../../core/services/Language/language-service';
import { CreatePostModal } from '../create-post-modal/create-post-modal';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-post-card',
  imports: [CommonModule, CreatePostModal],
  templateUrl: './create-post-card.html',
  styleUrl: './create-post-card.css',
})
export class CreatePostCard {
  readonly lang = inject(LanguageService);
  readonly router = inject(Router);
  private readonly cookieService = inject(CookieService);

  showPostModal = signal(false);
  profilePicture = signal<string>(this.cookieService.get('profilePicture'));

  // Method to navigate to the user's profile page
  navigateToProfile(): void {
    const userId = this.cookieService.get('userId');
    this.router.navigate(['/profile', userId]);
  }
}
