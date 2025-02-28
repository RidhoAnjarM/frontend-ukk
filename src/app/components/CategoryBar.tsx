// src/app/components/CategoryBarChart.tsx
'use client'

import { Bar } from 'react-chartjs-2'
import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function CategoryBarChart() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('http://localhost:5000/api/populer/category')
        const data = await response.json()
        setCategories(data.popular_categories)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching categories:', error)
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  if (loading) return <p className="text-gray-700 dark:text-gray-300">Loading categories...</p>

  const data = {
    labels: categories.map(cat => cat.name),
    datasets: [
      {
        label: 'Usage Count',
        data: categories.map(cat => cat.usage_count),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Kategori Populer' },
    },
    scales: {
      y: { beginAtZero: true },
    },
  }

  return <Bar data={data} options={options} />
}