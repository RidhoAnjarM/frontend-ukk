'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import { Notification } from "@/app/types/types";

const Notif = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found. Please log in.");
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/notification/`, {
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


  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found. Please log in.");
      }
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/notification/${id}/read`, null, {
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

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found. Please log in.");
      }
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/notification/readall`, null, {
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

      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/notification/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };


  return (
    <div>
      <Navbar />
      <div className="ps-[270px]">
        <div className="fixed z-10 w-[700px] h-[80px] bg-white backdrop-blur-lg bg-opacity-20 ms-[85px] flex justify-between items-center border border-t-0 px-4 border-gray-300">
          <h1 className="text-[24px] font-ruda">Notifikasi</h1>
          <button className="text-[12px] gap-2 text-blue-500" onClick={markAllAsRead}>
            Tandai semua telah dibaca
            <span> ({notifications?.length ? notifications.filter((notif) => !notif.isRead).length : 0})</span>
          </button>
        </div>
        {notifications.length > 0 ? (
          <ul className="ms-[85px] w-[700px] pt-[80px] z-0">
            {notifications.map((notif) => (
              <li key={notif.id} className={`p-4 border -mt-[1px] border-gray-300 flex items-center ${notif.isRead ? "bg-white" : "bg-gray-100"}`}>
                <img
                  src={
                    notif.reply_profile || notif.profile
                      ? `${process.env.NEXT_PUBLIC_API_URL}${notif.reply_profile || notif.profile}`
                      : 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg'
                  }
                  alt="Profile"
                  className="w-[50px] h-[50px] bg-cover rounded-full mr-4 bg-white"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                  }}
                />
                <div className="flex justify-between w-full relative">
                  <div className="w-[550px]">
                    {notif.forum_id ? (
                      <Link href={`/pages/user/forum/${notif.forum_id}`} onClick={() => markAsRead(notif.id)}>
                      <p className="hover:underline">{notif.content}</p>
                    </Link>
                    ) : (
                      <p>{notif.content}</p>
                    )}
                  </div>
                  <div className="relative">
                    <button onClick={() => setActiveDropdown(activeDropdown === notif.id ? null : notif.id)} className="focus:outline-none">
                      <img src="../../icons/menu.svg" alt="menu" className="w-[20px]" />
                    </button>
                    {activeDropdown === notif.id && (
                      <div className="absolute bg-[#F2F2F2] z-10 w-[170px] rounded-[15px] overflow-hidden top-7 right-0 shadow-md dropdown-container border border-primary">
                        {!notif.isRead && (
                          <button
                            className="block px-4 py-2 text-primary hover:bg-gray-200 w-full text-center font-ruda text-[12px] border-b border-primary"
                            onClick={() => markAsRead(notif.id)}
                          >
                            Tandai telah dibaca
                          </button>
                        )}
                        <button
                          className="block px-4 py-2 text-primary hover:bg-gray-200 w-full text-center font-ruda text-[12px]"
                          onClick={() => deleteNotification(notif.id)}
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="ms-[85px] w-[700px] pt-[100px] z-0 text-center">Tidak ada notifikasi apapun.</div>
        )}
      </div>
    </div>
  );
};

export default Notif;

