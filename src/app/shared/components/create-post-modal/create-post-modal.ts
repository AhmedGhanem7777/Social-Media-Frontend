import { Component, ElementRef, EventEmitter, inject, Output, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../core/services/Language/language-service';
import { Post } from '../../../core/services/Post/post';

@Component({
  selector: 'app-create-post-modal',
  imports: [FormsModule],
  templateUrl: './create-post-modal.html',
  styleUrl: './create-post-modal.css',
})
export class CreatePostModal {
  readonly lang = inject(LanguageService);
  private readonly postService = inject(Post);

  @Output() close = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  content = signal('');
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  isSubmitting = signal(false);

  // Method to submit the post form
  submit() {
    if (!this.content().trim() && !this.selectedFile()) return;

    this.isSubmitting.set(true);

    const formData = new FormData();
    formData.append('content', this.content());
    if (this.selectedFile()) {
      formData.append('contentUrl', this.selectedFile() as Blob);
    }

    this.postService.CreatePost(formData).subscribe({
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
      if (!file.type.startsWith('image/')) return;
      this.selectedFile.set(file);

      const reader = new FileReader();
      reader.onload = (e) => this.previewUrl.set(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  // Method to remove the selected file and clear the preview
  removeFile() {
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // Method to reset the form fields and clear the selected file
  resetForm() {
    this.content.set('');
    this.removeFile();
  }
}
