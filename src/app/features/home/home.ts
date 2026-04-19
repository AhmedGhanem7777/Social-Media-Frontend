import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { StoriesSection } from '../../shared/components/stories-section/stories-section';
import { PostCard } from '../../shared/components/post-card/post-card';
import { CreatePostCard } from '../../shared/components/create-post-card/create-post-card';
import { Sidebar } from '../../shared/components/sidebar/sidebar';
import { Post } from '../../core/models/post';
import { Feed } from '../../core/services/Feed/feed';
import { LanguageService } from '../../core/services/Language/language-service';

@Component({
  selector: 'app-home',
  imports: [StoriesSection, CreatePostCard, PostCard, Sidebar],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly feedService = inject(Feed);
  readonly lang = inject(LanguageService);

  posts = signal<Post[]>([]);
  isLoading = signal(false);

  private pageIndex = 1;
  private pageSize = 2;
  private hasMore = true;

  ngOnInit(): void {
    this.loadPosts();
  }

  // Load posts with pagination
  loadPosts(): void {
    if (this.isLoading() || !this.hasMore) return;

    this.isLoading.set(true);

    // Simulate API call to fetch posts
    this.feedService.GetFeedPosts({ pageIndex: this.pageIndex, pageSize: this.pageSize }).subscribe({
      next: (res) => {
        const newPosts = res.data.data;
        if (newPosts.length === 0) {
          this.hasMore = false;
        } else {
          this.posts.update(posts => [...posts, ...newPosts]);
          this.pageIndex++;
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load posts', err);
        this.isLoading.set(false);
      }
    });
  }

  // Handle scroll event to load more posts
  @HostListener('window:scroll')
  onScroll(): void {
    // Check if we're near the bottom of the page
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
      if (!this.isLoading() && this.hasMore) {
        this.loadPosts();
      }
    }
  }

  // Handle post deletion
  onPostDeleted(id: number): void {
    this.posts.update(posts => posts.filter(p => p.id !== id));
  }
}