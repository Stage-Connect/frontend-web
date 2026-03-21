import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { InAppNotification, NotificationService } from '../../services/notification.service';
import { AlertService } from '../../services/alert.service';
import {
  ButtonDirective,
  SpinnerComponent,
  PageLinkDirective,
  PageItemDirective,
  TableDirective,
  BadgeComponent,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonDirective,
    PageLinkDirective,
    PageItemDirective,
    TableDirective,
    SpinnerComponent,
    IconDirective,
    BadgeComponent
  ],
  template: `
    <div class="container-lg">
      <div class="page-header d-print-none mb-4">
        <div class="row align-items-center">
          <div class="col">
            <h2 class="page-title d-flex align-items-center gap-2">
              Notifications
              @if (unreadCount > 0) {
                <c-badge color="danger" shape="rounded-pill">
                  {{ unreadCount }}
                </c-badge>
              }
            </h2>
          </div>
          <div class="col-auto ms-auto">
            <button
              type="button"
              cButton
              color="primary"
              (click)="markAllAsRead()"
              [disabled]="isLoadingMarkAll || notifications.length === 0"
            >
              <svg cIcon name="cilCheckAlt" class="me-1"></svg>
              Tout marquer comme lu
            </button>
          </div>
        </div>
      </div>

      <!-- Erreur -->
      @if (error) {
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>Erreur!</strong> {{ error }}
          <button type="button" class="btn-close" (click)="error = ''"></button>
        </div>
      }

      <!-- Chargement -->
      @if (isLoading) {
        <div class="text-center py-5">
          <c-spinner color="primary" class="mb-2"></c-spinner>
          <p>Chargement des notifications...</p>
        </div>
      }

      <!-- État vide -->
      @if (!isLoading && notifications.length === 0) {
        <div class="alert alert-info text-center py-5">
          <svg cIcon name="cilBell" size="xl" class="mb-2 d-block mx-auto"></svg>
          <p class="mb-0">Aucune notification pour le moment</p>
        </div>
      }

      <!-- Table des Notifications -->
      @if (!isLoading && notifications.length > 0) {
        <div class="card shadow-sm border-0 rounded-3 overflow-hidden">
          <table cTable hover responsive class="mb-0 align-middle">
            <thead class="table-light">
              <tr>
                <th class="ps-4" style="width: 120px;">Statut</th>
                <th>Sujet</th>
                <th>Message</th>
                <th style="width: 180px;">Date</th>
                <th class="pe-4 text-center" style="width: 120px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (notification of notifications; track notification.notification_id) {
                <tr [class.table-active]="!notification.is_read" class="transition-all">
                  <td class="ps-4">
                    @if (!notification.is_read) {
                      <c-badge color="primary" shape="rounded-pill">Non lu</c-badge>
                    } @else {
                      <c-badge color="secondary" variant="outline" shape="rounded-pill">Lu</c-badge>
                    }
                  </td>
                  <td>
                    <div [class.fw-bold]="!notification.is_read" class="small">
                      {{ notification.subject }}
                    </div>
                  </td>
                  <td>
                    <div class="small text-muted text-wrap" style="max-width: 400px; line-height: 1.4;">
                      {{ notification.message }}
                    </div>
                  </td>
                  <td>
                    <small class="text-secondary text-nowrap" style="font-size: 0.75rem;">
                      {{ notification.created_at | date: 'medium' }}
                    </small>
                  </td>
                  <td class="pe-4 text-center">
                    <div class="d-flex justify-content-center gap-2">
                       <button
                        type="button"
                        cButton
                        variant="ghost"
                        [color]="notification.is_read ? 'info' : 'success'"
                        (click)="toggleRead(notification)"
                        [disabled]="isLoadingToggle.has(notification.notification_id)"
                        size="sm"
                        [title]="notification.is_read ? 'Marquer comme non lu' : 'Marquer comme lu'"
                      >
                        <svg cIcon [attr.name]="notification.is_read ? 'cilEnvelopeOpen' : 'cilEnvelopeClosed'"></svg>
                      </button>
                      @if (notification.action_url) {
                        <a 
                          [href]="notification.action_url" 
                          cButton 
                          color="info" 
                          variant="ghost" 
                          size="sm"
                          title="Voir les détails"
                        >
                          <svg cIcon name="cilExternalLink"></svg>
                        </a>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <!-- Pagination -->
          @if (totalPages > 1) {
            <div class="card-footer bg-white border-top-0 py-3">
              <nav aria-label="Pagination des notifications">
                <ul cPagination class="mb-0 justify-content-center">
                  <li cPageItem [disabled]="currentPage === 1">
                    <a cPageLink (click)="goToPage(currentPage - 1)" class="cursor-pointer">Précédent</a>
                  </li>
                  @for (page of getPageNumbers(); track $index) {
                    <li 
                      cPageItem 
                      [active]="page === currentPage"
                      [disabled]="page === null"
                    >
                      <a cPageLink (click)="page !== null && goToPage(page)" class="cursor-pointer">
                        {{ page ?? '...' }}
                      </a>
                    </li>
                  }
                  <li cPageItem [disabled]="currentPage === totalPages">
                    <a cPageLink (click)="goToPage(currentPage + 1)" class="cursor-pointer">Suivant</a>
                  </li>
                </ul>
              </nav>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .notification-item {
      background-color: #fff;
      border-radius: 0.375rem;
      transition: background-color 0.2s;

      &.unread {
        background-color: #f0f7ff;
      }

      &:hover {
        background-color: #f8f9fa;
      }

      &.unread:hover {
        background-color: #e8f2ff;
      }
    }

    .page-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .badge {
        margin-left: 0.25rem;
      }
    }
  `]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  private readonly notificationService = inject(NotificationService);
  private readonly alertService = inject(AlertService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  notifications: InAppNotification[] = [];
  unreadCount = 0;
  isLoading = false;
  isLoadingMarkAll = false;
  isLoadingToggle = new Set<string>();
  error = '';

  currentPage = 1;
  pageSize = 20;
  total = 0;
  totalPages = 0;

  ngOnInit(): void {
    this.loadNotifications();
    
    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.error = '';

    this.notificationService.getNotifications({
      page: this.currentPage,
      page_size: this.pageSize
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response) => {
          this.notifications = response.items;
          this.total = response.total;
          this.totalPages = Math.ceil(this.total / this.pageSize);
          this.notificationService.setNotifications(response.items);
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.error = 'Échec du chargement des notifications';
          console.error('Error loading notifications:', error);
          this.cdr.markForCheck();
        }
      });
  }

  toggleRead(notification: InAppNotification): void {
    const isCurrentlyRead = notification.is_read;
    this.isLoadingToggle.add(notification.notification_id);

    this.notificationService.markNotificationRead(notification.notification_id, !isCurrentlyRead)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoadingToggle.delete(notification.notification_id);
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          notification.is_read = !isCurrentlyRead;
          this.notificationService.refreshUnreadCount();
        },
        error: (error) => {
          console.error('Error updating notification:', error);
          this.alertService.error('Error', 'Failed to update notification');
        }
      });
  }

  markAllAsRead(): void {
    this.isLoadingMarkAll = true;

    this.notificationService.markAllNotificationsRead()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoadingMarkAll = false;
        })
      )
      .subscribe({
        next: () => {
          this.notifications.forEach(n => n.is_read = true);
          this.notificationService.refreshUnreadCount();
          this.alertService.success('Succès', 'Toutes les notifications sont marquées comme lues');
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error marking all as read:', error);
          this.alertService.error('Erreur', 'Impossible de marquer comme lu');
          this.cdr.markForCheck();
        }
      });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadNotifications();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPageNumbers(): (number | null)[] {
    const pages: (number | null)[] = [];
    const maxPages = 5;
    const halfWindow = Math.floor(maxPages / 2);

    let startPage = Math.max(1, this.currentPage - halfWindow);
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push(null);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) {
        pages.push(null);
      }
      pages.push(this.totalPages);
    }

    return pages;
  }
}
