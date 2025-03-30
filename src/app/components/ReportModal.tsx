import { useState } from 'react';
import axios from 'axios';
import Modal from './Modal';
import Alert from './Alert';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  reportType: 'account' | 'forum';
  id: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, title, reportType, id }) => {
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('error');
  const [alertMessage, setAlertMessage] = useState('');

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAlertType('error');
      setAlertMessage('Anda harus login terlebih dahulu');
      setShowAlert(true);
      return;
    }

    if (!reason.trim()) {
      setAlertType('error');
      setAlertMessage('Alasan tidak boleh kosong');
      setShowAlert(true);
      return;
    }

    setLoading(true);
    try {
      const endpoint = reportType === 'account' ? 'akun' : 'forum';
      const checkUrl = `${API_URL}/api/report/${endpoint}/check?${
        reportType === 'account' ? 'reported_id' : 'forum_id'
      }=${id}`;
      const postUrl = `${API_URL}/api/report/${endpoint}`;
      const payload =
        reportType === 'account' ? { reported_id: id, reason } : { forum_id: id, reason };

      const checkResponse = await axios.get(checkUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (checkResponse.data.exists) {
        setAlertType('warning');
        setAlertMessage(
          `Anda sudah melaporkan ${reportType === 'account' ? 'akun' : 'postingan'} ini dan laporan sedang diproses.`
        );
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
          setReason('');
          onClose();
        }, 2000);
        return;
      }

      // Kirim laporan
      const response = await axios.post(postUrl, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAlertType('success');
      setAlertMessage('Report berhasil dikirim dan sedang diproses');
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setReason('');
        onClose();
      }, 2000);
    } catch (err: any) {
      // Tangani error tanpa membiarkan exception terlempar ke console
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 403) {
          setAlertType('error');
          setAlertMessage(
            err.response.data.error || 'Anda tidak dapat melaporkan diri sendiri atau postingan Anda sendiri'
          );
        } else if (err.response.status === 401) {
          setAlertType('error');
          setAlertMessage('Sesi Anda telah habis, silakan login kembali');
        } else {
          setAlertType('error');
          setAlertMessage('Gagal mengirim report: ' + (err.response.data.error || 'Terjadi kesalahan'));
        }
      } else {
        setAlertType('error');
        setAlertMessage('Gagal mengirim report: Koneksi bermasalah');
      }

      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (reason.trim()) {
      const confirmClose = window.confirm('Apakah Anda yakin ingin membuang laporan ini?');
      if (confirmClose) {
        setReason('');
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <div className="p-2 flex flex-col justify-center">
          <h2 className="text-xl font-black mb-4 text-center font-ruda text-hitam1 dark:text-putih1">
            {title}
          </h2>
          <textarea
            className="w-full p-2 border border-hitam2 bg-putih1 dark:bg-hitam3 rounded mb-4 outline-none text-hitam2 dark:text-abu"
            placeholder="Alasan Report"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              className="px-4 py-2 border bg-gray-300 rounded hover:bg-gray-400 transition-colors"
              onClick={handleClose}
              disabled={loading}
            >
              Batal
            </button>
            <button
              className="px-4 py-2 bg-ungu border border-ungu text-white rounded"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Mengirim...' : 'Kirim'}
            </button>
          </div>
        </div>
      </Modal>
      {showAlert && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
    </>
  );
};

export default ReportModal;