export interface Platform {
    value: number
    name: string
}

export interface SocialMedia {
    platform: string
    url: string
}

export enum MediaKind {
    None = 0,
    Image = 1,
    Video = 2
}