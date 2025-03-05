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
      const checkUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/report/${endpoint}/check?${reportType === 'account' ? 'reported_id' : 'forum_id'
        }=${id}`;
      const postUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/report/${endpoint}`;
      const payload =
        reportType === 'account' ? { reported_id: id, reason } : { forum_id: id, reason };

      // Cek apakah sudah dilaporkan sebelumnya
      const checkResponse = await axios.get(checkUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (checkResponse.data.exists) {
        setAlertType('warning');
        setAlertMessage(`Anda sudah melaporkan ${reportType === 'account' ? 'akun' : 'postingan'} ini dan laporan sedang diproses.`);
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
          setReason('');
          onClose();
        }, 2000);
        return;
      }

      // Kirim laporan
      await axios.post(postUrl, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAlertType('success');
      setAlertMessage('Report berhasil dikirim');
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setReason('');
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error:', err);
      setAlertType('error');
      setAlertMessage('Gagal mengirim report');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="p-2 flex flex-col justify-center">
          <h2 className="text-xl font-black mb-4 text-center font-ruda text-hitam1 dark:text-putih1">{title}</h2>
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
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </button>
            <button
              className="px-4 py-2 bg-ungu border border-ungu text-white rounded "
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