import { Component, inject, input, linkedSignal, OnInit, signal } from '@angular/core';
import { PostDatePipe } from '../../pipes/post-date-pipe';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../../core/services/Language/language-service';
import { Comment } from '../../../core/models/comment';
import { REACTIONS } from '../../../core/models/reactions';
import { Comment as CommentService } from '../../../core/services/Comment/comment';
import { CommentInput } from '../comment-input/comment-input';
import { Enum } from '../../../core/services/Enum/enum';
import { Router } from "@angular/router";
import { Like } from '../../../core/services/Like/like';

@Component({
  selector: 'app-comment-item',
  imports: [CommonModule, PostDatePipe, CommentInput],
  templateUrl: './comment-item.html',
  styleUrl: './comment-item.css',
})
export class CommentItem implements OnInit {
  readonly lang = inject(LanguageService);
  readonly commentService = inject(CommentService);
  readonly enumService = inject(Enum);
  readonly likeService = inject(Like);
  readonly router = inject(Router);
  readonly REACTIONS = REACTIONS;

  readonly comment = input.required<Comment>();
  readonly postId = input.required<number>();
  readonly contentType = input.required<number>();
  readonly isReply = input<boolean>(false);

  isLiked = linkedSignal(() => this.comment().isLikedByCurrentUser);
  selectedReaction = linkedSignal<number | null>(() =>
    this.comment().reactionType
      ? (REACTIONS.find(r => r.name === this.comment().reactionType)?.id ?? null)
      : (this.comment().isLikedByCurrentUser ? 1 : null)
  );
  likesCount = linkedSignal(() => this.comment().likesCount);
  reactions = linkedSignal(() => this.comment().reactions ?? []);

  showReplies = signal(false);
  showReactions = signal(false);
  showReplyInput = signal(false);
  replies = signal<Comment[]>([]);

  ngOnInit(): void {
    this.getReactionTypes();
  }

  // Fetch reaction types if not already loaded
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

  // Fetch replies for the comment
  getRepliesForComment(commentId: number, forceShow: boolean = false): void {
    this.commentService.GetRepliesForComment({ commentId: commentId, pageIndex: 1, pageSize: 3 }).subscribe({
      next: (res: any) => {
        console.log('replies: ', res);
        if (res.isSuccess) {
          if (forceShow) {
            this.showReplies.set(true);
          } else {
            this.showReplies.update(v => !v);
          }
          this.replies.set(res.data.data);
        }
      }, error: (err) => {
        console.log(err);

      }
    })
  }

  // Navigate to a user's profile
  navigateToProfile(userId: string): void {
    if (userId) {
      this.router.navigate(['/profile', userId]);
    }
  }

  // Toggle the visibility of replies
  toggleReplies(): void {
    this.showReplies.update(v => !v);
  }

  // Handle the like action
  handleLike(): void {
    const wasLiked = !!this.selectedReaction();
    const previousReaction = this.selectedReaction();
    const previousCount = this.likesCount();
    const previousReactions = this.reactions();

    if (wasLiked) {
      this.selectedReaction.set(null);
      this.isLiked.set(false);
      this.likesCount.set(previousCount - 1);
    } else {
      // Default to Like (1)
      this.selectedReaction.set(1);
      this.isLiked.set(true);
      this.likesCount.set(previousCount + 1);
    }

    const reactionToSend = wasLiked ? (previousReaction || 1) : 1;

    // Optimistically update UI, then call API
    this.likeService.ToogleLike({
      contentType: 4,
      contentId: this.comment().id,
      reactionType: reactionToSend
    }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.likesCount.set(res.data.likesCount);
          this.reactions.set(res.data.reactions);
        } else {
          this.rollbackLike(previousReaction, previousCount, previousReactions);
        }
      },
      error: (err) => {
        console.error('like toggle error', err);
        this.rollbackLike(previousReaction, previousCount, previousReactions);
      }
    });
  }

  // Handle selecting a specific reaction
  selectReaction(id: number): void {
    const wasLiked = !!this.selectedReaction();
    const previousReaction = this.selectedReaction();
    const previousCount = this.likesCount();
    const previousReactions = this.reactions();

    if (!wasLiked) {
      this.likesCount.set(previousCount + 1);
    }
    this.selectedReaction.set(id);
    this.isLiked.set(true);
    this.showReactions.set(false);

    this.likeService.ToogleLike({
      contentType: 4,
      contentId: this.comment().id,
      reactionType: id
    }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.likesCount.set(res.data.likesCount);
          this.reactions.set(res.data.reactions);
        } else {
          this.rollbackLike(previousReaction, previousCount, previousReactions);
        }
      },
      error: (err) => {
        console.error('select reaction error', err);
        this.rollbackLike(previousReaction, previousCount, previousReactions);
      }
    });
  }

  // Rollback like state in case of an error
  rollbackLike(previousReaction: number | null, previousCount: number, previousReactions: any[]) {
    this.selectedReaction.set(previousReaction);
    this.isLiked.set(!!previousReaction);
    this.likesCount.set(previousCount);
    this.reactions.set(previousReactions);
  }

  // Get the emoji for a given reaction name
  getEmojiForReaction(name: string): string {
    return REACTIONS.find(r => r.name === name)?.emoji ?? '👍';
  }

  // Handle the submission of a reply to the comment
  handleReplySubmit(text: string): void {
    this.commentService.CreateComment({
      contentId: this.postId(), contentType: this.contentType(), text: text, parentCommentId: this.comment().id
    }).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          this.showReplyInput.set(false);
          this.getRepliesForComment(this.comment().id, true);
        }
      },
      error: (err) => console.log(err)
    });
  }

  // Get reaction details by ID
  getReactionById(id: number | null) {
    return this.enumService.reactionTypes().find(r => r.id === id);
  }
}
