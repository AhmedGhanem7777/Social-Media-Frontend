import { MediaKind } from "./enum";

export interface SharedPost {
    user: { name: string; username: string; avatar: string };
    content: string;
    image?: string;
    mediaKind: MediaKind;
    thumbnailUrl?: string;
    timeAgo: string;
}

export interface Post {
    id: number;
    content: string;
    contentUrl: string;
    mediaKind: MediaKind;
    thumbnailUrl?: string;

    createdAt: string;

    commentsCount: number;
    likesCount: number;
    savesCount: number;
    sharesCount: number;

    isLikedByCurrentUser: boolean;
    isSavedByCurrentUser: boolean;
    isViewedByCurrentUser: boolean;

    reactionType: string | null;
    reactions: ReactionSummary[]

    userId: string;
    userName: string;
    displayName: string;
    profilePicture: string;

    isFollow: boolean;
    isShared: boolean;

    sharedAt?: string;
    sharedByUserId?: string;
    sharedByDisplayName?: string;
    sharedByProfilePicture?: string;
    sharedCaption?: string;
}

export interface PostData {
    userId: string
    pageIndex: number
    pageSize: number
}

export interface PostShareData {
    content: string;
    postId: number
}

export interface ReactionSummary {
    reactionType: string;
    count: number;
}

export interface CreatePostRequest {
    content: string;
    contentUrl?: string;
}