'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '@/app/components/Navbar';
import { useParams } from 'next/navigation';
import { ForumPost, User } from '@/app/types/types';
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
    const [user, setUser] = useState<User | null>(null);

    //get profile
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios
                .get(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    setUser(response.data);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Failed to fetch user profile:', error);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

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
                id: response.data.reply.id,
                profile: response.data.reply.profile,
                username: response.data.reply.username,
                content: response.data.reply.content,
                relative_time: response.data.reply.relative_time,
                created_at: response.data.reply.created_at,
                user_id: response.data.reply.user_id,
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
    
            // Kosongkan input balasan
            setReplies((prev) => ({ ...prev, [commentId]: '' }));
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
                ...response.data.comment,
                profile: response.data.comment.profile,
                username: response.data.comment.username,
                content: response.data.comment.content,
                replies: [],
            };

            // Perbarui state post dengan menambahkan komentar baru
            setPost((prevPost) => {
                if (!prevPost) return prevPost;
                return {
                    ...prevPost,
                    comments: [...(prevPost.comments || []), newCommentData],
                };
            });

            // Kosongkan input komentar
            setNewComment((prev) => ({ ...prev, [postId]: '' }));
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
            <div className="ps-[270px] pt-[50px] mb-[50px]">
                <div
                    className={`fixed top-0 left-[180px] w-full z-10 transition-transform duration-300 ${isScrolling ? '-translate-y-full' : 'translate-y-0'
                        }`}
                >
                    <button
                        onClick={() => router.back()}
                        className=" w-[80px] h-[80px] ms-[90px] text-center flex justify-center items-end">
                        <img src="../../../icons/back.svg" alt="" className='' />
                    </button>
                </div>
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : post ? (
                    <div className="w-[700px] p-[30px] bg-white border border-black rounded-[10px] mb-[20px] ms-[85px]">
                        <div className="flex justify-between w-full items-center">
                            <div className="flex">
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL}${post.profile}`}
                                    alt=""
                                    className="w-[40px] h-[40px] flex items-center justify-center rounded-full overflow-hidden"
                                    onError={(e) => {
                                        console.log(`Image not found for user: ${post.profile}, setting to default.`);
                                        (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                                    }}
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
                                            Lihat akun
                                        </button>
                                        <button
                                            className="block px-4 py-2 text-primary hover:bg-gray-200 w-full text-center font-ruda"
                                        >
                                            Laporkan
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-[30px] text-[16px] font-sans">
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
                            <div className="mt-[15px] flex ms-[50px]">
                                <div className="text-primary font-ruda mt-[10px] mb-[10px] flex items-center text-[15px]">
                                    <button>
                                        <img src="../../../icons/like.svg" alt=""
                                            className="w-[15px] h-[15px] mr-[20px]" />
                                    </button>
                                </div>
                                <button
                                    className="font-ruda mt-[10px] mb-[10px] flex items-center text-[15px]"
                                >
                                    <img src="../../../icons/comment.svg"
                                        className="w-[15px] h-[15px] mr-[5px]"
                                    />
                                    <p className='mt-[1px]'>{post.comments ? post.comments.length + post.comments.reduce((acc, comment) => acc + (comment.replies ? comment.replies.length : 0), 0) : 0}</p>
                                </button>
                            </div>
                            <div className="flex items-center justify-between mt-[20px] mb-[20px] gap-2">
                                <hr className='border-black w-full' />
                                <p>Komentar</p>
                                <hr className='border-black w-full' />
                            </div>
                            {post.comments && post.comments.length > 0 ? (
                                post.comments.map((comment, index: number) => (
                                    <div key={comment.id || index} className="mt-[10px] ">
                                        <div className="flex items-center justify-between">
                                            <div className='flex items-center'>
                                                <img
                                                    src={`${process.env.NEXT_PUBLIC_API_URL}${comment.profile}`}
                                                    alt=""
                                                    className="w-[30px] h-[30px] bg-cover rounded-full"
                                                    onError={(e) => {
                                                        console.log(`Image not found for user: ${comment.profile}, setting to default.`);
                                                        (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                                                    }}
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
                                        <p className="mt-[5px] text-[16px] font-sans ms-[40px]">{comment.content}</p>
                                        <button
                                            onClick={() => setVisibleComments((prev) => ({ ...prev, [comment.id]: !prev[comment.id] }))}
                                            className="text-primary font-ruda mt-[10px] mb-[10px] ms-[40px] text-[12px] flex items-center"
                                        >
                                            {visibleComments[comment.id] ? 'Sembunyikan balasan' : 'Balas'}
                                            {comment.replies && comment.replies.length > 0 && (
                                                <span className="ml-[5px]">({comment.replies.length})</span>
                                            )}
                                        </button>

                                        {visibleComments[comment.id] && (
                                            <div className="mt-[10px] ms-[40px]">
                                                <div className="relative flex">
                                                    <input
                                                        type='text'
                                                        value={replies[comment.id] || ''}
                                                        onChange={(e) => handleReplyChange(comment.id, e.target.value)}
                                                        placeholder="Balas komentar ..."
                                                        className="w-[400px] bg-white border border-gray-300 px-[15px] text-sm outline-none rounded-full h-[40px] rounded-e-none"
                                                    />
                                                    <button
                                                        onClick={() => handleReplySubmit(comment.id, post.id)}
                                                        className="rounded-s-none text-white font-ruda bg-primary w-[100px] h-[40px] rounded-full"
                                                    >
                                                        kirim
                                                    </button>
                                                </div>

                                                {comment.replies && comment.replies.length > 0 && (
                                                    <div className="mt-[10px]">
                                                        {comment.replies.map((reply, replyIndex) => (
                                                            <div key={`${reply.id}-${replyIndex}`} className="mb-[10px] ms-[5px]">
                                                                <div className="flex items-center">
                                                                    <img
                                                                        src={`${process.env.NEXT_PUBLIC_API_URL}${reply.profile}`}
                                                                        alt=""
                                                                        className="w-[30px] h-[30px] bg-cover rounded-full"
                                                                        onError={(e) => {
                                                                            console.log(`Image not found for user: ${reply.profile}, setting to default.`);
                                                                            (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                                                                        }}
                                                                    />
                                                                    <div className="ms-[10px] flex items-center">
                                                                        <p className="text-[14px] font-ruda font-bold">
                                                                            {reply.username}
                                                                        </p>
                                                                        <div className="flex items-center ">
                                                                            <div className='w-[2px] h-[2px] bg-black rounded-full mx-[5px]'></div>
                                                                            <p className='text-[9px]'>{reply.relative_time}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <p className="mt-[5px] text-[14px] font-sans ms-[40px] me-[10px]">{reply.content}</p>
                                                                {typeof window !== 'undefined' && reply && reply.username && reply.username.trim() === localStorage.getItem('username')?.trim() && (
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

                            <div className={`fixed bottom-3 left-[271px] ms-[85px] w-full z-10 transition-transform duration-300 ${isScrolling ? 'translate-y-full' : '-translate-y-0'}`}>
                                <div className="w-[698px] relative h-[80px] bg-[#EEEEEE] py-[15px] px-[25px] rounded-[15px]">
                                    <div className="w-[650px] h-[50px] flex bg-white rounded-full overflow-hidden p-[5px] justify-between">
                                        <div className="w-[40px] h-[40px] rounded-full bg-primary overflow-hidden">
                                            {user && (
                                                <img
                                                    src={user.profile ? `http://localhost:5000${user.profile}` : 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg'}
                                                    alt="User profile"
                                                    className="w-[100px]"
                                                    onError={(e) => {
                                                        console.log(`Image not found for user: ${user.profile}, setting to default.`);
                                                        (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <input
                                            type='text'
                                            autoComplete='off'
                                            value={newComment[post.id] || ''}
                                            onChange={(e) => handleNewCommentChange(post.id, e.target.value)}
                                            placeholder="Berikan komentar..."
                                            className='w-[500px] outline-none px-[15px]'
                                        />
                                        <button
                                            onClick={() => handleNewCommentSubmit(post.id)}
                                            className="text-white text-[16px] font-ruda bg-primary w-[100px] h-[40px] rounded-full"
                                        >
                                            Kirim
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
