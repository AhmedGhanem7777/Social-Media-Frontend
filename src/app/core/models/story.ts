export interface Story {
    createdAt: string
    displayName: string
    id: number
    isViewedByCurrentUser: boolean
    mediaUrl: string
    profilePicture: string
    userId: string
    viewers: any[]
    viewsCount: number
    isOwnStory: boolean
    hasUnseenStory: boolean
}

export interface UserStory {
    userId: string;
    displayName: string;
    profilePicture: string;
    hasUnseenStory: boolean;
    isOwnStory: boolean;
}