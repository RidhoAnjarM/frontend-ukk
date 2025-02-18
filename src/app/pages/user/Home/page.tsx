'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import { ForumPost } from '@/app/types/types';

const Home = () => {
    const router = useRouter();
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isScrolling, setIsScrolling] = useState<boolean>(false);
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [postResponse, categoryResponse] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/forum/`),
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/category/`),
                ]);

                setPosts(postResponse.data);
                setCategories(categoryResponse.data);
            } catch (err) {
                setError('Gagal mengambil data, servernya mati.');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCommentClick = (postid: number) => {
        router.push(`/pages/user/forum/${postid}`);
    };

    const handleAkun = (akunid: number) => {
        router.push(`/pages/user/akun/${akunid}`);
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

    const handleCategoryChange = (categoryId: number | null) => {
        setSelectedCategory(categoryId);
    };

    const filteredPosts = selectedCategory
        ? posts.filter((post) => post.category_id === selectedCategory)
        : posts;

    const colors = ['bg-[#D1F7FF]', 'bg-[#A1FFB6]', 'bg-[#FFF8A4]', 'bg-[#FAD1FF]', 'bg-[#FF8585]'];

    return (
        <div>
            <Navbar />
            <div className="ps-[270px] pt-[59px]">
                <div className="fixed top-0 w-full ms-[85px] z-10 transition-transform duration-300">
                    <div className="bg-white backdrop-blur-md bg-opacity-20 w-[700px] h-[60px] border border-t-0 flex items-center justify-center px-[30px]">
                        <h1 className="text-[20px] text-primary font-ruda font-black">
                            {selectedCategory ? categories.find(category => category.id === selectedCategory)?.name : 'Semua'}
                        </h1>
                    </div>
                </div>
                {loading ? (
                    <div className='w-[700px] h-[100px] flex items-center justify-center bg-white border border-gray-300 border-t-0 ms-[85px]'>
                        <p>loading</p>
                    </div>
                ) : error ? (
                    <div className='w-[700px] h-[100px] flex items-center justify-center bg-white border border-gray-300 border-t-0 ms-[85px]'>
                        <p>{error}</p>
                    </div>
                ) : filteredPosts.length > 0 ? (
                    filteredPosts.map((post: ForumPost) => (
                        <div key={post.id} className="w-[700px] p-[30px] bg-white border border-gray-300 border-t-0 ms-[85px]">
                            <div className="flex justify-between w-full items-center">
                                <div className="flex">
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL}${post.profile}`}
                                        alt=""
                                        className="w-[40px] h-[40px] bg-cover rounded-full"
                                        onError={(e) => {
                                            console.log(`Image not found for user: ${post.profile}, setting to default.`);
                                            (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                                        }}
                                    />
                                    <div className="ms-[10px] py-[1px]">
                                        <div className="flex gap-1">
                                            <p className="text-[14px] font-ruda font-bold">{post.name}</p>
                                            <p className="text-[14px] font-sans text-gray-500 -mt-[2px]">@{post.username}</p>
                                        </div>
                                        <p className="text-[10px] font-sans">{post.relative_time}</p>
                                    </div>
                                </div>
                                <div className="relative dropdown-container">
                                    <button
                                        onClick={() => handleAccount(post.id)}
                                        className="focus:outline-none"
                                    >
                                        <img src="../../icons/menu.svg" alt="menu" className='w-[25px]' />
                                    </button>
                                    {activeDropdown === post.id && (
                                        <div className="absolute bg-[#F2F2F2] w-[150px] rounded-[15px] overflow-hidden -right-[60px] text-[12px]">
                                            <button onClick={() => handleAkun(post.user_id)} className="block px-4 py-2 text-primary hover:bg-gray-200 w-full text-center font-ruda">
                                                Lihat Akun
                                            </button>
                                            <button className="block px-4 py-2 text-primary hover:bg-gray-200 w-full text-center font-ruda">
                                                Laporkan Postingan
                                            </button>
                                            <button className="block px-4 py-2 text-primary hover:bg-gray-200 w-full text-center font-ruda">
                                                Laporkan Akun
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-[5px] text-[16px] font-sans ps-[50px]">
                                <h2>{post.title}</h2>
                                {post.photo && (
                                    <div className="w-[400px] h-[400px] bg-white bg-opacity-50 backdrop-blur-70 rounded-[15px] mt-[10px] border border-gray-400 flex justify-center items-center overflow-hidden group">
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_API_URL}${post.photo}`}
                                            alt={post.title}
                                            className="max-w-full max-h-full"
                                            onError={(e) => {
                                                console.log(`Image not found for user: ${post.photo}, setting to default.`);
                                                (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="ms-[50px] mt-2">
                                {post.tags && post.tags.length > 0 ? (
                                    post.tags.map((tag) => (
                                        <span key={tag.id} className="bg-gray-300 text-[12px] py-1 px-2 me-1 rounded-md">
                                            #{tag.name}
                                        </span>
                                    ))
                                ) : (
                                    <span className=""></span>
                                )}
                            </div>
                            <div className="mt-[10px] flex ms-[50px]">
                                <div className="text-primary font-ruda mt-[10px] mb-[10px] flex items-center text-[15px]">
                                    <button>
                                        <img src="../../icons/like.svg" alt=""
                                            className="w-[15px] h-[15px] mr-[20px]" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => handleCommentClick(post.id)}
                                    className="font-ruda mt-[10px] mb-[10px] flex items-center text-[15px]"
                                >
                                    <img src="../../icons/comment.svg"
                                        className="w-[15px] h-[15px] mr-[5px]"
                                    />
                                    <p className='mt-[1px]'>{post.comments ? post.comments.length + post.comments.reduce((acc, comment) => acc + (comment.replies ? comment.replies.length : 0), 0) : 0}</p>
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className='w-[700px] h-[100px] flex items-center justify-center bg-white border border-gray-300 border-t-0 ms-[85px]'>
                        <p>Belum ada postingan.</p>
                    </div>
                )}
            </div>


            <div className="fixed right-0 top-0 z-20">
                <input
                    type="text"
                    placeholder="cari kategori.."
                    className="w-[320px] px-[20px] h-[50px] border border-primary rounded-full me-[50px] relative my-[8px]"
                    onChange={(e) => {
                        const searchTerm = e.target.value.toLowerCase();
                        if (searchTerm === '') {
                            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/category/`)
                                .then(response => setCategories(response.data))
                                .catch(err => console.error('Error:', err));
                        } else {
                            setCategories((prevCategories) =>
                                prevCategories.filter((category) =>
                                    category.name.toLowerCase().includes(searchTerm)
                                )
                            );
                        }
                    }}
                />
                <div className="flex flex-wrap items-center gap-[5px] w-[320px] p-[15px] space-y-1 justify-between border border-primary rounded-[10px] bg-white me-[50px] mt-[20px]">
                    <button
                        className={`rounded-full h-[30px] text-[16px] px-[10px] ${selectedCategory === null ? 'bg-gray-400 text-white' : 'bg-gray-200'}`}
                        onClick={() => handleCategoryChange(null)}
                    >
                        Semua Kategori
                    </button>
                    {Array.from(new Set(categories.map(category => category.id))).map((id, index) => {
                        const category = categories.find(category => category.id === id);
                        const colorClass = colors[index % colors.length];
                        return (
                            <button
                                key={category?.id}
                                className={`rounded-full h-[30px] text-[16px] px-[10px] ${colorClass} ${selectedCategory === category?.id ? 'bg-gray-200 text-black' : 'text-black'}`}
                                onClick={() => handleCategoryChange(category?.id ?? null)}
                            >
                                {category?.name}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Home;
