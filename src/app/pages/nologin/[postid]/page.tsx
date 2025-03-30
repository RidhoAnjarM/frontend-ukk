'use client';

import DetailNoLogin from '@/app/components/DetailNoLogin'
import React from 'react'
import { useRouter } from 'next/navigation';
import { Back } from '@/app/components/svgs/page';
import PopulerTag from '@/app/components/PopulerTag';

const ForumDetailNoLogin = () => {
  const router = useRouter();

  return (
    <div className='bg-white dark:bg-hitam1 w-full min-h-screen' >
      <nav className="top-0 w-full ps-[289px] z-10 flex py-[35px] gap-3" >
        <div>
          <button
            onClick={() => router.back()}
            className="cursor-pointer group relative flex gap-1.5 w-[35px] h-[35px] hover:bg-black rounded-full hover:bg-opacity-20 transition items-center justify-center"
          >
            <Back className="fill-black dark:fill-white w-[25px]" />

            <div className="absolute w-[80px] h-[30px] opacity-0 -bottom-full rounded-md bg-black left-1/2 -translate-x-1/2 group-hover:opacity-100 transition-opacity text-white text-center font-sans" >
              kembali
            </div>
          </button>
        </div>
        <h1 className="text-[24px] text-black dark:text-white font-ruda font-medium" >
          Postingan
        </h1>
      </nav>
      <main className='ms-[280px]' >
      <div className="fixed top-[200px] left-3 w-[250px] bg-ungu bg-opacity-90 dark:bg-opacity-80 text-white p-6 flex flex-col justify-between z-0 shadow-lg">
        <div>
          <h2 className="text-[28px] font-ruda font-bold mt-10 animate-fade-in">
            Gabung ForuMedia!
          </h2>
          <p className="text-[16px] font-ruda mt-4 leading-relaxed animate-fade-in delay-100">
            "Jangan cuma lihat, jadi bagian dari cerita! Daftar sekarang dan mulai berbagi ide, diskusi seru, dan koneksi baru."
          </p>
          <button
            onClick={() => router.push('/login')}
            className="mt-6 w-full h-[45px] bg-white text-ungu font-ruda font-semibold rounded-[10px] hover:bg-gray-200 transition-all duration-300 animate-fade-in delay-200 mb-10"
          >
            Mulai Sekarang
          </button>
        </div>
      </div>
        <DetailNoLogin />
      </main>
      <div className="absolute right-0 top-0 mt-[110px] me-[50px]" >
        <PopulerTag />
      </div>
    </div>
  )
}

export default ForumDetailNoLogin