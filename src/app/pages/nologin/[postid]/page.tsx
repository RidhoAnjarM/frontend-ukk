'use client';

import DetailNoLogin from '@/app/components/DetailNoLogin'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import { Back } from '@/app/components/svgs';

const ForumDetailNoLogin = () => {
  const router = useRouter();

  return (
    <div className='bg-white dark:bg-hitam1 w-full min-h-screen' >
      <nav className="top-0 w-full z-10 flex py-[18px] px-[10px] lg:py-[35px] gap-3 lg:ps-48 lg:fixed" >
        <div>
          <button
            onClick={() => router.back()}
            className="cursor-pointer group relative flex gap-1.5 w-[20px] h-[20px] lg:w-[35px] lg:h-[35px] hover:bg-black rounded-full hover:bg-opacity-20 transition items-center justify-center"
          >
            <Back className="fill-black dark:fill-white w-[20px]" />

            <div className="absolute w-[80px] h-[30px] opacity-0 -bottom-full rounded-md bg-black left-1/2 -translate-x-1/2 group-hover:opacity-100 transition-opacity text-white text-center font-sans" >
              kembali
            </div>
          </button>
        </div>
        <h1 className="text-[15px] lg:text-[24px] text-black dark:text-white font-ruda font-medium" >
          Postingan
        </h1>
      </nav>
      <main>
        <DetailNoLogin />
      </main>
    </div>
  )
}

export default ForumDetailNoLogin