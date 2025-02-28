// src/app/admin/categories/page.tsx
'use client'

import { useState, useEffect } from 'react'
import SidebarAdmin from '@/app/components/sidebaradmin'
import ThemeToggle from '@/app/components/ThemeTogle'
import Modal from '@/app/components/Modal' // Import Modal component

export default function Kategori() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/category/')
      const data = await response.json()
      setCategories(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching categories:', error)
      setLoading(false)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      const response = await fetch('http://localhost:5000/api/category/', {
        method: 'POST',
        body: formData,
      })
      if (response.ok) {
        fetchCategories()
        setIsCreateModalOpen(false)
      }
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }

  const handleUpdateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      const response = await fetch(`http://localhost:5000/api/category/${selectedCategory.id}`, {
        method: 'PUT',
        body: formData,
      })
      if (response.ok) {
        fetchCategories()
        setIsEditModalOpen(false)
        setSelectedCategory(null)
      }
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  const handleDeleteCategory = async (id: number) => {
    if (confirm('Yakin ingin menghapus kategori ini?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/category/${id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          fetchCategories()
        }
      } catch (error) {
        console.error('Error deleting category:', error)
      }
    }
  }

  if (loading) return <p className="text-center mt-10 text-gray-700 dark:text-gray-300">Loading...</p>

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <SidebarAdmin />
      <div className="flex-1 ml-0 md:ml-64 p-6">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Kelola Kategori
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Tambah Kategori
            </button>
            <ThemeToggle />
          </div>
        </header>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Daftar Kategori
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600 dark:text-gray-300">
                  <th className="p-3">ID</th>
                  <th className="p-3">Nama</th>
                  <th className="p-3">Foto</th>
                  <th className="p-3">Penggunaan</th>
                  <th className="p-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(category => (
                  <tr key={category.id} className="border-t dark:border-gray-700">
                    <td className="p-3 text-gray-900 dark:text-gray-200">{category.id}</td>
                    <td className="p-3 text-gray-900 dark:text-gray-200">{category.name}</td>
                    <td className="p-3">
                      {category.photo ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}${category.photo}`}
                          alt={category.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Tidak ada foto</span>
                      )}
                    </td>
                    <td className="p-3 text-gray-900 dark:text-gray-200">{category.usage_count}</td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          setSelectedCategory(category)
                          setIsEditModalOpen(true)
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:underline mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 dark:text-red-400 hover:underline"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Create menggunakan komponen Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Tambah Kategori Baru
          </h2>
          <form onSubmit={handleCreateCategory}>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Nama</label>
              <input
                type="text"
                name="name"
                required
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Foto</label>
              <input
                type="file"
                name="photo"
                accept="image/*"
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Simpan
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal Edit menggunakan komponen Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedCategory(null)
          }}
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Edit Kategori
          </h2>
          <form onSubmit={handleUpdateCategory}>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Nama</label>
              <input
                type="text"
                name="name"
                defaultValue={selectedCategory?.name}
                required
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Foto</label>
              <input
                type="file"
                name="photo"
                accept="image/*"
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-200"
              />
              {selectedCategory?.photo && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Foto saat ini: {selectedCategory.photo}
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false)
                  setSelectedCategory(null)
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  )
}