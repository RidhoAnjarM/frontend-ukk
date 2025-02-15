'use client';

import DetailForum from '@/app/components/DetailForum'
import Navbar from '@/app/components/Navbar'
import React from 'react'
import { useRouter } from 'next/navigation';

const ForumDetail = () => {
  const router = useRouter();

  return (
    <div>
      <Navbar />
      <div className="ps-[270px] pt-[50px]">
        <nav className="fixed top-0 w-full ms-[85px] z-10 transition-transform duration-300">
          <div className="bg-white backdrop-blur-md bg-opacity-20 w-[700px] h-[60px] border border-t-0 flex items-center px-[30px] border-gray-400">
            <button
              onClick={() => router.back()}
              className="flex justify-center items-center me-[30px] hover:bg-black hover:bg-opacity-20 rounded-full px-1 py-2 transition-colors">
              <img src="../../../icons/back.svg" alt="" className='' />
            </button>
            <h1 className="text-[20px] text-primary font-ruda font-black">
              Postingan
            </h1>
          </div>
        </nav> 
        <main className='ms-[85px]'>
          <DetailForum />
        </main>
      </div>
    </div>
  )
}

export default ForumDetail