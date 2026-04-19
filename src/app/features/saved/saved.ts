import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { LanguageService } from '../../core/services/Language/language-service';
import { Post } from '../../core/models/post';
import { REACTIONS } from '../../core/models/reactions';
import { Save } from '../../core/services/SaveItem/save';
import { SavedPost, SavedTab } from '../../core/models/save';
import { MediaKind } from '../../core/models/enum';
import { PostDetailModal } from '../../shared/components/post-detail-modal/post-detail-modal';
import { ReelDetailModal } from '../../shared/components/reel-detail-modal/reel-detail-modal';


@Component({
  selector: 'app-saved',
  imports: [PostDetailModal, ReelDetailModal],
  templateUrl: './saved.html',
  styleUrl: './saved.css',
})
export class Saved implements OnInit {
  readonly lang = inject(LanguageService);
  readonly saveService = inject(Save);
  readonly MediaKind = MediaKind;

  activeTab = signal<SavedTab>('posts');
  savedItems = signal<SavedPost[]>([])
  showDetailModal = signal(false);
  itemId = signal<number>(0);

  isLoading = signal(false);

  readonly tabs = computed(() => [
    { id: 'posts' as SavedTab, label: this.lang.t('profile.posts') },
    { id: 'reels' as SavedTab, label: this.lang.t('nav.reels') },
  ]);

  readonly filteredPosts = computed(() => this.activeTab() === 'posts' ? this.savedItems() : []);
  readonly filteredReels = computed(() => this.activeTab() === 'reels' ? this.savedItems() : []);
  readonly totalCount = computed(() => this.savedItems().length);

  readonly isEmpty = computed(() => this.totalCount() === 0 && !this.isLoading());

  ngOnInit(): void {
    this.getSaveItemsForSpecificUser(1);
  }

  // Fetch saved items for the current user based on content type
  getSaveItemsForSpecificUser(contentType: number): void {
    this.isLoading.set(true);
    this.saveService.GetSaveItems(contentType).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          // Map API response to SavedPost model
          this.savedItems.set(res.data);
          this.itemId.set(res.data.id);
        }
        this.isLoading.set(false);
      }, error: (err) => {
        console.log(err);
        this.isLoading.set(false);
      }
    })
  }

  // Toggle save item
  unsave(id: number): void {
    this.saveService.ToogleSaveItem({ ContentId: id, ContentType: this.activeTab() === 'posts' ? 1 : 2 }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.getSaveItemsForSpecificUser(this.activeTab() === 'posts' ? 1 : 2);
        }
      }, error: (err) => {
        console.log(err);
      }
    })
  }

  // Handle tab change
  setActiveTab(tabId: SavedTab): void {
    this.activeTab.set(tabId);
    const type = tabId === 'posts' ? 1 : 2;
    this.getSaveItemsForSpecificUser(type);
  }

  // Open detail modal for a specific post or reel
  openDetailModal(id: number): void {
    this.itemId.set(id);
    this.showDetailModal.set(true);
  }

  // Close the detail modal
  closeDetailModal(): void {
    this.showDetailModal.set(false);
  }

  // Get emoji for a given reaction type
  getEmojiForReaction(name: string): string {
    return REACTIONS.find(r => r.name === name)?.emoji ?? '👍';
  }
}
