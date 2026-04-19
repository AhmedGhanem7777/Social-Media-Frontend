import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Theme } from '../../models/theme.type';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);

  theme = signal<Theme>('light');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('theme') as Theme | null;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.applyTheme(stored ?? (prefersDark ? 'dark' : 'light'));
    }
  }

  toggleTheme(): void {
    this.applyTheme(this.theme() === 'light' ? 'dark' : 'light');
  }

  private applyTheme(value: Theme): void {
    this.theme.set(value);
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.classList.toggle('dark', value === 'dark');
      localStorage.setItem('theme', value);
    }
  }
}
