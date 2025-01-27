'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from './Modal';
import { useRouter } from 'next/navigation';

interface User {
    username: string;
    profile: string;
}

const Navbar = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

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

    return (
        <div className="relative">
            <div className="fixed h-[calc(100vh)] w-[250px] flex flex-col items-center bg-white">
                {loading ? (
                    <div className='text-center'>
                        <div className="flex">
                            <div className="w-[80px] h-[80px] rounded-full bg-gray-200 z-0 mt-[85px] me-[45px] flex items-center justify-center">
                                <img src="../../images/FM.png" alt="" />
                            </div>
                            <div className="w-[100px] h-[100px] bg-gray-200 border border-[#2E3781] rounded-full overflow-hidden bg-cover flex items-center justify-center z-10 mt-[75px] ms-[50px] absolute">

                            </div>
                        </div>
                        <p className="text-black text-[16px] font-bold font-ruda mt-[37px]">@ ...</p>
                    </div>
                ) : user ? (
                    <div className='text-center'>
                        <div className="flex">
                            <div className="w-[80px] h-[80px] rounded-full bg-[#2E3781] z-0 mt-[85px] me-[45px] flex items-center justify-center">
                                <img src="../../images/FM.png" alt="" />
                            </div>
                            <div className="w-[100px] h-[100px] bg-white border border-[#2E3781] rounded-full overflow-hidden bg-cover flex items-center justify-center z-10 mt-[75px] ms-[50px] absolute">
                                <img
                                    src={user.profile ? `http://localhost:5000${user.profile}` : 'https://i.pinimg.com/736x/de/c6/f8/dec6f8725b7669004655f3bbe7178d41.jpg'}
                                    alt="User profile"
                                    className="w-[100px]"
                                    onError={(e) => {
                                        console.log(`Image not found for user: ${user.profile}, setting to default.`);
                                        (e.target as HTMLImageElement).src = 'https://i.pinimg.com/736x/de/c6/f8/dec6f8725b7669004655f3bbe7178d41.jpg';
                                    }}
                                />
                            </div>
                        </div>
                        <p className="text-black text-[16px] font-bold font-ruda mt-[37px]">@{user.username}</p>
                    </div>
                ) : (
                    <div className='text-center'>
                        <div className="flex">
                            <div className="w-[80px] h-[80px] rounded-full bg-gray-400 z-0 mt-[85px] me-[45px] flex items-center justify-center">
                                <img src="../../images/FM.png" alt="" />
                            </div>
                            <div className="w-[100px] h-[100px] bg-gray-400 border border-[#2E3781] rounded-full overflow-hidden bg-cover flex items-center justify-center z-10 mt-[75px] ms-[50px] absolute">

                            </div>
                        </div>
                        <p className="text-black text-[16px] font-bold font-ruda mt-[37px]">@ ...</p>
                    </div>
                )}

                <button className="w-[200px] h-[50px] bg-primary rounded-[15px] mt-[67px] text-[20px] text-white font-ruda flex items-center"
                    onClick={() => router.push('/pages/user/post')}>
                    <img src="../../icons/new.svg" alt="" className='mx-[15px]' /><h1 className='mt-[2px]'>New Post</h1>
                </button>
                <button className="w-[200px] h-[50px] bg-white rounded-[15px] mt-[5px] text-[20px] text-primary font-ruda flex items-center"
                    onClick={() => router.push('/pages/user/DashboardUser')}>
                    <img src="../../icons/home.svg" alt="" className='mx-[15px]' /><h1 className='mt-[2px]'>Home</h1>
                </button>
                <button className="w-[200px] h-[50px] bg-white rounded-[15px] mt-[5px] text-[20px] text-primary font-ruda flex items-center"
                    onClick={() => router.push('/pages/user/post')}>
                    <img src="../../icons/message.svg" alt="" className='mx-[15px]' /><h1 className='mt-[2px]'>Message</h1>
                </button>
                <button className="w-[200px] h-[50px] bg-white rounded-[15px] mt-[5px] text-[20px] text-primary font-ruda flex items-center"
                    onClick={() => router.push('/pages/user/post')}>
                    <img src="../../icons/akun.svg" alt="" className='mx-[15px]' /><h1 className='mt-[2px]'>Account</h1>
                </button>
                <button
                    onClick={handleConfirmLogout}
                    className="mt-[130px]"
                >
                    Logout
                </button>
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
