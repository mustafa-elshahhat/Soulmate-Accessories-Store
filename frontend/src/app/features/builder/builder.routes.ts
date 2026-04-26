import { Routes } from '@angular/router';

export const builderRoutes: Routes = [
  { path: '', redirectTo: 'select', pathMatch: 'full' },
  { path: 'select', loadComponent: () => import('./box-type-selector/box-type-selector.component').then(m => m.BoxTypeSelectorComponent) },
  { path: 'customize', loadComponent: () => import('./slot-picker/slot-picker.component').then(m => m.SlotPickerComponent) },
  { path: 'personalize', loadComponent: () => import('./customization/customization.component').then(m => m.CustomizationComponent) },
  { path: 'preview', loadComponent: () => import('./preview-screen/preview-screen.component').then(m => m.PreviewScreenComponent) },
];
