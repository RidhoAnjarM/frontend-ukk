'use client'

import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/app/components/Sidebar'
import { Ellipse, Search, Heart, Horizontal } from '@/app/components/svgs/page'
import { User } from '@/app/types/types'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import PopulerKategori from '@/app/components/PopulerKategori'
import PopulerTag from '@/app/components/PopulerTag'
import Dropdown from '@/app/components/Dropdown'
import ReportModal from '@/app/components/ReportModal'
import PostingModal from '@/app/components/PostingModal'

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Beranda() {
  const router = useRouter()
  const [forums, setForums] = useState<any[]>([])
  const [filteredForums, setFilteredForums] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [user, setUser] = useState<User | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showReportModalForum, setShowReportModalForum] = useState<boolean>(false);
  const [reportedUserId, setReportedUserId] = useState<number | null>(null);
  const [reportedForumId, setReportedForumId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showPostingModal, setShowPostingModal] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Adjust scroll speed
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleReportAccount = (userId: number) => {
    setReportedUserId(userId);
    setShowReportModal(true);
  };

  const handleReportForum = (forumId: number) => {
    setReportedForumId(forumId);
    setShowReportModalForum(true);
  };

  // Fetch semua forum
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('No token found in localStorage')
        }

        const forumResponse = await fetch(`${API_URL}/api/forum/`, {
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

        const categoryResponse = await fetch(`${API_URL}/api/category/`, {
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
    if (sortOption) {
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
      }
    }

    setFilteredForums(result)
  }, [searchQuery, sortOption, selectedCategory, forums])

  // Fungsi like
  const handleLikeForum = async (forumId: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Silakan login untuk menyukai forum')
        return
      }

      const response = await fetch(`${API_URL}/api/like/`, {
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
        .get(`${API_URL}/api/profile`, {
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

  const handleAkun = (akunid: number) => {
    router.push(`/pages/user/akun/${akunid}`);
  };


  return (
    <div className="w-full min-h-screen bg-white dark:bg-hitam1 overflow-hidden" >
      <Sidebar />
      <div className="fixed top-0 w-full h-[80px] bg-putih1 dark:bg-hitam2 border border-t-0 border-hitam2 flex items-center justify-between rounded-b-[16px] z-10" >
        <div className="text-[24px] font-ruda text-hitam2 dark:text-white ms-[57px]" >
          <h1>ForuMedia </h1>
        </div>
        <div className="flex items-center" >
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)
            }
            className="px-[5px] h-[40px] outline-none bg-putih2 dark:bg-hitam3 border border-hitam3 rounded-[6px] font-ruda text-[14px] text-center text-hitam1 dark:text-abu "
          >
            <option value="" > Untuk Anda </option>
            < option value="terbaru" > Terbaru </option>
            < option value="terhot" > Paling banyak dibahas </option>
            < option value="terlama" > Terlama </option>
          </select>
          <div className='flex items-center me-[20px]' >
            <input
              type="text"
              placeholder="Cari berdasarkan judul atau username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[440px] h-[40px] outline-none bg-putih2 dark:bg-hitam3 border border-hitam3 rounded-[6px] font-ruda text-[14px] text-hitam1 dark:text-abu px-[20px] ms-[20px]"
            />
            <Search className="stroke-hitam1 dark:stroke-putih1 -ms-[30px] w-[25px]" />
          </div>
          <div className='w-[150px]' > </div>
        </div>

        <div className="me-[50px] flex items-center" >
          {loading ? (
            <p className=""> loading...</ p >
          ) : user ? (
            <div className='text-center' >
              <div className="flex justify-center items-center" >
                {isProfilePage ? (
                  <div></div>
                ) : (
                  <div className="flex items-center" >
                    <div className='me-[15px]' >
                      <p className="text-[14px] text-hitam1 dark:text-putih1 font-ruda" > {user.name} </p>
                      <p className="text-[12px] text-hitam4 dark:text-abu font-ruda" > @{user.username} </p>
                    </div>
                    <img
                      src={user.profile ? `${API_URL}${user.profile}` : 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg'}
                      alt="User profile"
                      className="w-[45px] h-[45px] bg-white rounded-[6px] flex items-center justify-center object-cover"
                      onError={(e) => {
                        console.log(`Image not found for user: ${user.profile}, setting to default.`);
                        (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className='text-center' >
              <p>server mati kayaknya..</p>
            </div>
          )}
        </div>
      </div>

      <div className="ms-[280px] pt-[90px]" >
        <div
          className="flex overflow-x-auto w-[750px] overflow-hidden scrollbar-hide mt-[15px]"
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <button
            onClick={() => setSelectedCategory(null)}
            className={`h-[30px] px-[10px] rounded-[6px] whitespace-nowrap text-[14px] font-ruda me-[10px] ${selectedCategory === null
              ? 'bg-ungu text-white'
              : 'bg-putih3 dark:bg-hitam4 dark:text-abu'
              }`}
          >
            Semua
          </button>
          {
            categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`h-[30px] px-[10px] rounded-[6px] whitespace-nowrap text-[14px] font-ruda me-[10px] ${selectedCategory === category.id
                  ? 'bg-ungu text-white'
                  : 'bg-putih3 dark:bg-hitam4 dark:text-abu'
                  }`}
              >
                {category.name}
              </button>
            ))}
        </div>

        <div
          onClick={() => setShowPostingModal(true)}
          className="w-[750px] h-[90px] bg-putih1 dark:bg-hitam2 border border-hitam2 rounded-[16px] mt-[20px] flex items-center px-[20px]">
          {loading ? (
            <div className="flex items-center justify-between w-full">
              <div className="w-[50px] h-[50px] bg-gray-300 rounded-full animate-pulse"></div>
              <div className="w-[500px] h-[40px] bg-gray-300 rounded-[6px] animate-pulse"></div>
              <div className="w-[120px] h-[40px] bg-ungu rounded-[6px] animate-pulse"></div>
            </div>
          ) : user ? (
            <div className='w-full'>
              {isProfilePage ? (
                <div></div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <img
                    src={user.profile ? `${API_URL}${user.profile}` : 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg'}
                    alt="User profile"
                    className="w-[50px] h-[50px] bg-white rounded-full object-cover"
                    onError={(e) => {
                      console.log(`Image not found for user: ${user.profile}, setting to default.`);
                      (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                    }}
                  />
                  <div className="w-[500px] h-[40px] bg-putih3 dark:bg-hitam3 rounded-[6px] flex items-center text-[16px] text-black dark:text-abu font-ruda px-[10px] cursor-pointer">
                    <p>Apa yang aka dibahas hari ini?</p>
                  </div>
                  <div className="w-[120px] h-[40px] bg-ungu rounded-[6px] flex items-center justify-center text-white font-ruda text-[14px] cursor-pointer">
                    <p>Buat Postingan</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className='text-center' >
              <p>server mati kayaknya..</p>
            </div>
          )}
        </div>

        <div className="mt-[20px]" >
          {loading ? (
              <div className="w-[750px] h-[242px] bg-gray-300 rounded-[16px] p-[20px] animate-pulse" >
                <div className="flex items-center mb-3">
                  <div className="w-[40px] h-[40px] rounded-full bg-gray-400 animate-pulse" > </div>
                  <div className="ms-3" >
                    <div className='flex items-center' >
                      <div className="w-[150px] h-[20px] bg-gray-400 animate-pulse me-2" > </div>
                      <div className="w-[150px] h-[20px] bg-gray-400 animate-pulse" > </div>
                    </div>
                    <div className="w-[150px] h-[10px] bg-gray-400 animate-pulse" > </div>
                  </div>
                </div>
                <div className="w-full h-[50px] bg-gray-400 rounded animate-pulse" > </div>
                <div className="w-full h-[50px] bg-gray-400 rounded animate-pulse mt-4" > </div>
              </div>
            ) : filteredForums.length === 0 ? (
              <p className="text-gray-700 dark:text-gray-300" > Postingan tidak ditemukan.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6" >
                {filteredForums.map(forum => (
                    <div
                      key={forum.id}
                      className="w-[750px] h-[242px] p-[20px] bg-putih1 dark:bg-hitam2 rounded-[16px] border border-hitam2 hover:shadow-lg transition-shadow relative overflow-hidden"
                    >
                      <div className="flex items-center mb-3" >
                        <img
                          src={`${API_URL}${forum.profile}`}
                          alt={forum.username}
                          className="w-[40px] h-[40px] rounded-full mr-3 object-cover cursor-pointer"
                          onError={(e) => {
                            console.log(`Image not found for user: ${forum.profile}, setting to default.`);
                            (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                          }}
                          onClick={() => { handleAkun(forum.user_id) }}
                        />
                        <div className="" >
                          <div className='flex items-center' >
                            <p className="text-[14px] font-ruda text-hitam2 dark:text-putih1 font-semibold me-[6px] cursor-pointer hover:underline" onClick={() => { handleAkun(forum.user_id) }}> {forum.name} </p>
                            <Ellipse className="fill-black dark:fill-white" />
                            <p className="text-[14px] font-ruda text-hitam3 dark:text-abu font-medium ms-[6px] cursor-pointer hover:underline" onClick={() => { handleAkun(forum.user_id) }}> @{forum.username} </p>
                            <Dropdown
                              id={forum.id}
                              userId={forum.user_id}
                              onReportForum={handleReportForum}
                              onReportAccount={handleReportAccount}
                            />
                          </div>
                          <p className='text-[9px] font-ruda text-hitam4 dark:text-putih3 font-semibold' > {forum.relative_time} </p>
                        </div>
                      </div>

                      <div className="w-full grid grid-cols-[1fr_auto] gap-4" >
                        <div className="min-w-0" >
                          <h2
                            onClick={() => handleGetByID(forum.id)}
                            className="text-[18px] font-bold font-ruda text-hitam2 dark:text-white line-clamp-2 max-h-[53px] overflow-hidden text-ellipsis hover:underline cursor-pointer" >
                            {forum.title}
                          </h2>
                          <div className="mt-[5px] flex flex-wrap" >
                            {forum.category_name ? (
                                <p className="py-[6px] px-[10px] text-[10px] font-ruda font-bold bg-putih3 dark:bg-hitam4 text-hitam2 dark:text-abu rounded-full me-[5px] mb-[5px]" >
                                  {forum.category_name}
                                </p>
                              ) : null}
                            {forum.tags && forum.tags.length > 0 ? (
                                forum.tags.slice(0, 6).map((tag: any) => (
                                  <span key={tag.id} className="py-[6px] px-[10px] text-[10px] font-ruda font-bold bg-putih3 dark:bg-hitam4 text-hitam2 dark:text-abu rounded-full me-[5px] mb-[5px]" >
                                    #{tag.name}
                                  </span>
                                ))
                              ) : null
                            }
                          </div>
                        </div>
                        {forum.photo && (
                            <img
                              onClick={() => handleGetByID(forum.id)}
                              src={`${process.env.NEXT_PUBLIC_API_URL}${forum.photo}`
                              }
                              alt={forum.title}
                              className="w-[200px] h-[200px] rounded-[16px] object-cover flex-shrink-0 -mt-[50px] border border-hitam2 cursor-pointer"
                              onError={(e) => {
                                console.log(`Image not found for user: ${forum.photo}, setting to default.`);
                                (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                              }}
                            />
                          )}
                      </div>

                      {/* like dan komentar */}
                      <div className="flex items-center absolute bottom-[20px] left-[20px] dark:text-abu" >
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
                          <span>{getTotalComments(forum)} Komentar </span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
        </div>
      </div>
      <div className="block top-0 right-0 absolute me-[40px] mt-[90px]" >
        <div className="" >
          <PopulerKategori />
        </div>
        <div className="mt-[10px]" >
          <PopulerTag />
        </div>
      </div>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Laporkan Akun"
        reportType="account"
        id={reportedUserId || 0}
      />

      <ReportModal
        isOpen={showReportModalForum}
        onClose={() => setShowReportModalForum(false)}
        title="Laporkan Postingan"
        reportType="forum"
        id={reportedForumId || 0}
      />

      <PostingModal
        isOpen={showPostingModal}
        onClose={() => setShowPostingModal(false)}
      />
    </div>
  )
}