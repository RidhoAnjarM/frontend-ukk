'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Sidebar from "@/app/components/Sidebar";
import { Notification } from "@/app/types/types";
import { Back, Vertikal } from "@/app/components/svgs";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const Notif = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Fetch semua notif
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found. Please log in.");
      }

      const response = await axios.get(`${API_URL}/api/notification/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications(response.data.notifications || []);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
      setNotifications([]);
      setError("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  // Tandai telah dibaca
  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found. Please log in.");
      }
      await axios.put(`${API_URL}/api/notification/${id}/read`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // Tandai semua dibaca
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found. Please log in.");
      }
      await axios.put(`${API_URL}/api/notification/readall`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (!(event.target as HTMLElement).closest(".dropdown-container")) {
      setActiveDropdown(null);
    }
  };

  useEffect(() => {
    if (activeDropdown !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

  const deleteNotification = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found. Please log in.");
      }

      await axios.delete(`${API_URL}/api/notification/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  // Fungsi untuk mengecek apakah notifikasi adalah laporan
  const isReportNotification = (content: string) => {
    return content.includes("Laporan Anda");
  };

  return (
    <div className="bg-white dark:bg-hitam1 w-full min-h-screen">
    <Sidebar />
    <Navbar />
    <button
      className="fixed px-2 py-1 text-[11px] lg:text-[12px] gap-2 text-blue-500 mt-[70px] lg:mt-[85px] left-4 lg:ms-[859px] hover:underline z-20 bg-transparent backdrop-blur-lg"
      onClick={markAllAsRead}
    >
      Tandai semua telah dibaca
      <span> ({notifications?.length ? notifications.filter((notif) => !notif.isRead).length : 0})</span>
    </button>
    {loading ? (
      <div className="ms-0 lg:ms-[280px] pt-[80px] lg:pt-[120px] w-full lg:w-[750px] mx-auto px-4 lg:px-0">
        <div className="rounded-[16px] bg-gray-300 animate-pulse w-full h-[80px] lg:h-[100px] p-[16px] lg:p-[20px]"></div>
      </div>
    ) : notifications.length > 0 ? (
      <ul className="ms-0 lg:ms-[280px] w-full lg:w-[750px] mx-auto z-0 pt-[80px] lg:pt-[100px] px-4 lg:px-0">
        {notifications.map((notif) => (
          <li
            key={notif.id}
            className={`p-[16px] lg:p-[20px] mt-[12px] lg:mt-[16px] rounded-[16px] border border-hitam2 flex items-start ${
              notif.isRead ? 'bg-putih1 dark:bg-hitam2' : 'bg-putih3 dark:bg-hitam4'
            } relative`}
          >
            {/* Foto profil hanya muncul jika bukan notifikasi laporan */}
            {!isReportNotification(notif.content) && (
              <div className="me-3 lg:me-4">
                <img
                  src={
                    notif.reply_profile || notif.profile
                      ? `${process.env.NEXT_PUBLIC_API_URL}${notif.reply_profile || notif.profile}`
                      : 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg'
                  }
                  alt="Profile"
                  className="w-[32px] lg:w-[40px] h-[32px] lg:h-[40px] object-cover rounded-full bg-white"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                  }}
                />
              </div>
            )}
  
            <div className="text-hitam2 dark:text-abu flex-wrap flex max-w-[300px] lg:max-w-[500px] text-[14px] lg:text-[16px]">
              {notif.forum_id ? (
                <Link href={`/pages/user/forum/${notif.forum_id}`} onClick={() => markAsRead(notif.id)}>
                  <p className="hover:underline">{notif.content}</p>
                </Link>
              ) : (
                <p>{notif.content}</p>
              )}
            </div>
  
            {/* Menu */}
            <div className="absolute top-3 lg:top-4 right-3 lg:right-4">
              <button
                onClick={() => setActiveDropdown(activeDropdown === notif.id ? null : notif.id)}
                className="focus:outline-none"
              >
                <Vertikal className="fill-black dark:fill-white w-5 h-5 lg:w-6 lg:h-6" />
              </button>
              {activeDropdown === notif.id && (
                <div className="absolute bg-[#F2F2F2] z-10 w-[140px] lg:w-[170px] rounded-[15px] overflow-hidden top-6 lg:top-7 right-0 lg:-me-[85px] shadow-md dropdown-container border border-hitam4 text-[11px] lg:text-[12px]">
                  {!notif.isRead && (
                    <button
                      className="block px-3 lg:px-4 py-1.5 lg:py-2 text-hitam4 hover:bg-gray-200 w-full text-center font-ruda border-b border-hitam4"
                      onClick={() => markAsRead(notif.id)}
                    >
                      Tandai telah dibaca
                    </button>
                  )}
                  <button
                    className="block px-3 lg:px-4 py-1.5 lg:py-2 text-hitam4 hover:bg-gray-200 w-full text-center font-ruda"
                    onClick={() => deleteNotification(notif.id)}
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>
  
            {/* Image postingan tetap ada jika ada */}
            {notif.photo && (
              <div className="absolute top-3 lg:top-4 right-12 lg:right-14 me-[20px] mt-[8px] lg:mt-[10px] hidden lg:block">
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}${notif.photo}`}
                  alt=""
                  className="w-[40px] lg:w-[50px] h-[40px] lg:h-[50px] object-cover rounded-[6px] border border-hitam2"
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    ) : (
      <div className="ms-0 lg:ms-[285px] w-full lg:w-[700px] mx-auto pt-[80px] lg:pt-[100px] z-0 text-center text-black dark:text-white text-[14px] lg:text-[16px] px-4 lg:px-0">
        Tidak ada notifikasi apapun.
      </div>
    )}
  </div>
  );
};

export default Notif;