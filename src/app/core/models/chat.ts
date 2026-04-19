import { Pagination } from "./Pagination"

export interface UsersChat {
    isOnline: boolean
    lastMessage: string
    lastMessageTime: string
    unreadCount: number
    userAvatar: string
    userId: string
    userName: string
}

export interface SendMessageRequest {
    receiverId: string,
    content: string,
    replyToMessageId: string | null
}

export interface ConversationRequest extends Pagination {
    userId: string
}

export interface ChatMessage {
    messageId: string
    senderId: string
    senderName: string
    senderAvatar: string
    content: string
    sentAt: string
    isRead: boolean
    isOwn: boolean
    reactions: any[]
    replyToMessageId: string | null
    parentContent: string | null
    parentSenderName: string | null
}

export interface ReactRequest {
    messageId: string,
    reactionType: number
}