import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { LanguageService } from '../../../core/services/Language/language-service';
import { UserStory } from '../../../core/models/story';
import { Story } from '../../../core/services/Story/story';
import { StoryViewModal } from '../story-view-modal/story-view-modal';
import { CreateStory } from '../create-story/create-story';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-stories-section',
  imports: [StoryViewModal, CreateStory],
  templateUrl: './stories-section.html',
  styleUrl: './stories-section.css',
})
export class StoriesSection implements OnInit {
  readonly lang = inject(LanguageService);
  readonly storyService = inject(Story);
  private readonly cookieService = inject(CookieService);

  stories = signal<UserStory[]>([]);

  // View modal state
  showStoryViewer = signal(false);
  selectedUser = signal<UserStory | null>(null);

  // Create modal state
  showCreateStory = signal(false);

  currentUserId = signal<string>('');
  currentUserProfilePicture = signal<string>('');

  ownStory = computed(() => this.stories().find(s => s.isOwnStory));
  otherStories = computed(() => this.stories().filter(s => !s.isOwnStory));

  ngOnInit(): void {
    this.currentUserId.set(this.cookieService.get('userId'));
    this.currentUserProfilePicture.set(this.cookieService.get('profilePicture'));
    this.getStories();
  }

  // Fetch stories from the Story service and update the stories signal
  getStories(): void {
    this.storyService.getUserStory().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          // Update the stories signal with the fetched data to trigger UI updates
          this.stories.set(res.data);
        }
      },
      error: (err) => {
        console.error('Error fetching stories:', err);
      }
    });
  }

  // Handle click on story
  onStoryClick(story: UserStory, event: MouseEvent): void {
    // If clicking the + button on own story, open create modal
    const target = event.target as HTMLElement;
    if (story.isOwnStory && target.closest('.create-story-btn')) {
      this.openCreateStory();
      return;
    }
    this.openStoryViewer(story);
  }

  // Open the story viewer modal for the selected story
  openStoryViewer(story: UserStory): void {
    this.selectedUser.set(story);
    this.showStoryViewer.set(true);
  }

  // Close the story viewer modal and reset selected user
  closeStoryViewer(): void {
    this.showStoryViewer.set(false);
    this.selectedUser.set(null);
  }

  // Open the create story modal
  openCreateStory(): void {
    this.showCreateStory.set(true);
  }

  // Close the create story modal
  closeCreateStory(): void {
    this.showCreateStory.set(false);
  }

  // Determine the CSS classes for the story ring based on the story's state (unseen, own story, or seen)
  storyRingClass(story: UserStory): string {
    if (story.hasUnseenStory) return 'bg-gradient-story story-ring-animated';
    if (story.isOwnStory) return 'bg-border';
    return 'bg-muted';
  }
}
