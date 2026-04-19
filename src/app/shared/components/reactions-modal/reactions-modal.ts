import { Component, inject, input, OnInit, OnDestroy, output, signal, ElementRef, Renderer2 } from '@angular/core';
import { LanguageService } from '../../../core/services/Language/language-service';
import { UserReactionView } from '../../../core/models/reactions';
import { Like } from '../../../core/services/Like/like';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reactions-modal',
  imports: [],
  templateUrl: './reactions-modal.html',
  styleUrl: './reactions-modal.css',
})
export class ReactionsModal implements OnInit, OnDestroy {
  readonly lang = inject(LanguageService);
  readonly likeService = inject(Like);
  readonly router = inject(Router);
  contentId = input.required<number>();
  contentType = input<number>(1);
  close = output<void>();

  users = signal<UserReactionView[]>([]);
  loading = signal(false);
  pageIndex = signal(1);
  pageSize = 20;
  hasMore = signal(true);

  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  ngOnInit(): void {
    this.renderer.appendChild(document.body, this.el.nativeElement);
    this.loadUsers();
  }

  // Load users who reacted to the content
  loadUsers(): void {
    this.loading.set(true);
    this.likeService.GetUserReactions({ contentType: this.contentType(), contentId: this.contentId(), pageIndex: this.pageIndex(), pageSize: this.pageSize }).subscribe({
      next: (res: any) => {

        if (res.isSuccess) {
          const newUsers: UserReactionView[] = res.data.data ?? res.data;
          if (this.pageIndex() === 1) {
            this.users.set(newUsers);
          } else {
            this.users.update(prev => [...prev, ...newUsers]);
          }
          this.hasMore.set(newUsers.length >= this.pageSize);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load user reactions', err);
        this.loading.set(false);
      }
    });
  }

  // Load more users when the user scrolls to the bottom of the modal
  loadMore(): void {
    if (!this.hasMore() || this.loading()) return;
    this.pageIndex.update(p => p + 1);
    this.loadUsers();
  }

  // Handle scroll event to implement infinite scrolling
  onScroll(event: any): void {
    const element = event.target;
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 50) {
      this.loadMore();
    }
  }

  onClose(): void {
    this.close.emit();
  }

  // Navigate to the user's profile when their name or picture is clicked
  navigateToProfile(userId: string): void {
    this.close.emit();
    this.router.navigate(['/profile', userId]);
  }

  // Clean up the modal from the DOM when the component is destroyed
  ngOnDestroy(): void {
    if (this.el.nativeElement && this.el.nativeElement.parentNode) {
      this.renderer.removeChild(document.body, this.el.nativeElement);
    }
  }
}
