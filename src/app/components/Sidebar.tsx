'use client';
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Beranda, Dashboard, Lainnya, Notifikasi, Pengguna, Tambah } from './svgs';
import { User } from '../types/types';
import Modal from './Modal';
import PostingModal from './PostingModal';
import axios from 'axios';
import ThemeToggle from './ThemeTogle';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<any[]>(() => []);
  const [loading, setLoading] = useState(false);
  const [showPostingModal, setShowPostingModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Handle klik di luar untuk dropdown dan sidebar
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container') && !target.closest('.dropdown-trigger')) {
      setActiveDropdown(null);
    }
    if (isSidebarOpen && !target.closest('.sidebar') && !target.closest('.sidebar-toggle')) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    if (activeDropdown !== null || isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown, isSidebarOpen]);

  // Logout
  const handleConfirmLogout = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowLogoutModal(true);
    setShowDropdown(false);
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

  // Fetch notifikasi
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
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

  return (
    <div className="relative transition-colors">
      {/* Bulatan toggle untuk mobile (hanya muncul saat sidebar tertutup) */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="sidebar-toggle fixed left-0 top-1/2 -translate-y-1/2 ml-[10px] w-[40px] h-[40px] bg-putih1 dark:bg-hitam2 border border-hitam2 rounded-full flex items-center justify-center z-20 lg:hidden"
        >
          <Dashboard className="fill-black dark:fill-white"/>
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`sidebar fixed left-0 w-[60px] lg:w-[80px] h-[340px] lg:h-[365px] border border-hitam2 bg-putih1 flex flex-col rounded-[16px] items-center justify-evenly top-1/3 lg:top-1/4 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0 ml-[10px]' : 'translate-x-[-200px]'
        } lg:translate-x-0 lg:ml-[40px] dark:bg-hitam2 z-10`}
      >
        <button
          onClick={() => router.push('/pages/user/Beranda')}
          className={`${
            pathname === '/pages/user/Beranda'
              ? 'border-b-[3px] pb-[1.5px] border-ungu'
              : 'cursor-pointer group relative flex gap-1.5 transition items-center justify-center'
          }`}
        >
          <Beranda className="fill-hitam2 dark:fill-white" />
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-[60px] h-[20px] lg:w-[80px] lg:h-[30px] text-[12px] lg:text-[16px] opacity-0 rounded-md bg-hitam2 dark:bg-putih1 dark:text-hitam1 group-hover:opacity-100 transition-opacity text-white text-center font-ruda flex items-center justify-center whitespace-nowrap">
            Beranda
          </div>
        </button>

        <div>
          {unreadCount > 0 && (
            <span className="absolute right-[10px] lg:right-[20px] text-white w-[15px] h-[15px] bg-red-500 text-[12px] font-ruda flex items-center justify-center rounded-full z-10">
              <p>{unreadCount}</p>
            </span>
          )}
          <button
            onClick={() => router.push('/pages/user/notif')}
            className={`${
              pathname === '/pages/user/notif'
                ? 'border-b-[3px] pb-[1.5px] border-ungu'
                : 'cursor-pointer group relative flex gap-1.5 transition items-center justify-center'
            }`}
          >
            <Notifikasi className="fill-hitam2 dark:fill-white relative" />
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-[60px] h-[20px] lg:w-[80px] lg:h-[30px] text-[12px] lg:text-[16px] opacity-0 rounded-md bg-hitam2 dark:bg-putih1 dark:text-hitam1 group-hover:opacity-100 transition-opacity text-white text-center font-ruda flex items-center justify-center whitespace-nowrap">
              Notifikasi
            </div>
          </button>
        </div>

        <button
          onClick={() => setShowPostingModal(true)}
          className="w-[45px] h-[45px] bg-putih3 rounded-full flex items-center justify-center dark:bg-hitam3 cursor-pointer group relative gap-1.5 transition"
        >
          <Tambah className="fill-hitam2 dark:fill-white" />
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-[60px] h-[20px] lg:w-[80px] lg:h-[30px] text-[12px] lg:text-[16px] opacity-0 rounded-md bg-hitam2 dark:bg-putih1 dark:text-hitam1 group-hover:opacity-100 transition-opacity text-white text-center font-ruda flex items-center justify-center whitespace-nowrap">
            Posting
          </div>
        </button>

        <button
          onClick={() => router.push('/pages/user/profile')}
          className={`${
            pathname === '/pages/user/profile'
              ? 'border-b-[3px] pb-[1.5px] border-ungu'
              : 'cursor-pointer group relative flex gap-1.5 transition items-center justify-center'
          }`}
        >
          <Pengguna className="fill-hitam2 dark:fill-white" />
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-[60px] h-[20px] lg:w-[80px] lg:h-[30px] text-[12px] lg:text-[16px] opacity-0 rounded-md bg-hitam2 dark:bg-putih1 dark:text-hitam1 group-hover:opacity-100 transition-opacity text-white text-center font-ruda flex items-center justify-center whitespace-nowrap">
            Profil
          </div>
        </button>

        <div className="dropdown-container">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 1 ? null : 1)}
            className="cursor-pointer group relative flex gap-1.5 transition items-center justify-center"
          >
            <Lainnya className="fill-hitam2 dark:fill-white" />
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-[60px] h-[20px] lg:w-[80px] lg:h-[30px] text-[12px] lg:text-[16px] opacity-0 rounded-md bg-hitam2 dark:bg-putih1 dark:text-hitam1 group-hover:opacity-100 transition-opacity text-white text-center font-ruda flex items-center justify-center whitespace-nowrap">
              Lainnya
            </div>
          </button>
          {activeDropdown === 1 && (
            <div className="absolute bg-white dark:bg-hitam2 z-10 w-[80px] mt-[35px] -ms-[25px] rounded-[10px] border border-hitam2 overflow-hidden">
              <button
                onClick={(e) => handleConfirmLogout(e)}
                className="block px-4 py-2 text-hitam2 dark:text-white hover:bg-abu dark:hover:bg-hitam3 w-full text-center"
              >
                Logout
              </button>
              <div className="flex justify-center items-center py-2">
                <ThemeToggle />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Logout */}
      <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)}>
        <div className="p-6 font-ruda w-full">
          <div className="flex justify-center items-center mb-4">
            <h2 className="text-[20px] font-bold text-hitam1 dark:text-putih1">Konfirmasi Logout</h2>
          </div>
          <div className="text-center">
            <p className="text-[16px] text-hitam2 dark:text-abu mb-6">
              Apakah Anda yakin ingin keluar dari akun Anda?
            </p>
          </div>
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
      </Modal>

      {/* Posting Modal */}
      <PostingModal
        isOpen={showPostingModal}
        onClose={() => setShowPostingModal(false)}
      />
    </div>
  );
}