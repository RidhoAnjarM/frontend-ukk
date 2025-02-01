export interface Comment {
    id: number;
    content: string;
    created_at: string;
    profile: string;
    relative_time: string;
    user_id: number;
    username: string;
    replies?: Reply[];
}

export interface Reply {
    id: number;
    content: string;
    created_at: string;
    profile: string;
    relative_time: string;
    user_id: number;
    username: string;
}

export interface ForumPost {
    category: string;
    photo_orientation: string;
    id: number;
    title: string;
    photo: string;
    profile: string;
    user_id: number;
    username: string;
    category_id: number;
    category_name: string;
    relative_time: string;
    comments: Comment[];
}

export interface User {
    username: string;
    profile: string;
    name: string;
}

export interface Notification {
    id: string;
    content: string;
    isRead: boolean;
    comment?: string;
    user?: string;
    profile?: string;
    reply?: string;
    reply_user?: string;
    forum_id?: string;
    forum_title?: string;
    photo?: string;
    reply_profile?: string;
}