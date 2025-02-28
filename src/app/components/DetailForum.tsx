'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { ForumPost, User, DecodedToken } from '@/app/types/types';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Alert from './Alert';
import Modal from './Modal';

const DetailForum = () => {
    const [post, setPost] = useState<ForumPost | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState<{ [key: number]: string }>({});
    const { postid } = useParams();
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
    const [visibleComments, setVisibleComments] = useState<{ [key: number]: boolean }>({});
    const [replies, setReplies] = useState<{ [key: number]: string }>({});
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [visibleSubReplyInput, setVisibleSubReplyInput] = useState<{ [key: number]: boolean }>({});
    const [subReplies, setSubReplies] = useState<{ [key: number]: string }>({});
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [showReportModal, setShowReportModal] = useState<boolean>(false);
    const [showReportModalForum, setShowReportModalForum] = useState<boolean>(false);
    const [reportedUserId, setReportedUserId] = useState<number | null>(null);
    const [reportedForumId, setReportedForumId] = useState<number | null>(null);
    const [reason, setReason] = useState<string>('');
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('error');
    const [alertMessage, setAlertMessage] = useState('');

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
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/forum/${postid}`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                });
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
                name: response.data.comment.name,
                content: response.data.comment.content,
                replies: [],
            };

            setPost((prevPost) => {
                if (!prevPost) return prevPost;
                return {
                    ...prevPost,
                    comments: [...(prevPost.comments || []), newCommentData],
                };
            });

            setNewComment((prev) => ({ ...prev, [postId]: '' }));
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
    };

    const handleNewCommentChange = (postId: number, content: string) => {
        setNewComment((prev) => ({
            ...prev,
            [postId]: content,
        }));
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

    //reply
    const handleReplySubmit = async (commentId: number, postId: number, parentReplyId: number | null = null) => {
        const replyContent = parentReplyId ? subReplies[parentReplyId] : replies[commentId];
        if (!replyContent) return;

        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }

        const formData = new FormData();
        formData.append('parent_id', commentId.toString());
        formData.append('content', replyContent);

        if (parentReplyId !== null) {
            formData.append('parent_reply_id', parentReplyId.toString());
        }

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
                name: response.data.reply.name,
                content: response.data.reply.content,
                relative_time: response.data.reply.relative_time,
                created_at: response.data.reply.created_at,
                user_id: response.data.reply.user_id,
                parent_reply_id: parentReplyId,
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

            if (parentReplyId) {
                setSubReplies((prev) => ({ ...prev, [parentReplyId]: '' }));
            } else {
                setReplies((prev) => ({ ...prev, [commentId]: '' }));
            }
        } catch (error) {
            console.error('Error submitting reply:', error);
        }
    };

    const handleReplyChange = (commentId: number, content: string) => {
        setReplies((prev) => ({
            ...prev,
            [commentId]: content,
        }));
    };

    //delete reply
    const handleDeleteReply = async (commentId: number, replyId: number) => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }

        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/comment/reply/${replyId}`, {
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

    const handleAccountDropdown = (postId: number) => {
        console.log(`Toggling dropdown for post ID: ${postId}`);
        setActiveDropdown((prev) => (prev === postId ? null : postId));
    };

    const handleAkun = (akunid: number) => {
        console.log(`Navigating to account with ID: ${akunid}`);
        router.push(`/pages/user/akun/${akunid}`);
    };

    const getCurrentUserId = (): number | null => {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const decoded: DecodedToken = jwtDecode(token);
            return decoded.id;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    };

    useEffect(() => {
        const userId = getCurrentUserId();
        if (userId) {
            setCurrentUserId(userId);
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedUsername = localStorage.getItem('username');
            setUsername(storedUsername);
        }
    }, []);

    const toggleSubReplyInput = (replyId: number) => {
        setVisibleSubReplyInput((prev) => ({
            ...prev,
            [replyId]: !prev[replyId],
        }));
    };

    const handleLikePost = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/forum/${postid}/like`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setIsLiked(response.data.isLiked);
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleReportAccount = (userId: number) => {
        setReportedUserId(userId);
        setShowReportModal(true);
    };

    const handleSubmitReport = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setAlertType('error');
            setAlertMessage('Anda harus login terlebih dahulu');
            setShowAlert(true);
            return;
        }

        try {
            const checkResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/report/akun/check?reported_id=${reportedUserId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (checkResponse.data.exists) {
                setAlertType('warning');
                setAlertMessage('Anda sudah mereport akun ini dan laporan sedang diproses.');
                setShowAlert(true);
                setReason('');
                setShowReportModal(false);
                setTimeout(() => setShowAlert(false), 2000);
                return;
            }

            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/report/akun`,
                { reported_id: reportedUserId, reason: reason },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setAlertType('success');
            setAlertMessage('Report berhasil dikirim');
            setShowAlert(true);
            setShowReportModal(false);
            setReason('');

            setTimeout(() => setShowAlert(false), 2000);
        } catch (err) {
            console.error('Error:', err);
            setAlertType('error');
            setAlertMessage('Gagal mengirim report');
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 2000);
        }
    };

    const handleReportForum = (forumID: number) => {
        setReportedForumId(forumID);
        setShowReportModalForum(true);
    };

    const handleSubmitReportForum = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setAlertType('error');
            setAlertMessage('Anda harus login terlebih dahulu');
            setShowAlert(true);
            return;
        }

        try {
            const checkResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/report/forum/check?forum_id=${reportedForumId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (checkResponse.data.exists) {
                setAlertType('warning');
                setAlertMessage('Anda sudah mereport postingan ini dan laporan sedang diproses.');
                setShowAlert(true);
                setReason('');
                setShowReportModalForum(false);
                setTimeout(() => setShowAlert(false), 2000);
                return;
            }

            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/report/forum`,
                { forum_id: reportedForumId, reason: reason },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setAlertType('success');
            setAlertMessage('Report berhasil dikirim');
            setShowAlert(true);
            setShowReportModalForum(false);
            setReason('');

            setTimeout(() => setShowAlert(false), 2000);
        } catch (err) {
            console.error('Error:', err);
            setAlertType('error');
            setAlertMessage('Gagal mengirim report');
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 2000);
        }
    };

    const handleCloseReportModal = () => {
        setShowReportModal(false);
        setReason('');
    };

    const handleCloseReportModalForum = () => {
        setShowReportModalForum(false);
        setReason('');
    };

    return (
        <div>
            {showAlert && (
                <Alert
                    type={alertType}
                    message={alertMessage}
                    onClose={() => setShowAlert(false)}
                    className="mt-4"
                />
            )}
            {loading ? (
                <div className='w-[700px] h-[100px] flex items-center justify-center bg-white border border-gray-300 border-t-0 '>
                    <p>loading</p>
                </div>
            ) : error ? (
                <div className='w-[700px] h-[100px] flex items-center justify-center bg-white border border-gray-300 border-t-0 '>
                    <p>{error}</p>
                </div>
            ) : post ? (
                <div className="w-[700px] ">
                    {/* profil */}
                    <div className="flex justify-between w-full items-center px-[30px] pt-[20px]">
                        <div className="flex">
                            <div className="w-[40px] h-[40px] rounded-full bg-white overflow-hidden border border-gray-300 bg-cover flex items-center justify-center">
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL}${post.profile}`}
                                    alt=""
                                    className="w-[40px] h-[40px]"
                                    onError={(e) => {
                                        console.log(`Image not found for user: ${post.profile}, setting to default.`);
                                        (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                                    }}
                                />
                            </div>
                            <div className="ms-[10px] py-[1px]">
                                <div className="flex gap-1">
                                    <p className="text-[14px] font-ruda font-bold">{post.name}</p>
                                    <p className="text-[14px] font-sans text-gray-500 -mt-[2px]">@{post.username}</p>
                                </div>
                                <p className="text-[10px] font-sans">{post.relative_time}</p>
                            </div>
                        </div>
                        {/* report */}
                        <div className="relative">
                            <button
                                onClick={() => handleAccountDropdown(post.id)}
                                className="focus:outline-none w-[25px]"
                            >
                                <img src="../../../icons/menu.svg" alt="menu" />
                            </button>
                            {activeDropdown && (
                                <div
                                    className="absolute bg-[#F2F2F2] w-[150px] rounded-[15px] overflow-hidden -right-[60px] dropdown-container"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAkun(post.user_id);
                                        }}
                                        className="block px-4 py-2 text-primary hover:bg-gray-200 w-full text-center font-ruda text-[12px]"
                                    >
                                        Lihat akun
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleReportForum(post.id);
                                        }}
                                        className="block px-4 py-2 text-primary hover:bg-gray-200 w-full text-center font-ruda text-[12px]"
                                    >
                                        Laporkan postingan
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleReportAccount(post.user_id)
                                        }}
                                        className="block px-4 py-2 text-primary hover:bg-gray-200 w-full text-center font-ruda text-[12px]"
                                    >
                                        Laporkan akun
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* content */}
                    <div className="px-[30px] ">
                        <div className="font-sans text-[16px] ">
                            <h2>{post.title}</h2>
                            {post.photo && (
                                <div className="w-full max-h-[600px] bg-white bg-opacity-50 backdrop-blur-70 rounded-[15px] mt-[10px] border border-gray-400 flex justify-center items-center overflow-hidden">
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL}${post.photo}`}
                                        alt={post.title}
                                        className="w-full bg-cover"
                                    />
                                </div>
                            )}
                        </div>
                        < div className=" mt-4" >
                            {
                                post.tags && post.tags.length > 0 ? (
                                    post.tags.map((tag) => (
                                        <span key={tag.id} className="bg-gray-300 text-[12px] py-1 px-2 me-1 rounded-md" >
                                            #{tag.name}
                                        </span>
                                    ))
                                ) : (
                                    <span className="" > </span>
                                )}
                        </div>
                        {/* like&komen */}
                        <div className="mt-[15px] flex">
                            <button onClick={handleLikePost} className='font-ruda mb-[10px] flex items-center text-[15px] me-2'>
                                <img src={isLiked ? "../../../icons/liked.svg" : "../../../icons/like.svg"} alt=""
                                    className="w-[15px] h-[15px] mr-[5px] text-primary font-ruda flex items-center text-[15px]" />
                                <p className='mt-[1px]'>{post.like}</p>
                            </button>
                            <button
                                className="font-ruda mb-[10px] flex items-center text-[15px]"
                            >
                                <img src="../../../icons/comment.svg"
                                    className="w-[15px] h-[15px] mr-[5px]"
                                />
                                <p className='mt-[1px]'>{post.comments ? post.comments.length + post.comments.reduce((acc, comment) => acc + (comment.replies ? comment.replies.length : 0), 0) : 0}</p>
                            </button>
                        </div>
                    </div>

                    {/* input komen */}
                    <div className="w-full relative mt-[10px]">
                        <div className="w-full h-[80px] flex  overflow-hidden justify-between items-center border-gray-400 border-t px-[30px]">
                            <div className="w-[40px] h-[40px] rounded-full bg-white overflow-hidden border border-gray-300 bg-cover flex items-center justify-center">
                                {user && (
                                    <img
                                        src={user.profile ? `http://localhost:5000${user.profile}` : 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg'}
                                        alt="User profile"
                                        className="w-[40px] h-[40px]"
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
                                placeholder="Posting komentar..."
                                className='w-[520px] h-[35px] outline-none px-[15px] font-sans border-b'
                            />
                            <button
                                onClick={() => handleNewCommentSubmit(post.id)}
                                className={`text-[14px] font-ruda w-[70px] h-[30px] rounded-full ${newComment[post.id] ? 'bg-primary text-white' : 'bg-gray-300 text-gray-700 cursor-not-allowed'}`}
                                disabled={!newComment[post.id]}
                            >
                                Posting
                            </button>
                        </div>
                    </div>

                    <div className="mt-[10px] text-[16px] font-sans">
                        {/* komen */}
                        {post.comments && post.comments.length > 0 ? (
                            post.comments.map((comment) => (
                                <div key={comment.id} className="comment-container pt-[10px] pb-[10px] border-t border-gray-400 relative">
                                    {/* Garis vertikal utama */}
                                    {visibleComments[comment.id] && comment.replies && comment.replies.length > 0 && (
                                        <div
                                            className="absolute left-[50px] top-[50px] bottom-0 w-[1px] bg-gray-300"

                                        ></div>
                                    )}

                                    {/* Profil komentar utama */}
                                    <div className="flex items-center justify-between px-[30px] relative">
                                        <div className='flex items-center'>
                                            <div className="w-[40px] h-[40px] rounded-full bg-white overflow-hidden border border-gray-300 flex items-center justify-center">
                                                <img
                                                    src={`${process.env.NEXT_PUBLIC_API_URL}${comment.profile}`}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        console.log(`Image not found for user: ${comment.profile}, setting to default.`);
                                                        (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                                                    }}
                                                />
                                            </div>
                                            <div className="ms-[10px] flex items-center">
                                                <div className="flex gap-1">
                                                    <p className="text-[14px] font-ruda font-black">{comment.name}</p>
                                                    <p className="text-[14px] font-sans text-gray-500 -mt-[2px]">@{comment.username}</p>
                                                </div>
                                                <div className="flex items-center ">
                                                    <div className='w-[2px] h-[2px] bg-black rounded-full mx-[5px]'></div>
                                                    <p className='text-[9px]'>{comment.relative_time}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {comment.user_id === currentUserId && (
                                            <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="text-red-500 font-ruda text-[12px] flex items-center"
                                            >
                                                <img src="../../../icons/delete.svg" alt="" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Konten komentar */}
                                    <div className="w-full ps-[80px] pe-[50px]">
                                        <p className="text-[15px] font-sans">{comment.content}</p>
                                        <button
                                            onClick={() => setVisibleComments((prev) => ({ ...prev, [comment.id]: !prev[comment.id] }))}
                                            className="text-primary font-ruda mt-[10px] -ms-[7px] text-[12px] flex items-center hover:bg-cyan-400 rounded-full px-2 transition-colors"
                                        >
                                            {visibleComments[comment.id] ? 'Tutup Balasan' : 'Balas'}
                                            {comment.replies && comment.replies.length > 0 && (
                                                <span className="ms-[5px]">({comment.replies.length})</span>
                                            )}
                                        </button>
                                    </div>

                                    {/* Form balasan */}
                                    {visibleComments[comment.id] && (
                                        <div className="mt-[10px] ms-[78px]">
                                            <div className="w-[500px] h-[40px] flex justify-between items-center border-b ms-[40px]">
                                                <input
                                                    type='text'
                                                    value={replies[comment.id] !== undefined ? replies[comment.id] : `@${comment.username} `}
                                                    onChange={(e) => handleReplyChange(comment.id, e.target.value)}
                                                    placeholder="Balas komentar ..."
                                                    className="w-full px-[15px] text-sm outline-none"
                                                />
                                                <button
                                                    onClick={() => handleReplySubmit(comment.id, post.id)}
                                                    className={`rounded-full font-ruda text-[14px] w-[80px] h-[30px] ${replies[comment.id] ? 'bg-primary text-white' : 'bg-gray-300 text-gray-700 cursor-not-allowed'
                                                        }`}
                                                    disabled={!replies[comment.id]}
                                                >
                                                    Balas
                                                </button>
                                            </div>

                                            {/* List balasan */}
                                            {visibleComments[comment.id] && comment.replies && comment.replies.length > 0 && (
                                                <div className="mt-[10px]">
                                                    {comment.replies.map((reply) => (
                                                        <div key={reply.id} className="relative mt-3">
                                                            {/* Garis horizontal untuk reply */}
                                                            <div className="absolute -left-[28px] top-[15px] w-[29px] h-[1.5px] bg-gray-300"></div>

                                                            <div className="flex items-center justify-between pe-10">
                                                                <div className="flex items-center">
                                                                    <div className="w-[30px] h-[30px] rounded-full bg-white overflow-hidden border border-gray-300 flex items-center justify-center">
                                                                        <img
                                                                            src={`${process.env.NEXT_PUBLIC_API_URL}${reply.profile}`}
                                                                            alt=""
                                                                            className="w-full h-full object-cover"
                                                                            onError={(e) => {
                                                                                console.log(`Image not found for user: ${reply.profile}, setting to default.`);
                                                                                (e.target as HTMLImageElement).src =
                                                                                    'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div className="ms-[10px] flex items-center">
                                                                        <div className="flex gap-1">
                                                                            <p className="text-[14px] font-ruda font-black">{reply.name}</p> {/* Display the name */}
                                                                            <p className="text-[14px] font-sans text-gray-500 -mt-[2px]">@{reply.username}</p>
                                                                        </div>
                                                                        <div className="flex items-center">
                                                                            <div className="w-[2px] h-[2px] bg-black rounded-full mx-[5px]"></div>
                                                                            <p className="text-[9px]">{reply.relative_time}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {reply && comment && reply.user_id === currentUserId && (
                                                                    <button
                                                                        onClick={() => handleDeleteReply(comment.id, reply.id)}
                                                                        className="text-red-500 font-ruda mt-[10px] mb-[10px] text-[12px] flex items-center"
                                                                    >
                                                                        <img src="../../../icons/delete.svg" alt="" />
                                                                    </button>
                                                                )}
                                                            </div>

                                                            <p className="text-[14px] font-sans ms-[40px] -mt-[7px]">{reply.content}</p>

                                                            {/* Button untuk balasan balasan */}
                                                            <div className="ml-[40px] mt-2">
                                                                <button
                                                                    onClick={() => toggleSubReplyInput(reply.id)}
                                                                    className="text-primary font-ruda text-[12px]"
                                                                >
                                                                    Balas
                                                                </button>
                                                            </div>
                                                            {visibleSubReplyInput[reply.id] && (
                                                                <div className="mt-2 ml-[50px] flex items-center">
                                                                    <input
                                                                        type="text"
                                                                        value={subReplies[reply.id] !== undefined ? subReplies[reply.id] : `@${reply.username} `}
                                                                        onChange={(e) => setSubReplies((prev) => ({ ...prev, [reply.id]: e.target.value }))}
                                                                        placeholder="Balas balasan..."
                                                                        className="w-[350px] px-[15px] text-sm outline-none border-b"
                                                                    />
                                                                    <button
                                                                        onClick={() => {
                                                                            handleReplySubmit(comment.id, post.id, reply.id);
                                                                            setSubReplies((prev) => ({ ...prev, [reply.id]: '' }));
                                                                        }}
                                                                        className={`rounded-full font-ruda text-[14px] w-[80px] h-[30px] ml-2 ${subReplies[reply.id] && subReplies[reply.id].trim() !== `@${reply.username}`
                                                                            ? 'bg-primary text-white'
                                                                            : 'bg-gray-300 text-gray-700 cursor-not-allowed'
                                                                            }`}
                                                                        disabled={
                                                                            !subReplies[reply.id] ||
                                                                            subReplies[reply.id].trim() === `@${reply.username}`
                                                                        }
                                                                    >
                                                                        Balas
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className='text-center mb-5'>Tidak ada komentar.</p>
                        )}

                    </div>
                </div>
            ) : (
                <p>Post not found.</p>
            )}
            <Modal isOpen={showReportModal} onClose={handleCloseReportModal}>
                <div className="p-2 flex flex-col justify-center" >
                    <h2 className="text-xl font-black mb-4 text-center font-ruda "> Laporkan Akun </h2>
                    <textarea
                        className="w-full p-2 border border-gray-300 rounded mb-4 outline-none"
                        placeholder="Alasan Report"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                    <div className="flex justify-end gap-2 mt-2" >
                        <button
                            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                            onClick={handleCloseReportModal}
                        >
                            Batal
                        </button>
                        < button
                            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                            onClick={handleSubmitReport}
                        >
                            Kirim
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={showReportModalForum} onClose={handleCloseReportModalForum}>
                <div className="p-2 flex flex-col justify-center" >
                    <h2 className="text-xl font-black mb-4 text-center font-ruda "> Laporkan Postingan </h2>
                    <textarea
                        className="w-full p-2 border border-gray-300 rounded mb-4 outline-none"
                        placeholder="Alasan Report"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                    <div className="flex justify-end gap-2 mt-2" >
                        <button
                            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                            onClick={handleCloseReportModalForum}
                        >
                            Batal
                        </button>
                        < button
                            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                            onClick={handleSubmitReportForum}
                        >
                            Kirim
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default DetailForum