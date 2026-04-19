import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LanguageService } from '../../services/Language/language-service';
import { ThemeService } from '../../services/Theme/theme-service';
import { Account } from '../../services/Account/account';
import { form, submit, FormField, required, email } from '@angular/forms/signals';
import { LoginData } from '../../models/account';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormField],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  readonly languageService = inject(LanguageService);
  readonly themeService = inject(ThemeService);
  readonly accountService = inject(Account);
  readonly cookieService = inject(CookieService);
  readonly router = inject(Router);

  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  loginModel = signal<LoginData>({
    emailOrUserName: '',
    password: '',
  });
  loginForm = form(this.loginModel, schemaPath => {
    required(schemaPath.emailOrUserName, { message: 'Email or username is required' });
    required(schemaPath.password, { message: 'Password is required' });
  });

  // Submit handler for the login form
  handleSubmit(event: Event): void {
    event.preventDefault();
    this.isLoading.set(true);
    this.errorMessage.set('');

    // Call the login method from the account service with the form data
    submit(this.loginForm, async () => {
      await this.accountService.Login(this.loginModel()).subscribe({
        next: (res) => {
          // If the login was successful, store the tokens and user info in cookies and navigate to the home page
          if (res.isSuccess) {
            this.isLoading.set(false);
            this.cookieService.set('token', res.data.token);
            this.cookieService.set('refreshToken', res.data.refreshToken);
            this.cookieService.set('userId', res.data.userId);
            this.cookieService.set('profilePicture', res.data.profilePicture);
            this.router.navigate(['/home']);
          }
        }, error: (err) => {
          if (!err.error.isSuccess) {
            this.isLoading.set(false);
            this.errorMessage.set(err.error.error.description);
          }
        }
      })
    });
  }

  // Toggle the visibility of the password field
  toggleShowPassword(): void {
    this.showPassword.update(v => !v);
  }

  // Toggle the language of the application
  toggleLanguage(): void {
    this.languageService.setLanguage(
      this.languageService.language() === 'en' ? 'ar' : 'en'
    );
  }
}
