// src/app/admin/forums/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/app/components/Sidebar'
import ThemeToggle from '@/app/components/ThemeTogle'
import { Ellipse, Search, Heart } from '@/app/components/svgs/page'
import { User } from '@/app/types/types'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import PopulerKategori from '@/app/components/PopulerKategori'

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Beranda() {
  const router = useRouter()
  const [forums, setForums] = useState<any[]>([])
  const [filteredForums, setFilteredForums] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState('terbaru')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [user, setUser] = useState<User | null>(null);

  // Fetch semua forum
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('No token found in localStorage')
        }

        // Fetch forum
        const forumResponse = await fetch('http://localhost:5000/api/forum/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        if (!forumResponse.ok) {
          throw new Error(`Forum HTTP error! status: ${forumResponse.status}`)
        }
        const forumData = await forumResponse.json()
        console.log('Forum API Response:', forumData)
        setForums(Array.isArray(forumData) ? forumData : [])
        setFilteredForums(Array.isArray(forumData) ? forumData : [])

        // Fetch kategori
        const categoryResponse = await fetch('http://localhost:5000/api/category/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        if (!categoryResponse.ok) {
          throw new Error(`Category HTTP error! status: ${categoryResponse.status}`)
        }
        const categoryData = await categoryResponse.json()
        console.log('Category API Response:', categoryData)
        setCategories(Array.isArray(categoryData) ? categoryData : [])

        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setForums([])
        setFilteredForums([])
        setCategories([])
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Hitung total komentar (comments + replies)
  const getTotalComments = (forum: any) => {
    if (!forum.comments || !Array.isArray(forum.comments)) return 0
    const commentsCount = forum.comments.length
    const repliesCount = forum.comments.reduce((total: number, comment: any) => {
      return total + (comment.replies && Array.isArray(comment.replies) ? comment.replies.length : 0)
    }, 0)
    return commentsCount + repliesCount
  }

  // Handle search dan filter
  useEffect(() => {
    let result = [...forums]

    // Filter berdasarkan kategori
    if (selectedCategory !== null) {
      result = result.filter(forum => forum.category_id === selectedCategory)
    }

    // Search filter
    if (searchQuery) {
      result = result.filter(forum =>
        forum.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        forum.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort filter
    switch (sortOption) {
      case 'terbaru':
        result.sort((a, b) => new Date(b.createAt).getTime() - new Date(a.createAt).getTime())
        break
      case 'terhot':
        result.sort((a, b) => {
          const aScore = a.like + getTotalComments(a)
          const bScore = b.like + getTotalComments(b)
          return bScore - aScore
        })
        break
      case 'terlama':
        result.sort((a, b) => new Date(a.createAt).getTime() - new Date(b.createAt).getTime())
        break
      default:
        break
    }

    setFilteredForums(result)
  }, [searchQuery, sortOption, selectedCategory, forums])

  // Fungsi untuk toggle like
  const handleLikeForum = async (forumId: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Silakan login untuk menyukai forum')
        return
      }

      const response = await fetch('http://localhost:5000/api/like/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ forum_id: forumId }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Like Response:', result)

      setForums(prevForums =>
        prevForums.map(forum =>
          forum.id === forumId
            ? { ...forum, liked: result.liked, like: result.liked ? forum.like + 1 : forum.like - 1 }
            : forum
        )
      )
    } catch (error) {
      console.error('Error liking forum:', error)
      alert('Gagal menyukai forum')
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setUser(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Failed to fetch user profile:', error);
          setLoading(false);
        });

    } else {
      setLoading(false);
    }
  }, []);

  const isActive = (path: string) => {
    if (typeof window !== 'undefined') {
      return window.location.pathname === path;
    }
    return false;
  };

  const isProfilePage = isActive('/pages/user/profile');

  const handleGetByID = (postid: number) => {
    router.push(`/pages/user/forum/${postid}`);
  };

  if (loading) return <p className="text-center mt-10 text-gray-700 dark:text-gray-300">Loading forums...</p>

  return (
    <div className="w-full min-h-screen bg-white dark:bg-hitam1 ">
      <Sidebar />
      <div className="fixed top-0 w-full h-[80px] bg-putih1 dark:bg-hitam2 border border-t-0 border-hitam2 flex items-center justify-between rounded-b-[16px] z-10">
        <div className="text-[24px] font-ruda text-hitam2 dark:text-white ms-[57px]">
          <h1>ForuMedia</h1>
        </div>
        <div className="flex items-center">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="w-[113px] h-[40px] outline-none bg-putih2 dark:bg-hitam3 border border-hitam3 rounded-[6px] font-ruda text-[14px] text-center text-hitam1 dark:text-abu "
          >
            <option value="terbaru">Terbaru</option>
            <option value="terhot">Banyak dibahas</option>
            <option value="terlama">Terlama</option>
          </select>
          <div className='flex items-center me-[20px]'>
            <input
              type="text"
              placeholder="Cari berdasarkan judul atau username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[440px] h-[40px] outline-none bg-putih2 dark:bg-hitam3 border border-hitam3 rounded-[6px] font-ruda text-[14px] text-hitam1 dark:text-abu px-[20px] ms-[20px]"
            />
            <Search className="stroke-hitam1 dark:stroke-putih1 -ms-[30px] w-[25px]" />
          </div>
          <ThemeToggle />
        </div>

        <div className="me-[50px] flex items-center">
          {loading ? (
            <p className="">bentarr...</p>
          ) : user ? (
            <div className='text-center'>
              <div className="flex justify-center items-center">
                {isProfilePage ? (
                  <div></div>
                ) : (
                  <div className="flex" >
                    <img
                      src={user.profile ? `http://localhost:5000${user.profile}` : 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg'}
                      alt="User profile"
                      className="w-[45px] h-[45px] bg-white rounded-[6px] flex items-center justify-center object-cover"
                      onError={(e) => {
                        console.log(`Image not found for user: ${user.profile}, setting to default.`);
                        (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                      }}
                    />
                    <div className='ms-[15px]'>
                      <p className="text-[14px] text-hitam1 dark:text-putih1 font-ruda">{user.name}</p>
                      <p className="text-[12px] text-hitam4 dark:text-abu font-ruda">@{user.username}</p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className='text-center'>
              <p>loading..</p>
            </div>
          )}
        </div>
      </div>

      <div className="ms-[280px] pt-[90px]">
        <div className="flex overflow-x-auto pb-2 w-[750px] overflow-hidden scrollbar-hide mt-[15px]">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`h-[30px] px-[10px] rounded-[6px] whitespace-nowrap text-[14px] font-ruda me-[10px] ${selectedCategory === null
              ? 'bg-ungu text-white'
              : 'bg-putih3 dark:bg-hitam4 border border-hitam4 dark:text-abu'
              }`}
          >
            Semua
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`h-[30px] px-[10px] rounded-[6px] whitespace-nowrap text-[14px] font-ruda me-[10px] ${selectedCategory === category.id
                ? 'bg-ungu text-white'
                : 'bg-putih3 dark:bg-hitam4 border border-hitam4 dark:text-abu'
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="mt-[20px]">
          {filteredForums.length === 0 ? (
            <p className="text-gray-700 dark:text-gray-300">Postingan tidak ditemukan.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
              {filteredForums.map(forum => (
                <div
                  key={forum.id}
                  className="w-[750px] h-[242px] p-[20px] bg-putih1 dark:bg-hitam2 rounded-[16px] border border-hitam2 hover:shadow-lg transition-shadow overflow-hidden relative z-0"
                >
                  <div className="flex items-center mb-3">
                    <img
                      src={`${API_URL}${forum.profile}`}
                      alt={forum.username}
                      className="w-[40px] h-[40px] rounded-full mr-3 object-cover"
                      onError={(e) => {
                        console.log(`Image not found for user: ${forum.profile}, setting to default.`);
                        (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                      }}
                    />
                    <div className="">
                      <div className='flex items-center'>
                        <p className="text-[14px] font-ruda text-hitam2 dark:text-putih1 font-semibold me-[6px]">{forum.name}</p>
                        <Ellipse className="fill-black dark:fill-white" />
                        <p className="text-[14px] font-ruda text-hitam3 dark:text-abu font-medium ms-[6px]">{forum.username}</p>
                      </div>
                      <p className='text-[9px] font-ruda text-hitam4 dark:text-putih3 font-semibold'>{forum.relative_time}</p>
                    </div>
                  </div>

                  <div className="w-full flex justify-between">
                    <div className="">
                      <h2 onClick={() => handleGetByID(forum.id)} className="text-[18px] font-bold font-ruda text-hitam2 dark:text-white line-clamp-2 max-h-[53px] flex-1 min-w-0 overflow-hidden hover:underline cursor-pointer">{forum.title}</h2>
                      <div className="mt-[5px] flex flex-wrap">
                        {forum.category_name ? (
                          <p className="py-[6px] px-[10px] text-[10px] font-ruda font-bold bg-putih3 dark:bg-hitam4 text-hitam2 dark:text-abu rounded-full me-[5px] mb-[5px]">
                            {forum.category_name}
                          </p>
                        ) : null}
                        {forum.tags && forum.tags.length > 0 ? (
                          forum.tags.map((tag: any) => (
                            <span key={tag.id} className="py-[6px] px-[10px] text-[10px] font-ruda font-bold bg-putih3 dark:bg-hitam4 text-hitam2 dark:text-abu rounded-full me-[5px] mb-[5px]" >
                              #{tag.name}
                            </span>
                          ))
                        ) : null}
                      </div>
                    </div>
                    {forum.photo && (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}${forum.photo}`}
                        alt={forum.title}
                        className="w-[200px] h-[200px] rounded-[16px] object-cover flex-shrink-0 -mt-[50px] border border-hitam2"
                        onError={(e) => {
                          console.log(`Image not found for user: ${forum.photo}, setting to default.`);
                          (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                        }}
                      />
                    )}
                  </div>

                  {/* like dan komentar */}
                  <div className="flex items-center absolute bottom-[20px] left-[20px] dark:text-abu">
                    <button
                      onClick={() => handleLikeForum(forum.id)}
                      className="flex font-ruda items-center text-[13px] me-[27px]"
                    >
                      {forum.liked ? (
                        <Heart className="fill-ungu me-[5px]" />
                      ) : (
                        <Heart className="fill-abu me-[5px]" />
                      )}
                      {forum.like} Like
                    </button>
                    <button
                      onClick={() => handleGetByID(forum.id)}
                      className='flex font-ruda items-center text-[13px]'
                    >
                      <span>{getTotalComments(forum)} Komentar</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <PopulerKategori />
    </div>
  )
}