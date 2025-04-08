'use client'

import { useRouter } from 'next/navigation'
import ModalWhite from './ModalWhite'
import { useState } from 'react';

export default function SidebarAdmin() {
    const router = useRouter()
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [loading, setLoading] = useState(false);



    const navItemsMain = [
        { name: 'Beranda', path: '/pages/admin/Home', icon: <img src="/icons/dashboard.svg" /> },
        { name: 'Pengguna', path: '/pages/admin/User', icon: <img src="/icons/Users.svg" /> },
    ]

    const navItemsReports = [
        { name: 'Forum', path: '/pages/admin/ForumReport', icon: <img src="/icons/report.svg" /> },
        { name: 'Pengguna', path: '/pages/admin/UserReport', icon: <img src="/icons/User.svg" /> },
    ]

     const handleConfirmLogout = (event: React.MouseEvent) => {
        event.stopPropagation();
        setShowLogoutModal(true);
      };
    
      const handleLogout = () => {
        setLoading(true);
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          setLoading(false);
          setShowLogoutModal(false);
        }, 1000);
      };

    return (
        <div className="fixed inset-y-0 left-0 w-[210px] bg-hitam1 shadow-xl z-10">
            {/* Logo */}
            <div className="flex items-center justify-center mt-[30px] mb-[120px]">
                <div className="text-[28px] font-ruda font-bold text-putih1   px-4 py-2 rounded-full shadow-md">
                    ForuMedia
                </div>
            </div>

            {/* Navigasi */}
            <nav className="px-4">
                {/* Menu Utama */}
                <ul className="space-y-2">
                    {navItemsMain.map(item => (
                        <li key={item.name}>
                            <button
                                onClick={() => router.push(item.path)}
                                className="w-full flex items-center px-4 py-3 text-putih1 font-ruda text-[18px] hover:bg-hitam3 rounded-xl transition-colors duration-200"
                            >
                                <span className="mr-3 text-[20px]">{item.icon}</span>
                                {item.name}
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Subjudul Laporan */}
                <div className="mt-6 mb-3 px-4">
                    <h3 className="text-[14px] font-ruda text-putih1 opacity-70 uppercase tracking-wide">Laporan</h3>
                </div>

                {/* Menu Laporan */}
                <ul className="space-y-2">
                    {navItemsReports.map(item => (
                        <li key={item.name}>
                            <button
                                onClick={() => router.push(item.path)}
                                className="w-full flex items-center px-4 py-3 text-putih1 font-ruda text-[18px] hover:bg-hitam3 rounded-xl transition-colors duration-200"
                            >
                                <span className="mr-3 text-[20px]">{item.icon}</span>
                                {item.name}
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Logout */}
                <div className="absolute bottom-0 ms-6 mb-3">
                    <button
                        onClick={handleConfirmLogout}
                        className="w-full flex items-center px-4 py-3 text-putih1 font-ruda text-[18px] hover:bg-red-900 rounded-xl transition-colors duration-200 gap-3"
                    >
                        <img src="/icons/out.svg" />
                        Logout
                    </button>
                </div>
            </nav>
            <ModalWhite isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)}>
                <div className="p-6 font-ruda  w-full">
                    {/* Header */}
                    <div className="flex justify-center items-center mb-4">
                        <h2 className="text-[20px] font-bold text-hitam1">Konfirmasi Logout</h2>
                    </div>

                    {/* Konten */}
                    <div className="text-center">
                        <p className="text-[16px] text-hitam2 mb-6">
                            Apakah Anda yakin ingin keluar dari akun Anda?
                        </p>
                    </div>

                    {/* Tombol */}
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => setShowLogoutModal(false)}
                            className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-full hover:bg-gray-600 transition-all duration-200"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleLogout}
                            disabled={loading}
                            className="px-6 py-2 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                        >
                            {loading ? (
                                <div className="flex flex-row gap-2">
                                    <div className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:.7s]"></div>
                                    <div className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:.3s]"></div>
                                    <div className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:.7s]"></div>
                                </div>
                            ) : (
                                'Logout'
                            )}
                        </button>
                    </div>
                </div>
            </ModalWhite>
        </div>
    )
}