'use client';

import DetailNoLogin from '@/app/components/DetailNoLogin'
import Sidebar from '@/app/components/Sidebar'
import React from 'react'
import { useRouter } from 'next/navigation';
import { Back } from '@/app/components/svgs/page';
import PopulerKategori from '@/app/components/PopulerKategori';
import PopulerTag from '@/app/components/PopulerTag';

const ForumDetailNoLogin = () => {
  const router = useRouter();

  return (
    <div className='bg-white dark:bg-hitam1 w-full min-h-screen'>
      <nav className="top-0 w-full ps-[289px] z-10 flex py-[35px]">
        <button
          onClick={() => router.back()}
          className="flex justify-center items-center me-[30px] hover:bg-black hover:bg-opacity-20 rounded-full px-1 py-2 transition-colors">
          <Back className="fill-black dark:fill-white w-[25px]" />
        </button>
        <h1 className="text-[24px] text-black dark:text-white font-ruda font-medium">
          Postingan
        </h1>
      </nav>
      <main className='ms-[280px]'>
        <DetailNoLogin />
      </main>
      <div className="absolute right-0 top-0 mt-[110px] me-[50px]">
        <PopulerKategori />
        <div className="mt-5">
          <PopulerTag />
        </div>
      </div>
    </div>
  )
}

export default ForumDetailNoLogin