import { SocialMedia } from "./enum";
import { Pagination } from "./Pagination";

export interface SuggestedUser {
    userId: string;
    displayName: string;
    username: string;
    profilePicture: string;
    mutualFriends: number;
}

export interface UserProfile {
    address: {
        city: string
        country: string
    };
    bio: string;
    coverPicture: string;
    displayName: string;
    username: string;
    createdAt: string;
    profilePicture: string;
    socialLinks: SocialMedia[];
    postsCount: number;
    followersCount: number
    followingCount: number
}

export interface UserCommented {
    contentType: number;
    contentId: number;
    pageIndex: number;
    pageSize: number;
}

export interface UserCommentedView {
    userId: string;
    displayName: string;
    profilePicture: string;
}

export interface UpdateProfileData {
    displayName: string;
    bio: string;
    profilePicture: File | string | null;
    coverPicture: File | string | null;
    city: string;
    country: string;
}

export interface SearchRequest extends Pagination {
    query: string;
}

export interface FeedStoriesRequest extends Pagination {
    userId: string;
}