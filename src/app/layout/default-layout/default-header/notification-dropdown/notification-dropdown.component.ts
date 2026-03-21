import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { InAppNotification, NotificationService } from '../../../../services/notification.service';
import {
  BadgeComponent,
  DropdownComponent,
  DropdownToggleDirective,
  DropdownMenuDirective,
  DropdownHeaderDirective,
  DropdownItemDirective,
  SpinnerComponent,
  ColorModeService
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    BadgeComponent,
    DropdownComponent,
    DropdownToggleDirective,
    DropdownMenuDirective,
    DropdownHeaderDirective,
    DropdownItemDirective,
    IconDirective,
    SpinnerComponent
  ],
  template: `
    <c-dropdown [popperOptions]="{ placement: 'bottom-end' }" variant="nav-item">
      <button
        [caret]="false"
        cDropdownToggle
        class="py-0 px-1 border-0 bg-transparent position-relative btn-no-focus d-flex align-items-center"
        aria-label="Notifications"
        title="Notifications"
      >
        <svg cIcon name="cilBell" size="lg" class="my-1"></svg>
        @if (unreadCount > 0) {
          <c-badge
            color="danger"
            shape="rounded-circle"
            class="position-absolute top-0 end-0 translate-middle-y"
            style="font-size: 0.65rem; padding: 2px 5px; margin-top: 4px;"
          >
            {{ unreadCount }}
          </c-badge>
        }
      </button>

      <div
        cDropdownMenu
        class="pt-0 shadow-lg border-0 rounded-3 mt-2 overflow-hidden"
        [style.backgroundColor]="colorMode() === 'dark' ? '#24303f' : '#ffffff'"
        style="min-width: 320px; max-width: 400px;"
      >
        <!-- Header -->
        <div cDropdownHeader class="d-flex justify-content-between align-items-center py-3 px-4 border-bottom">
          <h6 class="mb-0 fw-bold" [style.color]="colorMode() === 'dark' ? '#ffffff' : '#1a222c'">
            Notifications
          </h6>
          @if (unreadCount > 0) {
            <c-badge color="danger" shape="rounded-pill">
              {{ unreadCount }} nouvelles
            </c-badge>
          }
        </div>

        <!-- Scrollable content area -->
        <div style="max-height: 400px; overflow-y: auto;">
          <!-- Loading State -->
          @if (isLoading) {
            <div class="d-flex justify-content-center align-items-center py-4 px-4">
              <c-spinner color="primary" size="sm"></c-spinner>
            </div>
          }

          <!-- Empty State -->
          @if (!isLoading && recentNotifications.length === 0) {
            <div
              class="text-center py-5 px-4"
              [style.color]="colorMode() === 'dark' ? '#8a99af' : '#64748b'"
            >
              <svg cIcon name="cilBellExclamation" size="xl" class="mb-2 d-block mx-auto opacity-50"></svg>
              <small>Aucune notification pour le moment</small>
            </div>
          }

          <!-- Notifications List -->
          @if (!isLoading && recentNotifications.length > 0) {
            <div>
              @for (notification of recentNotifications; track notification.notification_id; let last = $last) {
                <div
                  [class.border-bottom]="!last"
                  class="py-3 px-4 cursor-pointer notification-item transition-all"
                  [style.backgroundColor]="!notification.is_read ? (colorMode() === 'dark' ? 'rgba(52, 73, 94, 0.5)' : 'rgba(52, 73, 94, 0.05)') : 'transparent'"
                  [style.color]="colorMode() === 'dark' ? '#ffffff' : '#1a222c'"
                  (click)="onNotificationClick(notification)"
                >
                  <div class="d-flex justify-content-between align-items-start">
                    <div class="d-flex gap-3 flex-grow-1 me-2">
                       <div class="flex-shrink-0 mt-1">
                        <svg cIcon name="cilInfo" size="sm" class="text-primary"></svg>
                      </div>
                      <div class="flex-grow-1">
                        <p class="mb-1 small" [class.fw-bold]="!notification.is_read">
                          {{ notification.subject }}
                        </p>
                        <p class="mb-1 small" style="line-height: 1.35; word-break: break-word;" [style.color]="colorMode() === 'dark' ? '#ccd2d8' : '#4f5d73'">
                          {{ notification.message }}
                        </p>
                        <small style="font-size: 0.73rem;" [style.color]="colorMode() === 'dark' ? '#8a99af' : '#64748b'">
                          {{ notification.created_at | date: 'short' }}
                        </small>
                      </div>
                    </div>
                    @if (!notification.is_read) {
                      <c-badge
                        color="primary"
                        shape="rounded-circle"
                        style="width: 7px; height: 7px; padding: 0; margin-top: 6px; flex-shrink: 0;"
                      ></c-badge>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- View All Link -->
        <div class="border-top py-2 px-4 text-center">
          <a
            cDropdownItem
            [routerLink]="['/notifications']"
            class="py-1 d-flex justify-content-center fw-500 small"
            [style.color]="colorMode() === 'dark' ? '#4ba3ff' : '#004a99'"
          >
            Voir toutes les notifications →
          </a>
        </div>
      </div>
    </c-dropdown>
  `,
  styles: [`
    .notification-item {
      cursor: pointer;
      border-radius: 0.375rem;
      margin: 0.25rem 0;

      &:hover {
        background-color: rgba(52, 73, 94, 0.1) !important;
      }
    }

    .btn-no-focus:focus {
      outline: none;
      box-shadow: none;
    }

    small.fw-500 {
      font-weight: 500;
    }
  `]
})
export class NotificationDropdownComponent implements OnInit, OnDestroy {
  private readonly notificationService = inject(NotificationService);
  private readonly colorModeService = inject(ColorModeService);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  readonly colorMode = this.colorModeService.colorMode;

  recentNotifications: InAppNotification[] = [];
  unreadCount = 0;
  isLoading = false;

  ngOnInit(): void {
    // Subscribe to unread count with proper zone handling
    this.ngZone.run(() => {
      this.notificationService.unreadCount$
        .pipe(takeUntil(this.destroy$))
        .subscribe(count => {
          this.unreadCount = count;
          this.cdr.markForCheck();
        });
    });

    // Load recent notifications
    this.loadRecentNotifications();

    // Subscribe to notifications updates
    this.ngZone.run(() => {
      this.notificationService.notifications$
        .pipe(takeUntil(this.destroy$))
        .subscribe(notifications => {
          this.recentNotifications = notifications
            .filter(n => !n.is_read)
            .slice(0, 5);
          this.cdr.markForCheck();
        });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadRecentNotifications(): void {
    this.isLoading = true;
    this.ngZone.run(() => {
      this.notificationService.getNotifications({
        page: 1,
        page_size: 5,
        unread_only: true
      })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.recentNotifications = response.items;
            this.isLoading = false;
            this.cdr.markForCheck();
          },
          error: (error) => {
            console.error('Error loading notifications:', error);
            this.isLoading = false;
            this.cdr.markForCheck();
          }
        });
    });
  }

  onNotificationClick(notification: InAppNotification): void {
    if (notification.is_read) return;

    this.notificationService.markNotificationRead(notification.notification_id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          notification.is_read = true;
          this.notificationService.refreshUnreadCount();
          this.cdr.markForCheck();
        }
      });
  }
}
