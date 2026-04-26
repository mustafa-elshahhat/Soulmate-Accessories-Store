import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy, HostListener, ViewChild } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService, Notification } from '../../core/services/notification.service';
import { TranslationService } from '../../core/services/translation.service';
import { AudioService } from '../../core/services/audio.service';
import { AdminHeaderComponent } from './components/admin-header/admin-header.component';
import { AdminBottomNavComponent } from './components/admin-bottom-nav/admin-bottom-nav.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, AdminHeaderComponent, AdminBottomNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col min-h-screen bg-muted">
      <app-admin-header
        [userName]="authService.user()?.name || ''"
        [userEmail]="authService.user()?.email || ''"
        [unreadCount]="notificationService.unreadCount()"
        [isMuted]="audioService.isMuted()"
        [notifDropdownOpen]="notifDropdownOpen()"
        [profileDropdownOpen]="profileDropdownOpen()"
        [notifLoading]="notifLoading()"
        [notifications]="dropdownNotifications()"
        [currentLang]="currentLang()"
        (toggleMute)="audioService.toggleMute()"
        (toggleNotifDropdown)="toggleNotifDropdown()"
        (toggleProfileDropdown)="toggleProfileDropdown()"
        (notificationClick)="onNotificationClick($event)"
        (markAllRead)="markAllRead()"
        (logout)="logout()"
        (closeNotifDropdown)="notifDropdownOpen.set(false)"
        (closeProfileDropdown)="profileDropdownOpen.set(false)"
        #header />

      <!-- Page content -->
      <main class="flex-1 p-4 md:p-6">
        <router-outlet />
        
        <!-- Spacer to prevent content from hiding behind the fixed bottom nav -->
        <div class="h-20 sm:h-24 w-full"></div>
      </main>

      <app-admin-bottom-nav
        [moreOpen]="moreDropdownOpen()"
        (toggleMore)="toggleMoreDropdown()"
        (closeMore)="moreDropdownOpen.set(false)"
        #bottomNav />
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  audioService = inject(AudioService);
  private t = inject(TranslationService);
  readonly currentLang = this.t.currentLang;
  private router = inject(Router);

  notifDropdownOpen = signal(false);
  notifLoading = signal(false);
  dropdownNotifications = signal<Notification[]>([]);
  profileDropdownOpen = signal(false);
  moreDropdownOpen = signal(false);

  @ViewChild('header') headerComponent!: AdminHeaderComponent;
  @ViewChild('bottomNav') bottomNavComponent!: AdminBottomNavComponent;

  ngOnInit(): void {
    this.notificationService.startPolling();
  }

  ngOnDestroy(): void {
    this.notificationService.stopPolling();
  }

  toggleNotifDropdown(): void {
    this.profileDropdownOpen.set(false);
    this.moreDropdownOpen.set(false);
    if (this.notifDropdownOpen()) {
      this.notifDropdownOpen.set(false);
      return;
    }
    this.notifDropdownOpen.set(true);
    this.loadDropdownNotifications();
  }

  toggleProfileDropdown(): void {
    this.notifDropdownOpen.set(false);
    this.moreDropdownOpen.set(false);
    this.profileDropdownOpen.set(!this.profileDropdownOpen());
  }

  toggleMoreDropdown(): void {
    this.notifDropdownOpen.set(false);
    this.profileDropdownOpen.set(false);
    this.moreDropdownOpen.set(!this.moreDropdownOpen());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.notifDropdownOpen() && this.headerComponent?.notifDropdownRef && !this.headerComponent.notifDropdownRef.nativeElement.contains(event.target)) {
      this.notifDropdownOpen.set(false);
    }
    if (this.profileDropdownOpen() && this.headerComponent?.profileDropdownRef && !this.headerComponent.profileDropdownRef.nativeElement.contains(event.target)) {
      this.profileDropdownOpen.set(false);
    }
    if (this.moreDropdownOpen() && this.bottomNavComponent?.moreDropdownRef && !this.bottomNavComponent.moreDropdownRef.nativeElement.contains(event.target)) {
      this.moreDropdownOpen.set(false);
    }
  }

  private loadDropdownNotifications(): void {
    this.notifLoading.set(true);
    this.notificationService.getAll().subscribe({
      next: (data) => {
        this.dropdownNotifications.set(data.items.slice(0, 10));
        this.notifLoading.set(false);
      },
      error: () => this.notifLoading.set(false),
    });
  }

  onNotificationClick(n: Notification): void {
    this.notifDropdownOpen.set(false);
    if (!n.is_read) {
      this.notificationService.markAsRead(n.id).subscribe();
    }
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.dropdownNotifications.set(
          this.dropdownNotifications().map(n => ({ ...n, is_read: true }))
        );
      },
    });
  }

  logout(): void {
    this.profileDropdownOpen.set(false);
    this.authService.logout().subscribe({
      next: () => this.router.navigateByUrl('/login', { replaceUrl: true }),
      error: () => this.router.navigateByUrl('/login', { replaceUrl: true }),
    });
  }
}
