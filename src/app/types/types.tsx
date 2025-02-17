export interface Comment {
    id: number;
    content: string;
    created_at: string;
    profile: string;
    relative_time: string;
    user_id: number;
    username: string;
    name: string;
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
    name: string;
}

export interface ForumPost {
    category: string;
    id: number;
    title: string;
    photo: string;
    profile: string;
    user_id: number;
    username: string;
    name: string;
    category_id: number;
    category_name: string;
    relative_time: string;
    comments: Comment[];
}

export interface Forum {
    id: number;
    category_id: number;
    category_name: string;
    title: string;
    user_id: number;
    username: string;
    photo: string;
    profile: string;
    name: string;
    relative_time: string;
    comments: Comment[];
}

export interface UserProfile {
    id: number;
    name: string;
    username: string;
    profile: string;
    role: string;
    status: string;
    forums: Forum[];
}

export interface User {
    id: number;
    username: string;
    name: string;
    status: string;
    profile?: string;
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

export interface DecodedToken {
    id: number;
    username: string;
    name: string;
}