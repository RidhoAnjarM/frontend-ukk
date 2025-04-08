'use client';

import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import SidebarAdmin from '@/app/components/sidebaradmin';
import ModalWhite from '@/app/components/ModalWhite';
import { Ellipse } from '@/app/components/svgs/page';
import { Forum, type ForumReport } from '@/app/types/types';
import Alert from '@/app/components/Alert';
import axios from 'axios';

export default function ForumReport() {
  const [forumReports, setForumReports] = useState<ForumReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteReportModalOpen, setIsDeleteReportModalOpen] = useState(false);
  const [isDeleteForumModalOpen, setIsDeleteForumModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isForumReasonsModalOpen, setIsForumReasonsModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<number | null>(null);
  const [forumToDelete, setForumToDelete] = useState<number | null>(null);
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null);
  const [selectedForumReasons, setSelectedForumReasons] = useState<ForumReport[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [alertMessage, setAlertMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>(''); // Filter status
  const [searchQuery, setSearchQuery] = useState<string>(''); // Pencarian
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/report/forum');
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

  const confirmDeleteForum = async () => {
    if (forumToDelete === null) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Silakan login terlebih dahulu');
      const response = await fetch(`http://localhost:5000/api/forum/${forumToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        fetchReports();
        setAlertType('success');
        setAlertMessage(data.message || 'Forum berhasil dihapus');
      } else {
        setAlertType('error');
        setAlertMessage(data.error || 'Gagal menghapus forum');
      }
    } catch (error) {
      console.error('Error menghapus forum:', error);
      setAlertType('error');
      setAlertMessage('Terjadi kesalahan saat menghapus forum');
    } finally {
      setIsDeleteForumModalOpen(false);
      setForumToDelete(null);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    }
  };

  const confirmDeleteReport = async () => {
    if (reportToDelete === null) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Silakan login terlebih dahulu');
      const response = await fetch(`http://localhost:5000/api/report/forum/${reportToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (response.ok) {
        fetchReports();
        setAlertType('success');
        setAlertMessage(data.message || 'Laporan berhasil dihapus');
      } else {
        setAlertType('error');
        setAlertMessage(data.error || 'Gagal menghapus laporan');
      }
    } catch (error) {
      console.error('Error menghapus laporan:', error);
      setAlertType('error');
      setAlertMessage('Terjadi kesalahan saat menghapus laporan');
    } finally {
      setIsDeleteReportModalOpen(false);
      setReportToDelete(null);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    }
  };

  const openDetailModal = async (forumId: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Silakan login terlebih dahulu');
      const response = await axios.get(`http://localhost:5000/api/forum/${forumId}`, {
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
    if (filterStatus) {
      filtered = filtered.filter(group => group.status === filterStatus);
    }
    if (searchQuery) {
      filtered = filtered.filter(group =>
        group.forum.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.forum.user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  };

  const filteredReports = applyFilterAndSearch();

  const printHandler = useReactToPrint({
    documentTitle: 'Laporan Postingan',
    contentRef: componentRef,
  });

  if (loading) return <p className="text-center mt-10 text-gray-700">Memuat...</p>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarAdmin />
      <div className="flex-1 ml-[240px] p-4">
        {showAlert && <Alert type={alertType} message={alertMessage} onClose={() => setShowAlert(false)} />}
        <header className="flex justify-between items-center h-16 mb-4">
          <h1 className="text-2xl font-bold text-gray-800 font-ruda">Laporan Postingan</h1>
        </header>

        {/* Filter dan Pencarian */}
        <div className="bg-white p-4 rounded-lg shadow mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-2 border rounded bg-white text-gray-700 w-40 text-sm"
            >
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul atau username..."
              className="p-2 border rounded bg-white text-gray-700 w-64 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">
              Total: {filteredReports.length} (Pending: {filteredReports.filter(r => r.status === 'pending').length})
            </span>
            <button
              onClick={() => printHandler()}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Cetak
            </button>
          </div>
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
                  <tr key={group.forum.id} className="border-t">
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
                    <td className="p-2 flex items-center gap-2">
                      {group.status === 'pending' && (
                        <>
                          <button
                            onClick={() => { setForumToDelete(group.forum.id); setIsDeleteForumModalOpen(true); }}
                            className="text-red-600 hover:underline"
                          >
                            Hapus Forum
                          </button>
                          <Ellipse className="w-1 h-1" />
                          <button
                            onClick={() => { setReportToDelete(group.reports[0].id); setIsDeleteReportModalOpen(true); }}
                            className="text-red-600 hover:underline"
                          >
                            Hapus Laporan
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Konten Cetak */}
        <div className="hidden print:block" ref={componentRef}>
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold text-gray-800">Laporan Postingan</h1>
            <p className="text-gray-600 text-sm">Tanggal Cetak: {new Date().toLocaleDateString('id-ID')}</p>
            <p className="text-gray-600 text-sm mt-1">Total Laporan: {filteredReports.length}</p>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-600">
                <th className="p-2">Judul</th>
                <th className="p-2">Pembuat</th>
                <th className="p-2">Jumlah Laporan</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((group) => (
                <tr key={group.forum.id} className="border-t">
                  <td className="p-2">{group.forum.title}</td>
                  <td className="p-2">{group.forum.user.username}</td>
                  <td className="p-2">{group.reports.length}</td>
                  <td className="p-2">{group.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Hapus Laporan */}
        <ModalWhite isOpen={isDeleteReportModalOpen} onClose={() => setIsDeleteReportModalOpen(false)}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hapus Laporan</h2>
          <p className="text-gray-700 text-sm">Apakah Anda yakin ingin menghapus laporan ini?</p>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setIsDeleteReportModalOpen(false)} className="px-3 py-1 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 text-sm">Batal</button>
            <button type="button" onClick={confirmDeleteReport} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Hapus</button>
          </div>
        </ModalWhite>

        {/* Modal Hapus Forum */}
        <ModalWhite isOpen={isDeleteForumModalOpen} onClose={() => { setIsDeleteForumModalOpen(false); setForumToDelete(null); }}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hapus Forum</h2>
          <p className="text-gray-700 text-sm">Apakah Anda yakin ingin menghapus forum ini?</p>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => { setIsDeleteForumModalOpen(false); setForumToDelete(null); }} className="px-3 py-1 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 text-sm">Batal</button>
            <button type="button" onClick={confirmDeleteForum} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Hapus</button>
          </div>
        </ModalWhite>

        {/* Modal Detail Forum */}
        <ModalWhite isOpen={isDetailModalOpen} onClose={() => { setIsDetailModalOpen(false); setSelectedForum(null); }}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detail Forum</h2>
          {selectedForum && (
            <div className="space-y-4 text-sm text-hitam1">
              <p><strong>Judul:</strong> {selectedForum.title}</p>
              <p><strong>Deskripsi:</strong> {selectedForum.description}</p>
              <p><strong>Pembuat:</strong> {selectedForum.name} @{selectedForum.username}</p>
              {selectedForum.photo && <img src={selectedForum.photo} alt="Forum" className="max-w-full h-auto rounded" />}
            </div>
          )}
          <div className="flex justify-end mt-4">
            <button type="button" onClick={() => { setIsDetailModalOpen(false); setSelectedForum(null); }} className="px-3 py-1 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 text-sm">Tutup</button>
          </div>
        </ModalWhite>

        {/* Modal Alasan */}
        <ModalWhite isOpen={isForumReasonsModalOpen} onClose={() => { setIsForumReasonsModalOpen(false); setSelectedForumReasons([]); }}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detail Alasan Laporan</h2>
          <div className="space-y-4 max-h-64 overflow-y-auto text-sm">
            {selectedForumReasons.map((report, index) => (
              <div key={report.id} className="border p-2 rounded">
                <p><strong>Laporan #{index + 1}</strong></p>
                <p>Alasan: {report.reason}</p>
                <p className="text-gray-600">Tanggal: {new Date(report.created_at).toLocaleString('id-ID')}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <button type="button" onClick={() => { setIsForumReasonsModalOpen(false); setSelectedForumReasons([]); }} className="px-3 py-1 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 text-sm">Tutup</button>
          </div>
        </ModalWhite>
      </div>
    </div>
  );
}