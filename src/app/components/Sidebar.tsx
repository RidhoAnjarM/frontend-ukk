'use client';
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Beranda, Lainnya, Notifikasi, Pengguna, Tambah } from './svgs/page';
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<any[]>(() => []);
  const [loading, setLoading] = useState(true);
  const [showPostingModal, setShowPostingModal] = useState(false); // State untuk PostingModal

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

  // Logout
  const handleConfirmLogout = (event: React.MouseEvent) => {
    event.stopPropagation();
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
      <div className="fixed left-0 w-[80px] h-[365px] border border-hitam2 bg-putih1 flex flex-col rounded-[16px] ms-[40px] items-center justify-evenly top-1/4 dark:bg-hitam2">
        <button onClick={() => router.push('/pages/user/Beranda')} className={`${pathname === '/pages/user/Beranda' ? 'border-b-[3px] pb-[1.5px] border-ungu' : ''}`}>
          <Beranda className="fill-hitam2 dark:fill-white " />
        </button>

        <button onClick={() => router.push('/pages/user/notif')} className={`${pathname === '/pages/user/notif' ? 'border-b-[3px] pb-[1.5px] border-ungu' : ''}`}>
          {unreadCount > 0 && (
            <span className="absolute right-[20px] text-white w-[15px] h-[15px] bg-ungu text-[12px] font-ruda flex items-center justify-center rounded-full z-10">
              <p>{unreadCount}</p>
            </span>
          )}
          <Notifikasi className="fill-hitam2 dark:fill-white relative" />
        </button>

        <button 
          onClick={() => setShowPostingModal(true)}
          className='w-[45px] h-[45px] bg-putih3 rounded-[6px] flex items-center justify-center hover:rounded-full transition ease-in-out dark:bg-hitam3'
        >
          <Tambah className="fill-hitam2 dark:fill-white " />
        </button>

        <button onClick={() => router.push('/pages/user/profile')} className={`${pathname === '/pages/user/profile' ? 'border-b-[3px] pb-[1.5px] border-ungu' : ''}`}>
          <Pengguna className="fill-hitam2 dark:fill-white " />
        </button>

        <div className="dropdown-container">
          <button onClick={() => setActiveDropdown(activeDropdown === 1 ? null : 1)}>
            <Lainnya className="fill-hitam2 dark:fill-white " />
          </button>
          {activeDropdown === 1 && (
            <div className="absolute bg-white dark:bg-hitam2 z-10 w-[80px] mt-[35px] -ms-[25px] rounded-[10px] border border-hitam2 overflow-hidden ">
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
      <Modal isOpen={showLogoutModal} onClose={cancelLogout}>
        <div className="p-4 dark:text-white">
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

      {/* Posting Modal */}
      <PostingModal
        isOpen={showPostingModal}
        onClose={() => setShowPostingModal(false)}
      />
    </div>
  );
}