import { afterNextRender, Component, ElementRef, inject, Injector, input, OnInit, output, signal, viewChild } from '@angular/core';
import { LanguageService } from '../../../core/services/Language/language-service';
import { Reel as ReelService } from '../../../core/services/Reel/reel';
import { DatePipe } from '@angular/common';
import { Reel } from '../../../core/models/reel';
import { REACTIONS } from '../../../core/models/reactions';
import { Enum } from '../../../core/services/Enum/enum';
import { Like } from '../../../core/services/Like/like';
import { Save } from '../../../core/services/SaveItem/save';
import { Comments } from '../comments/comments';
import { CommonModule } from '@angular/common';
import { ReactionsModal } from '../reactions-modal/reactions-modal';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reel-detail-modal',
  imports: [DatePipe, Comments, CommonModule, ReactionsModal],
  templateUrl: './reel-detail-modal.html',
  styleUrl: './reel-detail-modal.css',
})
export class ReelDetailModal implements OnInit {
  readonly lang = inject(LanguageService);
  readonly reelService = inject(ReelService);
  readonly enumService = inject(Enum);
  readonly likeService = inject(Like);
  readonly saveService = inject(Save);
  readonly router = inject(Router);
  private readonly injector = inject(Injector);
  readonly REACTIONS = REACTIONS;

  reelId = input.required<number>();
  close = output<void>();
  item = signal<Reel | null>(null);

  isPlaying = signal(false);
  isMuted = signal(false);
  showComments = signal(false);
  showReactions = signal(false);
  showUserReactionsModal = signal(false);

  // Linked signals from item
  isLiked = signal(false);
  selectedReaction = signal<number | null>(null);
  isSaved = signal(false);
  likeCount = signal(0);
  commentsCount = signal(0);
  sharesCount = signal(0);
  savesCount = signal(0);
  reactions = signal<{ reactionType: string; count: number }[]>([]);

  videoPlayer = viewChild<ElementRef<HTMLVideoElement>>('videoPlayer');

  ngOnInit(): void {
    this.fetchReelDetails();
    this.getReactionTypes();
  }

  // Data Fetching & Initialization
  fetchReelDetails(): void {
    const id = this.reelId();
    if (!id) return;

    this.reelService.GetReelById(id).subscribe({
      next: (res) => {

        if (res.isSuccess) {
          const reel: Reel = res.data;
          this.item.set(reel);

          // Sync local signals
          this.isLiked.set(reel.isLikedByCurrentUser);
          this.selectedReaction.set(
            reel.reactionType
              ? (REACTIONS.find(r => r.name === reel.reactionType)?.id ?? null)
              : (reel.isLikedByCurrentUser ? 1 : null)
          );
          this.isSaved.set(reel.isSavedByCurrentUser);
          this.likeCount.set(reel.likesCount);
          this.commentsCount.set(reel.commentsCount);
          this.sharesCount.set(reel.sharesCount);
          this.savesCount.set(reel.savesCount);
          this.reactions.set(reel.reactions ?? []);

          this.autoplayVideo();
        }
      },
      error: (err) => console.error('Error fetching reel details:', err)
    });
  }

  // Get Reactions with metadata (emoji, color) for display
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
      });
    }
  }

  // Computed properties for display
  posterUrl(): string {
    return this.item()?.thumbnailUrl ?? "";
  }

  // If the reel is shared, show the sharer's info; otherwise, show the original poster's info
  get currentProfilePicture(): string | undefined {
    const reel = this.item();
    if (!reel) return undefined;
    return reel.isShared ? (reel.sharedByProfilePicture || reel.profilePicture) : reel.profilePicture;
  }

  // If the reel is shared, show the sharer's display name; otherwise, show the original poster's display name or username
  get currentDisplayName(): string | undefined {
    const reel = this.item();
    if (!reel) return undefined;
    return reel.isShared ? (reel.sharedByDisplayName || reel.displayName) : (reel.displayName || reel.userName);
  }

  // If the reel is shared, show the sharer's user ID; otherwise, show the original poster's user ID
  get currentUserId(): string | undefined {
    const reel = this.item();
    if (!reel) return undefined;
    return (reel.isShared ? reel.sharedByUserId : reel.userId) || '';
  }

  // Attempt to autoplay the video unmuted; if that fails, fall back to muted autoplay
  autoplayVideo(): void {
    afterNextRender(() => {
      const video = this.videoPlayer()?.nativeElement;
      if (!video) return;

      video.muted = false;
      this.isMuted.set(false);
      video.play()
        .then(() => this.isPlaying.set(true))
        .catch(() => {
          // Browser blocked unmuted autoplay — fall back to muted
          video.muted = true;
          this.isMuted.set(true);
          video.play()
            .then(() => this.isPlaying.set(true))
            .catch(err => console.error('Autoplay failed:', err));
        });
    }, { injector: this.injector });
  }

  onClose() {
    const video = this.videoPlayer()?.nativeElement;
    if (video) video.pause();
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('backdrop')) {
      this.onClose();
    }
  }

  // Video Controls
  togglePlay(): void {
    const video = this.videoPlayer()?.nativeElement;
    if (!video) return;

    if (video.paused) {
      video.play().catch(err => console.error('Error playing video:', err));
      this.isPlaying.set(true);
    } else {
      video.pause();
      this.isPlaying.set(false);
    }
  }

  toggleMute(): void {
    const video = this.videoPlayer()?.nativeElement;
    if (!video) return;
    video.muted = !video.muted;
    this.isMuted.set(video.muted);
  }

  toggleComments(): void {
    this.showComments.update(v => !v);
  }

  toggleUserReactionsModal() {
    this.showUserReactionsModal.update(v => !v);
  }

  // Like & Reactions
  handleLike(): void {
    const wasLiked = !!this.selectedReaction();
    const previousReaction = this.selectedReaction();
    const previousCount = this.likeCount();

    // Optimistic UI
    if (wasLiked) {
      this.selectedReaction.set(null);
      this.isLiked.set(false);
      this.likeCount.set(previousCount - 1);
    } else {
      this.selectedReaction.set(1);
      this.isLiked.set(true);
      this.likeCount.set(previousCount + 1);
    }

    const reactionToSend = wasLiked ? previousReaction! : 1;

    // Send toggle like request
    this.likeService.ToogleLike({ contentType: 2, contentId: this.reelId(), reactionType: reactionToSend }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          // Update like count and reactions based on server response to ensure consistency
          this.likeCount.set(res.data.likesCount);
          this.reactions.set(res.data.reactions);
        }
      }, error: (err) => {
        this.selectedReaction.set(previousReaction);
        this.isLiked.set(wasLiked);
        this.likeCount.set(previousCount);
        console.error('like toggle error', err);
      }
    });
  }

  // When a reaction is selected from the reactions modal, update the like with the new reaction type
  selectReaction(id: number): void {
    const wasLiked = !!this.selectedReaction();
    const previousReaction = this.selectedReaction();
    const previousCount = this.likeCount();

    if (!wasLiked) {
      this.likeCount.set(previousCount + 1);
    }
    this.selectedReaction.set(id);
    this.isLiked.set(true);
    this.showReactions.set(false);

    // Send toggle like request with the selected reaction type
    this.likeService.ToogleLike({ contentType: 2, contentId: this.reelId(), reactionType: id }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          // Update like count and reactions based on server response to ensure consistency
          this.likeCount.set(res.data.likesCount);
          this.reactions.set(res.data.reactions);
        }
      }, error: (err) => {
        this.selectedReaction.set(previousReaction);
        this.isLiked.set(wasLiked);
        this.likeCount.set(previousCount);
        console.error('select reaction error', err);
      }
    });
  }

  getReactionById(id: number | null) {
    return this.enumService.reactionTypes().find(r => r.id === id);
  }

  getEmojiForReaction(name: string): string {
    return REACTIONS.find(r => r.name === name)?.emoji ?? '👍';
  }

  // Save
  toggleSave(): void {
    this.saveService.ToogleSaveItem({ ContentType: 2, ContentId: this.reelId() }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          // Optimistically update UI
          this.isSaved.update(v => !v);
          this.savesCount.set(res.data.savesCount);
        }
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  // Navigation to profile
  navigateToProfile(userId: string): void {
    this.router.navigate(['/profile', userId]);
    this.onClose();
  }
}