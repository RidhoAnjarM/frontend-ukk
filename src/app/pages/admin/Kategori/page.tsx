// src/app/admin/categories/page.tsx
'use client'

import { useState, useEffect } from 'react'
import SidebarAdmin from '@/app/components/sidebaradmin'
import ThemeToggle from '@/app/components/ThemeTogle'
import Modal from '@/app/components/Modal' // Import Modal component
import { Ellipse } from '@/app/components/svgs/page'

export default function Kategori() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false) // State untuk modal hapus
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null) // State untuk menyimpan ID kategori yang akan dihapus

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
    setCategoryToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteCategory = async () => {
    if (categoryToDelete !== null) {
      try {
        const response = await fetch(`http://localhost:5000/api/category/${categoryToDelete}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          fetchCategories()
        }
      } catch (error) {
        console.error('Error deleting category:', error)
      } finally {
        setIsDeleteModalOpen(false)
        setCategoryToDelete(null)
      }
    }
  }

  if (loading) return <p className="text-center mt-10 text-gray-700">Loading...</p>

  return (
    <div className="flex min-h-screen bg-[#F7F7F7]">
      <SidebarAdmin />
      <div className="flex-1 ml-[240px] pe-[20px]">
        <header className="flex items-center justify-between h-[100px]">
          <h1 className="text-2xl font-bold text-hitam1 font-ruda">
            Kelola Kategori
          </h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-ungu text-white rounded hover:bg-green-700"
          >
            Tambah Kategori
          </button>
        </header>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600">
                  <th className="p-3">Nama</th>
                  <th className="p-3">Foto</th>
                  <th className="p-3">Penggunaan</th>
                  <th className="p-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(category => (
                  <tr key={category.id} className="border-t">
                    <td className="p-3 text-gray-900">{category.name}</td>
                    <td className="p-3">
                      {category.photo ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}${category.photo}`}
                          alt={category.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-500">Tidak ada foto</span>
                      )}
                    </td>
                    <td className="p-3 text-gray-900">{category.usage_count}</td>
                    <td className="p-3 flex items-center">
                      <button
                        onClick={() => {
                          setSelectedCategory(category)
                          setIsEditModalOpen(true)
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <Ellipse className="mx-2"/>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:underline"
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
          <h2 className="text-xl font-semibold text-gray-900">
            Tambah Kategori Baru
          </h2>
          <form onSubmit={handleCreateCategory}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Nama</label>
              <input
                type="text"
                name="name"
                required
                autoComplete='off'
                className="w-full p-2 border rounded outline-ungu"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Foto</label>
              <input
                type="file"
                name="photo"
                accept="image/*"
                className="w-full p-2 border rounded outline-ungu"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 "
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Edit Kategori
          </h2>
          <form onSubmit={handleUpdateCategory}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Nama</label>
              <input
                type="text"
                name="name"
                defaultValue={selectedCategory?.name}
                required
                className="w-full p-2 border rounded outline-ungu"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Foto</label>
              <input
                type="file"
                name="photo"
                accept="image/*"
                className="w-full p-2 border rounded outline-ungu"
              />
              {selectedCategory?.photo && (
                <p className="text-sm text-gray-500  mt-1">
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
                className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400"
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

        {/* Modal Hapus menggunakan komponen Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
        >
          <p className="text-gray-700 text-center mt-5">
            Apakah Anda yakin ingin menghapus kategori ini?
          </p>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={confirmDeleteCategory}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Hapus
            </button>
          </div>
        </Modal>
      </div>
    </div>
  )
}