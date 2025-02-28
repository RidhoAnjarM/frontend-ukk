// src/app/admin/users/page.tsx
'use client'

import { useState, useEffect } from 'react'
import SidebarAdmin from '@/app/components/sidebaradmin'
import ThemeToggle from '@/app/components/ThemeTogle'

export default function User() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  // Fetch semua pengguna
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

  // Handler untuk hapus pengguna
  const handleDeleteUser = async (id: number) => {
    if (confirm('Yakin ingin menghapus pengguna ini?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          fetchUsers() // Refresh data
        }
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
        <SidebarAdmin />
        <div className="flex-1 ml-0 md:ml-64 p-6">
          <p className="text-gray-900 dark:text-white">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <SidebarAdmin />

      {/* Konten Utama */}
      <div className="flex-1 ml-0 md:ml-64 p-6">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Kelola Pengguna
          </h1>
          <ThemeToggle />
        </header>

        {/* Tabel Pengguna */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Daftar Pengguna
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600 dark:text-gray-300">
                  <th className="p-3">ID</th>
                  <th className="p-3">Nama</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Suspend Hingga</th>
                  <th className="p-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-t dark:border-gray-700">
                    <td className="p-3 text-gray-900 dark:text-gray-200">{user.id}</td>
                    <td className="p-3 text-gray-900 dark:text-gray-200">{user.name}</td>
                    <td className="p-3 text-gray-900 dark:text-gray-200">{user.username}</td>
                    <td className="p-3 text-gray-900 dark:text-gray-200">{user.role}</td>
                    <td className="p-3 text-gray-900 dark:text-gray-200">{user.status}</td>
                    <td className="p-3 text-gray-900 dark:text-gray-200">
                      {user.suspend_duration > 0 ? `${user.suspend_duration} hari` : '-'}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setIsEditModalOpen(true)
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:underline mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
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

        {/* Modal Edit */}
        {isEditModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Edit Pengguna
              </h2>
              <form onSubmit={handleUpdateUser}>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Nama</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={selectedUser.name}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-200"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Username</label>
                  <input
                    type="text"
                    name="username"
                    defaultValue={selectedUser.username}
                    required
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-200"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Password (kosongkan jika tidak diubah)</label>
                  <input
                    type="password"
                    name="password"
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-200"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Profile</label>
                  <input
                    type="text"
                    name="profile"
                    defaultValue={selectedUser.profile}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-200"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Role</label>
                  <select
                    name="role"
                    defaultValue={selectedUser.role}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-200"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={selectedUser.status}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-200"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Suspend Hingga</label>
                  <input
                    type="datetime-local"
                    name="suspend_until"
                    defaultValue={selectedUser.suspend_until ? new Date(selectedUser.suspend_until).toISOString().slice(0, 16) : ''}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-200"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false)
                      setSelectedUser(null)
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
            </div>
          </div>
        )}
      </div>
    </div>
  )
}