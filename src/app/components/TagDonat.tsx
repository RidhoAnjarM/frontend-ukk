'use client'

import { Doughnut } from 'react-chartjs-2'
import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function TagDoughnutChart() {
  const [tags, setTags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTags() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/populer/tag`)
        if (!response.ok) {
          throw new Error('Gagal fecth tag')
        }
        const data = await response.json()
        if (!data.popular_tags || data.popular_tags.length === 0) {
          setError('Oops, hashtag populer lagi libur hari ini!')
        } else {
          setTags(data.popular_tags)
        }
        setLoading(false)
      } catch (error) {
        setError('Gagal menampilkan hastag')
        setLoading(false)
      }
    }
    fetchTags()
  }, [])

  if (loading) return <p className="text-gray-700 dark:text-gray-300">Loading tags...</p>
  if (error) return <p className="text-gray-700 dark:text-gray-300">{error}</p>
  if (!tags || tags.length === 0) return <p className="text-gray-700 dark:text-gray-300">No popular tags data available</p>

  const data = {
    labels: tags.map(tag => tag.name),
    datasets: [
      {
        label: 'Digunakan',
        data: tags.map(tag => tag.usage_count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)',
          'rgba(83, 102, 255, 0.6)',
          'rgba(255, 99, 255, 0.6)',
          'rgba(99, 255, 132, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)',
          'rgba(255, 99, 255, 1)',
          'rgba(99, 255, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Hastag Populer Minggu ini' },
    },
  }

  return <Doughnut data={data} options={options} />
}