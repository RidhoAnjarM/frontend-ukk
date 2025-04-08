'use client'

import { useRouter } from 'next/navigation'
import { Beranda, Pengguna } from './svgs/page'

export default function SidebarAdmin() {
    const router = useRouter()

    const navItemsMain = [
        { name: 'Beranda', path: '/pages/admin/Home', icon: '' },
        { name: 'Pengguna', path: '/pages/admin/User', icon: '' },
    ]

    const navItemsReports = [
        { name: 'Forum', path: '/pages/admin/ForumReport', icon: '' },
        { name: 'Pengguna', path: '/pages/admin/UserReport', icon: '' },
    ]

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/login");
        }
    };

    return (
        <div className="fixed inset-y-0 left-0 w-[210px] bg-hitam1 shadow-xl z-10">
            {/* Logo */}
            <div className="flex items-center justify-center mt-[30px] mb-[40px]">
                <div className="text-[28px] font-ruda font-bold text-putih1 bg-hitam3 px-4 py-2 rounded-full shadow-md">
                    ForuMedia
                </div>
            </div>

            {/* Navigasi */}
            <nav className="px-4">
                {/* Menu Utama */}
                <ul className="space-y-2">
                    {navItemsMain.map(item => (
                        <li key={item.name}>
                            <button
                                onClick={() => router.push(item.path)}
                                className="w-full flex items-center px-4 py-3 text-putih1 font-ruda text-[18px] hover:bg-hitam3 rounded-xl transition-colors duration-200"
                            >
                                <span className="mr-3 text-[20px]">{item.icon}</span>
                                {item.name}
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Subjudul Laporan */}
                <div className="mt-6 mb-3 px-4">
                    <h3 className="text-[14px] font-ruda text-putih1 opacity-70 uppercase tracking-wide">Laporan</h3>
                </div>

                {/* Menu Laporan */}
                <ul className="space-y-2">
                    {navItemsReports.map(item => (
                        <li key={item.name}>
                            <button
                                onClick={() => router.push(item.path)}
                                className="w-full flex items-center px-4 py-3 text-putih1 font-ruda text-[18px] hover:bg-hitam3 rounded-xl transition-colors duration-200"
                            >
                                <span className="mr-3 text-[20px]">{item.icon}</span>
                                {item.name}
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Logout */}
                <div className="mt-8">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-putih1 font-ruda text-[18px] hover:bg-red-900 rounded-xl transition-colors duration-200"
                    >
                        Logout
                    </button>
                </div>
            </nav>
        </div>
    )
}