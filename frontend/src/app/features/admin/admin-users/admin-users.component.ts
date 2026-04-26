import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { AdminService, AdminUser } from '../../../core/services/admin.service';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [DatePipe, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <h1 class="font-playfair text-3xl font-bold text-foreground mb-8">{{ 'admin.users.title' | t }}</h1>

      @if (loading()) {
        <div class="flex justify-center py-20">
          <div class="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else {
        <div class="hidden md:block bg-background rounded-xl shadow-sm border border-border overflow-hidden font-inter">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-muted/80 border-b border-border">
                <tr>
                  <th class="text-start px-6 py-4 font-semibold text-muted-foreground">{{ 'admin.users.name' | t }}</th>
                  <th class="text-start px-6 py-4 font-semibold text-muted-foreground">{{ 'admin.users.email' | t }}</th>
                  <th class="text-start px-6 py-4 font-semibold text-muted-foreground">{{ 'admin.users.phone' | t }}</th>
                  <th class="text-start px-6 py-4 font-semibold text-muted-foreground">{{ 'admin.users.status' | t }}</th>
                  <th class="text-start px-6 py-4 font-semibold text-muted-foreground">{{ 'admin.users.registrationDate' | t }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (user of users(); track user.id) {
                  <tr class="hover:bg-muted/50 transition-colors duration-300">
                    <td class="px-6 py-4 font-semibold text-foreground text-base">{{ user.name }}</td>
                    <td class="px-6 py-4 text-muted-foreground" dir="ltr">{{ user.email }}</td>
                    <td class="px-6 py-4 text-muted-foreground" dir="ltr">{{ user.phone }}</td>
                    <td class="px-6 py-4">
                      @if (user.is_locked) {
                        <span class="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border bg-red-50 text-red-700 border-red-200">{{ 'admin.users.blocked' | t }}</span>
                      } @else {
                        <span class="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border bg-green-50 text-green-700 border-green-200">{{ 'admin.users.active' | t }}</span>
                      }
                    </td>
                    <td class="px-6 py-4 text-muted-foreground">{{ user.created_at | date:'mediumDate' }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="px-6 py-16 text-center text-muted-foreground font-medium text-lg">{{ 'admin.users.empty' | t }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          @if (totalPages() > 1) {
            <div class="flex flex-col sm:flex-row items-center justify-between px-6 py-5 border-t border-border bg-muted/50 gap-4">
              <span class="text-sm text-muted-foreground font-medium">{{ 'admin.users.total' | t }} {{ total() }} {{ 'admin.users.user' | t }}</span>
              <div class="flex flex-wrap gap-2">
                @for (p of pages(); track p) {
                  <button (click)="goToPage(p)"
                          class="h-10 w-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-300"
                          [class.bg-primary]="p === currentPage()" [class.text-white]="p === currentPage()" [class.shadow-md]="p === currentPage()"
                          [class.bg-background]="p !== currentPage()" [class.border]="p !== currentPage()" [class.border-border]="p !== currentPage()" [class.hover:border-primary/50]="p !== currentPage()">
                    {{ p }}
                  </button>
                }
              </div>
            </div>
          }
        </div>

        <div class="md:hidden flex flex-col gap-4 font-inter">
          @if (users().length === 0) {
            <div class="bg-background rounded-xl border border-border p-8 text-center shadow-sm">
              <p class="text-muted-foreground font-medium text-lg">{{ 'admin.users.empty' | t }}</p>
            </div>
          } @else {
            @for (user of users(); track user.id) {
              <div class="bg-background rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-all duration-300">
                <div class="flex justify-between items-start mb-3">
                  <span class="font-semibold text-foreground text-base truncate pr-2">{{ user.name }}</span>
                  @if (user.is_locked) {
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide border bg-red-50 text-red-700 border-red-200 shrink-0">{{ 'admin.users.blocked' | t }}</span>
                  } @else {
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide border bg-green-50 text-green-700 border-green-200 shrink-0">{{ 'admin.users.active' | t }}</span>
                  }
                </div>
                
                <div class="mb-3 space-y-1">
                  <div class="text-sm text-muted-foreground truncate" dir="ltr">{{ user.email }}</div>
                  <div class="text-sm text-muted-foreground" dir="ltr">{{ user.phone }}</div>
                </div>
                
                <div class="mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  {{ user.created_at | date:'mediumDate' }}
                </div>
              </div>
            }

            @if (totalPages() > 1) {
              <div class="flex flex-col items-center pt-4 pb-2 gap-4">
                <span class="text-sm text-muted-foreground font-medium">{{ 'admin.users.total' | t }} {{ total() }} {{ 'admin.users.user' | t }}</span>
                <div class="flex flex-wrap justify-center gap-2">
                  @for (p of pages(); track p) {
                    <button (click)="goToPage(p)"
                            class="h-10 w-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-300"
                            [class.bg-primary]="p === currentPage()" [class.text-white]="p === currentPage()" [class.shadow-md]="p === currentPage()"
                            [class.bg-background]="p !== currentPage()" [class.border]="p !== currentPage()" [class.border-border]="p !== currentPage()" [class.hover:border-primary/50]="p !== currentPage()">
                      {{ p }}
                    </button>
                  }
                </div>
              </div>
            }
          }
        </div>
      }
    </div>
  `,
})
export class AdminUsersComponent implements OnInit {
  private adminService = inject(AdminService);

  users = signal<AdminUser[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  total = signal(0);
  pages = signal<number[]>([]);

  ngOnInit(): void {
    this.loadUsers(1);
  }

  goToPage(page: number): void {
    this.loadUsers(page);
  }

  private loadUsers(page: number): void {
    this.loading.set(true);
    this.adminService.getUsers(page, 20).subscribe({
      next: (res) => {
        this.users.set(res.data);
        this.currentPage.set(res.meta.page);
        this.totalPages.set(res.meta.total_pages);
        this.total.set(res.meta.total);
        this.pages.set(Array.from({ length: res.meta.total_pages }, (_, i) => i + 1));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
