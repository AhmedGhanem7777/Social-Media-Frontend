import { Component, computed, inject, input, output, signal, OnInit, OnDestroy } from '@angular/core';
import { LanguageService } from '../../../core/services/Language/language-service';
import { Feed } from '../../../core/services/Feed/feed';
import { Story } from '../../../core/models/story';
import { PostDatePipe } from '../../pipes/post-date-pipe';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-story-view-modal',
  imports: [PostDatePipe],
  templateUrl: './story-view-modal.html',
  styleUrl: './story-view-modal.css',
})
export class StoryViewModal implements OnInit, OnDestroy {
  readonly lang = inject(LanguageService);
  private readonly feedService = inject(Feed);

  userId = input.required<string>();
  displayName = input.required<string>();
  profilePicture = input<string>('');
  close = output<void>();

  stories = signal<Story[]>([]);
  currentIndex = signal(0);
  isLoading = signal(true);
  isPaused = signal(false);

  currentStory = computed(() => this.stories()[this.currentIndex()] ?? null);
  progress = signal(0);

  private timer: any = null;
  private readonly STORY_DURATION = 5000;
  private readonly TICK_INTERVAL = 50;

  ngOnInit(): void {
    this.loadStories();
  }

  // Fetch the stories for the given user ID from the Feed service and initialize the story viewer state
  loadStories(): void {
    this.isLoading.set(true);
    this.feedService.GetFeedStories({
      pageIndex: 1,
      pageSize: 50,
      userId: this.userId()
    }).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data?.data?.length) {
          // Update the stories signal with the fetched data to trigger UI updates
          this.stories.set(res.data.data);
          this.currentIndex.set(0);
          this.startTimer();
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching user stories:', err);
        this.isLoading.set(false);
      }
    });
  }

  // Start the timer to automatically advance the story after a certain duration, and update the progress signal accordingly
  startTimer(): void {
    this.clearTimer();
    this.progress.set(0);

    let elapsed = 0;
    this.timer = setInterval(() => {
      if (this.isPaused()) return;

      elapsed += this.TICK_INTERVAL;
      this.progress.set(Math.min((elapsed / this.STORY_DURATION) * 100, 100));

      if (elapsed >= this.STORY_DURATION) {
        this.nextStory();
      }
    }, this.TICK_INTERVAL);
  }

  // Clear the story timer to stop automatic advancement when the user interacts with the viewer or when the component is destroyed
  clearTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  // Advance to the next story or close the viewer if there are no more stories to show
  nextStory(): void {
    const idx = this.currentIndex();
    if (idx < this.stories().length - 1) {
      this.currentIndex.set(idx + 1);
      this.startTimer();
    } else {
      this.onClose();
    }
  }

  // Go back to the previous story if it exists
  prevStory(): void {
    const idx = this.currentIndex();
    if (idx > 0) {
      this.currentIndex.set(idx - 1);
      this.startTimer();
    }
  }

  // Handle user taps on the left or right side of the story viewer to navigate between stories, and handle hold events to pause/resume the story progression
  onTapLeft(): void {
    this.prevStory();
  }

  // Handle tap on the right side to go to the next story
  onTapRight(): void {
    this.nextStory();
  }

  // Handle hold start to pause the story progression
  onHoldStart(): void {
    this.isPaused.set(true);
  }

  // Handle hold end to resume the story progression
  onHoldEnd(): void {
    this.isPaused.set(false);
  }

  // When the user clicks the close button or when the last story finishes, clear the timer and emit the close event to notify the parent component to close the modal
  onClose(): void {
    this.clearTimer();
    this.close.emit();
  }

  // Handle clicks on the backdrop to close the story viewer if the user clicks outside the story content area
  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('story-backdrop')) {
      this.onClose();
    }
  }

  // Format the story's creation date using Angular's DatePipe for display in the UI
  ngOnDestroy(): void {
    this.clearTimer();
  }
}
