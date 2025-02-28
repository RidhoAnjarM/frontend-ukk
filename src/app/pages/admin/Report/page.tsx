// src/app/admin/reports/page.tsx
'use client'

import { useState, useEffect } from 'react'
import SidebarAdmin from '@/app/components/sidebaradmin'
import ThemeToggle from '@/app/components/ThemeTogle'
import Modal from '@/app/components/Modal'

interface User {
  id: number;
  name: string;
  username: string;
  profile: string;
  status: string;
  suspend_until?: string;
  created_at: string;
}

interface Forum {
  id: number;
  title: string;
  description: string;
  photo: string;
  user_id: number;
  user: User;
  category_id?: number;
  likes_count: number;
  created_at: string;
}

interface Report {
  id: number;
  reporter_id: number;
  reported_id: number;
  reason: string;
  status: string;
  created_at: string;
  reported_user: User;
}

interface ForumReport {
  id: number;
  reporter_id: number;
  forum_id: number;
  reason: string;
  status: string;
  created_at: string;
  forum: Forum;
}

export default function Report() {
  const [accountReports, setAccountReports] = useState<Report[]>([])
  const [forumReports, setForumReports] = useState<ForumReport[]>([])
  const [loading, setLoading] = useState(true)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const accountRes = await fetch('http://localhost:5000/api/report/akun')
      const accountData: Report[] = await accountRes.json()
      setAccountReports(accountData)

      const forumRes = await fetch('http://localhost:5000/api/report/forum')
      const forumData: ForumReport[] = await forumRes.json()
      setForumReports(forumData)

      setLoading(false)
    } catch (error) {
      console.error('Error fetching reports:', error)
      setLoading(false)
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
        alert('Please login first')
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
        alert(data.message)
      } else {
        alert(data.error || 'Failed to review report')
      }
    } catch (error) {
      console.error('Error reviewing report:', error)
      alert('Error occurred while reviewing report')
    }
  }

  const handleDeleteForum = async (forumId: number) => {
    if (confirm('Are you sure you want to delete this forum?')) {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          alert('Please login first')
          return
        }

        const response = await fetch(`http://localhost:5000/api/forum/${forumId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        const data = await response.json()
        if (response.ok) {
          fetchReports()
          alert(data.message)
        } else {
          alert(data.error || 'Failed to delete forum')
        }
      } catch (error) {
        console.error('Error deleting forum:', error)
        alert('Error occurred while deleting forum')
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
            Manage Reports
          </h1>
          <ThemeToggle />
        </header>

        {/* Account Reports */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Account Reports
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600 dark:text-gray-300">
                  <th className="p-3">ID</th>
                  <th className="p-3">Reported User</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Created At</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {accountReports.map(report => (
                  <tr key={report.id} className="border-t dark:border-gray-700">
                    <td className="p-3 text-gray-900 dark:text-gray-200">{report.id}</td>
                    <td className="p-3 text-gray-900 dark:text-gray-200">{report.reported_user.name}</td>
                    <td className="p-3 text-gray-900 dark:text-gray-200">{report.reported_user.username}</td>
                    <td className="p-3 text-gray-900 dark:text-gray-200">{report.reason}</td>
                    <td className="p-3 text-gray-900 dark:text-gray-200">{report.status}</td>
                    <td className="p-3 text-gray-900 dark:text-gray-200">
                      {new Date(report.created_at).toLocaleString()}
                    </td>
                    <td className="p-3">
                      {report.status === 'pending' && (
                        <button
                          onClick={() => {
                            setSelectedReport(report)
                            setIsReviewModalOpen(true)
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Forum Reports */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Forum Reports
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600 dark:text-gray-300">
                  <th className="p-3">ID</th>
                  <th className="p-3">Forum Title</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Author</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Created At</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {forumReports.map(report => (
                  <tr key={report.id} className="border-t dark:border-gray-700">
                    <td className="p-3 text-gray-900 dark:text-gray-200">{report.id}</td>
                    <td className="p-3 text-gray-900 dark:text-gray-200">{report.forum.title}</td>
                    <td className="p-3 text-gray-900 dark:text-gray-200 truncate max-w-xs">
                      {report.forum.description}
                    </td>
                    <td className="p-3 text-gray-900 dark:text-gray-200">
                      {report.forum.user.username}
                    </td>
                    <td className="p-3 text-gray-900 dark:text-gray-200">{report.reason}</td>
                    <td className="p-3 text-gray-900 dark:text-gray-200">{report.status}</td>
                    <td className="p-3 text-gray-900 dark:text-gray-200">
                      {new Date(report.created_at).toLocaleString()}
                    </td>
                    <td className="p-3">
                      {report.status === 'pending' && (
                        <button
                          onClick={() => handleDeleteForum(report.forum_id)}
                          className="text-red-600 dark:text-red-400 hover:underline"
                        >
                          Delete Forum
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Review Modal */}
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false)
            setSelectedReport(null)
          }}
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Review Report #{selectedReport?.id}
          </h2>
          {selectedReport && (
            <div className="mb-4">
              <p className="text-gray-700 dark:text-gray-300">
                Reported User: {selectedReport.reported_user.username} ({selectedReport.reported_user.name})
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Reason: {selectedReport.reason}
              </p>
            </div>
          )}
          <form onSubmit={handleReviewReport}>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Action</label>
              <select
                name="action"
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-200"
                required
              >
                <option value="approve">Approve (Suspend Account)</option>
                <option value="reject">Reject</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">
                Suspension Duration (days)
              </label>
              <input
                type="number"
                name="days"
                min="1"
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-200"
                defaultValue="7"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setIsReviewModalOpen(false)
                  setSelectedReport(null)
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  )
}