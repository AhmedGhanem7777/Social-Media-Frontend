import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { PostCard } from '../post-card/post-card';
import { LanguageService } from '../../../core/services/Language/language-service';
import { Post as PostService } from '../../../core/services/Post/post';
import { Post } from '../../../core/models/post';

@Component({
  selector: 'app-post-detail-modal',
  imports: [PostCard],
  templateUrl: './post-detail-modal.html',
  styleUrl: './post-detail-modal.css',
})
export class PostDetailModal implements OnInit {
  readonly lang = inject(LanguageService);
  readonly postService = inject(PostService);

  postId = input.required<number>();
  close = output<void>();
  item = signal<Post | null>(null);

  ngOnInit(): void {
    // Fetch post details when modal opens
    this.fetchItemDetails();
  }

  // Fetch post details by ID
  fetchItemDetails(): void {
    const id = this.postId();
    if (!id) return;

    this.postService.GetPostById(id).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          // Assuming res.data is the post details
          this.item.set(res.data);
        }
      },
      error: (err) => console.error('Error fetching post details:', err)
    });
  }

  // Close the modal
  onClose() {
    this.close.emit();
  }

  // Close modal when clicking on backdrop
  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('backdrop')) {
      this.onClose();
    }
  }
}
