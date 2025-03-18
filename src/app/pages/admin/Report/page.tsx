'use client'

import { useState, useEffect } from 'react'
import SidebarAdmin from '@/app/components/sidebaradmin'
import ModalWhite from '@/app/components/ModalWhite'
import { Forum, ForumReport, Reports, UserProfile } from '@/app/types/types'
import Alert from '@/app/components/Alert'
import axios from 'axios'
import { Ellipse } from '@/app/components/svgs/page'

export default function Report() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [accountReports, setAccountReports] = useState<Reports[]>([])
  const [forumReports, setForumReports] = useState<ForumReport[]>([])
  const [loading, setLoading] = useState(true)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [isDeleteReportModalOpen, setIsDeleteReportModalOpen] = useState(false)
  const [isDeleteForumModalOpen, setIsDeleteForumModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isAccountDetailModalOpen, setIsAccountDetailModalOpen] = useState(false)
  const [isReasonsModalOpen, setIsReasonsModalOpen] = useState(false)  
  const [isForumReasonsModalOpen, setIsForumReasonsModalOpen] = useState(false)  
  const [selectedReport, setSelectedReport] = useState<Reports | null>(null)
  const [reportToDelete, setReportToDelete] = useState<number | null>(null)
  const [forumToDelete, setForumToDelete] = useState<number | null>(null)
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [selectedReasons, setSelectedReasons] = useState<Reports[]>([])
  const [selectedForumReasons, setSelectedForumReasons] = useState<ForumReport[]>([])
  const [showAlert, setShowAlert] = useState(false)
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info')
  const [alertMessage, setAlertMessage] = useState('')

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const accountRes = await fetch('http://localhost:5000/api/report/akun')
      const accountData: Reports[] = await accountRes.json()
      setAccountReports(accountData || [])

      const forumRes = await fetch('http://localhost:5000/api/report/forum')
      const forumData: ForumReport[] = await forumRes.json()
      setForumReports(forumData || [])

      setLoading(false)
    } catch (error) {
      console.error('Gagal mengambil laporan:', error)
      setAccountReports([])
      setForumReports([])
      setLoading(false)
      setAlertType('error')
      setAlertMessage('Gagal mengambil laporan')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 2000)
    }
  }

  const handleReviewReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const action = formData.get('action') as string
    const days = action === 'approve' ? parseInt(formData.get('days') as string) : 0

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setAlertType('warning')
        setAlertMessage('Silakan login terlebih dahulu')
        setShowAlert(true)
        setTimeout(() => setShowAlert(false), 2000)
        return
      }

      const response = await fetch('http://localhost:5000/api/report/akun/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          report_id: selectedReport?.id,
          action,
          days
        })
      })

      const data = await response.json()
      if (response.ok) {
        fetchReports()
        setIsReviewModalOpen(false)
        setSelectedReport(null)
        setAlertType('success')
        setAlertMessage(data.message || 'Laporan berhasil ditinjau')
        setShowAlert(true)
        setTimeout(() => setShowAlert(false), 2000)
      } else {
        setAlertType('error')
        setAlertMessage(data.error || 'Gagal meninjau laporan')
        setShowAlert(true)
        setTimeout(() => setShowAlert(false), 2000)
      }
    } catch (error) {
      console.error('Error meninjau laporan:', error)
      setAlertType('error')
      setAlertMessage('Terjadi kesalahan saat meninjau laporan')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 2000)
    }
  }

  const openDeleteForumModal = (forumId: number) => {
    setForumToDelete(forumId)
    setIsDeleteForumModalOpen(true)
  }

  const confirmDeleteForum = async () => {
    if (forumToDelete !== null) {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setAlertType('warning')
          setAlertMessage('Silakan login terlebih dahulu')
          setShowAlert(true)
          setTimeout(() => setShowAlert(false), 2000)
          return
        }

        const response = await fetch(`http://localhost:5000/api/forum/${forumToDelete}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        const data = await response.json()
        if (response.ok) {
          fetchReports()
          setAlertType('success')
          setAlertMessage(data.message || 'Forum berhasil dihapus')
          setShowAlert(true)
          setTimeout(() => setShowAlert(false), 2000)
        } else {
          setAlertType('error')
          setAlertMessage(data.error || 'Gagal menghapus forum')
          setShowAlert(true)
          setTimeout(() => setShowAlert(false), 2000)
        }
      } catch (error) {
        console.error('Error menghapus forum:', error)
        setAlertType('error')
        setAlertMessage('Terjadi kesalahan saat menghapus forum')
        setShowAlert(true)
        setTimeout(() => setShowAlert(false), 2000)
      } finally {
        setIsDeleteForumModalOpen(false)
        setForumToDelete(null)
      }
    }
  }

  const openDeleteReportModal = (reportId: number) => {
    setReportToDelete(reportId)
    setIsDeleteReportModalOpen(true)
  }

  const confirmDeleteReport = async () => {
    if (reportToDelete !== null) {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setAlertType('warning')
          setAlertMessage('Silakan login terlebih dahulu')
          setShowAlert(true)
          setTimeout(() => setShowAlert(false), 2000)
          return
        }

        const response = await fetch(`http://localhost:5000/api/report/forum/${reportToDelete}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        const data = await response.json()
        if (response.ok) {
          fetchReports()
          setAlertType('success')
          setAlertMessage(data.message || 'Laporan berhasil dihapus')
          setShowAlert(true)
          setTimeout(() => setShowAlert(false), 2000)
        } else {
          setAlertType('error')
          setAlertMessage(data.error || 'Gagal menghapus laporan forum')
          setShowAlert(true)
          setTimeout(() => setShowAlert(false), 2000)
        }
      } catch (error) {
        console.error('Error menghapus laporan forum:', error)
        setAlertType('error')
        setAlertMessage('Terjadi kesalahan saat menghapus laporan forum')
        setShowAlert(true)
        setTimeout(() => setShowAlert(false), 2000)
      } finally {
        setIsDeleteReportModalOpen(false)
        setReportToDelete(null)
      }
    }
  }

  const openDetailModal = async (forumId: number) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setAlertType('warning')
        setAlertMessage('Silakan login terlebih dahulu')
        setShowAlert(true)
        setTimeout(() => setShowAlert(false), 2000)
        return
      }

      const response = await axios.get(`http://localhost:5000/api/forum/${forumId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      setSelectedForum(response.data)
      setIsDetailModalOpen(true)
    } catch (error) {
      console.error('Error fetching forum details:', error)
      setAlertType('error')
      setAlertMessage('Gagal mengambil detail forum')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 2000)
    } finally {
      setLoading(false)
    }
  }

  const openAccountDetailModal = async (userId: number) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setAlertType('warning')
        setAlertMessage('Silakan login terlebih dahulu')
        setShowAlert(true)
        setTimeout(() => setShowAlert(false), 2000)
        return
      }

      const response = await axios.get(`${API_URL}/api/users/${userId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      console.log('Response from API:', response.data)
      
      if (response.data.profile) {
        setSelectedUser({
          ...response.data.profile,
          forums: response.data.profile.forums || []
        })
        setIsAccountDetailModalOpen(true)
      } else {
        throw new Error('Profile not found in response')
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
      setAlertType('error')
      setAlertMessage('Gagal mengambil detail akun')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 2000)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  // Fungsi untuk mengelompokkan laporan akun
  const groupAccountReports = () => {
    const grouped = accountReports.reduce((acc, report) => {
      const userId = report.reported_user.id
      if (!acc[userId]) {
        acc[userId] = []
      }
      acc[userId].push(report)
      return acc
    }, {} as Record<number, Reports[]>)
    return Object.values(grouped)
  }

  // Fungsi untuk mengelompokkan laporan forum
  const groupForumReports = () => {
    const grouped = forumReports.reduce((acc, report) => {
      const forumId = report.forum_id
      if (!acc[forumId]) {
        acc[forumId] = []
      }
      acc[forumId].push(report)
      return acc
    }, {} as Record<number, ForumReport[]>)
    return Object.values(grouped)
  }

  // Fungsi untuk membuka modal alasan akun
  const openReasonsModal = (reports: Reports[]) => {
    setSelectedReasons(reports)
    setIsReasonsModalOpen(true)
  }

  // Fungsi untuk membuka modal alasan forum
  const openForumReasonsModal = (reports: ForumReport[]) => {
    setSelectedForumReasons(reports)
    setIsForumReasonsModalOpen(true)
  }


  if (loading) return <p className="text-center mt-10 text-gray-700" > Memuat...</p>

  return (
    <div className="flex min-h-screen bg-gray-100" >
      <SidebarAdmin />
      <div className="flex-1 ms-[240px] pe-[20px]" >
        {showAlert && (
          <Alert
            type={alertType}
            message={alertMessage}
            onClose={() => setShowAlert(false)}
          />
        )}
        <header className="flex justify-between items-center h-[100px]" >
          <h1 className="text-2xl font-bold text-hitam1 font-ruda" >
            Kelola Laporan
          </h1>
        </header>

        {/* Laporan Akun */}
        <div className="bg-white p-6 rounded-lg shadow mb-8" >
          <h2 className="text-xl font-semibold text-gray-900 mb-4" >
            Laporan Akun
          </h2>
          <div className="overflow-x-auto" >
            {!accountReports || accountReports.length === 0 ? (
              <p className="text-gray-700" > Tidak ada akun dilaporkan.</p>
            ) : (
              <table className="w-full text-left " >
                <thead>
                  <tr className="text-gray-600" >
                    <th className="p-3" > Pengguna Dilaporkan </th>
                    <th className="p-3" > Username </th>
                    <th className="p-3" > Alasan </th>
                    <th className="p-3" > Status </th>
                    <th className="p-3" > Aksi </th>
                  </tr>
                </thead>
                <tbody>
                  {groupAccountReports().map((reports) => {
                    const user = reports[0].reported_user
                    const reportCount = reports.length
                    return (
                      <tr key={user.id} className="border-t">
                        <td className="p-3 text-gray-900">
                          <button
                            onClick={() => openAccountDetailModal(user.id)}
                            className="text-blue-600 hover:underline"
                          >
                            {user.name}
                          </button>
                        </td>
                        <td className="p-3 text-gray-900">{user.username}</td>
                        <td className="p-3 text-gray-900">
                          {reportCount === 1 ? (
                            reports[0].reason
                          ) : (
                            <button
                              onClick={() => openReasonsModal(reports)}
                              className="text-blue-600 hover:underline"
                            >
                              {reportCount} Laporan
                            </button>
                          )}
                        </td>
                        <td className="p-3 text-gray-900">{reports[0].status}</td>
                        <td className="p-3">
                          {reports.some(r => r.status === 'pending') && (
                            <button
                              onClick={() => {
                                setSelectedReport(reports[0])  
                                setIsReviewModalOpen(true)
                              }}
                              className="text-blue-600 hover:underline"
                            >
                              Tinjau
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Laporan Forum */}
        <div className="bg-white p-6 rounded-lg shadow" >
          <h2 className="text-xl font-semibold text-gray-900 mb-4" >
            Laporan Forum
          </h2>
          < div className="overflow-x-auto" >
            {!forumReports || forumReports.length === 0 ? (
              <p className="text-gray-700" > Tidak ada forum dilaporkan.</p>
            ) : (
              <table className="w-full text-left" >
                <thead>
                  <tr className="text-gray-600" >
                    <th className="p-3" > Judul Forum </th>
                    <th className="p-3" > Pembuat </th>
                    <th className="p-3" > Alasan </th>
                    <th className="p-3" > Status </th>
                    <th className="p-3" > Aksi </th>
                  </tr>
                </thead>
                <tbody>
                  {groupForumReports().map((reports) => {
                    const forum = reports[0].forum
                    const reportCount = reports.length
                    return (
                      <tr key={forum.id} className="border-t">
                        <td className="p-3 text-gray-900">
                          <button
                            onClick={() => openDetailModal(forum.id)}
                            className="text-blue-600 hover:underline"
                          >
                            {forum.title}
                          </button>
                        </td>
                        <td className="p-3 text-gray-900">{forum.user.username}</td>
                        <td className="p-3 text-gray-900">
                          {reportCount === 1 ? (
                            reports[0].reason
                          ) : (
                            <button
                              onClick={() => openForumReasonsModal(reports)}
                              className="text-blue-600 hover:underline"
                            >
                              {reportCount} Laporan
                            </button>
                          )}
                        </td>
                        <td className="p-3 text-gray-900">{reports[0].status}</td>
                        <td className="p-3 flex items-center">
                          {reports.some(r => r.status === 'pending') && (
                            <>
                              <button
                                onClick={() => openDeleteForumModal(forum.id)}
                                className="text-red-600 hover:underline"
                              >
                                Hapus Forum
                              </button>
                              <Ellipse className="mx-2"/>
                              <button
                                onClick={() => openDeleteReportModal(reports[0].id)}
                                className="text-red-600 hover:underline"
                              >
                                Hapus Laporan
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Modal Tinjau Laporan */}
        <ModalWhite
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false)
            setSelectedReport(null)
          }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4" >
            Tinjau Laporan #{selectedReport?.id}
          </h2>
          {selectedReport && (
              <div className="mb-4" >
                <p className="text-gray-700" >
                  Pengguna Dilaporkan: {selectedReport.reported_user.username} ({selectedReport.reported_user.name})
                </p>
                < p className="text-gray-700" >
                  Alasan: {selectedReport.reason}
                </p>
              </div>
            )}
          <form onSubmit={handleReviewReport}>
            <div className="mb-4" >
              <label className="block text-gray-700 mb-1" > Aksi </label>
              < select
                name="action"
                className="w-full p-2 border rounded"
                required
              >
                <option value="approve" > Setujui(Tangguhkan Akun) </option>
                < option value="reject" > Tolak </option>
              </select>
            </div>
            < div className="mb-4" >
              <label className="block text-gray-700 mb-1" >
                Durasi Penangguhan(hari)
              </label>
              < input
                type="number"
                name="days"
                min="1"
                className="w-full p-2 border rounded"
                defaultValue="7"
              />
            </div>
            < div className="flex justify-end space-x-2" >
              <button
                type="button"
                onClick={() => {
                  setIsReviewModalOpen(false)
                  setSelectedReport(null)
                }}
                className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400"
              >
                Batal
              </button>
              < button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Kirim
              </button>
            </div>
          </form>
        </ModalWhite>

        {/* Modal Hapus Laporan Forum */}
        <ModalWhite
          isOpen={isDeleteReportModalOpen}
          onClose={() => setIsDeleteReportModalOpen(false)}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4" >
            Konfirmasi Hapus Laporan Forum
          </h2>
          < p className="text-gray-700" >
            Apakah Anda yakin ingin menghapus laporan forum ini ?
          </p>
          < div className="flex justify-end space-x-2 mt-4" >
            <button
              type="button"
              onClick={() => setIsDeleteReportModalOpen(false)}
              className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400"
            >
              Batal
            </button>
            < button
              type="button"
              onClick={confirmDeleteReport}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Hapus
            </button>
          </div>
        </ModalWhite>

        <ModalWhite
          isOpen={isDeleteForumModalOpen}
          onClose={() => {
            setIsDeleteForumModalOpen(false)
            setForumToDelete(null)
          }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Konfirmasi Hapus Forum
          </h2>
          <p className="text-gray-700">
            Apakah Anda yakin ingin menghapus forum ini?
          </p>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={() => {
                setIsDeleteForumModalOpen(false)
                setForumToDelete(null)
              }}
              className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={confirmDeleteForum}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Hapus
            </button>
          </div>
        </ModalWhite>

        <ModalWhite
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedForum(null);
          }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Detail Forum</h2>
          {selectedForum ? (
            <div className="space-y-3 text-gray-900">
              <p><span className="font-semibold">Judul:</span> {selectedForum.title}</p>
              <p><span className="font-semibold">Deskripsi:</span> {selectedForum.description}</p>
              <p><span className="font-semibold">Pembuat:</span> {selectedForum.username} ({selectedForum.name})</p>
              <p><span className="font-semibold">Kategori:</span> {selectedForum.category_name || 'Tidak ada kategori'}</p>

              {selectedForum.photo && (
                <img
                  src={selectedForum.photo}
                  alt={selectedForum.title}
                  className="max-w-full h-auto rounded-lg mt-2"
                />
              )}

              {selectedForum.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedForum.tags.map((tag: any) => (
                    <span key={tag.id} className="bg-gray-200 px-2 py-1 rounded text-sm">
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-700">Memuat detail forum...</p>
          )}

          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={() => {
                setIsDetailModalOpen(false);
                setSelectedForum(null);
              }}
              className="px-3 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400"
            >
              Tutup
            </button>
          </div>
        </ModalWhite>

        <ModalWhite
          isOpen={isAccountDetailModalOpen}
          onClose={() => {
            setIsAccountDetailModalOpen(false)
            setSelectedUser(null)
          }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Detail Akun
          </h2>
          {loading ? (
            <p className="text-gray-700">Memuat detail akun...</p>
          ) : selectedUser ? (
            <div className="space-y-6">
              {/* Informasi Akun */}
              <div>
                <div className="space-y-2">
                  <div>
                    <p className="text-gray-700 font-semibold">Nama:</p>
                    <p className="text-gray-900">{selectedUser.name || 'Tidak tersedia'}</p>
                  </div>
                  <div>
                    <p className="text-gray-700 font-semibold">Username:</p>
                    <p className="text-gray-900">{selectedUser.username || 'Tidak tersedia'}</p>
                  </div>
                  {selectedUser.profile && (
                    <div>
                      <p className="text-gray-700 font-semibold">Foto Profil:</p>
                      <img 
                        src={`${API_URL}${selectedUser.profile}`} 
                        alt={selectedUser.username || 'Profile'}
                        className="w-[50px] h-[50px] rounded-full mt-2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Postingan */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Postingan</h3>
                {selectedUser.forums && Array.isArray(selectedUser.forums) && selectedUser.forums.length > 0 ? (
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {selectedUser.forums.map((forum) => (
                      <div key={forum.id} className="border p-3 rounded-lg">
                        <p className="text-gray-900 font-semibold">{forum.title || 'Tanpa judul'}</p>
                        <p className="text-gray-700 text-sm">{forum.description || 'Tanpa deskripsi'}</p>
                        <p className="text-gray-600 text-xs mt-1">
                          Kategori: {forum.category_name || 'Tidak ada'}
                        </p>
                        <p className="text-gray-600 text-xs">Likes: {forum.like || 0}</p>
                        {forum.photo && (
                          <img 
                            src={`${API_URL}${forum.photo}`} 
                            alt={forum.title || 'Forum image'}
                            className="mt-2 max-w-full h-auto rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-700">Belum ada postingan</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-700">Tidak ada data akun yang tersedia</p>
          )}
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={() => {
                setIsAccountDetailModalOpen(false)
                setSelectedUser(null)
              }}
              className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400"
            >
              Tutup
            </button>
          </div>
        </ModalWhite>

        <ModalWhite
          isOpen={isReasonsModalOpen}
          onClose={() => {
            setIsReasonsModalOpen(false)
            setSelectedReasons([])
          }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Detail Alasan Laporan
          </h2>
          {selectedReasons.length > 0 ? (
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {selectedReasons.map((report, index) => (
                <div key={report.id} className="border p-3 rounded-lg">
                  <p className="text-gray-900 font-semibold">Laporan #{index + 1}</p>
                  <p className="text-gray-700">Alasan: {report.reason}</p>
                  <p className="text-gray-600 text-sm">
                    Tanggal: {new Date(report.created_at).toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-700">Tidak ada alasan yang tersedia</p>
          )}
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={() => {
                setIsReasonsModalOpen(false)
                setSelectedReasons([])
              }}
              className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400"
            >
              Tutup
            </button>
          </div>
        </ModalWhite>

        <ModalWhite
          isOpen={isForumReasonsModalOpen}
          onClose={() => {
            setIsForumReasonsModalOpen(false)
            setSelectedForumReasons([])
          }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Detail Alasan Laporan Forum
          </h2>
          {selectedForumReasons.length > 0 ? (
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {selectedForumReasons.map((report, index) => (
                <div key={report.id} className="border p-3 rounded-lg">
                  <p className="text-gray-900 font-semibold">Laporan #{index + 1}</p>
                  <p className="text-gray-700">Alasan: {report.reason}</p>
                  <p className="text-gray-600 text-sm">
                    Tanggal: {new Date(report.created_at).toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-700">Tidak ada alasan yang tersedia</p>
          )}
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={() => {
                setIsForumReasonsModalOpen(false)
                setSelectedForumReasons([])
              }}
              className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400"
            >
              Tutup
            </button>
          </div>
        </ModalWhite>
      </div>
    </div>
  )
}