'use client';

import DetailForum from '@/app/components/DetailForum'
import Sidebar from '@/app/components/Sidebar'
import React from 'react'
import { useRouter } from 'next/navigation';
import { Back } from '@/app/components/svgs/page';

const ForumDetail = () => {
  const router = useRouter();

  return (
    <div className='bg-white dark:bg-hitam1 w-full min-h-screen'>
      <Sidebar />
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
        <DetailForum />
      </main>
    </div>
  )
}

export default ForumDetail