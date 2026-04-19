import { inject, Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from '../../core/services/Language/language-service';

@Pipe({
  name: 'postDate',
  standalone: true
})
export class PostDatePipe implements PipeTransform {
  private lang = inject(LanguageService);
  private static formatters = new Map<string, Intl.DateTimeFormat>();

  transform(value: string | Date | undefined | null): string {
    if (!value) return '';

    let date: Date;
    if (value instanceof Date) {
      date = value;
    } else {
      let dateStr = String(value);

      if (!dateStr.includes('Z') && !/[+-]\d{2}(:?\d{2})?$/.test(dateStr)) {
        dateStr = dateStr.includes('T') ? `${dateStr}Z` : `${dateStr.replace(' ', 'T')}Z`;
      }
      date = new Date(dateStr);
    }

    const timestamp = date.getTime();
    if (isNaN(timestamp)) return '';

    const now = Date.now();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);

    if (diffInSeconds < 60) {
      return this.lang.t('time.now');
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}${this.lang.t('time.minute')}`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}${this.lang.t('time.hour')}`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}${this.lang.t('time.day')}`;
    }

    return this.formatAbsoluteDate(date, now);
  }

  private formatAbsoluteDate(date: Date, now: number): string {
    const locale = this.lang.language();

    const yearFormatter = this.getFormatter(locale, { year: 'numeric', timeZone: 'Africa/Cairo' });
    const targetYear = yearFormatter.format(date);
    const currentYear = yearFormatter.format(new Date(now));

    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      timeZone: 'Africa/Cairo'
    };

    if (targetYear !== currentYear) {
      options.year = 'numeric';
    }

    return this.getFormatter(locale, options).format(date);
  }

  private getFormatter(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
    const key = `${locale}-${JSON.stringify(options)}`;
    if (!PostDatePipe.formatters.has(key)) {
      PostDatePipe.formatters.set(key, new Intl.DateTimeFormat(locale, options));
    }
    return PostDatePipe.formatters.get(key)!;
  }
}
