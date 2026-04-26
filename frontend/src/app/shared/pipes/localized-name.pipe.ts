import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../../core/services/translation.service';

@Pipe({
  name: 'localizedName',
  standalone: true,
  pure: false,
})
export class LocalizedNamePipe implements PipeTransform {
  private t = inject(TranslationService);

  transform(nameAr: string, nameEn?: string | null): string {
    return this.t.currentLang() === 'ar' ? nameAr : (nameEn || nameAr);
  }
}
