import { Component, inject, input, OnInit, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Comment, CreateCommentRequest } from '../../../core/models/comment';
import { CommentItem } from '../comment-item/comment-item';
import { Comment as CommentService } from '../../../core/services/Comment/comment';
import { LanguageService } from '../../../core/services/Language/language-service';
import { CommentInput } from '../comment-input/comment-input';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, CommentItem, CommentInput],
  templateUrl: './comments.html',
  styleUrl: './comments.css',
})
export class Comments implements OnInit {
  private readonly commentService = inject(CommentService);
  readonly lang = inject(LanguageService);

  postId = input.required<number>();
  contentType = input.required<number>();
  selectedComments = signal<Comment[]>([]);
  commentCountChange = output<number>();

  ngOnInit(): void {
    this.getCommentsForPost();
  }

  pageIndex = 1;
  readonly pageSize = 5;
  hasMoreComments = signal(false);
  isLoadingMore = signal(false);

  // Fetch comments for the post, with optional reset for pagination
  getCommentsForPost(reset = true): void {
    if (reset) {
      this.pageIndex = 1;
      this.hasMoreComments.set(false);
    }
    this.isLoadingMore.set(true);

    this.commentService.GetCommentsForContent({ contentType: this.contentType(), contentId: this.postId(), pageIndex: this.pageIndex, pageSize: this.pageSize }).subscribe({
      next: (res: any) => {

        // Normalize response to ensure we have an array of comments
        let fetchedComments: Comment[] = [];
        if (res && res.data) {
          const rawData = res.data.data || [];
          fetchedComments = Array.isArray(rawData) ? rawData : [];
        } else if (Array.isArray(res)) {
          fetchedComments = res;
        }

        if (reset) {
          this.selectedComments.set(fetchedComments);
        } else {

          this.selectedComments.update(curr => {
            const existingIds = new Set(curr.map(c => c.id));
            const uniqueNew = fetchedComments.filter(c => !existingIds.has(c.id));
            return [...curr, ...uniqueNew];
          });
        }

        this.hasMoreComments.set(fetchedComments.length === this.pageSize);
        this.isLoadingMore.set(false);
      }, error: (err) => {
        console.log(err);
        this.isLoadingMore.set(false);
      }
    })
  }

  // Load more comments when user requests
  loadMoreComments(): void {
    if (this.isLoadingMore() || !this.hasMoreComments()) return;
    this.pageIndex++;
    this.getCommentsForPost(false);
  }

  // Handle the submission of a new comment
  handleCommentSubmit(text: string): void {
    const commentData: CreateCommentRequest = {
      contentId: this.postId(),
      contentType: this.contentType(),
      text: text.trim(),
      parentCommentId: null
    };

    this.createComment(commentData);
  }

  // Create a new comment using the CommentService
  createComment(commentData: CreateCommentRequest): void {
    this.commentService.CreateComment(commentData).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          console.log('Comment created successfully', res);
          this.commentCountChange.emit(res.data);
          this.getCommentsForPost();
        }
      }, error: (err) => {
        console.log(err);
      }
    });
  }
}
