'use client';

import DetailForum from '@/app/components/DetailForum'
import Sidebar from '@/app/components/Sidebar'
import React from 'react'
import { useRouter } from 'next/navigation';
import { Back } from '@/app/components/svgs/page';
import PopulerTag from '@/app/components/PopulerTag';
import Navbar from '@/app/components/Navbar';

const ForumDetail = () => {
  const router = useRouter();

  return (
    <div className='bg-white dark:bg-hitam1 w-full min-h-screen' >
      <Sidebar />
      <nav >
        <Navbar />
      </nav>
      <main className='ms-[280px] pt-[100px]' >
        <div className="absolute top-[100px] left-[200px]">
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

        <DetailForum />

        <div className="absolute top-[100px] right-[30px]" >
          <PopulerTag />
        </div>
      </main>
    </div>
  )
}

export default ForumDetail