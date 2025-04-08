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
    created_at: string;
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
    id: number;
    title: string;
    description: string;
    photo: string;
    photos: string[];
    profile: string;
    user_id: number;
    username: string;
    name: string;
    relative_time: string;
    comments: Comment[];
    tags: Tags[];
    like: number;
    liked: number;
    created_at: string;
}

export interface Like {
    id: number;
}

export interface Forum {
    id: number;
    title: string;
    description: string;
    photo: string;
    photos: string[];
    profile: string;
    user_id: number;
    user: User;
    username: string;
    name: string;
    relative_time: string;
    comments: Comment[];
    tags: Tags[];
    like: number;
    liked: number;
    created_at: string;
}

export interface UserProfile {
    id: number;
    name: string;
    username: string;
    profile: string;
    role: string;
    status: string;
    forums: Forum[];
    suspend_until?: string;
    suspend_duration?: number;
    suspend_count?: number;
    created_at: string;
}

export interface User {
    id: number;
    username: string;
    name: string;
    status: string;
    profile?: string;
    suspend_until?: string;
    created_at: string;
    suspend_count?: number;
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
    created_at: string;
}

export interface DecodedToken {
    id: number;
    username: string;
    name: string;
}

export type Tag = {
    id: number;
    name: string;
    created_at: string;
};

export interface Reports {
    id: number;
    reporter_id: number;
    reported_id: number;
    reason: string;
    status: string;
    created_at: string;
    reported_user: User;
    suspend_until?: string;
    suspend_count?: number;
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