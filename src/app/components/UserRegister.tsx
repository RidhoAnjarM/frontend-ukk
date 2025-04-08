'use client';

import { Bar } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register komponen ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function UserRegister() {
  const [userRegistrations, setUserRegistrations] = useState<number[]>(Array(12).fill(0)); // Array 12 bulan, default 0
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('http://localhost:5000/api/users');
        const data = await response.json();
        const users = data.users;

        // Inisialisasi array untuk menghitung pendaftaran per bulan (Jan-Des)
        const monthlyCounts = Array(12).fill(0);

        // Kelompokkan pengguna berdasarkan bulan dari created_at
        users.forEach((user: { created_at: string }) => {
          const date = new Date(user.created_at);
          const month = date.getMonth(); // 0 = Jan, 11 = Des
          monthlyCounts[month] += 1; // Tambah 1 ke bulan yang sesuai
        });

        setUserRegistrations(monthlyCounts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  if (loading) return <p className="text-gray-700 dark:text-gray-300">Loading user registrations...</p>;

  const data = {
    labels: [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ],
    datasets: [
      {
        label: 'Pendaftaran Pengguna',
        data: userRegistrations,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',  
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Pendaftaran Pengguna per Bulan (2025)' },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Jumlah Pengguna' },
      },
    },
  };

  return <Bar data={data} options={options} />;
}