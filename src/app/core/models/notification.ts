import { Pagination } from "./Pagination";

export interface NotificationRequest extends Pagination {
    IsRead: boolean;
    Type: number;
}

export interface Notification {
    id: number,
    userId: string,
    actorId: string,
    actorName: string,
    actorProfilePicture: string,
    type: string,
    contentId: number,
    message: string,
    isRead: boolean,
    createdAt: string
}