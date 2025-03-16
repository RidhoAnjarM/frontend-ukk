'use client'

import { useState, useEffect } from 'react'
import SidebarAdmin from '@/app/components/sidebaradmin'
import ThemeToggle from '@/app/components/ThemeTogle'
import Modal from '@/app/components/Modal'
import { Ellipse } from '@/app/components/svgs/page'

export default function User() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [userToDelete, setUserToDelete] = useState<number | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users')
      const data = await response.json()
      setUsers(data.users)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching users:', error)
      setLoading(false)
    }
  }

  // Handler untuk update pengguna
  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      const response = await fetch(`http://localhost:5000/api/users/${selectedUser.id}`, {
        method: 'PUT',
        body: formData,
      })
      if (response.ok) {
        fetchUsers() // Refresh data
        setIsEditModalOpen(false)
        setSelectedUser(null)
      } else {
        console.error('Failed to update user:', await response.text())
      }
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const handleDeleteUser = async (id: number) => {
    setUserToDelete(id)
    setIsDeleteModalOpen(true)
  }

  // Handler untuk konfirmasi hapus pengguna
  const confirmDeleteUser = async () => {
    if (userToDelete !== null) {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${userToDelete}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          fetchUsers()
        }
      } catch (error) {
        console.error('Error deleting user:', error)
      } finally {
        setIsDeleteModalOpen(false)
        setUserToDelete(null)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <SidebarAdmin />
        <div className="flex-1 ml-0 md:ml-64 p-6">
          <p className="text-gray-900">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F7F7F7]">
      {/* Sidebar */}
      <SidebarAdmin />

      {/* Konten Utama */}
      <div className="flex-1 ml-[240px] pe-[20px]">
        <header className="flex justify-between items-center h-[100px]">
          <h1 className="text-2xl font-bold text-hitam1 font-ruda">
            Kelola Pengguna
          </h1>
        </header>

        {/* Tabel Pengguna */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600">
                  <th className="p-3">Nama</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Suspend Hingga</th>
                  <th className="p-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-t">
                    <td className="p-3 text-gray-900">{user.name}</td>
                    <td className="p-3 text-gray-900">{user.username}</td>
                    <td className="p-3 text-gray-900">{user.status}</td>
                    <td className="p-3 text-gray-900">
                      {user.suspend_duration > 0 ? `${user.suspend_duration} hari` : '-'}
                    </td>
                    <td className="p-3 flex items-center">
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setIsEditModalOpen(true)
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <Ellipse className="mx-2"/>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
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
      </div>

      {isEditModalOpen && selectedUser && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedUser(null)
          }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Edit Pengguna
          </h2>
          <form onSubmit={handleUpdateUser}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Status</label>
              <select
                name="status"
                defaultValue={selectedUser.status}
                className="w-full p-2 border rounded"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false)
                  setSelectedUser(null)
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
      )}

      {/* Modal Hapus */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <p className="text-gray-700 text-center mt-5">
          Apakah Anda yakin ingin menghapus Pengguna ini?
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
            onClick={confirmDeleteUser}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Hapus
          </button>
        </div>
      </Modal>

    </div>
  )
}