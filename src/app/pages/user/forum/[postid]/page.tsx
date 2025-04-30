'use client';

import DetailForum from '@/app/components/DetailForum'
import Sidebar from '@/app/components/Sidebar'
import React from 'react'
import { useRouter } from 'next/navigation';
import { Back } from '@/app/components/svgs';
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
      <main className='pt-[100px]' >
        <DetailForum />
        <div className="absolute top-[100px] right-[30px] hidden lg:block" >
          <PopulerTag />
        </div>
      </main>
    </div>
  )
}

export default ForumDetail