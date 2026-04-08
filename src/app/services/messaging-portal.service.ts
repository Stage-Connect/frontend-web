import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { buildApiUrl } from '../core/api.config';

export interface InboxConversationDto {
  conversation_id: string;
  last_message_preview: string | null;
  last_message_sender_account_id: string | null;
  last_message_at: string | null;
  last_activity_at: string;
  unread_count: number;
}

export interface InboxResponseDto {
  page: number;
  page_size: number;
  total: number;
  sort_by: string;
  sort_order: string;
  items: InboxConversationDto[];
}

export interface MessageDto {
  message_id: string;
  conversation_id: string;
  sender_account_id: string;
  content: string;
  sent_at: string;
  is_read: boolean;
}

export interface ConversationMessagesDto {
  items: MessageDto[];
  total: number;
  page: number;
  page_size: number;
}

@Injectable({
  providedIn: 'root'
})
export class MessagingPortalService {
  private readonly http = inject(HttpClient);

  getInbox(page = 1, pageSize = 20): Observable<InboxResponseDto> {
    const params = new HttpParams().set('page', String(page)).set('page_size', String(pageSize));
    return this.http.get<InboxResponseDto>(buildApiUrl('/api/v1/messaging/inbox'), { params });
  }

  sendMessage(conversationId: string, body: { content: string }): Observable<MessageDto> {
    return this.http.post<MessageDto>(
      buildApiUrl(`/api/v1/messaging/conversations/${encodeURIComponent(conversationId)}/messages`),
      body
    );
  }

  getConversationMessages(conversationId: string, page = 1, pageSize = 20): Observable<ConversationMessagesDto> {
    const params = new HttpParams().set('page', String(page)).set('page_size', String(pageSize));
    return this.http.get<ConversationMessagesDto>(
      buildApiUrl(`/api/v1/messaging/conversations/${encodeURIComponent(conversationId)}/messages`),
      { params }
    );
  }

  markConversationRead(conversationId: string): Observable<void> {
    return this.http.post<void>(
      buildApiUrl(`/api/v1/messaging/conversations/${encodeURIComponent(conversationId)}/read`),
      {}
    );
  }
}
