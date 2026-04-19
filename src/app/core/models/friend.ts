import { Pagination } from "./Pagination"

export interface FriendData {
    profilePicture: string
    username: string
    displayName: string
    userId: string
    mutualFriends: number
}

export interface FriendRequest extends Pagination {
    userId: string
}