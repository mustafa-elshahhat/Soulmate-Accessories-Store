import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../../core/services/translation.service';

@Pipe({
  name: 'formatPrice',
  standalone: true,
  pure: false,
})
export class FormatPricePipe implements PipeTransform {
  private t = inject(TranslationService);

  transform(value: number | null | undefined): string {
    if (value == null) return '';
    const lang = this.t.currentLang();
    const locale = lang === 'ar' ? 'ar-EG' : 'en-EG';
    const suffix = lang === 'ar' ? 'ج.م' : 'EGP';
    return `${value.toLocaleString(locale)} ${suffix}`;
  }
}
