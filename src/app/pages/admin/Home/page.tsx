'use client'

import { useEffect, useState } from 'react'
import SidebarAdmin from '@/app/components/sidebaradmin'
import CategoryBarChart from '@/app/components/CategoryBar'
import TagDoughnutChart from '@/app/components/TagDonat'
import { ForumReport, Reports } from '@/app/types/types'

export default function AdminHome() {
  const [totalUsers, setTotalUsers] = useState(0)
  const [weeklyUsers, setWeeklyUsers] = useState(0)
  const [totalForums, setTotalForums] = useState(0)
  const [weeklyForums, setWeeklyForums] = useState(0)
  const [accountReports, setAccountReports] = useState<Reports[]>([])
  const [forumReports, setForumReports] = useState<ForumReport[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUserStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users-stats')
      const data = await response.json()
      setTotalUsers(data.total_users)
      setWeeklyUsers(data.weekly_users)
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const fetchForumStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/forum/stats')
      const data = await response.json()
      setTotalForums(data.total_forums)
      setWeeklyForums(data.weekly_forums)
    } catch (error) {
      console.error('Error fetching forum stats:', error)
    }
  }

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
    }
  }

  useEffect(() => {
    fetchUserStats()
    fetchForumStats()
    fetchReports()
  }, [])

  // Mengelompokkan laporan akun berdasarkan user ID
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

  // Mengelompokkan laporan forum berdasarkan forum ID
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

  if (loading) return <p className="text-center mt-10 text-gray-700">Memuat...</p>

  return (
    <div className="flex min-h-screen bg-[#F7F7F7]">
      {/* Sidebar */}
      <SidebarAdmin />

      {/* Konten Utama */}
      <div className="flex-1 ml-[240px]">
        <header className="flex items-center h-[100px]">
          <h1 className="text-2xl font-bold text-hitam1 font-ruda">
            Beranda
          </h1>
        </header>

        <div className="flex gap-[30px]">
          <section className="bg-white w-[350px] h-[350px] rounded-lg shadow flex items-center justify-center">
            <div className="max-w-[300px]">
              <TagDoughnutChart />
            </div>
          </section>

          <section className="bg-white w-[600px] h-[350px] rounded-lg shadow flex items-center justify-center">
            <div className="w-[550px]">
              <CategoryBarChart />
            </div>
          </section>

          <section>
            <div className='w-[250px] h-[160px] bg-white shadow rounded-[16px] flex'>
              <div className='w-[125px] border-e border-gray-300 text-center font-ruda text-[14px] font-medium pt-[25px]'>
                <h3>Total Postingan</h3>
                <p className='text-[17px] font-extrabold font-sans mt-[35px]'>{totalForums}</p>
              </div>
              <div className='w-[125px] text-center font-ruda text-[14px] font-medium pt-[25px]'>
                <h3>Total Postingan Minggu ini</h3>
                <p className='text-[17px] font-extrabold font-sans mt-[15px]'>{weeklyForums}</p>
              </div>
            </div>

            <div className='w-[250px] h-[160px] bg-white shadow rounded-[16px] flex mt-[30px]'>
              <div className='w-[125px] border-e border-gray-300 text-center font-ruda text-[14px] font-medium pt-[25px]'>
                <h3>Total Pengguna</h3>
                <p className='text-[17px] font-extrabold font-sans mt-[35px]'>{totalUsers}</p>
              </div>
              <div className='w-[125px] text-center font-ruda text-[14px] font-medium pt-[25px]'>
                <h3>Total Pendaftar Minggu ini</h3>
                <p className='text-[17px] font-extrabold font-sans mt-[15px]'>{weeklyUsers}</p>
              </div>
            </div>
          </section>
        </div>

        <div className='flex gap-[30px] my-[30px]'>
          {/* Section Laporan Pengguna */}
          <section className='w-[610px] h-[350px] bg-white rounded-[16px] shadow p-6'>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Laporan Pengguna</h2>
              <span className="text-gray-600 font-ruda">
                Total: {groupAccountReports().length} Akun Dilaporkan
              </span>
            </div>
            <div className="overflow-x-auto max-h-[270px]">
              {groupAccountReports().length === 0 ? (
                <p className="text-gray-700">Tidak ada akun dilaporkan.</p>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-600">
                      <th className="p-3">Pengguna</th>
                      <th className="p-3">Username</th>
                      <th className="p-3">Jumlah Laporan</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupAccountReports().map((reports) => {
                      const user = reports[0].reported_user
                      const reportCount = reports.length
                      return (
                        <tr key={user.id} className="border-t">
                          <td className="p-3 text-gray-900">{user.name}</td>
                          <td className="p-3 text-gray-900">{user.username}</td>
                          <td className="p-3 text-gray-900">{reportCount} Laporan</td>
                          <td className="p-3 text-gray-900">{reports[0].status}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* Section Laporan Forum */}
          <section className='w-[610px] h-[350px] bg-white rounded-[16px] shadow p-6'>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Laporan Forum</h2>
              <span className="text-gray-600 font-ruda">
                Total: {groupForumReports().length} Forum Dilaporkan
              </span>
            </div>
            <div className="overflow-x-auto max-h-[270px]">
              {groupForumReports().length === 0 ? (
                <p className="text-gray-700">Tidak ada forum dilaporkan.</p>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-600">
                      <th className="p-3">Judul Forum</th>
                      <th className="p-3">Pembuat</th>
                      <th className="p-3">Jumlah Laporan</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupForumReports().map((reports) => {
                      const forum = reports[0].forum
                      const reportCount = reports.length
                      return (
                        <tr key={forum.id} className="border-t">
                         <td className="p-3 text-gray-900 truncate max-w-[200px]" title={forum.title}>
                            {forum.title}
                          </td>
                          <td className="p-3 text-gray-900">{forum.user.username}</td>
                          <td className="p-3 text-gray-900">{reportCount} Laporan</td>
                          <td className="p-3 text-gray-900">{reports[0].status}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}