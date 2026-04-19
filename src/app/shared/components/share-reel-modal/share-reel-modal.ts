import { Component, inject, input, output, signal } from '@angular/core';
import { PostDatePipe } from '../../pipes/post-date-pipe';
import { LanguageService } from '../../../core/services/Language/language-service';
import { Reel } from '../../../core/models/reel';

@Component({
  selector: 'app-share-reel-modal',
  imports: [PostDatePipe],
  templateUrl: './share-reel-modal.html',
})
export class ShareReelModal {
  readonly lang = inject(LanguageService);

  reel = input.required<Reel>();
  close = output<void>();
  share = output<string>();

  caption = signal('');

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
}
