'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from './Modal';
import { useRouter } from 'next/navigation';
import { User } from '@/app/types/types';

const Navbar = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
    const [notifications, setNotifications] = useState<any[]>(() => []);

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

            axios
                .get(`${process.env.NEXT_PUBLIC_API_URL}/api/notification/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    console.log('Notifications data:', response.data.notifications); 
                    setNotifications(response.data.notifications); 
                })
                .catch((error) => {
                    console.error('Failed to fetch notifications:', error);
                });

        } else {
            setLoading(false);
        }
    }, []);

    const unreadCount = Array.isArray(notifications)
        ? notifications.filter((notif) => !notif.isRead).length
        : 0;


    const handleConfirmLogout = () => {
        setShowLogoutModal(true);
        setShowDropdown(false);
    };

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setIsLoggedIn(false);
            setUser(null);
            router.push("/login");
        }
    };

    const cancelLogout = () => {
        setShowLogoutModal(false);
    };

    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.dropdown-container') && !target.closest('.dropdown-trigger')) {
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

    const isActive = (path: string) => {
        if (typeof window !== 'undefined') {
            return window.location.pathname === path;
        }
        return false;
    };


    return (
        <div className="relative">
            <div className="fixed h-[calc(100vh)] w-[270px] flex flex-col items-center bg-white">
                {loading ? (
                    <div className='text-center'>
                        <div className="flex justify-center">
                            <div className="w-[100px] h-[100px] bg-gray-200 border border-[#2E3781] rounded-full overflow-hidden bg-cover flex items-center justify-center z-10 mt-[75px]">
                            </div>
                        </div>
                        <p className="text-black text-[16px] font-bold font-ruda mt-[37px]">@ ...</p>
                    </div>
                ) : user ? (
                    <div className='text-center'>
                        <div className="flex justify-center">
                            <div className="w-[100px] h-[100px] bg-white border border-[#2E3781] rounded-full overflow-hidden bg-cover flex items-center justify-center z-10 mt-[75px]">
                                <img
                                    src={user.profile ? `http://localhost:5000${user.profile}` : 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg'}
                                    alt="User profile"
                                    className="w-[100px]"
                                    onError={(e) => {
                                        console.log(`Image not found for user: ${user.profile}, setting to default.`);
                                        (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                                    }}
                                />
                            </div>
                        </div>
                        <p className="text-black text-[16px] font-bold font-ruda mt-[15px]">{user.name}</p>
                        <p className="text-[#6F6F6F] text-[12px] font-bold font-ruda mt-[7px]">@{user.username}</p>
                    </div>
                ) : (
                    <div className='text-center'>
                        <div className="flex justify-center">
                            <div className="w-[100px] h-[100px] bg-gray-400 border border-[#2E3781] rounded-full overflow-hidden bg-cover flex items-center justify-center z-10 mt-[75px]">

                            </div>
                        </div>
                        <p className="text-black text-[16px] font-bold font-ruda mt-[37px]">@ ...</p>
                    </div>
                )}

                <div>
                    <button className={`w-[200px] h-[50px] rounded-full mt-[67px] text-[16px] font-ruda flex items-center ${isActive('/pages/user/post') ? 'bg-primary text-white' : 'bg-primary text-white'}`}
                        onClick={() => router.push('/pages/user/post')}>
                        <img src="../../../icons/new.svg" alt="" className='mx-[20px]' /><h1 className='mt-[2px]'>Posting</h1>
                    </button>
                    <button className="px-[20px] h-[50px] rounded-full mt-[5px] text-[16px] font-ruda flex items-center hover:bg-black hover:bg-opacity-15 transition-colors text-primary"
                        onClick={() => router.push('/pages/user/Home')}>
                        <img src="../../../icons/home.svg" alt="" className='me-[20px]' /><h1 className='mt-[2px]'>Beranda</h1>
                    </button>
                    <button className="px-[20px] h-[50px] rounded-full mt-[5px] text-[16px] font-ruda flex items-center hover:bg-black hover:bg-opacity-15 transition-colors text-primary"
                        onClick={() => router.push('/pages/user/notif')}>
                        <img src="../../../icons/message.svg" alt="" className='me-[20px]' />
                        <h1 className='mt-[2px]'>Notifikasi
                        </h1>
                        {unreadCount > 0 && (
                            <span className="ms-[20px] text-white bg-primary text-xs rounded-full px-2 py-1">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    <button className="px-[20px] h-[50px] rounded-full mt-[5px] text-[16px] font-ruda flex items-center hover:bg-black hover:bg-opacity-15 transition-colors text-primary"
                        onClick={() => router.push('/pages/user/profile')}>
                        <img src="../../../icons/akun.svg" alt="" className='me-[20px]' /><h1 className='mt-[2px]'>Profil</h1>
                    </button>
                    <div className="">
                        <div className="dropdown-container">
                            <button
                                onClick={() =>
                                    setActiveDropdown(activeDropdown === 1 ? null : 1)
                                }
                                className="dropdown-trigger px-[20px] h-[50px] rounded-full mt-[5px] text-[16px] font-ruda flex items-center hover:bg-black hover:bg-opacity-15 transition-colors text-primary"
                            >
                                <img src="../../../icons/more.svg" alt="" className='me-[20px]' /><h1 className='mt-[2px]'>Lainya</h1>
                            </button>
                            {activeDropdown === 1 && (
                                <div className="absolute bg-white z-10 w-[150px] mt-3 ms-[25px] rounded-[10px] border shadow-lg overflow-hidden">
                                    <button
                                        onClick={handleConfirmLogout}
                                        className="block px-4 py-2 text-primary hover:bg-gray-200 w-full text-center"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            <Modal isOpen={showLogoutModal} onClose={cancelLogout}>
                <div className="p-4">
                    <h2 className="text-lg mb-4">Konfirmasi Logout</h2>
                    <p>Apakah Anda yakin ingin keluar?</p>
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={cancelLogout}
                            className="px-4 py-2 border border-gray-300 rounded-md mr-2"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-500 text-white rounded-md"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Navbar;
