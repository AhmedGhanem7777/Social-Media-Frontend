import { Component, inject, input, output, signal } from '@angular/core';
import { LanguageService } from '../../../core/services/Language/language-service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-comment-input',
  imports: [],
  templateUrl: './comment-input.html',
  styleUrl: './comment-input.css',
})
export class CommentInput {
  readonly lang = inject(LanguageService);
  private readonly cookieService = inject(CookieService);

  userProfilePicture = signal<string>(this.cookieService.get('profilePicture'));

  placeholder = input<string>('Write a comment...');
  initialValue = input<string>('');
  submitButtonText = input<string>('');

  submitted = output<string>();

  commentText = signal('');

  constructor() {
    this.commentText.set(this.initialValue());
  }

  // Handle the comment submission
  handleCommentSubmit(): void {
    const text = this.commentText().trim();
    if (text) {
      this.submitted.emit(text);
      this.commentText.set('');
    }
  }
}
