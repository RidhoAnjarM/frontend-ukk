'use client';

import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import SidebarAdmin from '@/app/components/sidebaradmin';
import ModalWhite from '@/app/components/ModalWhite';
import { Ellipse } from '@/app/components/svgs';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function User() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>(''); // Format: YYYY-MM
  const [searchQuery, setSearchQuery] = useState<string>('');
  const componentRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users');
      const data = await response.json();
      setUsers(data.users);
      setFilteredUsers(data.users);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const response = await fetch(`http://localhost:5000/api/users/${selectedUser.id}`, {
        method: 'PUT',
        body: formData,
      });
      if (response.ok) {
        fetchUsers();
        setIsEditModalOpen(false);
        setSelectedUser(null);
      } else {
        console.error('Failed to update user:', await response.text());
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (id: number) => {
    setUserToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (userToDelete !== null) {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${userToDelete}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchUsers();
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      } finally {
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
      }
    }
  };

  const applyFilterAndSearch = () => {
    let filtered = [...users];

    // Filter berdasarkan bulan
    if (filterMonth) {
      filtered = filtered.filter((user) => {
        const date = new Date(user.created_at);
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return yearMonth === filterMonth;
      });
    }

    // Pencarian berdasarkan username atau name
    if (searchQuery) {
      filtered = filtered.filter((user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const resetFilter = () => {
    setFilterMonth('');
    setSearchQuery('');
    setFilteredUsers(users);
  };

  const getMonthlyUserCounts = () => {
    const counts: { [key: string]: number } = {};
    users.forEach((user) => {
      const date = new Date(user.created_at);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      counts[yearMonth] = (counts[yearMonth] || 0) + 1;
    });
    return counts;
  };

  const monthlyCounts = getMonthlyUserCounts();
  const currentDate = new Date();
  const getLastFourMonths = () => {
    const months = [];
    for (let i = 3; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.push({
        key: yearMonth,
        label: date.toLocaleString('id-ID', { month: 'long', year: 'numeric' }),
        count: monthlyCounts[yearMonth] || 0,
      });
    }
    return months;
  };

  const fourMonths = getLastFourMonths();
  const chartData = {
    labels: fourMonths.map((m) => m.label),
    datasets: [
      {
        label: 'Jumlah Pengguna',
        data: fourMonths.map((m) => m.count),
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // Sembunyikan legenda untuk minimalis
      title: { display: true, text: 'Tren Pengguna 4 Bulan Terakhir', font: { size: 16 } },
    },
    scales: {
      y: { beginAtZero: true, title: { display: false } },
      x: { grid: { display: false } }, // Sembunyikan grid untuk minimalis
    },
  };

  const printHandler = useReactToPrint({
    documentTitle: 'Laporan Ringkasan Pengguna',
    contentRef: componentRef,
  });

  const handlePrint = () => {
    if (!componentRef.current) {
      console.error('componentRef tidak tersedia');
      return;
    }

    const chartCanvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!chartCanvas) {
      console.error('Canvas tidak ditemukan di DOM');
      return;
    }

    const chartImage = chartCanvas.toDataURL('image/png');
    const imgElement = componentRef.current.querySelector('#chart-image') as HTMLImageElement;
    if (imgElement) {
      imgElement.src = chartImage;
    } else {
      console.error('Elemen gambar #chart-image tidak ditemukan');
    }

    setTimeout(() => {
      printHandler();
    }, 100);
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const monthNum = String(i + 1).padStart(2, '0');
    const monthName = new Date(`2025-${monthNum}-01`).toLocaleString('id-ID', { month: 'long' });
    return { value: `2025-${monthNum}`, label: `${monthName} 2025` };
  });

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <SidebarAdmin />
        <div className="flex-1 ml-0 md:ml-64 p-6">
          <p className="text-gray-900">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F7F7F7]">
      <SidebarAdmin />
      <div className="flex-1 ml-[240px] p-4">
        <header className="flex justify-between items-center h-16 mb-4">
          <h1 className="text-2xl font-bold text-gray-800 font-ruda">Kelola Pengguna</h1>
        </header>

        {/* Filter, Pencarian, dan Tombol */}
        <div className="bg-white p-4 rounded-lg shadow mb-4 flex items-center justify-between gap-4 font-ruda">
          <div className="flex items-center gap-4">
            <div>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="p-2 border rounded bg-white text-gray-700 w-40 text-sm focus:ring-ungu focus:ring-2 outline-none"
              >
                <option value="">Filter Bulan</option>
                {monthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau username..."
              className="p-2 border rounded bg-white text-gray-700 w-64 text-sm outline-none focus:ring-ungu focus:ring-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">
              Total: {filteredUsers.length}
            </span>
            <button
              onClick={applyFilterAndSearch}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              Terapkan
            </button>
            <button
              onClick={resetFilter}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
            >
              Reset
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Cetak
            </button>
          </div>
        </div>

        {/* Grafik */}
        <div className="bg-white p-4 rounded-lg shadow mb-4 flex justify-center">
          <div style={{ height: '200px', width: '600px' }}>
            <Line ref={chartRef} data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Konten untuk Dicetak */}
        <div className="hidden print:block" ref={componentRef}>
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold text-gray-800">Laporan Ringkasan Pengguna</h1>
            <p className="text-gray-600 text-sm">
              Tanggal Cetak: {new Date().toLocaleDateString('id-ID')}
              {filterMonth && ` | Bulan: ${new Date(filterMonth + '-01').toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`}
            </p>
            <p className="text-gray-600 text-sm mt-1">Total Pengguna: {filteredUsers.length}</p>
          </div>
          <div className="max-w-2xl mx-auto" style={{ height: '200px' }}>
            <img id="chart-image" alt="Chart" style={{ width: '100%', height: '100%' }} />
          </div>
          <div className="text-center text-gray-500 mt-4 text-sm">
            <p>Laporan ini dibuat oleh Sistem Manajemen Pengguna</p>
            <p>© {new Date().getFullYear()}</p>
          </div>
        </div>

        {/* Tabel Pengguna */}
        <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-600">
                <th className="p-2">Nama</th>
                <th className="p-2">Username</th>
                <th className="p-2">Status</th>
                <th className="p-2">Suspend Hingga</th>
                <th className="p-2">Tanggal Daftar</th>
                <th className="p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-2 text-center text-gray-600">
                    Tidak ada data pengguna.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="p-2 text-gray-900">{user.name}</td>
                    <td className="p-2 text-gray-900">{user.username}</td>
                    <td className="p-2 text-gray-900">{user.status}</td>
                    <td className="p-2 text-gray-900">
                      {user.suspend_duration > 0 ? `${user.suspend_duration} hari` : '-'}
                    </td>
                    <td className="p-2 text-gray-900">
                      {new Date(user.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-2 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditModalOpen(true);
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit */}
      {isEditModalOpen && selectedUser && (
        <ModalWhite
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
        >
          <div className="px-6 font-ruda w-[400px]">
            <div className="flex justify-center items-center mb-6">
              <h2 className="text-[24px] font-bold text-hitam1">Edit Pengguna</h2>
            </div>
            <form onSubmit={handleUpdateUser}>
              <div className="mb-4">
                <select
                  name="status"
                  defaultValue={selectedUser.status}
                  className="w-full p-2 border border-hitam1 text-hitam1 outline-none rounded-lg bg-white text-lg"
                >
                  <option value="active">Active</option>
                </select>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedUser(null);
                  }}
                  className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-full hover:bg-gray-600 transition-all duration-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-full hover:shadow-lg transition-all duration-200"
                >
                  Update
                </button>
              </div>
            </form>

          </div>
        </ModalWhite>
      )}

      {/* Modal Hapus */}
      <ModalWhite
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <div className="p-4 font-ruda w-[400px]">
          <div className="flex justify-center items-center mb-4">
            <h1 className="text-[20px] font-bold text-hitam1">Hapus Pengguna?</h1>
          </div>
          <div className="text-center">
            <p className="text-[16px] text-hitam2 mb-6">
              Yakin ingin menghapus Pengguna ini?<br/> Tindakan ini tidak bisa dibatalkan.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-full hover:bg-gray-600 transition-all duration-200"
            >
              Batal
            </button>
            <button
              onClick={confirmDeleteUser}
              className="px-6 py-2 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 hover:shadow-lg transition-all duration-200"
            >
              Hapus
            </button>
          </div>
        </div>
      </ModalWhite>
    </div>
  );
}

// Style untuk cetak
const printStyles = `
  @media print {
    .print\\:block {
      display: block !important;
    }
    .print\\:hidden {
      display: none !important;
    }
    button {
      display: none !important;
    }
    body {
      margin: 0;
      padding: 10mm;
    }
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = printStyles;
  document.head.appendChild(styleSheet);
}