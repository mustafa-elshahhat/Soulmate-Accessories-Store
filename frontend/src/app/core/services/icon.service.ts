import { Injectable, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

const ICONS = [
  'shopping-cart',
  'heart',
  'user',
  'bell',
  'search',
  'chevron-right',
  'check',
  'x',
  'menu',
  'trash',
  'plus',
  'minus',
  'upload',
  'edit',
  'eye',
  'arrow-right',
  'arrow-left',
  'filter',
  'gift',
  'package',
] as const;

@Injectable({ providedIn: 'root' })
export class IconService {
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);

  registerIcons(): void {
    ICONS.forEach((icon) => {
      this.iconRegistry.addSvgIcon(
        icon,
        this.sanitizer.bypassSecurityTrustResourceUrl(`/assets/icons/${icon}.svg`),
      );
    });
  }
}
