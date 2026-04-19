import { Component, ElementRef, EventEmitter, inject, Output, signal, ViewChild } from '@angular/core';
import { LanguageService } from '../../../core/services/Language/language-service';
import { Story } from '../../../core/services/Story/story';

@Component({
  selector: 'app-create-story',
  imports: [],
  templateUrl: './create-story.html',
  styleUrl: './create-story.css',
})
export class CreateStory {
  readonly lang = inject(LanguageService);
  private readonly storyService = inject(Story);

  @Output() close = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  isSubmitting = signal(false);

  // Method to submit the story form
  submit() {
    if (!this.selectedFile()) return;

    this.isSubmitting.set(true);

    const formData = new FormData();
    formData.append('MediaUrl', this.selectedFile() as Blob);

    this.storyService.createStory(formData).subscribe({
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
      if (!file.type.startsWith('image/')) return;
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
    this.removeFile();
  }
}
