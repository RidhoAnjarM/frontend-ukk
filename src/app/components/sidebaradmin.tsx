// src/components/SidebarAdmin.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SidebarAdmin() {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    const navItems = [
        { name: 'Beranda', path: '/pages/admin/Home' },
        { name: 'Kategori', path: '/pages/admin/Kategori' },
        { name: 'Pengguna', path: '/pages/admin/User' },
        { name: 'Laporan', path: '/pages/admin/Report' },
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
            {/* Tombol toggle untuk mobile */}
            <button
                className="md:hidden p-2 fixed top-4 left-4 z-20 text-gray-900 dark:text-white"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? '✕' : '☰'}
            </button>

            {/* SidebarAdmin */}
            <div
                className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg transform ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:translate-x-0 transition-transform duration-300 ease-in-out z-10`}
            >
                <div className="p-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                        Admin Menu
                    </h2>
                    <nav>
                        <ul className="space-y-2">
                            {navItems.map(item => (
                                <li key={item.name}>
                                    <button
                                        onClick={() => {
                                            router.push(item.path)
                                            setIsOpen(false)
                                        }}
                                        className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                    >
                                        {item.name}
                                    </button>
                                </li>
                            ))}
                            <li>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                >
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            {/* Overlay untuk mobile saat SidebarAdmin terbuka */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 md:hidden z-0"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}