'use client';

import { useState, useEffect } from 'react';
import SidebarAdmin from '@/app/components/sidebaradmin';
import ModalWhite from '@/app/components/ModalWhite';
import { Ellipse } from '@/app/components/svgs/page';
import { Forum, type ForumReport } from '@/app/types/types';
import Alert from '@/app/components/Alert';
import axios from 'axios';

export default function ForumReport() {
  const [forumReports, setForumReports] = useState<ForumReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isForumReasonsModalOpen, setIsForumReasonsModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isConfirmActionModalOpen, setIsConfirmActionModalOpen] = useState(false);
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null);
  const [selectedForumReasons, setSelectedForumReasons] = useState<ForumReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [selectedForumId, setSelectedForumId] = useState<number | null>(null);
  const [actionChoice, setActionChoice] = useState<string>('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [alertMessage, setAlertMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState<string>(''); 
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_URL}/api/report/forum`);
      const data: ForumReport[] = await res.json();
      setForumReports(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Gagal mengambil laporan:', error);
      setForumReports([]);
      setLoading(false);
      setAlertType('error');
      setAlertMessage('Gagal mengambil laporan');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    }
  };

  const handleReportAction = async (reportId: number, action: 'accept' | 'reject') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Silakan login terlebih dahulu');
      const response = await axios.post(
        `${API_URL}/api/report/forum/${reportId}/handle`,
        { action },
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      if (response.status === 200) {
        fetchReports();
        setAlertType('success');
        setAlertMessage(response.data.message || `Laporan berhasil ${action === 'accept' ? 'diterima' : 'ditolak'}`);
      }
    } catch (error: any) {
      console.error(`Error ${action} laporan:`, error);
      setAlertType('error');
      setAlertMessage(error.response?.data?.error || `Gagal ${action === 'accept' ? 'menerima' : 'menolak'} laporan`);
    } finally {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    }
  };

  const openDetailModal = async (forumId: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Silakan login terlebih dahulu');
      const response = await axios.get(`${API_URL}/api/forum/${forumId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setSelectedForum(response.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Error fetching forum details:', error);
      setAlertType('error');
      setAlertMessage('Gagal mengambil detail forum');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  const openActionModal = (reportId: number, forumId: number) => {
    setSelectedReportId(reportId);
    setSelectedForumId(forumId);
    setActionChoice('');
    setIsActionModalOpen(true);
  };

  const confirmAction = () => {
    if (!selectedReportId || !selectedForumId || !actionChoice) return;

    switch (actionChoice) {
      case 'accept':
      case 'reject':
        setIsConfirmActionModalOpen(true);
        break;
      default:
        break;
    }
    setIsActionModalOpen(false);
  };

  const executeConfirmedAction = async () => {
    if (!selectedReportId || !actionChoice) return;

    await handleReportAction(selectedReportId, actionChoice as 'accept' | 'reject');
    setIsConfirmActionModalOpen(false);
  };

  const groupForumReports = () => {
    const grouped = forumReports.reduce((acc, report) => {
      const forumId = report.forum_id;
      if (!acc[forumId]) acc[forumId] = [];
      acc[forumId].push(report);
      return acc;
    }, {} as Record<number, ForumReport[]>);
    return Object.values(grouped).map(group => ({
      forum: group[0].forum,
      reports: group,
      status: group[0].status,
    }));
  };

  const applyFilterAndSearch = () => {
    let filtered = groupForumReports();
    if (searchQuery) {
      filtered = filtered.filter(group =>
        group.forum.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.forum.user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  };

  const filteredReports = applyFilterAndSearch();

  if (loading) return <p className="text-center mt-10 text-gray-700">Memuat...</p>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarAdmin />
      <div className="flex-1 ml-[240px] p-4">
        {showAlert && <Alert type={alertType} message={alertMessage} onClose={() => setShowAlert(false)} />}
        <header className="flex justify-between items-center h-16 mb-4">
          <h1 className="text-2xl font-bold text-gray-800 font-ruda">Laporan Postingan</h1>
        </header>

        <div className="bg-white p-4 rounded-lg shadow mb-4 flex items-center justify-between gap-4 font-ruda">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul atau username..."
              className="p-2 border rounded bg-white text-gray-700 w-64 text-sm"
            />
          </div>
          <span className="text-sm font-semibold text-gray-700">
            Total Laporan: {filteredReports.length}
          </span>
        </div>

        {/* Tabel Laporan */}
        <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-600">
                <th className="p-2">Judul</th>
                <th className="p-2">Pembuat</th>
                <th className="p-2">Jumlah Laporan</th>
                <th className="p-2">Status</th>
                <th className="p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-2 text-center text-gray-600">Tidak ada laporan postingan.</td>
                </tr>
              ) : (
                filteredReports.map((group) => (
                  <tr key={group.forum.id} className="border-t text-hitam1">
                    <td className="p-2">
                      <button
                        onClick={() => openDetailModal(group.forum.id)}
                        className="text-blue-600 hover:underline"
                      >
                        {group.forum.title}
                      </button>
                    </td>
                    <td className="p-2">{group.forum.user.username}</td>
                    <td className="p-2">
                      <button
                        onClick={() => { setSelectedForumReasons(group.reports); setIsForumReasonsModalOpen(true); }}
                        className="text-blue-600 hover:underline"
                      >
                        {group.reports.length} Laporan
                      </button>
                    </td>
                    <td className="p-2">{group.status}</td>
                    <td className="p-2">
                      {group.status === 'pending' && (
                        <button
                          onClick={() => openActionModal(group.reports[0].id, group.forum.id)}
                          className="text-blue-600 hover:underline"
                        >
                          Pilih Aksi
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Aksi */}
        <ModalWhite isOpen={isActionModalOpen} onClose={() => setIsActionModalOpen(false)}>
          <div className="w-[500px] p-6">
            <h2 className="text-2xl font-semibold font-ruda text-hitam1 text-center mb-3">Pilih Tindakan</h2>
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
                onClick={() => setIsActionModalOpen(false)}
                className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-full hover:bg-gray-600 transition-all duration-200"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmAction}
                disabled={!actionChoice}
                className={`px-6 py-2 text-white font-semibold rounded-full hover:shadow-lg transition-all duration-200 ${actionChoice ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
                  }`}
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </ModalWhite>

        {/* Modal Konfirmasi untuk Terima/Tolak */}
        <ModalWhite isOpen={isConfirmActionModalOpen} onClose={() => setIsConfirmActionModalOpen(false)}>
          <div className="w-[450px] p-6">
            <h2 className="text-2xl font-semibold font-ruda text-hitam1 text-center mb-3">
              Konfirmasi {actionChoice === 'accept' ? 'Terima' : 'Tolak'} Laporan
            </h2>
            <p className="text-[16px] text-hitam2 mb-6 text-center">
              Apakah Anda yakin ingin {actionChoice === 'accept' ? 'menerima' : 'menolak'} laporan ini?
            </p>
            <div className="flex justify-center gap-3 font-ruda">
              <button
                type="button"
                onClick={() => setIsConfirmActionModalOpen(false)}
                className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-full hover:bg-gray-600 transition-all duration-200"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeConfirmedAction}
                className={`px-6 py-2 text-white font-semibold rounded-full hover:shadow-lg transition-all duration-200 ${actionChoice === 'accept' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
              >
                Ya, {actionChoice === 'accept' ? 'Terima' : 'Tolak'}
              </button>
            </div>
          </div>
        </ModalWhite>

        {/* Modal Alasan */}
        <ModalWhite isOpen={isForumReasonsModalOpen} onClose={() => { setIsForumReasonsModalOpen(false); setSelectedForumReasons([]); }}>
          <div className="w-[500px] max-h-[400px]">
            <h2 className="text-2xl font-semibold font-ruda text-hitam1 text-center mb-3">Detail Alasan Laporan</h2>
            <div className="space-y-4 max-h-64 overflow-y-auto scrollbar-hide">
              {selectedForumReasons.map((report, index) => (
                <div key={report.id} className="border p-2 rounded text-hitam1 font-ruda">
                  <p className='text-md'><strong>Laporan {index + 1}</strong> <span className='text-[12px]'>Tanggal: {new Date(report.created_at).toLocaleString('id-ID')}</span></p>
                  <p className='text-[14px] mt-2'>Alasan: {report.reason}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <button type="button" onClick={() => { setIsForumReasonsModalOpen(false); setSelectedForumReasons([]); }} className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-full hover:bg-gray-600 transition-all duration-200">Tutup</button>
            </div>
          </div>
        </ModalWhite>

        {/* Modal Detail Forum */}
        <ModalWhite isOpen={isDetailModalOpen} onClose={() => { setIsDetailModalOpen(false); setSelectedForum(null); }}>
          <div className="w-[750px] max-h-[600px] p-6">
            <h2 className="text-2xl font-semibold font-ruda text-hitam1 text-center mb-6">Detail Forum</h2>
            {selectedForum ? (
              <div className="bg-white rounded-[16px] max-h-[450px] overflow-y-auto scrollbar-hide">
                {/* Header Forum */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <img
                      src={`${API_URL}${selectedForum.profile}`}
                      alt="Profile"
                      className="w-[40px] h-[40px] object-cover rounded-full border border-hitam2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                      }}
                    />
                    <div className="ms-3">
                      <div className="flex items-center">
                        <p className="text-[15px] font-ruda text-hitam2 font-semibold me-2">{selectedForum.name}</p>
                        <Ellipse className="fill-black" />
                        <p className="text-[14px] font-ruda text-hitam3 font-medium ms-2">@{selectedForum.username}</p>
                      </div>
                      <p className="text-[9px] font-ruda text-hitam4 font-semibold">{selectedForum.relative_time}</p>
                    </div>
                  </div>
                </div>

                {/* Konten Forum */}
                <div>
                  <h2 className="text-[17px] font-ruda font-bold text-hitam1 whitespace-pre-wrap">{selectedForum.title}</h2>
                  <p className="text-[15px] font-ruda font-medium mt-3 text-hitam1 whitespace-pre-wrap">{selectedForum.description}</p>
                  <div className="mt-2 flex flex-wrap">
                    {selectedForum.tags && selectedForum.tags.map((tag: any) => (
                      <span
                        key={tag.id}
                        className="py-1 px-2 text-[10px] font-ruda font-bold bg-gray-200 text-hitam2 rounded-full me-1 mb-1"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>

                  {/* Foto */}
                  {selectedForum.photo && (
                    <div className="w-[500px] bg-white rounded-[15px] mt-3 border border-gray-400 overflow-hidden">
                      <img src={`${API_URL}${selectedForum.photo}`} alt={selectedForum.title} className="w-full object-cover" />
                    </div>
                  )}
                  {selectedForum.photos && selectedForum.photos.length > 0 && (
                    <div className="mt-3">
                      <div className="w-[500px] h-[500px] bg-white rounded-[15px] border border-gray-400 overflow-hidden flex items-center justify-center">
                        <img
                          src={`${API_URL}${selectedForum.photos[0]}`} 
                          alt={selectedForum.title}
                          className="w-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Komentar */}
                <div className="mt-5">
                  <h3 className="text-[16px] font-ruda text-hitam1 mb-4">{selectedForum.comments ? selectedForum.comments.length : 0} Komentar <span className='ms-3'>{selectedForum.like} Suka</span> </h3>
                  {selectedForum.comments && selectedForum.comments.length > 0 ? (
                    selectedForum.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-100 rounded-[10px] p-3 mt-3">
                        <div className="flex items-center justify-between">
                          <div className="flex">
                            <img
                              src={`${API_URL}${comment.profile}`}
                              alt="Profile"
                              className="w-[35px] h-[35px] object-cover rounded-full border border-hitam2"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                              }}
                            />
                            <div className="ms-3">
                              <div className="flex items-center">
                                <p className="text-[13px] font-ruda text-hitam2 font-semibold me-2">{comment.name}</p>
                                <Ellipse className="fill-black" />
                                <p className="text-[12px] font-ruda text-hitam3 font-medium ms-2">@{comment.username}</p>
                              </div>
                              <p className="text-[9px] font-ruda text-hitam4 font-semibold">{comment.relative_time}</p>
                            </div>
                          </div>
                        </div>
                        <div className="ms-[45px] mt-2">
                          <p className="text-[14px] font-ruda text-hitam1">{comment.content}</p>
                        </div>

                        {/* Balasan */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-3 ms-[45px]">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="mt-3">
                                <div className="flex items-center">
                                  <img
                                    src={`${API_URL}${reply.profile}`}
                                    alt="Profile"
                                    className="w-[35px] h-[35px] object-cover rounded-full border border-hitam2"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                                    }}
                                  />
                                  <div className="ms-3">
                                    <div className="flex items-center">
                                      <p className="text-[13px] font-ruda text-hitam2 font-semibold me-2">{reply.name}</p>
                                      <Ellipse className="fill-black" />
                                      <p className="text-[12px] font-ruda text-hitam3 font-medium ms-2">@{reply.username}</p>
                                    </div>
                                    <p className="text-[9px] font-ruda text-hitam4 font-semibold">{reply.relative_time}</p>
                                  </div>
                                </div>
                                <div className="ms-[45px] mt-1">
                                  <p className="text-[14px] font-ruda text-hitam1">{reply.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-hitam1">Tidak ada komentar.</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-center text-hitam1">Tidak ada data forum.</p>
            )}
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={() => { setIsDetailModalOpen(false); setSelectedForum(null); }}
                className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-full hover:bg-gray-600 transition-all duration-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </ModalWhite>
      </div>
    </div>
  );
}