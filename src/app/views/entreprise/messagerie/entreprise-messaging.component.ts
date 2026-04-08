import { Component, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  CardBodyComponent,
  CardComponent,
  ColComponent,
  RowComponent,
  BadgeComponent,
  ButtonDirective,
  FormControlDirective,
  ColorModeService
} from '@coreui/angular';
import {
  MessagingPortalService,
  InboxConversationDto,
  MessageDto
} from '../../../services/messaging-portal.service';
import { MessagingWebSocketService } from '../../../services/messaging-websocket.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-entreprise-messaging',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    BadgeComponent,
    ButtonDirective,
    FormControlDirective
  ],
  template: `
    <c-row class="g-0" style="min-height: 70vh;">
      <!-- Inbox (left column) -->
      <c-col lg="4" class="border-end" [class.border-secondary]="isDark()">
        <c-card class="border-0 h-100" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-body class="p-0">
            <div class="px-3 py-3 border-bottom fw-bold" [class.border-secondary]="isDark()">
              Conversations
            </div>
            @if (loadingInbox) {
              <div class="p-4 text-center opacity-75">Chargement…</div>
            } @else if (inboxError) {
              <div class="alert alert-warning m-3 small" role="alert">{{ inboxError }}</div>
            } @else if (conversations.length === 0) {
              <div class="p-4 text-center opacity-75 small">Aucune conversation.</div>
            } @else {
              <ul class="list-unstyled mb-0">
                @for (conv of conversations; track conv.conversation_id) {
                  <li
                    class="px-3 py-3 border-bottom cursor-pointer"
                    [class.border-secondary]="isDark()"
                    [class.bg-primary]="selectedConversation?.conversation_id === conv.conversation_id && !isDark()"
                    [style.background]="selectedConversation?.conversation_id === conv.conversation_id && isDark() ? 'rgba(255,255,255,0.12)' : undefined"
                    [class.text-white]="selectedConversation?.conversation_id === conv.conversation_id && !isDark()"
                    style="cursor:pointer"
                    (click)="selectConversation(conv)"
                  >
                    <div class="d-flex justify-content-between align-items-start">
                      <span class="fw-semibold small text-truncate" style="max-width:75%">{{ conv.conversation_id }}</span>
                      @if (conv.unread_count > 0) {
                        <c-badge color="danger" class="ms-1">{{ conv.unread_count }}</c-badge>
                      }
                    </div>
                    <div class="small opacity-75 text-truncate mt-1">{{ conv.last_message_preview ?? '—' }}</div>
                    <div class="small opacity-50 mt-1">{{ fmt(conv.last_activity_at) }}</div>
                  </li>
                }
              </ul>
            }
          </c-card-body>
        </c-card>
      </c-col>

      <!-- Messages (right column) -->
      <c-col lg="8">
        <c-card class="border-0 h-100" [class.bg-dark]="isDark()" [class.text-white]="isDark()">
          <c-card-body class="p-0 d-flex flex-column" style="height:70vh;">
            @if (!selectedConversation) {
              <div class="flex-grow-1 d-flex align-items-center justify-content-center opacity-50 small">
                Sélectionnez une conversation pour afficher les messages.
              </div>
            } @else {
              <!-- Header -->
              <div class="px-4 py-3 border-bottom fw-bold small" [class.border-secondary]="isDark()">
                Conversation : {{ selectedConversation.conversation_id }}
              </div>

              <!-- Messages list -->
              <div class="flex-grow-1 overflow-auto px-4 py-3" #msgContainer>
                @if (loadingMessages) {
                  <div class="text-center opacity-75 small">Chargement des messages…</div>
                } @else if (messagesError) {
                  <div class="alert alert-warning small" role="alert">{{ messagesError }}</div>
                } @else if (messages.length === 0) {
                  <div class="text-center opacity-50 small">Aucun message dans cette conversation.</div>
                } @else {
                  @for (msg of messages; track msg.message_id) {
                    <div class="mb-3 d-flex flex-column"
                         [class.align-items-end]="msg.sender_account_id === 'me'">
                      <div
                        class="px-3 py-2 rounded small"
                        style="max-width:75%"
                        [class.bg-primary]="msg.sender_account_id === 'me'"
                        [class.text-white]="msg.sender_account_id === 'me'"
                        [class.bg-light]="msg.sender_account_id !== 'me' && !isDark()"
                        [style.background]="msg.sender_account_id !== 'me' && isDark() ? 'rgba(255,255,255,0.08)' : undefined"
                      >
                        {{ msg.content }}
                      </div>
                      <div class="small opacity-50 mt-1">{{ fmt(msg.sent_at) }}</div>
                    </div>
                  }
                }
              </div>

              <!-- Input area -->
              <div class="px-4 py-3 border-top d-flex gap-2" [class.border-secondary]="isDark()">
                <input
                  cFormControl
                  class="flex-grow-1"
                  placeholder="Écrire un message…"
                  [(ngModel)]="newMessageContent"
                  (keyup.enter)="sendMessage()"
                  [disabled]="sending"
                />
                <button
                  cButton
                  color="primary"
                  (click)="sendMessage()"
                  [disabled]="sending || !newMessageContent.trim()"
                >
                  {{ sending ? 'Envoi…' : 'Envoyer' }}
                </button>
              </div>
            }
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>
  `
})
export class EntrepriseMessagingComponent implements OnInit, OnDestroy {
  readonly #colorModeService = inject(ColorModeService);
  readonly isDark = computed(() => this.#colorModeService.colorMode() === 'dark');
  private readonly messaging = inject(MessagingPortalService);
  private readonly ws = inject(MessagingWebSocketService);
  private readonly auth = inject(AuthService);
  private wsSub: Subscription | null = null;

  loadingInbox = true;
  inboxError = '';
  conversations: InboxConversationDto[] = [];

  selectedConversation: InboxConversationDto | null = null;
  loadingMessages = false;
  messagesError = '';
  messages: MessageDto[] = [];

  newMessageContent = '';
  sending = false;

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (user) {
      this.ws.connect(user.id);
      this.wsSub = this.ws.messages$.subscribe((wsMsg) => {
        if (this.selectedConversation?.conversation_id === wsMsg.conversation_id) {
          const incoming: MessageDto = {
            message_id: wsMsg.message_id,
            conversation_id: wsMsg.conversation_id,
            sender_account_id: wsMsg.sender_account_id,
            content: wsMsg.content,
            sent_at: wsMsg.sent_at,
            is_read: false
          };
          this.messages = [...this.messages, incoming];
        }
        const conv = this.conversations.find(c => c.conversation_id === wsMsg.conversation_id);
        if (conv && this.selectedConversation?.conversation_id !== wsMsg.conversation_id) {
          conv.unread_count = (conv.unread_count ?? 0) + 1;
          conv.last_message_preview = wsMsg.content;
        }
      });
    }
    this.messaging.getInbox(1, 50).subscribe({
      next: (res) => {
        this.conversations = res.items;
        this.loadingInbox = false;
      },
      error: () => {
        this.inboxError = 'Messagerie : connectez-vous avec un compte autorisé ou vérifiez les droits.';
        this.loadingInbox = false;
      }
    });
  }

  selectConversation(conv: InboxConversationDto): void {
    this.selectedConversation = conv;
    this.messages = [];
    this.messagesError = '';
    this.loadingMessages = true;
    this.messaging.getConversationMessages(conv.conversation_id).subscribe({
      next: (res) => {
        this.messages = res.items;
        this.loadingMessages = false;
        if (conv.unread_count > 0) {
          this.messaging.markConversationRead(conv.conversation_id).subscribe();
          conv.unread_count = 0;
        }
      },
      error: () => {
        this.messagesError = 'Impossible de charger les messages.';
        this.loadingMessages = false;
      }
    });
  }

  sendMessage(): void {
    const content = this.newMessageContent.trim();
    if (!content || !this.selectedConversation || this.sending) {
      return;
    }
    this.sending = true;
    this.messaging.sendMessage(this.selectedConversation.conversation_id, { content }).subscribe({
      next: (msg) => {
        this.messages = [...this.messages, msg];
        this.newMessageContent = '';
        this.sending = false;
      },
      error: () => {
        this.sending = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
    this.ws.disconnect();
  }

  fmt(iso: string): string {
    try {
      return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
    } catch {
      return iso;
    }
  }
}
