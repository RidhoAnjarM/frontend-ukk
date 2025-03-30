'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SidebarAdmin() {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    const navItems = [
        { name: 'Beranda', path: '/pages/admin/Home' },
        { name: 'Laporan', path: '/pages/admin/Report' },
        { name: 'Pengguna', path: '/pages/admin/User' },
    ]

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/login");
        }
    };

    return (
        <>
            <button
                className="md:hidden p-2 fixed top-4 left-4 z-20 text-gray-900 dark:text-white"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? '✕' : '☰'}
            </button>

            <div className={`fixed inset-y-0 left-0 w-[210px] bg-hitam1 shadow-lg transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out z-10`}>
                <div>
                    <div className="text-[24px] font-ruda text-putih1 text-center w-full mt-[50px]" >
                        <h1>ForuMedia</h1>
                    </div>
                    <nav className='mt-[180px]'>
                        <ul>
                            {navItems.map(item => (
                                <li key={item.name} >
                                    <button
                                        onClick={() => {
                                            router.push(item.path)
                                            setIsOpen(false)
                                        }}
                                        className="ms-[25px] px-[24px] py-[7px] text-putih1 font-ruda text-[20px] hover:bg-hitam3 rounded-[16px] mb-1"
                                    >
                                        {item.name}
                                    </button>
                                </li>
                            ))}
                            <li>
                                <button
                                    onClick={handleLogout}
                                    className="ms-[25px] px-[24px] py-[7px] text-putih1 font-ruda text-[20px] hover:bg-hitam3 rounded-[16px]"
                                >
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 md:hidden z-0"
                    onClick={() => setIsOpen(false)
                    }
                />
            )}
        </>
    )
}