import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Lang } from '../../models/lang.type';
import { translations } from '../../models/translations';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private platformId = inject(PLATFORM_ID);

  language = signal<Lang>('en');
  direction = computed(() => (this.language() === 'ar' ? 'rtl' : 'ltr'));

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('lang') as Lang | null;
      if (stored) this.setLanguage(stored);
    }
  }

  setLanguage(lang: Lang): void {
    this.language.set(lang);
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', lang);
      localStorage.setItem('lang', lang);
    }
  }

  t(key: string): string {
    return translations[this.language()][key] ?? key;
  }
}
