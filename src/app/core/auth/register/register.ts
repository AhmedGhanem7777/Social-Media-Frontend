import { Component, inject, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../services/Language/language-service';
import { ThemeService } from '../../services/Theme/theme-service';
import { isPlatformBrowser } from '@angular/common';
import { form, submit, FormField, required, pattern, email, validate, validateHttp } from '@angular/forms/signals';
import { Account } from '../../services/Account/account';
import { RegisterData } from '../../models/account';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-register',
  imports: [RouterLink, FormField],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private platformId = inject(PLATFORM_ID);

  readonly languageService = inject(LanguageService);
  readonly themeService = inject(ThemeService);
  readonly accountService = inject(Account);

  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isLoading = signal(false);
  avatarPreview = signal<string | null>(null);
  saveFile: WritableSignal<File | string | null> = signal(null);
  registerMessage = signal('');
  errorMessage = signal('');

  registerationModel = signal<RegisterData>({
    firstName: '',
    lastName: '',
    profilePicture: null,
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  registerationForm = form(this.registerationModel, schemaPath => {
    required(schemaPath.firstName, { message: 'First name is required' });
    required(schemaPath.lastName, { message: 'Last name is required' });
    required(schemaPath.username, { message: 'Username is required' });
    required(schemaPath.email, { message: 'Email is required' });
    required(schemaPath.password, { message: 'Password is required' });
    required(schemaPath.confirmPassword, { message: 'Confirm password is required' });
    email(schemaPath.email, { message: 'Invalid email format' });

    // Password validation
    pattern(schemaPath.password, /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/, { message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character' });

    // Confirm password validation
    validate(schemaPath.confirmPassword, ({ value, valueOf }) => {
      const confirmPassword = value();
      const password = valueOf(schemaPath.password);
      if (confirmPassword !== password) {
        return {
          kind: 'passwordMismatch',
          message: 'Passwords do not match'
        }
      }
      return null;
    });

    // Username validation
    validateHttp(schemaPath.username, {
      request: ({ value }) => `${environment.baseUrl}/api/Account/exist-user/${value()}`,
      onSuccess: (response: any) => {
        if (response.isSuccess) {
          return {
            kind: 'usernameTaken',
            message: 'Username is already taken'
          }
        }
        return null;
      }, onError: (err) => ({
        kind: 'usernameCheckFailed',
        message: 'Failed to check username availability'
      })
    })

    // Email validation
    validateHttp(schemaPath.email, {
      request: ({ value }) => `${environment.baseUrl}/api/Account/exist-user/${value()}`,
      onSuccess: (response: any) => {
        if (response.isSuccess) {
          return {
            kind: 'emailTaken',
            message: 'Email is already taken'
          }
        }
        return null;
      }, onError: (err) => ({
        kind: 'emailCheckFailed',
        message: 'Failed to check email availability'
      })
    })
  });

  // Handle form submission for user registration
  handleSubmit(event: Event): void {
    event.preventDefault();
    this.isLoading.set(true);
    this.registerMessage.set('');
    this.errorMessage.set('');

    // Submit the registration form
    submit(this.registerationForm, async () => {
      // Prepare form data for submission
      const formData = new FormData();
      formData.append('firstName', this.registerationModel().firstName);
      formData.append('lastName', this.registerationModel().lastName);
      formData.append('username', this.registerationModel().username);
      formData.append('email', this.registerationModel().email);
      formData.append('password', this.registerationModel().password);
      formData.append('confirmPassword', this.registerationModel().confirmPassword);
      if (this.saveFile()) {
        formData.append('profilePicture', this.saveFile() as File);
      }

      // Register the user using the Account service
      await this.accountService.Register(formData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.isLoading.set(false);
            this.registerMessage.set(res.data);
            this.resetForm();
          }
        }, error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.error?.description || 'Registration failed');
        }
      })
    })
  }

  // Toggle the visibility of the password field
  toggleShowPassword(): void {
    this.showPassword.update(v => !v);
  }

  // Toggle the visibility of the confirm password field
  toggleShowConfirmPassword(): void {
    this.showConfirmPassword.update(v => !v);
  }

  // Toggle the language of the application
  toggleLanguage(): void {
    this.languageService.setLanguage(
      this.languageService.language() === 'en' ? 'ar' : 'en'
    );
  }

  // Handle file selection for profile picture
  onFileSelected(event: Event): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.avatarPreview.set(e.target?.result as string);
      this.saveFile.set(file);
    };
    reader.readAsDataURL(file);
  }

  // Reset the registration form to its initial state
  resetForm(): void {
    this.registerationForm().reset();
    this.registerationModel.set({
      firstName: '',
      lastName: '',
      profilePicture: null,
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });

    this.avatarPreview.set(null);
    this.saveFile.set(null);
  }
}
