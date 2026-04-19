import { ReactionSummary } from "./post";

export interface Reel {
    id: number;
    caption: string;
    videoUrl: string;
    thumbnailUrl: string | null;

    createdAt: string;

    commentsCount: number;
    likesCount: number;
    sharesCount: number;
    savesCount: number;

    isLikedByCurrentUser: boolean;
    isSavedByCurrentUser: boolean;
    isViewedByCurrentUser: boolean;

    reactionType: string | null;
    reactions: ReactionSummary[];

    userId: string;
    userName: string;
    displayName: string;
    profilePicture: string;

    isFollow: boolean;

    isShared: boolean;
    sharedAt?: string | null;
    sharedByUserId?: string | null;
    sharedByDisplayName?: string | null;
    sharedByProfilePicture?: string | null;
    sharedCaption?: string | null;
}


export interface ShareRequest {
    reelId: number
    caption?: string
}

export interface CreateReelRequest {
    videoUrl: string;
    caption?: string;
}