import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { buildApiUrl } from '../core/api.config';

export interface InAppNotification {
  notification_id: string;
  recipient_account_id: string;
  source_kind: string;
  subject: string;
  message: string;
  reference_identifier: string | null;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

export interface NotificationsListResponse {
  items: InAppNotification[];
  total: number;
  page: number;
  page_size: number;
}

export interface NotificationPreference {
  event_type: string;
  enabled: boolean;
  send_email: boolean;
}

export interface NotificationPreferencesResponse {
  preferences: NotificationPreference[];
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
  unread_only?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly http = inject(HttpClient);

  private readonly notificationsSubject = new BehaviorSubject<InAppNotification[]>([]);
  readonly notifications$ = this.notificationsSubject.asObservable();

  private readonly unreadCountSubject = new BehaviorSubject<number>(0);
  readonly unreadCount$ = this.unreadCountSubject.asObservable();

  /**
   * Get paginated list of notifications
   *
   * @param params Pagination and filter parameters
   * @returns Observable of notifications list
   */
  getNotifications(params?: PaginationParams): Observable<NotificationsListResponse> {
    let httpParams = new HttpParams();
    
    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.page_size) {
      httpParams = httpParams.set('page_size', params.page_size.toString());
    }
    if (params?.unread_only) {
      httpParams = httpParams.set('unread_only', 'true');
    }

    return this.http.get<NotificationsListResponse>(
      buildApiUrl('/api/v1/notifications'),
      { params: httpParams }
    );
  }

  /**
   * Load and cache notifications
   */
  loadNotifications(unreadOnly = false): Observable<NotificationsListResponse> {
    return this.getNotifications({
      page: 1,
      page_size: 50,
      unread_only: unreadOnly
    });
  }

  /**
   * Mark a single notification as read/unread
   *
   * @param notificationId The notification ID
   * @param isRead Whether to mark as read (true) or unread (false)
   * @returns Observable
   */
  markNotificationRead(notificationId: string, isRead = true): Observable<void> {
    return this.http.patch<void>(
      buildApiUrl(`/api/v1/notifications/${notificationId}/read-state`),
      { is_read: isRead }
    );
  }

  /**
   * Mark all notifications as read
   *
   * @returns Observable
   */
  markAllNotificationsRead(): Observable<void> {
    return this.http.post<void>(
      buildApiUrl('/api/v1/notifications/mark-all-read'),
      {}
    );
  }

  /**
   * Get notification preferences
   *
   * @returns Observable of preferences
   */
  getPreferences(): Observable<NotificationPreferencesResponse> {
    return this.http.get<NotificationPreferencesResponse>(
      buildApiUrl('/api/v1/notifications/preferences')
    );
  }

  /**
   * Update notification preferences
   *
   * @param preferences Array of preference updates
   * @returns Observable
   */
  updatePreferences(preferences: NotificationPreference[]): Observable<NotificationPreferencesResponse> {
    return this.http.put<NotificationPreferencesResponse>(
      buildApiUrl('/api/v1/notifications/preferences'),
      { preferences }
    );
  }

  /**
   * Add notifications to the local cache
   */
  addNotifications(notifications: InAppNotification[]): void {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([...notifications, ...current]);
    this.updateUnreadCount();
  }

  /**
   * Update local cache with fresh notifications
   */
  setNotifications(notifications: InAppNotification[]): void {
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
  }

  /**
   * Update unread count
   */
  private updateUnreadCount(): void {
    const unreadCount = this.notificationsSubject.value.filter(n => !n.is_read).length;
    this.unreadCountSubject.next(unreadCount);
  }

  /**
   * Refresh unread count from cache
   */
  refreshUnreadCount(): number {
    const unreadCount = this.notificationsSubject.value.filter(n => !n.is_read).length;
    this.unreadCountSubject.next(unreadCount);
    return unreadCount;
  }

  /**
   * Clear local cache
   */
  clearCache(): void {
    this.notificationsSubject.next([]);
    this.unreadCountSubject.next(0);
  }
}
