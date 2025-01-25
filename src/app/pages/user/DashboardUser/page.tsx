'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '@/app/components/Navbar';
import { ForumPost } from '@/app/types/types';

const DashboardUser = () => {
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
    const [isScrolling, setIsScrolling] = useState<boolean>(false);
    const [visibleComments, setVisibleComments] = useState<{ [key: number]: boolean }>({});

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolling(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/forum/`);
                const sortedPosts = response.data.sort((a: ForumPost, b: ForumPost) => b.id - a.id);
                setPosts(sortedPosts);
            } catch (err) {
                setError('Failed to fetch forum posts.');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
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

    const toggleComments = (postId: number) => {
        setVisibleComments((prev) => ({
            ...prev,
            [postId]: !prev[postId],
        }));
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

    return (
        <div>
            <Navbar />
            <div className="ps-[250px] pt-[80px]">
                <div
                    className={`fixed top-0 left-[250px] w-full z-10 transition-transform duration-300 ${isScrolling ? '-translate-y-full' : 'translate-y-0'
                        }`}
                >
                    <div className="bg-white backdrop-blur-80 bg-opacity-70 w-[120px] ms-[66px] text-center rounded-ee-[15px] rounded-bl-[15px]">
                        <h1 className="text-[30px] text-primary font-ruda font-black">For You</h1>
                    </div>
                </div>
                {loading ? (
                    <div className="">
                        <div className="w-[800px] h-[150px] p-[35px] bg-white border border-black rounded-[15px] mb-[20px] ms-[60px]"></div>
                        <div className="w-[800px] h-[200px] p-[35px] bg-white border border-black rounded-[15px] mb-[20px] ms-[60px]"></div>
                        <div className="w-[800px] h-[150px] p-[35px] bg-white border border-black rounded-[15px] mb-[20px] ms-[60px]"></div>
                    </div>
                ) : error ? (
                    <p>{error}</p>
                ) : posts.length > 0 ? (
                    posts.map((post) => (
                        <div key={post.id} className="w-[800px] p-[35px] bg-white border border-black rounded-[15px] mb-[20px] ms-[60px]">
                            <div className="flex justify-between w-full items-center">
                                <div className="flex">
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL}${post.profile}`}
                                        alt=""
                                        className="w-[50px] h-[50px] bg-cover rounded-full"
                                    />
                                    <div className="ms-[20px] py-[7px]">
                                        <p className="text-[16px] font-ruda font-bold">{post.username}</p>
                                        <p className="text-[10px] font-ruda font-bold">{post.relative_time}</p>
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
                            <div className="mt-[30px] text-[16px] font-ruda font-black">
                                <h2>{post.title}</h2>
                                {post.photo && (
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL}${post.photo}`}
                                        alt={post.title}
                                        className="w-[300px] rounded-[15px] mt-[20px] shadow-md"
                                    />
                                )}
                            </div>
                            <div className="mt-[20px]">
                                <button
                                    onClick={() => toggleComments(post.id)}
                                    className="text-primary font-ruda mt-[10px] mb-[10px] flex items-center text-[15px]"
                                >
                                    <img
                                        src={visibleComments[post.id] ? "../../icons/comment.svg" : "../../icons/comment.svg"}
                                        className="w-[20px] h-[20px] mr-[5px]"
                                    />
                                    {visibleComments[post.id] ? '' : ''} {post.comments ? post.comments.length : 0}
                                </button>
                                {visibleComments[post.id] && (
                                    <>
                                        {post.comments && post.comments.length > 0 ? (
                                            post.comments.map((comment) => (
                                                <div key={comment.id} className="mt-[10px] p-[10px] bg-gray-100 rounded-[10px]">
                                                    <div className="flex items-center">
                                                        <img
                                                            src={`${process.env.NEXT_PUBLIC_API_URL}${comment.profile}`}
                                                            alt=""
                                                            className="w-[30px] h-[30px] bg-cover rounded-full"
                                                        />
                                                        <div className="ms-[10px] flex items-center">
                                                            <p className="text-[16px] font-ruda font-bold">{comment.username} <span className="text-[8px] top-2">{comment.relative_time}</span></p>
                                                        </div>
                                                    </div>
                                                    <p className="mt-[10px] text-[14px] font-ruda">{comment.content}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p>No comments available.</p>
                                        )}

                                    </>
                                )}
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

