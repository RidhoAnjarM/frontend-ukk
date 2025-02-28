// src/app/admin/page.tsx
import SidebarAdmin from '@/app/components/sidebaradmin'
import CategoryBarChart from '@/app/components/CategoryBar'
import TagDoughnutChart from '@/app/components/TagDonat'
import ThemeToggle from '@/app/components/ThemeTogle'

export default function AdminHome() {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <SidebarAdmin />

      {/* Konten Utama */}
      <div className="flex-1 ml-0 md:ml-64 p-6">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Beranda
          </h1>
          <ThemeToggle />
        </header>

        <div className="space-y-8">
          {/* Kategori Populer */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Kategori Populer
            </h2>
            <div className="max-w-4xl mx-auto">
              <CategoryBarChart />
            </div>
          </section>

          {/* Tag Populer */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Tag Populer
            </h2>
            <div className="max-w-md mx-auto">
              <TagDoughnutChart />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}