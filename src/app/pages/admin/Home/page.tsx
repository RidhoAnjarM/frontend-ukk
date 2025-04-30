'use client';

import { useEffect, useState } from 'react';
import SidebarAdmin from '@/app/components/sidebaradmin';
import TagDoughnutChart from '@/app/components/TagDonat';
import { ForumReport, Reports } from '@/app/types/types';
import UserRegister from '@/app/components/UserRegister';
import { useRouter } from 'next/navigation';
import ModalWhite from '@/app/components/ModalWhite';
import Alert from '@/app/components/Alert';
import axios from 'axios';
interface GroupedAccountReport {
  user: Reports['reported_user'];
  reports: Reports[];
  latestReportStatus: string;
}

export default function AdminHome() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const [totalUsers, setTotalUsers] = useState(0);
  const [weeklyUsers, setWeeklyUsers] = useState(0);
  const [totalForums, setTotalForums] = useState(0);
  const [weeklyForums, setWeeklyForums] = useState(0);
  const [accountReports, setAccountReports] = useState<{ pending: Reports[]; pending_suspended: Reports[] }>({
    pending: [],
    pending_suspended: [],
  });
  const [forumReports, setForumReports] = useState<ForumReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isForumActionModalOpen, setIsForumActionModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Reports | null>(null);
  const [selectedForumReportId, setSelectedForumReportId] = useState<number | null>(null);
  const [actionChoice, setActionChoice] = useState<string>('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [alertMessage, setAlertMessage] = useState('');

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users-stats`);
      const data = await response.json();
      setTotalUsers(data.total_users);
      setWeeklyUsers(data.weekly_users);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchForumStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/forum/stats`);
      const data = await response.json();
      setTotalForums(data.total_forums);
      setWeeklyForums(data.weekly_forums);
    } catch (error) {
      console.error('Error fetching forum stats:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Silakan login terlebih dahulu');
      const accountRes = await fetch(`${API_URL}/api/report/akun`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const accountData = await accountRes.json();
      setAccountReports({ pending: accountData.pending || [], pending_suspended: accountData.pending_suspended || [] });
      const forumRes = await fetch(`${API_URL}/api/report/forum`);
      const forumData: ForumReport[] = await forumRes.json();
      setForumReports(forumData || []);
      setLoading(false);
    } catch (error) {
      console.error('Gagal mengambil laporan:', error);
      setAccountReports({ pending: [], pending_suspended: [] });
      setForumReports([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
    fetchForumStats();
    fetchReports();
  }, []);

  const groupAccountReports = (): GroupedAccountReport[] => {
    const allReports = [...accountReports.pending, ...accountReports.pending_suspended];
    const grouped = allReports.reduce((acc, report) => {
      const userId = report.reported_user.id;
      if (!acc[userId]) acc[userId] = [];
      acc[userId].push(report);
      return acc;
    }, {} as Record<number, Reports[]>);
    return Object.values(grouped).map((group) => ({
      user: group[0].reported_user,
      reports: group,
      latestReportStatus: group.sort((a: Reports, b: Reports) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].status,
    }));
  };

  const groupForumReports = () => {
    const grouped = forumReports.reduce((acc, report) => {
      const forumId = report.forum_id;
      if (!acc[forumId]) acc[forumId] = [];
      acc[forumId].push(report);
      return acc;
    }, {} as Record<number, ForumReport[]>);
    return Object.values(grouped);
  };

  const handleReviewReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const action = formData.get('action') as string;
    const days = parseInt(formData.get('days') as string) || 0;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Silakan login terlebih dahulu');
      const response = await fetch(`${API_URL}/api/report/akun/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ report_id: selectedReport?.id, action, days }),
      });
      const data = await response.json();
      if (response.ok) {
        fetchReports();
        setIsReviewModalOpen(false);
        setSelectedReport(null);
        setAlertType('success');
        setAlertMessage(data.message || 'Laporan berhasil ditinjau');
      } else {
        setAlertType('error');
        setAlertMessage(data.error || 'Gagal meninjau laporan');
      }
    } catch (error) {
      console.error('Error meninjau laporan:', error);
      setAlertType('error');
      setAlertMessage('Terjadi kesalahan saat meninjau laporan');
    } finally {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    }
  };

  const handleForumReportAction = async () => {
    if (!selectedForumReportId || !actionChoice) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Silakan login terlebih dahulu');
      const response = await axios.post(
        `${API_URL}/api/report/forum/${selectedForumReportId}/handle`,
        { action: actionChoice },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      if (response.status === 200) {
        fetchReports();
        setAlertType('success');
        setAlertMessage(response.data.message || `Laporan berhasil ${actionChoice === 'accept' ? 'diterima' : 'ditolak'}`);
      }
    } catch (error: any) {
      console.error(`Error ${actionChoice} laporan:`, error);
      setAlertType('error');
      setAlertMessage(error.response?.data?.error || `Gagal ${actionChoice === 'accept' ? 'menerima' : 'menolak'} laporan`);
    } finally {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
      setIsForumActionModalOpen(false);
      setSelectedForumReportId(null);
      setActionChoice('');
    }
  };

  const groupedAccountReports = groupAccountReports();
  const groupedForumReports = groupForumReports();

  if (loading) return <p className="text-center mt-10 text-hitam1 text-lg font-ruda">Memuat...</p>;

  return (
    <div className="flex min-h-screen bg-[#F7F7F7]">
      <SidebarAdmin />
      <div className="flex-1 ml-[240px] p-6">
        {showAlert && <Alert type={alertType} message={alertMessage} onClose={() => setShowAlert(false)} />}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-hitam1 font-ruda">Dashboard Admin</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-medium text-gray-600 font-ruda">Total Pengguna</h3>
            <p className="text-2xl font-extrabold text-hitam1 mt-2">{totalUsers}</p>
            <p className="text-xs text-gray-500 mt-1">Semua waktu</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-medium text-gray-600 font-ruda">Pendaftar Minggu Ini</h3>
            <p className="text-2xl font-extrabold text-hitam1 mt-2">{weeklyUsers}</p>
            <p className="text-xs text-gray-500 mt-1">7 hari terakhir</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-medium text-gray-600 font-ruda">Total Postingan</h3>
            <p className="text-2xl font-extrabold text-hitam1 mt-2">{totalForums}</p>
            <p className="text-xs text-gray-500 mt-1">Semua waktu</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-medium text-gray-600 font-ruda">Postingan Minggu Ini</h3>
            <p className="text-2xl font-extrabold text-hitam1 mt-2">{weeklyForums}</p>
            <p className="text-xs text-gray-500 mt-1">7 hari terakhir</p>
          </div>
        </div>

        <div className="flex gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md w-[500px] h-[400px] overflow-hidden flex justify-center items-center">
            <TagDoughnutChart />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md w-[705px] max-h-[400px]">
            <UserRegister />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Laporan Pengguna */}
          <div className="bg-white p-6 rounded-xl shadow-md cursor-pointer" onClick={() => router.push('/pages/admin/UserReport')}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-hitam1 font-ruda">Laporan Pengguna</h2>
              <span className="text-sm text-hitam1 font-ruda bg-gray-100 px-2 py-1 rounded-full">
                {groupedAccountReports.length} Akun
              </span>
            </div>
            <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {groupedAccountReports.length === 0 ? (
                <p className="text-hitam1 text-center py-4">Belum ada laporan pengguna</p>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="sticky top-0 bg-white">
                    <tr className="text-hitam1 border-b">
                      <th className="p-3 font-medium">Pengguna</th>
                      <th className="p-3 font-medium">Laporan</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedAccountReports.map((group) => (
                      <tr key={group.user.id} className="border-t hover:bg-gray-50 text-hitam4">
                        <td className="p-3">
                          <span className="font-medium">{group.user.name}</span>
                          <span className="text-gray-500"> (@{group.user.username})</span>
                        </td>
                        <td className="p-3">{group.reports.length}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              group.latestReportStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : group.latestReportStatus === 'pending_suspended'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {group.latestReportStatus === 'pending_suspended' ? 'Pending (Suspended)' : group.latestReportStatus}
                          </span>
                        </td>
                        <td className="p-3">
                          {(group.latestReportStatus === 'pending' || group.latestReportStatus === 'pending_suspended') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReport(group.reports[0]);
                                setIsReviewModalOpen(true);
                              }}
                              className="text-blue-600 hover:underline"
                            >
                              Tinjau
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Laporan Forum */}
          <div className="bg-white p-6 rounded-xl shadow-md cursor-pointer" onClick={() => router.push('/pages/admin/ForumReport')}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-hitam1 font-ruda">Laporan Forum</h2>
              <span className="text-sm text-hitam1 font-ruda bg-gray-100 px-2 py-1 rounded-full">
                {groupedForumReports.length} Postingan
              </span>
            </div>
            <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {groupedForumReports.length === 0 ? (
                <p className="text-hitam1 text-center py-4">Belum ada laporan forum</p>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="sticky top-0 bg-white">
                    <tr className="text-hitam1 border-b">
                      <th className="p-3 font-medium">Judul</th>
                      <th className="p-3 font-medium">Pembuat</th>
                      <th className="p-3 font-medium">Laporan</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedForumReports.map((reports) => {
                      const forum = reports[0].forum;
                      return (
                        <tr key={forum.id} className="border-t hover:bg-gray-50 text-hitam4">
                          <td className="p-3 truncate max-w-[200px]" title={forum.title}>
                            {forum.title}
                          </td>
                          <td className="p-3">{forum.user.username}</td>
                          <td className="p-3">{reports.length}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                reports[0].status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {reports[0].status}
                            </span>
                          </td>
                          <td className="p-3">
                            {reports[0].status === 'pending' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedForumReportId(reports[0].id);
                                  setIsForumActionModalOpen(true);
                                }}
                                className="text-blue-600 hover:underline"
                              >
                                Tinjau
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Modal Tinjau Laporan Pengguna */}
        <ModalWhite
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedReport(null);
          }}
        >
          <div className="w-[500px] max-h-[400px] p-6">
            <h2 className="text-2xl font-semibold font-ruda text-hitam1 text-center mb-3">Tinjau Laporan Pengguna</h2>
            {selectedReport && (
              <div className="mb-4 text-md font-ruda text-hitam1">
                <p>
                  Pengguna: {selectedReport.reported_user.name}@{selectedReport.reported_user.username}
                </p>
                <p>
                  Status Akun:{' '}
                  {selectedReport.reported_user.status === 'suspended' && selectedReport.reported_user.suspend_until
                    ? `Suspended hingga ${new Date(selectedReport.reported_user.suspend_until).toLocaleString('id-ID')}`
                    : 'Aktif'}
                </p>
                <p>Total Suspend: {selectedReport.reported_user.suspend_count || 0}</p>
              </div>
            )}
            <form onSubmit={handleReviewReport}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1 text-sm">Aksi</label>
                <select name="action" className="w-full p-3 border rounded-lg text-sm bg-white text-hitam1 border-hitam1" required>
                  <option value="approve">Tangguhkan</option>
                  {selectedReport?.reported_user.status === 'suspended' && <option value="extend">Perpanjang Suspend</option>}
                  <option value="reject">Tolak</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1 text-sm">Durasi (hari)</label>
                <input
                  type="number"
                  name="days"
                  min="1"
                  className="w-full p-3 border rounded-lg text-sm bg-white text-hitam1 border-hitam1"
                  defaultValue="7"
                />
              </div>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsReviewModalOpen(false);
                    setSelectedReport(null);
                  }}
                  className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-full hover:bg-gray-600 transition-all duration-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 hover:shadow-lg transition-all duration-200"
                >
                  Kirim
                </button>
              </div>
            </form>
          </div>
        </ModalWhite>

        {/* Modal Tinjau Laporan Forum */}
        <ModalWhite
          isOpen={isForumActionModalOpen}
          onClose={() => {
            setIsForumActionModalOpen(false);
            setSelectedForumReportId(null);
          }}
        >
          <div className="w-[500px] p-6">
            <h2 className="text-2xl font-semibold font-ruda text-hitam1 text-center mb-3">Tinjau Laporan Forum</h2>
            <div className="mb-4">
              <select
                value={actionChoice}
                onChange={(e) => setActionChoice(e.target.value)}
                className="w-full p-3 border rounded-lg text-sm bg-white text-hitam1 border-hitam1"
              >
                <option value="">Pilih aksi...</option>
                <option value="accept">Terima Laporan</option>
                <option value="reject">Tolak Laporan</option>
              </select>
            </div>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsForumActionModalOpen(false);
                  setSelectedForumReportId(null);
                }}
                className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-full hover:bg-gray-600 transition-all duration-200"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleForumReportAction}
                disabled={!actionChoice}
                className={`px-6 py-2 text-white font-semibold rounded-full hover:shadow-lg transition-all duration-200 ${
                  actionChoice ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </ModalWhite>
      </div>
    </div>
  );
}