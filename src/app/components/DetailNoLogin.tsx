'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { ForumPost, Reply } from '@/app/types/types';
import { useRouter } from 'next/navigation';
import { Ellipse, Heart} from './svgs/page';
import ModalLogin from './ModalLogin';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const DetailForum = () => {
    const [post, setPost] = useState<ForumPost | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { postid } = useParams();
    const router = useRouter();
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
    const [visibleComments, setVisibleComments] = useState<number | null>(null);
    const [inputValue, setInputValue] = useState<string>('');
    const [sortOption, setSortOption] = useState<'terbaru' | 'terpopuler'>('terbaru');
    const [showLogin, setShowLogin] = useState(false);

    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.dropdown-container') && !target.closest('.dropdown-item')) {
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

    const handleShowDropdown = (postId: number) => {
        setActiveDropdown((prev) => (prev === postId ? null : postId));
    };


    const handleAkun = (akunid: number) => {
        router.push(`/pages/user/akun/${akunid}`);
    };

    // Get forum by id
    useEffect(() => {
        if (!postid) return;

        const fetchPostDetail = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/forum/nologin/${postid}`);
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

    const sortComments = (comments: any[]) => {
        if (!comments) return [];

        const sortedComments = [...comments];
        if (sortOption === 'terbaru') {
            return sortedComments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else if (sortOption === 'terpopuler') {
            return sortedComments.sort((a, b) => (b.replies?.length || 0) - (a.replies?.length || 0));
        }
        return sortedComments;
    };

    const getTotalComments = (forum: any) => {
        if (!forum.comments || !Array.isArray(forum.comments)) return 0;
        const commentsCount = forum.comments.length;
        const repliesCount = forum.comments.reduce((total: number, comment: any) => {
            return total + (comment.replies && Array.isArray(comment.replies) ? comment.replies.length : 0);
        }, 0);
        return commentsCount + repliesCount;
    };

    return (
        <div className="relative min-h-screen pb-20">
            {loading ? (
                <div className="w-[750px] h-[242px] bg-gray-300 rounded-[16px] p-[20px] animate-pulse">
                    <div className="flex items-center mb-3">
                        <div className="w-[40px] h-[40px] rounded-full bg-gray-400 animate-pulse"></div>
                        <div className="ms-3">
                            <div className="flex items-center">
                                <div className="w-[150px] h-[20px] bg-gray-400 animate-pulse me-2"></div>
                                <div className="w-[150px] h-[20px] bg-gray-400 animate-pulse"></div>
                            </div>
                            <div className="w-[150px] h-[10px] bg-gray-400 animate-pulse"></div>
                        </div>
                    </div>
                    <div className="w-full h-[50px] bg-gray-400 rounded animate-pulse"></div>
                    <div className="w-full h-[50px] bg-gray-400 rounded animate-pulse mt-4"></div>
                </div>
            ) : error ? (
                <div className="w-[700px] h-[100px] flex items-center justify-center bg-white border border-gray-300 border-t-0">
                    <p>{error}</p>
                </div>
            ) : post ? (
                <div className="w-[750px] p-[25px] bg-white dark:bg-hitam2 rounded-[16px] border border-hitam2 hover:shadow-lg transition-shadow relative z-0">
                    {/* Profil */}
                    <div className="flex justify-between w-full items-center">
                        <div className="flex">
                            <img
                                src={`${API_URL}${post.profile}`}
                                alt=""
                                className="w-[40px] h-[40px] object-cover rounded-full border border-hitam2"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                                }}
                            />
                            <div className="ms-[10px]">
                                <div className="flex items-center">
                                    <p className="text-[15px] font-ruda text-hitam2 dark:text-putih1 font-semibold me-[6px] cursor-pointer hover:underline" onClick={() => handleAkun(post.user_id)}>{post.name}</p>
                                    <Ellipse className="fill-black dark:fill-white" />
                                    <p className="text-[14px] font-ruda text-hitam3 dark:text-abu font-medium ms-[6px] cursor-pointer hover:underline" onClick={() => handleAkun(post.user_id)}>@{post.username}</p>
                                </div>
                                <p className="text-[9px] font-ruda text-hitam4 dark:text-putih3 font-semibold">{post.relative_time}</p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        <h2 className="text-[17px] font-ruda font-bold mt-1 text-hitam1 dark:text-abu">{post.title}</h2>
                        <p className="text-[15px] font-ruda font-medium mt-3 text-hitam1 dark:text-putih1">{post.description}</p>
                        <div className="mt-[5px] flex flex-wrap">
                            {post.category_name && (
                                <p className="py-[6px] px-[10px] text-[10px] font-ruda font-bold bg-putih3 dark:bg-hitam4 text-hitam2 dark:text-abu rounded-full me-[5px] mb-[5px]">
                                    {post.category_name}
                                </p>
                            )}
                            {post.tags && post.tags.map((tag: any) => (
                                <span key={tag.id} className="py-[6px] px-[10px] text-[10px] font-ruda font-bold bg-putih3 dark:bg-hitam4 text-hitam2 dark:text-abu rounded-full me-[5px] mb-[5px]">
                                    #{tag.name}
                                </span>
                            ))}
                        </div>
                        {post.photo && (
                            <div className="w-[500px] bg-white bg-opacity-50 backdrop-blur-70 rounded-[15px] mt-3 border border-gray-400 object-cover overflow-hidden">
                                <img src={`${API_URL}${post.photo}`} alt={post.title} className="w-full bg-cover" />
                            </div>
                        )}
                        <div className="flex items-center dark:text-abu mt-3">
                            <button onClick={() => setShowLogin(true)} className="flex font-ruda items-center text-[13px] me-[27px]">
                                {post.liked ? <Heart className="fill-ungu me-[5px]" /> : <Heart className="fill-abu me-[5px]" />}
                                {post.like} Like
                            </button>
                            <button className="flex font-ruda items-center text-[13px]">
                                <span>{getTotalComments(post)} Komentar</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-5 mb-4">
                        <h3 className="text-[16px] font-ruda text-hitam1 dark:text-abu">Komentar</h3>
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value as 'terbaru' | 'terpopuler')}
                            className="bg-putih1 dark:bg-hitam3 text-hitam1 dark:text-abu text-[14px] font-ruda p-1 rounded outline-none"
                        >
                            <option value="terbaru">Terbaru</option>
                            <option value="terpopuler">Terpopuler</option>
                        </select>
                    </div>

                    {/* Komentar */}
                    <div>
                        {post.comments && post.comments.length > 0 ? (
                            sortComments(post.comments).map((comment) => (
                                <div key={comment.id} className="comment-container w-full bg-putih1 dark:bg-hitam3 rounded-[10px] p-[10px] mt-3">
                                    <div className="flex items-center justify-between relative">
                                        <div className="flex">
                                            <img
                                                src={`${API_URL}${comment.profile}`}
                                                alt=""
                                                className="w-[35px] h-[35px] object-cover rounded-full border border-hitam2"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                                                }}
                                            />
                                            <div className="ms-[10px]">
                                                <div className="flex items-center">
                                                    <p className="text-[13px] font-ruda text-hitam2 dark:text-putih1 font-semibold me-[6px] cursor-pointer hover:underline" onClick={() => handleAkun(comment.user_id)}>{comment.name}</p>
                                                    <Ellipse className="fill-black dark:fill-white" />
                                                    <p className="text-[12px] font-ruda text-hitam3 dark:text-abu font-medium ms-[6px] cursor-pointer hover:underline" onClick={() => handleAkun(comment.user_id)}>@{comment.username}</p>
                                                </div>
                                                <p className="text-[9px] font-ruda text-hitam4 dark:text-putih3 font-semibold">{comment.relative_time}</p>
                                            </div>
                                        </div>

                                    </div>
                                    <div className="ms-[45px] text-wrap mt-2">
                                        <p className="text-[14px] font-ruda text-hitam1 dark:text-putih3 text-wrap">{comment.content}</p>
                                        <div className="flex items-center">
                                            <hr className="w-[15px] me-1 border border-blue-900 dark:border-abu" />
                                            <button
                                                onClick={() => {
                                                    setVisibleComments((prev) => (prev === comment.id ? null : comment.id));
                                                    setInputValue('');
                                                }}
                                                className="text-blue-900 dark:text-abu text-[12px] hover:underline"
                                            >
                                                {visibleComments === comment.id ? 'Tutup Balasan' : 'Lihat Balasan'}
                                                {comment.replies && comment.replies.length > 0 && <span className="ms-[2px]">({comment.replies.length})</span>}
                                            </button>
                                        </div>
                                    </div>

                                    {visibleComments === comment.id && comment.replies && comment.replies.length > 0 && (
                                        <div className="mt-[10px] ms-[45px]">
                                            {comment.replies.map((reply: Reply) => (
                                                <div key={reply.id} className="relative mt-3">
                                                    <div className="flex items-center justify-between pe-10">
                                                        <div className="flex">
                                                            <img
                                                                src={`${API_URL}${reply.profile}`}
                                                                alt=""
                                                                className="w-[35px] h-[35px] object-cover rounded-full border border-hitam2"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                                                                }}
                                                            />
                                                            <div className="ms-[10px]">
                                                                <div className="flex items-center">
                                                                    <p className="text-[13px] font-ruda text-hitam2 dark:text-putih1 font-semibold me-[6px] cursor-pointer hover:underline" onClick={() => handleAkun(reply.user_id)}>{reply.name}</p>
                                                                    <Ellipse className="fill-black dark:fill-white" />
                                                                    <p className="text-[12px] font-ruda text-hitam3 dark:text-abu font-medium ms-[6px] cursor-pointer hover:underline" onClick={() => handleAkun(reply.user_id)}>@{reply.username}</p>
                                                                </div>
                                                                <p className="text-[9px] font-ruda text-hitam4 dark:text-putih3 font-semibold">{reply.relative_time}</p>
                                                            </div>
                                                        </div>

                                                    </div>
                                                    <div className="ms-[45px] text-wrap mt-1">
                                                        <p className="text-[14px] font-ruda text-hitam1 dark:text-putih3 text-wrap">{reply.content}</p>
                                                        <div className="flex items-center mt-1">
                                                            <button
                                                                onClick={() => {
                                                                    setInputValue(`@${reply.username} `);
                                                                }}
                                                                className="text-blue-900 dark:text-abu text-[12px] hover:underline"
                                                            >
                                                                Balas
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-center mb-5 text-hitam1 dark:text-putih1">Tidak ada komentar.</p>
                        )}
                    </div>
                </div>
            ) : (
                <p>Tidak ada postingan.</p>
            )}

            {/* Input Fixed */}
            {post && (
                <div className="fixed bottom-2 w-[780px] p-4 bg-white dark:bg-hitam2 z-10 rounded-[16px] border border-hitam2 -ms-[15px] flex justify-center">
                    <div className="w-[650px] h-[45px] bg-putih3 dark:bg-hitam3 flex overflow-hidden items-center px-2 rounded-[16px] relative">
                        <input
                            type="text"
                            autoComplete="off"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder='Ketik disini untuk komentar...'
                            className="w-[600px] h-[35px] bg-putih3 dark:bg-hitam3 outline-none px-[15px] text-[16px] font-sans text-hitam1 dark:text-abu placeholder-hitam4 dark:placeholder-gray-600"
                        />
                    </div>
                    <button
                        onClick={() => setShowLogin(true)}
                        className={`w-[45px] h-[45px] rounded-[10px] ms-2 flex items-center justify-center ${inputValue.trim() ? 'bg-ungu text-white' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
                        disabled={!inputValue.trim()}
                    >
                        <img src="../../../icons/paperplane.svg" alt="" />
                    </button>
                </div>
            )}

            <ModalLogin isOpen={showLogin} onClose={() => setShowLogin(false)} />
        </div>
    );
};

export default DetailForum;