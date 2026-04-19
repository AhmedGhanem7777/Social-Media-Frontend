export interface Reaction {
    id: number;
    name: string;
    emoji: string;
    color: string;
}

export const REACTIONS: Reaction[] = [
    { id: 1, name: 'Like', emoji: '👍', color: 'text-blue-500' },
    { id: 2, name: 'Love', emoji: '❤️', color: 'text-red-500' },
    { id: 3, name: 'Haha', emoji: '😂', color: 'text-yellow-500' },
    { id: 4, name: 'Wow', emoji: '😮', color: 'text-yellow-500' },
    { id: 5, name: 'Sad', emoji: '😢', color: 'text-blue-400' },
    { id: 6, name: 'Angry', emoji: '😡', color: 'text-orange-600' }
];

export interface UserReactionView {
    userId: string;
    displayName: string;
    profilePicture: string;
    reactionType: string;
}

export interface UserReactionRequest {
    contentType: number;
    contentId: number;
    pageIndex: number;
    pageSize: number;
}