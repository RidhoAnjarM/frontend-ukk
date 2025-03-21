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

export interface Tags {
    id: number;
    name: string;
    usage_count: number;
}

export interface Category {
    id: number;
    name: string;
    photo: string;
    usage_count: number;
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
    description: string;
    photo: string;
    profile: string;
    user_id: number;
    username: string;
    name: string;
    category_id: number;
    category_name: string;
    relative_time: string;
    comments: Comment[];
    tags: Tags[];
    like: number;
    liked: number;
}

export interface Like {
    id: number;
}

export interface Forum {
    id: number;
    title: string;
    description: string;
    photo: string;
    profile: string;
    user_id: number;
    user: User;
    username: string;
    name: string;
    category: string;
    category_id: number;
    category_name: string;
    relative_time: string;
    comments: Comment[];
    tags: Tags[];
    like: number;
    liked: number;
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
    suspend_until?: string;
    created_at: string;
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

export type Tag = {
    id: number;
    name: string;
};

export interface Reports {
    id: number;
    reporter_id: number;
    reported_id: number;
    reason: string;
    status: string;
    created_at: string;
    reported_user: User;
}

export interface ForumReport {
    id: number;
    reporter_id: number;
    forum_id: number;
    reason: string;
    status: string;
    created_at: string;
    forum: Forum;
}