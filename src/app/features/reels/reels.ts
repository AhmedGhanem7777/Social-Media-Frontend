import { afterNextRender, Component, ElementRef, inject, PLATFORM_ID, signal, viewChild, viewChildren, OnInit, Injector } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/Language/language-service';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Feed as FeedService } from '../../core/services/Feed/feed';
import { Reel } from '../../core/models/reel';
import { Pagination } from '../../core/models/Pagination';
import { Like as LikeService } from '../../core/services/Like/like';
import { Save as SaveService } from '../../core/services/SaveItem/save';
import { REACTIONS } from '../../core/models/reactions';
import { Enum as EnumService } from '../../core/services/Enum/enum';
import { Comments } from '../../shared/components/comments/comments';
import { ShareReelModal } from '../../shared/components/share-reel-modal/share-reel-modal';

import { Reel as ReelService } from '../../core/services/Reel/reel';
import { CookieService } from 'ngx-cookie-service';

import { Friend as FriendService } from '../../core/services/Friend/friend';

@Component({
  selector: 'app-reels',
  standalone: true,
  imports: [CommonModule, Comments, ShareReelModal, RouterLink],
  templateUrl: './reels.html',
  styleUrl: './reels.css',
})
export class Reels implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly feedService = inject(FeedService);
  private readonly likeService = inject(LikeService);
  private readonly saveService = inject(SaveService);
  private readonly reelService = inject(ReelService);
  private readonly friendService = inject(FriendService);
  private readonly enumService = inject(EnumService);
  private readonly cookieService = inject(CookieService);
  private readonly injector = inject(Injector);
  readonly lang = inject(LanguageService);

  readonly currentUserId = this.cookieService.get('userId');

  readonly scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');
  readonly videoElements = viewChildren<ElementRef<HTMLVideoElement>>('reelVideo');

  readonly reels = signal<Reel[]>([]);
  readonly activeIndex = signal(0);
  readonly isMuted = signal(false);
  readonly isPlaying = signal(true);
  readonly showComments = signal(false);
  readonly showShareModal = signal(false);

  readonly requestedUserIds = signal<Set<string>>(new Set());

  // Pagination state
  private pageIndex = 1;
  private readonly pageSize = 2;
  loading = signal(false);

  ngOnInit(): void {
    this.fetchReels();
    this.getReactionTypes();
  }

  // Set up scroll listener for infinite loading and active reel tracking
  constructor() {
    afterNextRender(() => {
      const el = this.scrollContainer()?.nativeElement;
      if (!el) return;

      el.addEventListener('scroll', () => {
        const newIndex = Math.round(el.scrollTop / el.clientHeight);
        if (newIndex !== this.activeIndex()) {
          this.onReelChange(newIndex);
        }
      }, { passive: true });
    });
  }

  // Fetch reels with pagination
  fetchReels(): void {
    if (this.loading()) return;
    this.loading.set(true);

    const pagination: Pagination = { pageIndex: this.pageIndex, pageSize: this.pageSize };
    this.feedService.GetFeedReels(pagination).subscribe({
      next: (res) => {
        if (res.isSuccess) {

          let newReels = res.data?.data || res.data || [];
          if (!Array.isArray(newReels)) newReels = [];

          if (newReels.length > 0) {
            this.reels.update(current => [...current, ...newReels]);
            this.pageIndex++;
          }

          // If it's the first load, play the first video
          if (this.activeIndex() === 0 && this.reels().length > 0) {
            setTimeout(() => this.playVideoAtIndex(0), 100);
          }
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching reels:', err);
        this.loading.set(false);
      }
    });
  }

  // Fetch reaction types for like functionality
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
        }
      });
    }
  }

  // Handle reel change event
  onReelChange(newIndex: number): void {
    const oldIndex = this.activeIndex();
    this.activeIndex.set(newIndex);
    this.isPlaying.set(true);

    this.pauseVideoAtIndex(oldIndex);
    this.playVideoAtIndex(newIndex);

    // Infinite scroll check
    if (newIndex >= this.reels().length - 2) {
      this.fetchReels();
    }
  }

  // Play video at specified index
  playVideoAtIndex(index: number): void {
    const video = this.videoElements()[index]?.nativeElement;
    if (video) {
      video.muted = this.isMuted();
      video.play().catch(err => console.log('Autoplay error:', err));
    }
  }

  // Pause video at specified index
  pauseVideoAtIndex(index: number): void {
    const video = this.videoElements()[index]?.nativeElement;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  }

  // Toggle like for a reel
  toggleLike(reel: Reel): void {
    const wasLiked = reel.isLikedByCurrentUser;
    const reactionToSend = wasLiked ? (REACTIONS.find(r => r.name === reel.reactionType)?.id ?? 1) : 1;

    this.reels.update(list => list.map(r =>
      r.id === reel.id ? {
        ...r,
        isLikedByCurrentUser: !wasLiked,
        likesCount: r.likesCount + (wasLiked ? -1 : 1),
        reactionType: wasLiked ? null : 'Like'
      } : r
    ));

    this.likeService.ToogleLike({ contentType: 2, contentId: reel.id, reactionType: reactionToSend }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.reels.update(list => list.map(r =>
            r.id === reel.id ? { ...r, likesCount: res.data.likesCount, reactions: res.data.reactions } : r
          ));
        }
      },
      error: () => {
        // Rollback on error
        this.reels.update(list => list.map(r => r.id === reel.id ? reel : r));
      }
    });
  }

  // Toggle save for a reel
  toggleSave(reel: Reel): void {
    const wasSaved = reel.isSavedByCurrentUser;

    this.reels.update(list => list.map(r =>
      r.id === reel.id ? {
        ...r,
        isSavedByCurrentUser: !wasSaved,
        savesCount: r.savesCount + (wasSaved ? -1 : 1)
      } : r
    ));

    this.saveService.ToogleSaveItem({ ContentType: 2, ContentId: reel.id }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.reels.update(list => list.map(r =>
            r.id === reel.id ? { ...r, savesCount: res.data.savesCount } : r
          ));
        }
      },
      error: () => {
        this.reels.update(list => list.map(r => r.id === reel.id ? reel : r));
      }
    });
  }

  // Play/pause toggle
  togglePlay(): void {
    const video = this.videoElements()[this.activeIndex()]?.nativeElement;
    if (!video) return;

    if (video.paused) {
      video.play();
      this.isPlaying.set(true);
    } else {
      video.pause();
      this.isPlaying.set(false);
    }
  }

  // Mute/unmute toggle
  toggleMute(): void {
    this.isMuted.update(m => !m);
    this.videoElements().forEach(v => v.nativeElement.muted = this.isMuted());
  }

  // Toggle comments and share modal
  toggleComments(): void { this.showComments.update(v => !v); }
  toggleShareModal(): void { this.showShareModal.update(v => !v); }

  // Handle sharing a reel
  shareReel(caption: string = ''): void {
    const reel = this.reels()[this.activeIndex()];
    this.reelService.ShareReel({ caption: caption, reelId: reel.id }).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {

          this.reels.update(list => list.map(r =>
            r.id === reel.id ? { ...r, sharesCount: res.data } : r
          ));
          this.showShareModal.set(false);
        }
      },
      error: (err) => console.log('Share error:', err)
    });
  }

  // Send friend request to reel owner
  sendFriendRequest(userId: string): void {
    if (this.requestedUserIds().has(userId)) return;

    this.friendService.SendFriendRequest(userId).subscribe({
      next: (res: any) => {

        if (res.isSuccess) {
          this.requestedUserIds.update(set => {
            const newSet = new Set(set);
            newSet.add(userId);
            return newSet;
          });
        }
      },
      error: (err) => console.log('Follow error:', err)
    });
  }

  // Navigate back
  goBack(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.history.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}
