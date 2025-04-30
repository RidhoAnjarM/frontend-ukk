'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { User } from '../types/types';
import axios from 'axios';
import { Back } from './svgs';

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
      <div className="fixed top-0 w-full h-[60px] lg:h-[80px] bg-putih1 dark:bg-hitam2 border border-t-0 border-hitam2 flex items-center justify-between rounded-b-[16px] z-10 lg:px-4">
        <div className="ms-[20px] lg:ms-[57px]">
          <button
            onClick={() => router.back()}
            className="cursor-pointer group relative flex gap-1.5 w-[35px] h-[35px] hover:bg-black rounded-full hover:bg-opacity-20 transition items-center justify-center"
          >
            <Back className="fill-black dark:fill-white w-[25px]" />

            <div className="absolute w-[60px] h-[20px] lg:w-[80px] lg:h-[30px] text-[12px] lg:text-[16px] opacity-0 -bottom-full rounded-md bg-black left-1/2 -translate-x-1/2 group-hover:opacity-100 transition-opacity text-white text-center font-sans" >
              kembali
            </div>
          </button>
        </div>
        <div className="text-[24px] font-ruda text-hitam2 dark:text-white ">
          <h1>ForuMedia</h1>
        </div>
        <div className="me-[20px] lg:me-[50px] flex items-center">
          {loading ? (
            <p>loading...</p>
          ) : user ? (
            <div className="text-center">
              <div className="flex justify-center items-center">
                {!isProfilePage && (
                  <div className="flex items-center hover:underline">
                    <div className="me-[15px] hidden lg:block">
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
                      className="w-[35px] h-[35px] lg:w-[45px] lg:h-[45px] bg-white rounded-full lg:rounded-[6px] flex items-center justify-center object-cover cursor-pointer"
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
