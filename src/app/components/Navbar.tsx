'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { User } from '../types/types';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isActive = (path: string) => {
    if (typeof window !== 'undefined') return window.location.pathname === path;
    return false;
  };

  const isProfilePage = isActive('/pages/user/profile');

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        axios
          .get(`${API_URL}/api/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            setUser(response.data);
          })
          .catch((error) => {
            console.error("Failed to fetch user profile:", error);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    }
  }, []);
  

  return (
    <div>
      <div className="fixed top-0 w-full h-[80px] bg-putih1 dark:bg-hitam2 border border-t-0 border-hitam2 flex items-center justify-between rounded-b-[16px] z-10">
        <div className="text-[24px] font-ruda text-hitam2 dark:text-white ms-[57px]">
          <h1>ForuMedia</h1>
        </div>
        <div className="me-[50px] flex items-center">
          {loading ? (
            <p>loading...</p>
          ) : user ? (
            <div className="text-center">
              <div className="flex justify-center items-center">
                {!isProfilePage && (
                  <div className="flex items-center hover:underline">
                    <div className="me-[15px]">
                      <p
                        className="text-[14px] text-hitam1 dark:text-putih1 font-ruda hover:underline cursor-pointer"
                        onClick={() => router.push('/pages/user/profile')}
                      >
                        {user.name}
                      </p>
                      <p
                        className="text-[12px] text-hitam4 dark:text-abu font-ruda hover:underline cursor-pointer"
                        onClick={() => router.push('/pages/user/profile')}
                      >
                        @{user.username}
                      </p>
                    </div>
                    <img
                      src={
                        user.profile
                          ? `${API_URL}${user.profile}`
                          : 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg'
                      }
                      alt="User profile"
                      className="w-[45px] h-[45px] bg-white rounded-[6px] flex items-center justify-center object-cover cursor-pointer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                      }}
                      onClick={() => router.push('/pages/user/profile')}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center dark:text-abu">
              <p>server mati kayaknya..</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
