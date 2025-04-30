'use client';

import { useState, useEffect, useRef } from 'react';
import SidebarAdmin from '@/app/components/sidebaradmin';
import ModalWhite from '@/app/components/ModalWhite';
import { Reports, UserProfile } from '@/app/types/types';
import Alert from '@/app/components/Alert';
import axios from 'axios';
import { Ellipse} from '@/app/components/svgs';

export default function UserReport() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [accountReports, setAccountReports] = useState<{ pending: Reports[], pending_suspended: Reports[] }>({ pending: [], pending_suspended: [] });
  const [loading, setLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isAccountDetailModalOpen, setIsAccountDetailModalOpen] = useState(false);
  const [isReasonsModalOpen, setIsReasonsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Reports | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<Reports[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [alertMessage, setAlertMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Silakan login terlebih dahulu');
      const res = await fetch(`${API_URL}/api/report/akun`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setAccountReports({ pending: data.pending || [], pending_suspended: data.pending_suspended || [] });
      setLoading(false);
    } catch (error) {
      console.error('Gagal mengambil laporan:', error);
      setAccountReports({ pending: [], pending_suspended: [] });
      setLoading(false);
      setAlertType('error');
      setAlertMessage('Gagal mengambil laporan');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    }
  };

  const applyFilterAndSearch = () => {
    let filtered = groupAccountReports();
    if (searchQuery) {
      filtered = filtered.filter(group =>
        group.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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

  const openAccountDetailModal = async (userId: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Silakan login terlebih dahulu');
      const response = await axios.get(`${API_URL}/api/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setSelectedUser({ ...response.data.profile, forums: response.data.profile.forums || [] });
      setIsAccountDetailModalOpen(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setAlertType('error');
      setAlertMessage('Gagal mengambil detail akun');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  const groupAccountReports = () => {
    const allReports = [...accountReports.pending, ...accountReports.pending_suspended];
    const grouped = allReports.reduce((acc, report) => {
      const userId = report.reported_user.id;
      if (!acc[userId]) acc[userId] = [];
      acc[userId].push(report);
      return acc;
    }, {} as Record<number, Reports[]>);
    return Object.values(grouped).map(group => ({
      user: group[0].reported_user,
      reports: group,
      latestReportStatus: group.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].status, // Status laporan terbaru
    }));
  };

  const filteredReports = applyFilterAndSearch();

  const getTotalComments = (forum: any) => {
    if (!forum.comments || !Array.isArray(forum.comments)) return 0;
    const commentsCount = forum.comments.length;
    const repliesCount = forum.comments.reduce((total: number, comment: any) => {
      return total + (comment.replies && Array.isArray(comment.replies) ? comment.replies.length : 0);
    }, 0);
    return commentsCount + repliesCount;
  };

  if (loading) return <p className="text-center mt-10 text-gray-700">Memuat...</p>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarAdmin />
      <div className="flex-1 ml-[240px] p-4">
        {showAlert && <Alert type={alertType} message={alertMessage} onClose={() => setShowAlert(false)} />}
        <header className="flex justify-between items-center h-16 mb-4">
          <h1 className="text-2xl font-bold text-gray-800 font-ruda">Laporan Pengguna</h1>
        </header>

        {/* Filter dan Pencarian */}
        <div className="bg-white p-4 rounded-lg shadow mb-4 flex items-center justify-between gap-4 font-ruda">
          <div className="flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau username..."
              className="p-2 border rounded bg-white text-gray-700 w-64 text-sm"
            />
          </div>
          <div className="flex items-center">
            <span className="text-sm font-semibold text-gray-700">
              Total laporan: {filteredReports.length} 
            </span>
          </div>
        </div>

        {/* Tabel Laporan */}
        <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-600">
                <th className="p-2">Nama</th>
                <th className="p-2">Username</th>
                <th className="p-2">Jumlah Laporan</th>
                <th className="p-2">Status Akun</th>
                <th className="p-2">Status Laporan</th>
                <th className="p-2">Hitungan Suspend</th>
                <th className="p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-2 text-center text-gray-600">Tidak ada laporan pengguna.</td>
                </tr>
              ) : (
                filteredReports.map((group) => (
                  <tr key={group.user.id} className="border-t text-hitam1">
                    <td className="p-2">
                      <button
                        onClick={() => openAccountDetailModal(group.user.id)}
                        className="text-blue-600 hover:underline"
                      >
                        {group.user.name}
                      </button>
                    </td>
                    <td className="p-2">{group.user.username}</td>
                    <td className="p-2">
                      <button
                        onClick={() => { setSelectedReasons(group.reports); setIsReasonsModalOpen(true); }}
                        className="text-blue-600 hover:underline"
                      >
                        {group.reports.length} Laporan
                      </button>
                    </td>
                    <td className="p-2">
                      {group.user.status === 'suspended' && group.user.suspend_until 
                        ? `Suspended (${new Date(group.user.suspend_until).toLocaleDateString('id-ID')})` 
                        : 'Active'}
                    </td>
                    <td className="p-2">{group.latestReportStatus === 'pending_suspended' ? 'Pending (Suspended)' : group.latestReportStatus}</td>
                    <td className="p-2">{group.user.suspend_count || 0}</td>
                    <td className="p-2">
                      {(group.latestReportStatus === 'pending' || group.latestReportStatus === 'pending_suspended') && (
                        <button
                          onClick={() => { setSelectedReport(group.reports[0]); setIsReviewModalOpen(true); }}
                          className="text-blue-600 hover:underline"
                        >
                          Tinjau
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Tinjau */}
        <ModalWhite isOpen={isReviewModalOpen} onClose={() => { setIsReviewModalOpen(false); setSelectedReport(null); }}>
          <div className="w-[500px] max-h-[400px] p-6">
            <h2 className="text-2xl font-semibold font-ruda text-hitam1 text-center mb-3">Tinjau Laporan</h2>
            {selectedReport && (
              <div className="mb-4 text-md font-ruda text-hitam1">
                <p>Pengguna: {selectedReport.reported_user.name}@{selectedReport.reported_user.username}</p>
                <p>Status Akun: {selectedReport.reported_user.status === 'suspended' && selectedReport.reported_user.suspend_until ? `Suspended hingga ${new Date(selectedReport.reported_user.suspend_until).toLocaleString('id-ID')}` : 'Aktif'}</p>
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
                <input type="number" name="days" min="1" className="w-full p-3 border rounded-lg text-sm bg-white text-hitam1 border-hitam1" defaultValue="7" />
              </div>
              <div className="flex justify-center gap-3">
                <button type="button" onClick={() => { setIsReviewModalOpen(false); setSelectedReport(null); }} className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-full hover:bg-gray-600 transition-all duration-200">Batal</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 hover:shadow-lg transition-all duration-200">Kirim</button>
              </div>
            </form>
          </div>
        </ModalWhite>

        {/* Modal Detail Akun */}
        <ModalWhite isOpen={isAccountDetailModalOpen} onClose={() => { setIsAccountDetailModalOpen(false); setSelectedUser(null); }}>
          <div className='max-h-[600px]'>
            <h2 className="text-2xl font-semibold font-ruda text-hitam1 text-center mb-3">Detail Akun</h2>
            {selectedUser && (
              <div className="space-y-4 text-sm">
                <div className="flex items-center mb-3">
                  {selectedUser.profile &&
                    <img
                      src={`${API_URL}${selectedUser.profile}`}
                      alt={selectedUser.username}
                      className="w-[40px] h-[40px] rounded-full mr-3 object-cover cursor-pointer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                      }}
                    />
                  }
                  <div>
                    <div className="flex items-center">
                      <p className="text-[14px] font-ruda text-hitam2 font-semibold me-[6px] cursor-pointer hover:underline">
                        {selectedUser.name}
                      </p>
                      <Ellipse className="fill-black" />
                      <p className="text-[14px] font-ruda text-hitam3 font-medium ms-[6px] cursor-pointer hover:underline">
                        @{selectedUser.username}
                      </p>
                    </div>
                    <p className="text-[12px] text-gray-600">
                      Status: {selectedUser.status === 'suspended' && selectedUser.suspend_until ? `Suspended hingga ${new Date(selectedUser.suspend_until).toLocaleString('id-ID')}` : 'Aktif'}
                    </p>
                    <p className="text-[12px] text-gray-600">Total Suspend: {selectedUser.suspend_count || 0}</p>
                  </div>
                </div>

                <h3 className="font-semibold text-hitam1 font-ruda ">Postingan</h3>
                <div className='max-h-[400px] overflow-y-auto scrollbar-hide'>
                  {selectedUser.forums?.length ? selectedUser.forums.map(forum => (
                    <div
                      key={forum.id}
                      className="w-[700px] p-[20px] bg-putih1 rounded-[16px] border border-hitam2 relative overflow-hidden mb-2"
                    >
                      <div className="flex items-center mb-3 text-[12px] font-ruda text-hitam1 gap-2">
                        <p>{forum.relative_time}</p>
                        <Ellipse className="fill-black" />
                        <p>{forum.like} Suka</p>
                        <Ellipse className="fill-black" />
                        <p>{getTotalComments(forum)} Komentar</p>
                      </div>

                      <div className="w-full grid grid-cols-[1fr_auto] gap-4">
                        <div className="min-w-0">
                          <h2 className="text-[12px] font-bold font-ruda text-hitam2" >
                            {forum.title}
                          </h2>
                          <p className='text-[12px] font-ruda text-hitam3 mb-4'>
                            {forum.description}
                          </p>
                          <div className="flex flex-wrap absolute bottom-2">
                            {forum.tags &&
                              forum.tags.length > 0 &&
                              forum.tags.slice(0, 10).map((tag: any) => (
                                <span
                                  key={tag.id}
                                  className="text-hitam1 font-ruda font-extrabold text-[10px] me-1"
                                >
                                  #{tag.name}
                                </span>
                              ))}
                          </div>
                        </div>
                        {forum.photo && (
                          <img
                            src={`${API_URL}${forum.photo}`}
                            alt={forum.title}
                            className="w-[150px] h-[150px] rounded-[16px] object-cover flex-shrink-0 -mt-[40px] border border-hitam2 cursor-pointer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                            }}
                          />
                        )}
                        {forum.photos && forum.photos.length > 0 && (
                          <div className="relative w-[150px] h-[150px] -mt-[40px] flex-shrink-0">
                            <img
                              src={`${API_URL}${forum.photos[0]}`}
                              alt={forum.title}
                              className="w-full h-full rounded-[16px] object-cover border border-hitam2 cursor-pointer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                              }}
                            />
                            {forum.photos.length > 1 && (
                              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-[12px] font-ruda px-2 py-1 rounded">
                                +{Math.min(forum.photos.length - 1, 4)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )) : <p className="text-gray-700">Belum ada postingan</p>}
                </div>
              </div>
            )}
            <div className="flex justify-center mt-4">
              <button type="button" onClick={() => { setIsAccountDetailModalOpen(false); setSelectedUser(null); }} className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-full hover:bg-gray-600 transition-all duration-200">Tutup</button>
            </div>
          </div>
        </ModalWhite>

        {/* Modal Alasan */}
        <ModalWhite isOpen={isReasonsModalOpen} onClose={() => { setIsReasonsModalOpen(false); setSelectedReasons([]); }}>
          <div className="w-[500px] max-h-[400px]">
            <h2 className="text-2xl font-semibold font-ruda text-hitam1 text-center mb-3">Detail Alasan Laporan</h2>
            <div className="space-y-4 max-h-64 overflow-y-auto scrollbar-hide">
              {selectedReasons.map((report, index) => (
                <div key={report.id} className="border p-2 rounded text-hitam1 font-ruda">
                  <p className='text-md'><strong>Laporan {index + 1}</strong> <span className='text-[12px]'>Tanggal: {new Date(report.created_at).toLocaleString('id-ID')}</span></p>
                  <p className='text-[14px] mt-2'>Alasan: {report.reason}</p>
                  <p className='text-[12px] mt-1'>Status: {report.status === 'pending_suspended' ? 'Pending (Suspended)' : report.status}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <button type="button" onClick={() => { setIsReasonsModalOpen(false); setSelectedReasons([]); }} className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-full hover:bg-gray-600 transition-all duration-200">Tutup</button>
            </div>
          </div>
        </ModalWhite>
      </div>
    </div>
  );
}