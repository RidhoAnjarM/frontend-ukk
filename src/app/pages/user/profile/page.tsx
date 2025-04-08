'use client';

import Alert from '@/app/components/Alert';
import Modal from '@/app/components/Modal';
import PopulerTag from '@/app/components/PopulerTag';
import Sidebar from '@/app/components/Sidebar';
import { Back, Ellipse, Heart } from '@/app/components/svgs/page';
import { ForumPost } from '@/app/types/types';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const Profile = () => {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [showEditMod, setShowEditModal] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [forumToDelete, setForumToDelete] = useState<number | null>(null);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
    });
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }

                const response = await fetch(`${API_URL}/api/profil/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch profile');
                }

                const data = await response.json();
                setProfile(data.profile);
                setFormData({
                    name: data.profile.name,
                    username: data.profile.username,
                    password: '',
                });
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleUpdateProfile = async () => {
        setShowEditModal(false);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('username', formData.username);
            if (formData.password) {
                formDataToSend.append('password', formData.password);
            }
            if (profileImage) {
                formDataToSend.append('profile', profileImage);
            }

            const response = await fetch(`${API_URL}/api/users/${profile.id}`, {
                method: 'PUT',
                body: formDataToSend,
            });

            if (!response.ok) {
                throw new Error('Profil gagal diupdate');
            }

            const data = await response.json();
            setProfile({ ...profile, name: data.name, username: data.username, profile: data.profile });
            setEditMode(false);
            setShowEdit(false);
            setAlertMessage('Profil berhasil diupdate');

            setTimeout(() => {
                setAlertMessage('');
            }, 1500);
        } catch (err) {
            setAlertMessage(err instanceof Error ? err.message : 'An unknown error occurred');

            setTimeout(() => {
                setAlertMessage('');
            }, 1500);
        }
    };

    const handleDeleteForum = async () => {
        setShowDeleteModal(false);
        if (!forumToDelete) return;
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            const response = await fetch(`${API_URL}/api/forum/${forumToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Gagal menghapus postingan');
            }

            setProfile((prev: any) => ({
                ...prev,
                forums: prev.forums.filter((forum: any) => forum.id !== forumToDelete),
            }));
            setAlertMessage('Postingan berhasil dihapus');

            setTimeout(() => {
                setAlertMessage('');
            }, 1500);
        } catch (err) {
            setAlertMessage(err instanceof Error ? err.message : 'An unknown error occurred');

            setTimeout(() => {
                setAlertMessage('');
            }, 1500);
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

    const handleGetByID = (postid: number) => {
        router.push(`/pages/user/forum/${postid}`);
    };

    const handleLikeForum = async (forumId: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Silakan login untuk menyukai forum');
                return;
            }

            const response = await fetch(`${API_URL}/api/like/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ forum_id: forumId }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Like Response:', result);

            setProfile((prev: any) => ({
                ...prev,
                forums: prev.forums.map((forum: any) =>
                    forum.id === forumId
                        ? {
                              ...forum,
                              liked: result.liked,
                              like: result.liked ? forum.like + 1 : forum.like - 1,
                          }
                        : forum
                ),
            }));
        } catch (error) {
            console.error('Error liking forum:', error);
            alert('Gagal menyukai forum');
        }
    };

    const getTotalComments = (forum: any) => {
        if (!forum.comments || !Array.isArray(forum.comments)) return 0;
        const commentsCount = forum.comments.length;
        const repliesCount = forum.comments.reduce((total: number, comment: any) => {
            return total + (comment.replies && Array.isArray(comment.replies) ? comment.replies.length : 0);
        }, 0);
        return commentsCount + repliesCount;
    };

    const getTotalLikes = () => {
        if (!profile?.forums || !Array.isArray(profile.forums)) return 0;
        return profile.forums.reduce((total: number, forum: any) => total + (forum.like || 0), 0);
    };

    return (
        <div className="bg-white dark:bg-hitam1 w-full min-h-screen">
            <Sidebar />
            <div className="absolute mt-[60px] ms-[220px]">
                <button
                    onClick={() => router.back()}
                    className="cursor-pointer group relative flex gap-1.5 w-[35px] h-[35px] hover:bg-black rounded-full hover:bg-opacity-20 transition items-center justify-center"
                >
                    <Back className="fill-black dark:fill-white w-[25px]" />
                    <div className="absolute w-[80px] h-[30px] opacity-0 -bottom-full rounded-md bg-black left-1/2 -translate-x-1/2 group-hover:opacity-100 transition-opacity text-white text-center font-sans">
                        kembali
                    </div>
                </button>
            </div>
            <div>
                {alertMessage && <Alert type="success" message={alertMessage} onClose={() => setAlertMessage(null)} />}
                {loading ? (
                    <div className="w-full h-screen flex items-center justify-center">
                        <p className="text-hitam1 dark:text-abu font-ruda text-[16px]">Memuat profil...</p>
                    </div>
                ) : error ? (
                    <div className="w-full h-[calc(100vh-60px)] flex items-center justify-center mt-[60px] ms-[270px]">
                        <p className="text-hitam1 dark:text-abu font-ruda text-[16px]">{error}</p>
                    </div>
                ) : (
                    <>
                        <div className="fixed w-[750px] h-[170px] bg-putih1 dark:bg-hitam2 border border-hitam2 rounded-[16px] top-0 ms-[280px] mt-[57px] overflow-hidden z-10">
                            <div className="w-full h-[90px] bg-abu">
                                <img src="../../images/latar.jpg" alt="" className="w-full h-[90px] object-cover" />
                            </div>
                            <div className="w-full h-[90px] flex relative">
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL}${profile.profile}`}
                                    alt="Profile"
                                    className="w-[100px] h-[100px] rounded-full object-cover ms-[35px] -mt-[45px]"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                                    }}
                                />
                                <div className="ms-[12px] p-0 grid-cols-1 items-start">
                                    <div className="flex items-center gap-2">
                                        <p className="text-[24px] font-ruda font-medium text-hitam1 dark:text-putih1">{profile.name}</p>
                                        <p className="text-[16px] font-ruda font-medium text-hitam4 dark:text-abu">@{profile.username}</p>
                                    </div>
                                    <div className="flex gap-4 text-[13px] font-ruda text-hitam2 dark:text-putih1">
                                        <span>{profile.forums ? profile.forums.length : 0} Postingan</span>
                                        <span>{getTotalLikes()} Suka</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowEdit(true)}
                                    className="w-[100px] h-[30px] border border-[#7A0FC6] rounded-[6px] text-[13px] font-ruda font-extrabold text-[#7A0FC6] hover:bg-[#7A0FC6] hover:text-putih1 transition-colors right-4 mt-[6px] absolute"
                                >
                                    edit profile
                                </button>
                            </div>
                        </div>

                        <h1 className="text-[20px] font-ruda font-medium text-hitam1 dark:text-putih1 ms-[300px] mt-[245px] fixed">
                            Postingan Anda
                        </h1>
                        <div className="fixed w-[770px] bg-putih1 dark:bg-hitam2 ms-[270px] mt-[280px] rounded-[16px] overflow-y-auto max-h-[calc(100vh-290px)] scrollbar-hide grid justify-center p-[10px] overflow-hidden">
                            {profile.forums && profile.forums.length > 0 ? (
                                profile.forums
                                    .sort((a: ForumPost, b: ForumPost) => b.id - a.id)
                                    .map((forum: ForumPost) => (
                                        <div
                                            key={forum.id}
                                            className="w-[750px] h-[242px] p-[20px] bg-putih1 dark:bg-hitam3 rounded-[16px] border border-hitam2 hover:shadow-lg transition-shadow overflow-hidden relative z-0 mb-[10px]"
                                        >
                                            <div className="flex items-center mb-3">
                                                <img
                                                    src={`${API_URL}${forum.profile}`}
                                                    alt={forum.username}
                                                    className="w-[40px] h-[40px] rounded-full mr-3 object-cover"
                                                    onError={(e) => {
                                                        console.log(`Image not found for user: ${forum.profile}, setting to default.`);
                                                        (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                                                    }}
                                                />
                                                <div className="">
                                                    <div className="flex items-center">
                                                        <p className="text-[14px] font-ruda text-hitam2 dark:text-putih1 font-semibold me-[6px]">{forum.name}</p>
                                                        <Ellipse className="fill-black dark:fill-white" />
                                                        <p className="text-[14px] font-ruda text-hitam3 dark:text-abu font-medium ms-[6px]">{forum.username}</p>
                                                        <Ellipse className="fill-black dark:fill-white mx-[6px]" />
                                                        <button
                                                            onClick={() => {
                                                                setForumToDelete(forum.id);
                                                                setShowDeleteModal(true);
                                                            }}
                                                            className="px-2 h-[30px] text-[12px] font-ruda text-red-600 hover:text-red-300 hover:underline transition-colors"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                    <p className="text-[9px] font-ruda text-hitam4 dark:text-putih3 font-semibold">{forum.relative_time}</p>
                                                </div>
                                            </div>

                                            <div className="w-full flex justify-between">
                                                <div>
                                                    <h2
                                                        onClick={() => handleGetByID(forum.id)}
                                                        className="text-[18px] font-bold font-ruda text-hitam2 dark:text-white line-clamp-2 max-h-[53px] flex-1 min-w-0 overflow-hidden hover:underline cursor-pointer"
                                                    >
                                                        {forum.title}
                                                    </h2>
                                                    <div className="mt-[5px] flex flex-wrap">
                                                        {forum.tags && forum.tags.length > 0 ? (
                                                            forum.tags.slice(0, 6).map((tag: any) => (
                                                                <span
                                                                    key={tag.id}
                                                                    className="py-[6px] px-[10px] text-[10px] font-ruda font-bold bg-putih3 dark:bg-hitam4 text-hitam2 dark:text-abu rounded-full me-[5px] mb-[5px]"
                                                                >
                                                                    #{tag.name}
                                                                </span>
                                                            ))
                                                        ) : null}
                                                    </div>
                                                </div>
                                                {forum.photo && (
                                                    <img
                                                        src={`${process.env.NEXT_PUBLIC_API_URL}${forum.photo}`}
                                                        alt={forum.title}
                                                        className="w-[200px] h-[200px] rounded-[16px] object-cover flex-shrink-0 -mt-[50px] border border-hitam2"
                                                        onError={(e) => {
                                                            console.log(`Image not found for user: ${forum.photo}, setting to default.`);
                                                            (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                                                        }}
                                                    />
                                                )}
                                                {forum.photos && forum.photos.length > 0 && (
                                                    <div className="relative w-[200px] h-[200px] -mt-[50px] flex-shrink-0">
                                                        <img
                                                            onClick={() => handleGetByID(forum.id)}
                                                            src={`${API_URL}${forum.photos[0]}`}
                                                            alt={forum.title}
                                                            className="w-full h-full rounded-[16px] object-cover border border-hitam2 cursor-pointer"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src =
                                                                    'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                                                            }}
                                                        />
                                                        {forum.photos.length > 1 && (
                                                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-[12px] font-ruda px-2 py-1 rounded">
                                                                +{Math.min(forum.photos.length - 1, 4)}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center absolute bottom-[20px] left-[20px] dark:text-abu">
                                                <button
                                                    onClick={() => handleLikeForum(forum.id)}
                                                    className="flex font-ruda items-center text-[13px] me-[27px] text-hitam1 dark:text-abu"
                                                >
                                                    {forum.liked ? (
                                                        <Heart className="fill-ungu me-[5px]" />
                                                    ) : (
                                                        <Heart className="fill-abu me-[5px]" />
                                                    )}
                                                    {forum.like} Suka
                                                </button>
                                                <button
                                                    onClick={() => handleGetByID(forum.id)}
                                                    className="flex font-ruda items-center text-[13px] text-hitam1 dark:text-abu"
                                                >
                                                    <span>{getTotalComments(forum)} Komentar</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <div className="w-[750px] h-[200px] flex items-center justify-center rounded-[16px] bg-putih1 dark:bg-hitam3 dark:border-hitam3 dark:text-abu border-t-0 text-center">
                                    <p className="text-gray-500">Tidak ada Postingan.</p>
                                </div>
                            )}
                        </div>
                        <div className="absolute top-0 right-0 me-[40px] mt-[60px]">
                            <PopulerTag />
                        </div>

                        <Modal isOpen={showEdit} onClose={() => setShowEdit(false)}>
                            <div className="px-4 font-ruda">
                                <div className="flex justify-center items-center mb-6">
                                    <h2 className="text-[24px] font-bold text-hitam1 dark:text-putih1 font-ruda">Edit Profil</h2>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[14px] font-semibold text-hitam2 dark:text-abu mb-1">Nama</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full p-2 bg-putih3 dark:bg-hitam3 border dark:border-hitam3 rounded-[10px] text-hitam1 dark:text-abu focus:ring-2 focus:ring-ungu outline-none transition-all duration-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[14px] font-semibold text-hitam2 dark:text-abu mb-1">Username</label>
                                        <input
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className="w-full p-2 bg-putih3 dark:bg-hitam3 border dark:border-hitam3 rounded-[10px] text-hitam1 dark:text-abu focus:ring-2 focus:ring-ungu outline-none transition-all duration-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[14px] font-semibold text-hitam2 dark:text-abu mb-1">Password</label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            placeholder="Kosongkan jika tidak diganti"
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full p-2 bg-putih3 dark:bg-hitam3 border dark:border-hitam3 rounded-[10px] text-hitam1 dark:text-abu focus:ring-2 focus:ring-ungu outline-none transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[14px] font-semibold text-hitam2 dark:text-abu mb-1">Foto Profil</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                                            className="w-full p-2 bg-putih3 dark:bg-hitam3 border dark:border-hitam3 rounded-[10px] text-hitam1 dark:text-abu file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-ungu file:text-white hover:file:bg-ungu-dark transition-all duration-200"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowEdit(false)}
                                        className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-full hover:bg-gray-600 transition-all duration-200"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleUpdateProfile}
                                        className="px-6 py-2 bg-ungu text-white font-semibold rounded-full hover:bg-ungu-dark hover:shadow-lg transition-all duration-200"
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </div>
                        </Modal>

                        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                            <div className="p-6 font-ruda w-full">
                                <div className="flex justify-center items-center mb-4">
                                    <h1 className="text-[20px] font-bold text-hitam1 dark:text-putih1">Hapus Postingan?</h1>
                                </div>
                                <div className="text-center">
                                    <p className="text-[16px] text-hitam2 dark:text-abu mb-6">
                                        Yakin ingin menghapus postingan ini? Tindakan ini tidak bisa dibatalkan.
                                    </p>
                                </div>
                                <div className="flex justify-center gap-3">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-full hover:bg-gray-600 transition-all duration-200"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleDeleteForum}
                                        className="px-6 py-2 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 hover:shadow-lg transition-all duration-200"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </Modal>
                    </>
                )}
            </div>
        </div>
    );
};

export default Profile;