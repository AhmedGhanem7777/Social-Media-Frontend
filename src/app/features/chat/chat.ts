import { afterNextRender, Component, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { LanguageService } from '../../core/services/Language/language-service';
import { Chat as ChatService } from '../../core/services/Chat/chat';
import { FormsModule } from '@angular/forms';
import { ChatMessage, UsersChat } from '../../core/models/chat';
import { CookieService } from 'ngx-cookie-service';
import { PostDatePipe } from '../../shared/pipes/post-date-pipe';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { User as UserService } from '../../core/services/User/user';

@Component({
  selector: 'app-chat',
  imports: [FormsModule, PostDatePipe, DatePipe],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit {
  readonly lang = inject(LanguageService);
  readonly chatService = inject(ChatService);
  private readonly cookieService = inject(CookieService);
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);

  readonly messagesContainer = viewChild<ElementRef<HTMLDivElement>>('messagesContainer');

  readonly currentUserId = this.cookieService.get('userId');

  selectedChat = signal<UsersChat | null>(null);
  showMobileChat = signal(false);
  messageText = '';

  usersChat = signal<UsersChat[]>([]);
  messages = signal<ChatMessage[]>([]);
  loadingMessages = signal(false);
  sendingMessage = signal(false);
  activeMenuId = signal<string | null>(null);

  private pageIndex = 1;
  private readonly pageSize = 50;

  constructor() {
    afterNextRender(() => this.scrollToBottom());
  }

  ngOnInit(): void {
    this.getUsersChat();
  }

  // Chat Listeners and Handlers
  getUsersChat(): void {
    this.chatService.GetAllUsersChat().subscribe({
      next: (res) => {
        // Assuming the API returns an array of chats with users
        if (res.isSuccess) {
          this.usersChat.set(res.data);
          const userId = this.route.snapshot.queryParams['userId'];
          if (userId) {
            this.handleChatByUserId(userId);
          }
        }
      },
      error: (err) => {
        console.error('Failed to load conversations:', err);
      }
    });
  }

  // Handle selecting a chat by user ID
  handleChatByUserId(userId: string): void {
    const existingChat = this.usersChat().find(c => c.userId === userId);
    if (existingChat) {
      this.selectConversation(existingChat);
    } else {
      this.userService.getUserProfile(userId).subscribe({
        next: (res) => {
          // Assuming the API returns a user object
          if (res.isSuccess) {
            const userData = res.data;
            const newChat: UsersChat = {
              userId: userData.userId,
              userName: userData.displayName,
              userAvatar: userData.profilePicture,
              lastMessage: '',
              lastMessageTime: '',
              unreadCount: 0,
              isOnline: false
            };
            this.usersChat.update(chats => [newChat, ...chats]);
            this.selectConversation(newChat);
          }
        },
        error: (err) => {
          console.error('Failed to load user profile for chat:', err);
        }
      });
    }
  }

  // Handle selecting a conversation from the list
  selectConversation(conv: UsersChat): void {
    this.selectedChat.set(conv);
    this.showMobileChat.set(true);
    this.pageIndex = 1;
    this.loadMessages(conv.userId);
    this.markAsRead(conv);
  }

  // Load messages for the selected conversation
  loadMessages(userId: string): void {
    this.loadingMessages.set(true);
    this.messages.set([]);

    // Call the API to get messages with pagination
    this.chatService.GetConversationWithUser({
      userId,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize
    }).subscribe({
      next: (res) => {
        // Assuming the API returns an array of messages
        if (res.isSuccess) {
          const msgs: ChatMessage[] = res.data ?? [];
          this.messages.set(msgs.reverse());
          setTimeout(() => this.scrollToBottom(), 50);
        }
        this.loadingMessages.set(false);
      },
      error: (err) => {
        console.error('Failed to load messages:', err);
        this.loadingMessages.set(false);
      }
    });
  }

  // Mark messages as read when opening a conversation
  markAsRead(conv: UsersChat): void {
    if (conv.unreadCount > 0) {
      this.chatService.MarkMessagesAsRead(conv.userId).subscribe({
        next: () => {
          this.usersChat.update(chats =>
            chats.map(c => c.userId === conv.userId ? { ...c, unreadCount: 0 } : c)
          );
        }
      });
    }
  }

  // Send a new message in the selected conversation
  sendMessage(): void {
    const text = this.messageText.trim();
    const selected = this.selectedChat();
    if (!text || !selected) return;

    this.sendingMessage.set(true);
    this.messageText = '';

    this.chatService.SendMessage({
      receiverId: selected.userId,
      content: text,
      replyToMessageId: null
    }).subscribe({
      next: (res) => {
        // Assuming the API returns the sent message object
        if (res.isSuccess) {
          const sentMessage: ChatMessage = res.data ?? {
            messageId: crypto.randomUUID(),
            senderId: this.currentUserId,
            senderName: '',
            senderAvatar: '',
            content: text,
            sentAt: new Date().toISOString(),
            isRead: false,
            isOwn: true,
            reactions: []
          };
          this.messages.update(msgs => [...msgs, sentMessage]);

          this.usersChat.update(chats =>
            chats.map(c => c.userId === selected.userId
              ? { ...c, lastMessage: text, lastMessageTime: 'Just now' }
              : c
            )
          );

          setTimeout(() => this.scrollToBottom(), 50);
        }
        this.sendingMessage.set(false);
      },
      error: (err) => {
        console.error('Failed to send message:', err);
        this.sendingMessage.set(false);
      }
    });
  }

  // Delete a message (own messages only)
  deleteMessage(messageId: string): void {
    this.chatService.DeleteMessage(messageId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.messages.update(msgs => msgs.filter(m => m.messageId !== messageId));
        }
      }
    });
  }

  // Utility methods
  isMyMessage(msg: ChatMessage): boolean {
    return msg.isOwn;
  }

  // Get message by ID (used for actions like reply or react)
  getMessageById(messageId: string | null): ChatMessage | undefined {
    if (!messageId) return undefined;
    return this.messages().find(m => m.messageId === messageId);
  }

  // Scroll helpers
  scrollToBottom(): void {
    const el = this.messagesContainer()?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
