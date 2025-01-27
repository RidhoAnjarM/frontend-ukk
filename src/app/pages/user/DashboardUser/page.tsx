'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import { ForumPost } from '@/app/types/types';

const DashboardUser = () => {
    const router = useRouter();
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isScrolling, setIsScrolling] = useState<boolean>(false);
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/forum/`)
                setPosts(response.data);
            } catch (err) {
                setError('Failed to fetch forum posts.');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const handleCommentClick = (postid: number) => {
        router.push(`/pages/user/forum/${postid}`);
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

    return (
        <div>
            <Navbar />
            <div className="ps-[290px] pt-[80px]">
                <div
                    className={`fixed top-0 left-[250px] w-full z-10 transition-transform duration-300 ${isScrolling ? '-translate-y-full' : 'translate-y-0'
                        }`}
                >
                    <div className="bg-black backdrop-blur-md bg-opacity-20 w-[120px] ms-[100px] text-center rounded-ee-[15px] rounded-bl-[15px]">
                        <h1 className="text-[30px] text-primary font-ruda font-black">For You</h1>
                    </div>
                </div>
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : posts.length > 0 ? (
                    posts.map((post: ForumPost) => (
                        <div key={post.id} className="w-[700px] p-[30px] bg-white border border-black rounded-[15px] mb-[20px] ms-[85px]">
                            <div className="flex justify-between w-full items-center">
                                <div className="flex">
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL}${post.profile}`}
                                        alt=""
                                        className="w-[40px] h-[40px] bg-cover rounded-full"
                                    />
                                    <div className="ms-[10px] py-[1px]">
                                        <p className="text-[16px] font-ruda font-bold">{post.username}</p>
                                        <p className="text-[10px] font-ruda font-bold">{post.relative_time}</p>
                                        <p>{post.category_name}</p>
                                    </div>
                                </div>
                                <div className="relative dropdown-container">
                                    <button
                                        onClick={() => handleAccount(post.id)}
                                        className="focus:outline-none"
                                    >
                                        <img src="../../icons/menu.svg" alt="menu" />
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
                            <div className="mt-[30px] text-[14px] font-ruda font-black ps-[50px]">
                                <h2>{post.title}</h2>
                                {post.photo && (
                                    <div className="w-[400px] h-[400px] bg-white bg-opacity-50 backdrop-blur-70 rounded-[15px] mt-[20px] border border-gray-400 flex justify-center items-center overflow-hidden group">
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_API_URL}${post.photo}`}
                                            alt={post.title}
                                            className="max-w-full max-h-full"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="mt-[20px] flex ms-[50px]">
                                <div className="text-primary font-ruda mt-[10px] mb-[10px] flex items-center text-[15px]">
                                    <button>
                                        <img src="../../icons/like.svg" alt=""
                                            className="w-[20px] h-[20px] mr-[20px]" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => handleCommentClick(post.id)}
                                    className="text-primary font-ruda mt-[10px] mb-[10px] flex items-center text-[15px]"
                                >
                                    <img src="../../icons/comment.svg"
                                        className="w-[20px] h-[20px] mr-[5px]"
                                    />
                                    {post.comments ? post.comments.length + post.comments.reduce((acc, comment) => acc + (comment.replies ? comment.replies.length : 0), 0) : 0}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No posts available.</p>
                )}
            </div>
        </div>
    );
};

export default DashboardUser;
