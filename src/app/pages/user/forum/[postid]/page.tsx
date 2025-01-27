'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '@/app/components/Navbar';
import { useParams } from 'next/navigation';
import { ForumPost } from '@/app/types/types';
import { useRouter } from 'next/navigation';

const ForumDetail = () => {
    const [post, setPost] = useState<ForumPost | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState<{ [key: number]: string }>({});
    const { postid } = useParams();
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
    const [visibleComments, setVisibleComments] = useState<{ [key: number]: boolean }>({});
    const [replies, setReplies] = useState<{ [key: number]: string }>({});
    const [isScrolling, setIsScrolling] = useState<boolean>(false);
    const router = useRouter();

    //get forum byid
    useEffect(() => {
        if (!postid) return;

        const fetchPostDetail = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/forum/${postid}`);
                setPost(response.data);
            } catch (err) {
                setError('Failed to fetch post details.');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPostDetail();
    }, [postid]);

    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.dropdown-container')) {
            setActiveDropdown(null);
        }
    };

    useEffect(() => {
        if (activeDropdown !== null) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeDropdown]);

    const handleAccount = (postId: number) => {
        setActiveDropdown((prev) => (prev === postId ? null : postId));
    };

    const handleReplyChange = (commentId: number, content: string) => {
        setReplies((prev) => ({
            ...prev,
            [commentId]: content,
        }));
    };

    //reply
    const handleReplySubmit = async (commentId: number, postId: number) => {
        if (!replies[commentId]) return;

        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }

        const formData = new FormData();
        formData.append('parent_id', commentId.toString());
        formData.append('content', replies[commentId]);

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/comment/reply`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const newReplyData = {
                ...response.data,
                profile: `${process.env.NEXT_PUBLIC_API_URL}${response.data.profile}`,
                username: response.data.username,
                content: response.data.content,
            };

            setPost((prevPost) => {
                if (!prevPost) return prevPost;
                return {
                    ...prevPost,
                    comments: prevPost.comments.map((comment) =>
                        comment.id === commentId
                            ? {
                                ...comment,
                                replies: [...(comment.replies || []), newReplyData],
                            }
                            : comment
                    ),
                };
            });
            setReplies((prev) => ({ ...prev, [commentId]: '' }));
            window.location.reload();
        } catch (error) {
            console.error('Error submitting reply:', error);
        }
    };

    const handleNewCommentChange = (postId: number, content: string) => {
        setNewComment((prev) => ({
            ...prev,
            [postId]: content,
        }));
    };

    // comment
    const handleNewCommentSubmit = async (postId: number) => {
        if (!newComment[postId]) return;

        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }

        const formData = new FormData();
        formData.append('forum_id', postId.toString());
        formData.append('content', newComment[postId]);

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/comment/`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const newCommentData = {
                ...response.data,
                profile: `${process.env.NEXT_PUBLIC_API_URL}${response.data.profile}`,
                username: response.data.username,
                content: response.data.content,
            };

            setPost((prevPost) => {
                if (!prevPost) return prevPost;
                return {
                    ...prevPost,
                    comments: [...(prevPost.comments || []), newCommentData],
                };
            });
            setNewComment((prev) => ({ ...prev, [postId]: '' }));
            window.location.reload(); // Refresh the page
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
    };

    //delete comment
    const handleDeleteComment = async (commentId: number) => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }

        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/comment/${commentId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setPost((prevPost) => {
                if (!prevPost) return prevPost;
                return {
                    ...prevPost,
                    comments: prevPost.comments.filter((comment) => comment.id !== commentId),
                };
            });
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    //delete reply
    const handleDeleteReply = async (commentId: number, replyId: number) => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }

        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/comment/${replyId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setPost((prevPost) => {
                if (!prevPost) return prevPost;
                return {
                    ...prevPost,
                    comments: prevPost.comments.map((comment) =>
                        comment.id === commentId
                            ? {
                                ...comment,
                                replies: (comment.replies ?? []).filter((reply) => reply.id !== replyId),
                            }
                            : comment
                    ),
                };
            });
        } catch (error) {
            console.error('Error deleting reply:', error);
        }
    };

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const handleScroll = () => {
            setIsScrolling(true);
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setIsScrolling(false);
            }, 200);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timeoutId);
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolling(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div>
            <Navbar />
            <div className="ps-[290px] pt-[50px] mb-[50px]">
                <div
                    className={`fixed top-0 left-[180px] w-full z-10 transition-transform duration-300 ${isScrolling ? '-translate-y-full' : 'translate-y-0'
                        }`}
                >
                    <button
                        onClick={() => router.push('/pages/user/DashboardUser')}
                        className=" w-[80px] h-[80px] ms-[90px] text-center flex justify-center items-end">
                        <img src="../../../icons/back.svg" alt="" className='' />
                    </button>
                </div>
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : post ? (
                    <div className="w-[700px] p-[30px] bg-white border border-black rounded-[15px] mb-[20px] ms-[90px]">
                        <div className="flex justify-between w-full items-center">
                            <div className="flex">
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL}${post.profile}`}
                                    alt=""
                                    className="w-[40px] h-[40px] flex items-center justify-center rounded-full overflow-hidden"
                                />
                                <div className="ms-[10px] py-[1px]">
                                    <p className="text-[16px] font-ruda font-bold">{post.username}</p>
                                    <p className="text-[10px] font-ruda font-bold">{post.relative_time}</p>
                                </div>
                            </div>
                            <div className="relative">
                                <button
                                    onClick={() => handleAccount(post.id)}
                                    className="focus:outline-none"
                                >
                                    <img src="../../../icons/menu.svg" alt="menu" />
                                </button>
                                {activeDropdown === post.id && (
                                    <div
                                        className="absolute bg-[#F2F2F2] z-10 w-[150px] h-[80px] rounded-[15px] overflow-hidden -right-[60px]"
                                    >
                                        <button
                                            className="block px-4 py-2 text-primary hover:bg-gray-200 w-full text-center font-ruda"
                                        >
                                            View Account
                                        </button>
                                        <button
                                            className="block px-4 py-2 text-primary hover:bg-gray-200 w-full text-center font-ruda"
                                        >
                                            Report Account
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-[30px] text-[14px] font-ruda font-black">
                            <div className="ms-[50px]">
                                <h2>{post.title}</h2>
                                {post.photo && (
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL}${post.photo}`}
                                        alt={post.title}
                                        className="w-[300px] rounded-[15px] mt-[20px] shadow-md"
                                    />
                                )}
                            </div>
                            <div className="flex items-center justify-between mt-[20px] mb-[20px] gap-2">
                                <hr className='border-black w-full'/>
                                <p>Comment</p>
                                <hr className='border-black w-full' />
                            </div>
                            {post.comments && post.comments.length > 0 ? (
                                post.comments.map((comment, index: number) => (
                                    <div key={comment.id} className="mt-[10px] ">
                                        <div className="flex items-center justify-between">
                                            <div className='flex items-center'>
                                                <img
                                                    src={`${process.env.NEXT_PUBLIC_API_URL}${comment.profile}`}
                                                    alt=""
                                                    className="w-[30px] h-[30px] bg-cover rounded-full"
                                                />
                                                <div className="ms-[10px] flex items-center">
                                                    <p className="text-[14px] font-ruda font-bold">
                                                        {comment.username}
                                                    </p>
                                                    <div className="flex items-center ">
                                                        <div className='w-[2px] h-[2px] bg-black rounded-full mx-[5px]'></div>
                                                        <p className='text-[9px]'>{comment.relative_time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="text-red-500 font-ruda mt-[10px] mb-[10px] text-[8px] flex items-center"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                        <p className="mt-[10px] text-[14px] font-ruda ms-[40px]">{comment.content}</p>
                                        <button
                                            onClick={() => setVisibleComments((prev) => ({ ...prev, [comment.id]: !prev[comment.id] }))}
                                            className="text-primary font-ruda mt-[10px] mb-[10px] ms-[40px] text-[12px] flex items-center"
                                        >
                                            {visibleComments[comment.id] ? 'Hide reply' : 'Reply'}
                                            {comment.replies && comment.replies.length > 0 && (
                                                <span className="ml-[5px]">({comment.replies.length})</span>
                                            )}
                                        </button>

                                        {visibleComments[comment.id] && (
                                            <div className="mt-[10px] ms-[40px]">
                                                <div className="relative">
                                                    <input
                                                        type='text'
                                                        value={replies[comment.id] || ''}
                                                        onChange={(e) => handleReplyChange(comment.id, e.target.value)}
                                                        placeholder="Reply to comments ..."
                                                        className="w-[400px] h-[40px] bg-white border border-gray-300 px-[15px] relative text-sm outline-none rounded-full"
                                                    />
                                                    <button
                                                        onClick={() => handleReplySubmit(comment.id, post.id)}
                                                        className="mt-[5px] ms-[5px] text-white font-ruda bg-primary w-[100px] h-[40px] rounded-full"
                                                    >
                                                        send
                                                    </button>
                                                </div>

                                                {comment.replies && comment.replies.length > 0 && (
                                                    <div className="mt-[10px]">
                                                        {comment.replies.map((reply, replyIndex) => (
                                                            <div key={reply.id} className="mb-[10px] ms-[5px]">
                                                                <div className="flex items-center">
                                                                    <img
                                                                        src={`${process.env.NEXT_PUBLIC_API_URL}${reply.profile}`}
                                                                        alt=""
                                                                        className="w-[30px] h-[30px] bg-cover rounded-full"
                                                                    />
                                                                    <div className="ms-[10px] flex items-center">
                                                                        <p className="text-[16px] font-ruda font-bold">
                                                                            {reply.username}{' '}
                                                                            <span className="text-[8px] top-2">{reply.relative_time}</span>
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <p className="mt-[10px] text-[14px] font-ruda">{reply.content}</p>
                                                                {typeof window !== 'undefined' && reply.username.trim() === localStorage.getItem('username')?.trim() && (
                                                                    <button
                                                                        onClick={() => handleDeleteReply(comment.id, reply.id)}
                                                                        className="text-red-500 font-ruda mt-[10px] mb-[10px] text-[15px] flex items-center"
                                                                    >
                                                                        Delete Reply
                                                                    </button>
                                                                )}
                                                                <hr className='mt-[20px] mb-[20px] border-gray-300' />
                                                            </div>
                                                        ))}
                                                    </div>

                                                )}
                                            </div>
                                        )}
                                        <hr className='mt-[20px] mb-[20px] border-black' />
                                    </div>
                                ))
                            ) : (
                                <p className='text-center'>No comments found.</p>
                            )}

                            <div className={`fixed bottom-3 left-[381px] w-full z-10 transition-transform duration-300 ${isScrolling ? 'translate-y-full' : '-translate-y-0'
                                }`}>
                                <div className="w-[698px] relative h-[80px] bg-[#EEEEEE] py-[15px] px-[25px] rounded-[15px]">
                                    <div className="w-[650px] h-[50px] flex bg-white rounded-full overflow-hidden p-[5px] justify-between">
                                        <div className="w-[40px] h-[40px] rounded-full bg-primary">

                                        </div>
                                        <input
                                            type='text'
                                            autoComplete='off'
                                            value={newComment[post.id] || ''}
                                            onChange={(e) => handleNewCommentChange(post.id, e.target.value)}
                                            placeholder="Write a comment..."
                                            className='w-[500px] outline-none px-[15px]'
                                        />
                                        <button
                                            onClick={() => handleNewCommentSubmit(post.id)}
                                            className="text-white text-[20px] font-ruda bg-primary w-[100px] h-[40px] rounded-full"
                                        >
                                            Send
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p>Post not found.</p>
                )}
            </div>
        </div>
    );
};

export default ForumDetail;
