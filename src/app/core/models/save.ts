import { MediaKind } from "./enum";

export interface SaveRequest {
    ContentType: number;
    ContentId: number;
}

export type SavedTab = 'posts' | 'reels';

export interface SavedPost {
    id: number;
    contentUrl: string;
    mediaKind: MediaKind;
    thumbnailUrl?: string;
    createdAt: string;
    displayName: string;
    likesCount: number;
    profilePicture: string | null;
    userId: string;
    reactions: {
        reactionType: string;
        count: number;
    }[];
}
