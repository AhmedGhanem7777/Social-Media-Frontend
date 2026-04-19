import { Component, ElementRef, EventEmitter, inject, OnInit, Output, signal, ViewChild } from '@angular/core';
import { LanguageService } from '../../../core/services/Language/language-service';
import { FormsModule } from '@angular/forms';
import { Reel } from '../../../core/services/Reel/reel';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-create-reel-modal',
  imports: [FormsModule],
  templateUrl: './create-reel-modal.html',
  styleUrl: './create-reel-modal.css',
})
export class CreateReelModal implements OnInit {
  readonly lang = inject(LanguageService);
  private readonly reelService = inject(Reel);
  private readonly cookieService = inject(CookieService);

  @Output() close = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  caption = signal('');
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  isSubmitting = signal(false);
  profilePicture = signal<string>('');
  userId = signal<string>('');
  userName = signal<string>('');

  ngOnInit(): void {
    this.profilePicture.set(this.cookieService.get("profilePicture"));
    this.userId.set(this.cookieService.get("userId"));
    this.userName.set(this.cookieService.get("userName"));
  }

  // Method to submit the reel form
  submit() {
    // Video is required for reels
    if (!this.selectedFile()) return;

    this.isSubmitting.set(true);

    const formData = new FormData();
    if (this.caption().trim()) {
      formData.append('caption', this.caption());
    }
    formData.append('videoUrl', this.selectedFile() as Blob);

    this.reelService.CreateReel(formData).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModal();
        window.location.reload();
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  // Method to close the modal and reset the form
  closeModal() {
    if (this.isSubmitting()) return;
    this.close.emit();
    this.resetForm();
  }

  // Method to handle clicks outside the modal
  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('backdrop')) {
      this.closeModal();
    }
  }

  // Method to trigger the hidden file input
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  // Method to handle file selection and generate a preview
  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) return;
      this.selectedFile.set(file);

      const url = URL.createObjectURL(file);
      this.previewUrl.set(url);
    }
  }

  // Method to remove the selected file and clear the preview
  removeFile() {
    this.selectedFile.set(null);
    if (this.previewUrl()) {
      URL.revokeObjectURL(this.previewUrl()!);
      this.previewUrl.set(null);
    }
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // Method to reset the form to its initial state
  resetForm() {
    this.caption.set('');
    this.removeFile();
  }
}
