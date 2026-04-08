import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

import { apiConfig } from '../core/api.config';

export interface WsIncomingMessage {
  type: string;
  conversation_id: string;
  message_id: string;
  sender_account_id: string;
  content: string;
  sent_at: string;
}

@Injectable({ providedIn: 'root' })
export class MessagingWebSocketService implements OnDestroy {
  private ws: WebSocket | null = null;
  private readonly messageSubject = new Subject<WsIncomingMessage>();
  readonly messages$ = this.messageSubject.asObservable();

  connect(accountIdentifier: string): void {
    this.disconnect();
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const base = apiConfig.baseUrl
      ? apiConfig.baseUrl.replace(/^https?:/, protocol)
      : `${protocol}//${window.location.host}`;
    const url = `${base}/ws/messaging?account_identifier=${encodeURIComponent(accountIdentifier)}`;
    this.ws = new WebSocket(url);
    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string) as WsIncomingMessage;
        this.messageSubject.next(data);
      } catch {
        // ignore malformed frames
      }
    };
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
