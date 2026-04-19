import { Component, inject, input, output, signal, ElementRef, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { PostDatePipe } from '../../pipes/post-date-pipe';
import { LanguageService } from '../../../core/services/Language/language-service';
import { Post } from '../../../core/models/post';

@Component({
  selector: 'app-share-post-modal',
  imports: [PostDatePipe],
  templateUrl: './share-post-modal.html',
  styleUrl: './share-post-modal.css',
})
export class SharePostModal implements OnInit, OnDestroy {
  readonly lang = inject(LanguageService);
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  post = input.required<Post>();
  close = output<void>();
  share = output<string>();

  caption = signal('');

  ngOnInit(): void {
    // Append the modal element to the body to ensure it overlays all content
    this.renderer.appendChild(document.body, this.el.nativeElement);
  }

  // When the user types in the caption textarea, update the caption signal
  onCaptionInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.caption.set(target.value);
  }

  // When the user clicks the share button, emit the share event with the current caption
  onShare(): void {
    this.share.emit(this.caption());
  }

  // When the user clicks the close button, emit the close event to notify the parent component to close the modal
  onClose(): void {
    this.close.emit();
  }

  // Remove the modal element from the body when the component is destroyed to clean up
  ngOnDestroy(): void {
    if (this.el.nativeElement && this.el.nativeElement.parentNode) {
      this.renderer.removeChild(document.body, this.el.nativeElement);
    }
  }
}
