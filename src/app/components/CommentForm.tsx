import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface CommentFormProps {
    postId: number;
    onCommentAdded: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ postId, onCommentAdded }) => {
    const [content, setContent] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        console.log('Received postId:', postId);
    }, [postId]);

    const fetchForumId = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
            const response = await axios.get(`${apiUrl}/api/forum/${postId}`);
            return response.data.forumId;
        } catch (err: any) {
            setError('Failed to fetch forum ID.');
            if (axios.isAxiosError(err)) {
                console.error('Axios error:', err.message);
            } else {
                console.error('Error:', err);
            }
            return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
            setError('User not authenticated.');
            setLoading(false);
            return;
        }

        if (content.trim().length < 3) {
            setError('Comment must be at least 3 characters.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('content', content.trim());
        formData.append('postId', String(postId));

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
            await axios.post(
                `${apiUrl}/api/comment/`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setContent('');
            setError(null);
            onCommentAdded();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to add comment.');
            if (axios.isAxiosError(err)) {
                console.error('Axios error:', err.message);
            } else {
                console.error('Error:', err);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-[10px]">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-[10px] border border-gray-300 rounded-[10px]"
                placeholder="Add a comment..."
                required
            />
            {error && <p className="text-red-500">{error}</p>}
            <button
                type="submit"
                className="mt-[10px] px-[20px] py-[10px] bg-primary text-white rounded-[10px]"
                disabled={loading || content.trim() === ''}
            >
                {loading ? 'Posting...' : 'Post Comment'}
            </button>
        </form>
    );
};

export default CommentForm;
