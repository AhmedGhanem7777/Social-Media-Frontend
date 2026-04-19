import { Component, inject, input, linkedSignal, signal, OnInit, computed, output } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageService } from '../../../core/services/Language/language-service';
import { Post } from '../../../core/models/post';
import { MediaKind } from '../../../core/models/enum';
import { Comments } from '../comments/comments';
import { PostDatePipe } from '../../pipes/post-date-pipe';
import { REACTIONS } from '../../../core/models/reactions';
import { CommonModule } from '@angular/common';
import { Post as PostService } from '../../../core/services/Post/post';
import { SharePostModal } from '../share-post-modal/share-post-modal';
import { UserCommentedView } from '../../../core/models/user';
import { Comment } from '../../../core/services/Comment/comment';
import { UserListModal } from '../user-list-modal/user-list-modal';
import { Enum } from '../../../core/services/Enum/enum';
import { Like } from '../../../core/services/Like/like';
import { CookieService } from 'ngx-cookie-service';
import { Save } from '../../../core/services/SaveItem/save';
import { ReactionsModal } from '../reactions-modal/reactions-modal';
import { Hide } from '../../../core/services/HideItem/hide';


@Component({
  selector: 'app-post-card',
  imports: [Comments, PostDatePipe, CommonModule, SharePostModal, UserListModal, ReactionsModal],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
})
export class PostCard implements OnInit {
  readonly lang = inject(LanguageService);
  private readonly router = inject(Router);
  readonly postService = inject(PostService);
  readonly commentService = inject(Comment);
  readonly enumService = inject(Enum);
  readonly hideService = inject(Hide);
  readonly likeService = inject(Like);
  readonly cookieService = inject(CookieService);
  readonly saveService = inject(Save);
  readonly REACTIONS = REACTIONS;
  readonly MediaKind = MediaKind;

  readonly post = input.required<Post>();
  postDeleted = output<number>();

  isLiked = linkedSignal(() => this.post().isLikedByCurrentUser);
  selectedReaction = linkedSignal<number | null>(() => {
    const name = this.post().reactionType;
    if (name) {
      return REACTIONS.find(r => r.name === name)?.id ?? null;
    }
    return this.post().isLikedByCurrentUser ? 1 : null;
  });

  isSaved = linkedSignal(() => this.post().isSavedByCurrentUser ?? false);
  likeCount = linkedSignal(() => this.post().likesCount);
  commentsCount = linkedSignal(() => this.post().commentsCount);
  sharesCount = linkedSignal(() => this.post().sharesCount);
  savesCount = linkedSignal(() => this.post().savesCount ?? 0);
  reactions = linkedSignal(() => this.post().reactions);

  readonly currentUserId = this.cookieService.get('userId');
  readonly isOwner = computed(() => {
    if (this.post().isShared) {
      return this.post().sharedByUserId === this.currentUserId;
    }
    return this.post().userId === this.currentUserId;
  });

  showComments = signal(false);
  showMoreMenu = signal(false);
  showReactions = signal(false);
  showShareModal = signal(false);
  showUserCommentedModal = signal(false);
  showUserReactionsModal = signal(false);
  userCommented = signal<UserCommentedView[]>([]);

  ngOnInit(): void {
    this.getUsersWhoCommented();
    this.getReactionTypes();
  }

  // Get reaction types with metadata (emoji, color) for display
  getReactionTypes(): void {
    if (this.enumService.reactionTypes().length === 0 || this.enumService.reactionTypes() === REACTIONS) {
      this.enumService.GetReactionTypes().subscribe({
        next: (res: any) => {
          if (res.isSuccess) {
            const mappedReactions = res.data.map((backendReaction: { id: number; name: string }) => {
              const metadata = REACTIONS.find(r => r.id === backendReaction.id);
              return {
                id: backendReaction.id,
                name: metadata?.name || backendReaction.name,
                emoji: metadata?.emoji,
                color: metadata?.color
              };
            });
            this.enumService.reactionTypes.set(mappedReactions);
          }
        }, error: (err) => {
          console.log(err);
        }
      })
    }
  }

  // Handle like/unlike with optimistic UI update
  handleLike(): void {
    const wasLiked = !!this.selectedReaction();
    const previousReaction = this.selectedReaction();
    const previousCount = this.likeCount();

    // Optimistic UI update
    if (wasLiked) {
      this.selectedReaction.set(null);
      this.isLiked.set(false);
      this.likeCount.set(previousCount - 1);
    } else {
      // Default to Like (1)
      this.selectedReaction.set(1);
      this.isLiked.set(true);
      this.likeCount.set(previousCount + 1);
    }

    // Send the (previous) reaction on unlike, or the new one on like
    const reactionToSend = wasLiked ? previousReaction! : 1;

    this.likeService.ToogleLike({ contentType: 1, contentId: this.post().id, reactionType: reactionToSend }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          // Update counts and reactions based on backend response to ensure consistency
          this.likeCount.set(res.data.likesCount);
          this.reactions.set(res.data.reactions);
        }
      }, error: (err) => {
        // Rollback optimistic update on failure
        this.selectedReaction.set(previousReaction);
        this.isLiked.set(wasLiked);
        this.likeCount.set(previousCount);
        console.error('like toggle error', err);
      }
    })
  }

  // Share post with optional caption
  sharePost(caption: string = ''): void {
    const postIdToShare = this.post().id;
    this.postService.SharePost({ content: caption, postId: postIdToShare }).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          this.sharesCount.set(res.data);
          this.showShareModal.set(false);
        }
      }, error: (err) => {
        console.log('share post error', err);
      }
    })
  }

  // Get users who commented on the post
  getUsersWhoCommented(): void {
    if (this.userCommented().length === 0) {
      this.commentService.GetUsersWhoCommented({ contentType: 1, contentId: this.post().id, pageIndex: 1, pageSize: 5 }).subscribe({
        next: (res: any) => {
          // Assuming res.data.data is the array of users who commented
          this.userCommented.set(res.data.data);
        }, error: (err) => {
          console.log('users who commented error', err);
        }
      })
    } else {
      this.showUserCommentedModal.set(true);
    }
  }

  // Toggle save/unsave post
  toggleSave(contentId: number): void {
    this.saveService.ToogleSaveItem({ ContentType: 1, ContentId: contentId }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.isSaved.update(v => !v);
          this.savesCount.set(res.data.savesCount);
        }
      }, error: (err) => {
        console.log(err);
      }
    })
  }

  // Delete post (only for owner)
  handleDelete(): void {
    this.postService.DeletePost(this.post().id).subscribe({
      next: (res) => {
        console.log('Post deleted', res);
        if (res.isSuccess) {
          this.closeMoreMenu();
          this.postDeleted.emit(this.post().id);
        }
      }, error: (err) => {
        console.log('Delete post error', err);
      }
    })
  }

  // Hide post
  toggleHidePost(): void {
    this.hideService.ToogleHideItem({ contentId: this.post().id, contentType: 1 }).subscribe({
      next: (res) => {
        console.log('Hide post', res);
        if (res.isSuccess) {
          this.closeMoreMenu();
        }
      }, error: (err) => {
        console.log('Hide post error', err);
      }
    })
  }

  toggleUserCommentedModal() {
    this.showUserCommentedModal.set(true);
  }

  toggleUserReactionsModal() {
    this.showUserReactionsModal.set(true);
  }

  selectReaction(id: number): void {
    const wasLiked = !!this.selectedReaction();
    const previousReaction = this.selectedReaction();
    const previousCount = this.likeCount();

    // Optimistic UI update
    if (!wasLiked) {
      this.likeCount.set(previousCount + 1);
    }
    this.selectedReaction.set(id);
    this.isLiked.set(true);
    this.showReactions.set(false);

    // Persist to backend
    this.likeService.ToogleLike({ contentType: 1, contentId: this.post().id, reactionType: id }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.likeCount.set(res.data.likesCount);
          this.reactions.set(res.data.reactions);
        }
      }, error: (err) => {
        // Rollback on failure
        this.selectedReaction.set(previousReaction);
        this.isLiked.set(wasLiked);
        this.likeCount.set(previousCount);
        console.error('select reaction error', err);
      }
    })
  }

  getReactionById(id: number | null) {
    return this.enumService.reactionTypes().find(r => r.id === id);
  }

  getEmojiForReaction(name: string): string {
    return REACTIONS.find(r => r.name === name)?.emoji ?? '👍';
  }

  toggleSaved(): void {
    const newVal = !this.isSaved();
    this.isSaved.set(newVal);
    this.savesCount.set(this.savesCount() + (newVal ? 1 : -1));
  }

  toggleComments(): void { this.showComments.update(v => !v); }
  toggleMoreMenu(): void { this.showMoreMenu.update(v => !v); }
  closeMoreMenu(): void { this.showMoreMenu.set(false); }

  navigateToProfile(userId?: string): void {
    this.router.navigate(['/profile', userId]);
  }
}
