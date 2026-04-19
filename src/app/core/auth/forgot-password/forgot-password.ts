import { Component, inject, signal } from '@angular/core';
import { LanguageService } from '../../services/Language/language-service';
import { ThemeService } from '../../services/Theme/theme-service';
import { Router, RouterLink } from '@angular/router';
import { form, submit, FormField, email, required } from '@angular/forms/signals';
import { Account } from '../../services/Account/account';
import { ForgotPasswordData } from '../../models/account';

@Component({
  selector: 'app-forgot-password',
  imports: [RouterLink, FormField],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  readonly languageService = inject(LanguageService);
  readonly themeService = inject(ThemeService);
  readonly accountService = inject(Account);
  readonly router = inject(Router);

  isLoading = signal(false);
  errorMsg = signal('');

  forgotPasswordModel = signal<ForgotPasswordData>({
    email: ''
  })
  forgotPasswordForm = form(this.forgotPasswordModel, schemaPath => {
    email(schemaPath.email, { message: 'Invalid email format' })
    required(schemaPath.email, { message: 'Email is required' })
  })

  // Handle form submission
  handleSubmit(event: Event): void {
    event.preventDefault();
    this.isLoading.set(true);
    this.errorMsg.set('');

    // Validate form before submission using the submit helper
    submit(this.forgotPasswordForm, async () => {
      await this.accountService.ForgotPassword(this.forgotPasswordModel()).subscribe({
        next: (res) => {
          // If the request was successful, navigate to the reset password page
          if (res.isSuccess) {
            this.isLoading.set(false);
            this.router.navigate(['/reset-password', this.forgotPasswordModel().email]);
          }
        }, error: (err) => {
          this.errorMsg.set(err.error.error.description);
          this.isLoading.set(false);
        }
      })
    })
  }

  // Toggle between lang (ar and en)
  toggleLanguage(): void {
    this.languageService.setLanguage(
      this.languageService.language() === 'en' ? 'ar' : 'en'
    );
  }
}
