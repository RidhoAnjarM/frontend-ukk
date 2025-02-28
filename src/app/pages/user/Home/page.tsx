'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Alert from '@/app/components/Alert';
import Modal from '@/app/components/Modal'
import { ForumPost } from '@/app/types/types';
import ThemeToggle from '@/app/components/ThemeTogle';

const Home = () => {
    const router = useRouter();
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isScrolling, setIsScrolling] = useState<boolean>(false);
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [showReportModal, setShowReportModal] = useState<boolean>(false);
    const [showReportModalForum, setShowReportModalForum] = useState<boolean>(false);
    const [reportedUserId, setReportedUserId] = useState<number | null>(null);
    const [reportedForumId, setReportedForumId] = useState<number | null>(null);
    const [reason, setReason] = useState<string>('');
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('error');
    const [alertMessage, setAlertMessage] = useState('');
    const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [postResponse, categoryResponse] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/forum/`, {
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token")}`
                        }
                    }),
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/category/`),
                ]);

                setPosts(postResponse.data);
                setCategories(categoryResponse.data);

                // Inisialisasi likedPosts berdasarkan data dari backend
                const likedPostIds = postResponse.data
                    .filter((post: ForumPost) => post.liked)
                    .map((post: ForumPost) => post.id);
                setLikedPosts(new Set(likedPostIds));

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

    const handleLike = async (postId: number) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("Token tidak ditemukan, user harus login");
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/like/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ forum_id: postId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Gagal memberikan like");
            }

            const { liked } = await response.json();

            setPosts((prevPosts) =>
                prevPosts.map((post) => {
                    if (post.id === postId) {
                        const newLikeCount = liked ? post.like + 1 : Math.max(post.like - 1, 0);
                        return { ...post, like: newLikeCount };
                    }
                    return post;
                })
            );

            setLikedPosts((prevLikedPosts) => {
                const updatedLikedPosts = new Set(prevLikedPosts);
                if (liked) {
                    updatedLikedPosts.add(postId);
                } else {
                    updatedLikedPosts.delete(postId);
                }
                localStorage.setItem('likedPosts', JSON.stringify(Array.from(updatedLikedPosts)));
                return updatedLikedPosts;
            });

        } catch (error) {
            console.error("Error:", error);
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
            <Sidebar />
            <ThemeToggle />
            <div className="ps-[270px] pt-[59px]" >
                {showAlert && (
                    <Alert
                        type={alertType}
                        message={alertMessage}
                        onClose={() => setShowAlert(false)}
                        className="mt-4"
                    />
                )}

                <div className="fixed top-0 w-full ms-[85px] z-10 transition-transform duration-300" >
                    <div className="bg-white backdrop-blur-md bg-opacity-20 w-[700px] h-[60px] border border-t-0 flex items-center justify-center px-[30px]" >
                        <h1 className="text-[20px] text-primary font-ruda font-black" >
                            {selectedCategory ? categories.find(category => category.id === selectedCategory)?.name : 'Inovasi & Teknologi'}
                        </h1>
                    </div>
                </div>

                {loading ? (
                    <div className='w-[700px] h-[100px] flex items-center justify-center bg-white border border-gray-300 border-t-0 ms-[85px]' >
                        <p>loading </p>
                    </div>
                ) : error ? (
                    <div className='w-[700px] h-[100px] flex items-center justify-center bg-white border border-gray-300 border-t-0 ms-[85px]' >
                        <p>{error} </p>
                    </div>
                ) : filteredPosts.length > 0 ? (
                    filteredPosts.map((post: ForumPost) => (
                        <div key={post.id} className="w-[700px] p-[30px] bg-white border border-gray-300 border-t-0 ms-[85px]" >
                            <div className="flex justify-between w-full items-center" >
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
                                    < div className="ms-[10px] py-[1px]" >
                                        <div className="flex gap-1" >
                                            <p className="text-[14px] font-ruda font-bold" > {post.name} </p>
                                            < p className="text-[14px] font-sans text-gray-500 -mt-[2px]" > @{post.username} </p>
                                        </div>
                                        < p className="text-[10px] font-sans" > {post.relative_time} </p>
                                    </div>
                                </div>
                                < div className="relative dropdown-container" >
                                    <button
                                        onClick={() => handleAccount(post.id)}
                                        className="focus:outline-none"
                                    >
                                        <img src="../../icons/menu.svg" alt="menu" className='w-[25px]' />
                                    </button>
                                    {
                                        activeDropdown === post.id && (
                                            <div className="absolute bg-[#F2F2F2] w-[150px] rounded-[15px] overflow-hidden -right-[60px] text-[12px]" >
                                                <button onClick={() => handleAkun(post.user_id)} className="block px-4 py-2 text-primary hover:bg-gray-200 w-full text-center font-ruda" >
                                                    Lihat Akun
                                                </button>
                                                < button onClick={() => handleReportForum(post.id)} className="block px-4 py-2 text-primary hover:bg-gray-200 w-full text-center font-ruda" >
                                                    Laporkan Postingan
                                                </button>
                                                < button onClick={() => handleReportAccount(post.user_id)} className="block px-4 py-2 text-primary hover:bg-gray-200 w-full text-center font-ruda" >
                                                    Laporkan Akun
                                                </button>
                                            </div>
                                        )}
                                </div>
                            </div>
                            < div className="mt-[5px] text-[16px] font-sans ps-[50px]" >
                                <h2>{post.title} </h2>
                                {post.photo && (
                                    <div className="max-w-[400px] bg-white bg-opacity-50 backdrop-blur-70 rounded-[15px] mt-[10px] border border-gray-400 flex justify-center items-center overflow-hidden bg-cover" >
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_API_URL}${post.photo}`}
                                            alt={post.title}
                                            className="w-full bg-cover"
                                            onError={(e) => {
                                                console.log(`Image not found for user: ${post.photo}, setting to default.`);
                                                (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                                            }
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="ms-[50px] mt-2" >
                                {post.tags && post.tags.length > 0 ? (
                                    post.tags.map((tag) => (
                                        <span key={tag.id} className="bg-gray-300 text-[12px] py-1 px-2 me-1 rounded-md" >
                                            #{tag.name}
                                        </span>
                                    ))
                                ) : (
                                    <span className="" > </span>
                                )}
                            </div>
                            <div className="mt-[10px] flex ms-[50px]" >
                                <div className="font-ruda mt-[10px] mb-[10px] flex items-center text-[15px] me-5">
                                    <button
                                        onClick={() => handleLike(post.id)}
                                        className={`w-[15px] h-[15px] mr-[5px] ${likedPosts.has(post.id) ? 'text-red-500' : 'text-gray-500'}`}
                                    >
                                        <img
                                            src={likedPosts.has(post.id) ? "../../icons/liked.svg" : "../../icons/like.svg"}
                                            alt="Like"
                                            className="w-[15px] h-[15px] mr-[5px]"
                                        />
                                    </button>
                                    <p className='mt-[1px]'>{post.like}</p>
                                </div>
                                <div className="font-ruda mt-[10px] mb-[10px] flex items-center text-[15px]">
                                    < button onClick={() => handleCommentClick(post.id)}>
                                        <img src="../../icons/comment.svg"
                                            className="w-[15px] h-[15px] mr-[5px]"
                                        />
                                    </button>
                                    <p className='mt-[1px]' > {post.comments ? post.comments.length + post.comments.reduce((acc, comment) => acc + (comment.replies ? comment.replies.length : 0), 0) : 0} </p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className='w-[700px] h-[100px] flex items-center justify-center bg-white border border-gray-300 border-t-0 ms-[85px]' >
                        <p>Belum ada postingan.</p>
                    </div>
                )}
            </div>
            < div className="fixed right-0 top-0 z-20" >
                <input
                    type="text"
                    placeholder="cari kategori.."
                    className="w-[380px] px-[20px] h-[50px] border border-primary rounded-full me-[50px] relative my-[8px]"
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
                <div className="flex flex-wrap items-center gap-[5px] w-[380px] p-[15px] space-y-1 justify-between border border-primary rounded-[10px] bg-white me-[20px] mt-[20px]" >
                    <button
                        className={`rounded-full h-[25px] text-[14px] px-[10px] ${selectedCategory === null ? 'bg-gray-400 text-white' : 'bg-gray-200'}`}
                        onClick={() => handleCategoryChange(null)}
                    >
                        Semua
                    </button>
                    {Array.from(new Set(categories.map(category => category.id))).map((id, index) => {
                        const category = categories.find(category => category.id === id);
                        const colorClass = colors[index % colors.length];
                        return (
                            <button
                                key={category?.id}
                                className={`rounded-full h-[25px] text-[14px] px-[10px] ${colorClass} ${selectedCategory === category?.id ? 'bg-gray-200 text-black' : 'text-black'}`
                                }
                                onClick={() => handleCategoryChange(category?.id ?? null)}
                            >
                                {category?.name}
                            </button>
                        );
                    })}
                </div>

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
        </div>
    );
};

export default Home;