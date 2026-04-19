import { Component, inject, input, output, ElementRef, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserCommentedView } from '../../../core/models/user';
import { LanguageService } from '../../../core/services/Language/language-service';

@Component({
  selector: 'app-user-list-modal',
  imports: [],
  templateUrl: './user-list-modal.html',
  styleUrl: './user-list-modal.css',
})
export class UserListModal implements OnInit, OnDestroy {
  readonly lang = inject(LanguageService);
  readonly router = inject(Router);
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  title = input<string>('Users');
  users = input.required<UserCommentedView[]>();
  close = output<void>();

  ngOnInit(): void {
    // Append the modal element to the body to ensure it overlays all content
    this.renderer.appendChild(document.body, this.el.nativeElement);
  }

  // When the user clicks the close button or clicks outside the modal content, emit the close event to notify the parent component to close the modal
  onClose(): void {
    this.close.emit();
  }

  // Navigate to the user's profile page when their name or profile picture is clicked, and close the modal
  navigateToProfile(userId: string): void {
    this.router.navigate(['/profile', userId]);
    this.close.emit();
  }

  // Handle clicks on the backdrop to close the modal if the user clicks outside the modal content area
  ngOnDestroy(): void {
    if (this.el.nativeElement && this.el.nativeElement.parentNode) {
      this.renderer.removeChild(document.body, this.el.nativeElement);
    }
  }
}
