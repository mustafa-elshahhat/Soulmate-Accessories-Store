import { ChangeDetectionStrategy, Component, Injectable, signal, inject } from '@angular/core';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'warning';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<ToastMessage[]>([]);
  private nextId = 0;
  private recentMessages = new Map<string, number>();

  show(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
    // Prevent duplicate toasts within 2 seconds
    const key = `${type}:${message}`;
    const now = Date.now();
    const lastShown = this.recentMessages.get(key);
    if (lastShown && now - lastShown < 2000) return;
    this.recentMessages.set(key, now);

    const id = this.nextId++;
    this.toasts.update(current => [...current, { id, type, message }]);
    setTimeout(() => this.dismiss(id), 4000);
  }

  dismiss(id: number): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}

@Component({
  selector: 'app-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed top-5 inset-x-0 z-[200] flex flex-col items-center gap-2.5 pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl backdrop-blur-sm min-w-[280px] max-w-[440px] animate-[toastIn_300ms_cubic-bezier(0.16,1,0.3,1)]"
             [class]="toast.type === 'success' ? 'bg-green-600/95 text-white' : toast.type === 'error' ? 'bg-red-600/95 text-white' : 'bg-amber-500/95 text-white'">
          @if (toast.type === 'success') {
            <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          } @else if (toast.type === 'error') {
            <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
          } @else {
            <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"/></svg>
          }
          <p class="text-sm font-medium flex-1">{{ toast.message }}</p>
          <button (click)="toastService.dismiss(toast.id)" class="text-white/70 hover:text-white transition-colors shrink-0 cursor-pointer">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  public toastService = inject(ToastService);
}
