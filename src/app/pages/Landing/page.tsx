'use client';

import { useState, useEffect, useRef } from 'react';
import { Ellipse, Search, Heart, Horizontal } from '@/app/components/svgs/page';
import { useRouter } from 'next/navigation';
import PopulerKategori from '@/app/components/PopulerKategori';
import PopulerTag from '@/app/components/PopulerTag';
import ModalLogin from '@/app/components/ModalLogin';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Landing() {
  const router = useRouter();
  const [forums, setForums] = useState<any[]>([]);
  const [filteredForums, setFilteredForums] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showLogin, setShowLogin] = useState(false);

  // Fungsi untuk klik hashtag
  const handleHashtagClick = (hashtag: string) => {
    const hashtagText = `#${hashtag}`;
    setSearchQuery(hashtagText);
  };

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
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  // Fetch semua forum
  useEffect(() => {
    const fetchData = async () => {
      try {
        const forumResponse = await fetch(`${API_URL}/api/forum/nologin`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!forumResponse.ok) throw new Error(`Forum HTTP error! status: ${forumResponse.status}`);
        const forumData = await forumResponse.json();
        setForums(Array.isArray(forumData) ? forumData : []);
        setFilteredForums(Array.isArray(forumData) ? forumData : []);

        const categoryResponse = await fetch(`${API_URL}/api/category/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!categoryResponse.ok) throw new Error(`Category HTTP error! status: ${categoryResponse.status}`);
        const categoryData = await categoryResponse.json();
        setCategories(Array.isArray(categoryData) ? categoryData : []);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setForums([]);
        setFilteredForums([]);
        setCategories([]);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Hitung total komentar
  const getTotalComments = (forum: any) => {
    if (!forum.comments || !Array.isArray(forum.comments)) return 0;
    const commentsCount = forum.comments.length;
    const repliesCount = forum.comments.reduce((total: number, comment: any) => {
      return total + (comment.replies && Array.isArray(comment.replies) ? comment.replies.length : 0);
    }, 0);
    return commentsCount + repliesCount;
  };

  // Handle search dan filter
  useEffect(() => {
    let result = [...forums];

    // Filter berdasarkan kategori
    if (selectedCategory !== null) {
      result = result.filter((forum) => forum.category_id === selectedCategory);
    }

    // Search filter (judul, username, dan hashtag)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((forum) => {
        const titleMatch = forum.title.toLowerCase().includes(query);
        const usernameMatch = forum.username.toLowerCase().includes(query);
        const hashtagMatch = forum.tags && forum.tags.some((tag: any) => `#${tag.name.toLowerCase()}` === query);
        return titleMatch || usernameMatch || hashtagMatch;
      });
    }

    // Sort filter
    if (sortOption) {
      switch (sortOption) {
        case 'terbaru':
          result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
        case 'terhot':
          result.sort((a, b) => getTotalComments(b) - getTotalComments(a)); // Hanya berdasarkan komentar
          break;
        case 'terlama':
          result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          break;
      }
    }

    setFilteredForums(result);
  }, [searchQuery, sortOption, selectedCategory, forums]);

  const handleGetByID = (postid: number) => {
    router.push(`/pages/nologin/${postid}`);
  };

  const handleAkun = (akunid: number) => {
    router.push(`/pages/user/akun/${akunid}`);
  };

  return (
    <div className="w-full min-h-screen bg-white dark:bg-hitam1 overflow-hidden">
      <div className="fixed top-0 w-full h-[80px] bg-putih1 dark:bg-hitam2 border border-t-0 border-hitam2 flex items-center justify-between rounded-b-[16px] z-10">
        <div className="text-[24px] font-ruda text-hitam2 dark:text-white ms-[57px]">
          <h1>ForuMedia</h1>
        </div>
        <div className="flex items-center">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-[5px] h-[40px] outline-none bg-putih2 dark:bg-hitam3 border border-hitam3 rounded-[6px] font-ruda text-[14px] text-center text-hitam1 dark:text-abu"
          >
            <option value="">Untuk Anda</option>
            <option value="terbaru">Terbaru</option>
            <option value="terhot">Paling Banyak Dibahas</option>
            <option value="terlama">Terlama</option>
          </select>
          <div className="flex items-center me-[20px]">
            <input
              type="text"
              placeholder="Cari berdasarkan judul, username, atau hashtag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[440px] h-[40px] outline-none bg-putih2 dark:bg-hitam3 border border-hitam3 rounded-[6px] font-ruda text-[14px] text-hitam1 dark:text-abu px-[20px] ms-[20px]"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="-ms-[30px] w-[25px] h-[25px] flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-hitam1 dark:stroke-putih1 w-[20px] h-[20px]"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : (
              <Search className="stroke-hitam1 dark:stroke-putih1 -ms-[30px] w-[25px]" />
            )}
          </div>
        </div>
        <div className="me-[50px] flex items-center">
          <button className="w-[100px] h-[35px] bg-ungu rounded-[6px] text-white font-ruda" onClick={() => router.push('/login')}>
            Login
          </button>
        </div>
      </div>

      <div className="ms-[280px] pt-[90px]">
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
            className={`h-[30px] px-[10px] rounded-[6px] whitespace-nowrap text-[14px] font-ruda me-[10px] ${
              selectedCategory === null ? 'bg-ungu text-white' : 'bg-putih3 dark:bg-hitam4 dark:text-abu'
            }`}
          >
            Semua
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`h-[30px] px-[10px] rounded-[6px] whitespace-nowrap text-[14px] font-ruda me-[10px] ${
                selectedCategory === category.id ? 'bg-ungu text-white' : 'bg-putih3 dark:bg-hitam4 dark:text-abu'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="mt-[20px]">
          {loading ? (
            <div className="w-[750px] h-[242px] bg-gray-300 rounded-[16px] p-[20px] animate-pulse">
              <div className="flex items-center mb-3">
                <div className="w-[40px] h-[40px] rounded-full bg-gray-400 animate-pulse"></div>
                <div className="ms-3">
                  <div className="flex items-center">
                    <div className="w-[150px] h-[20px] bg-gray-400 animate-pulse me-2"></div>
                    <div className="w-[150px] h-[20px] bg-gray-400 animate-pulse"></div>
                  </div>
                  <div className="w-[150px] h-[10px] bg-gray-400 animate-pulse"></div>
                </div>
              </div>
              <div className="w-full h-[50px] bg-gray-400 rounded animate-pulse"></div>
              <div className="w-full h-[50px] bg-gray-400 rounded animate-pulse mt-4"></div>
            </div>
          ) : filteredForums.length === 0 ? (
            <p className="text-gray-700 dark:text-gray-300">Postingan tidak ditemukan.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
              {filteredForums.map((forum) => (
                <div
                  key={forum.id}
                  className="w-[750px] h-[242px] p-[20px] bg-putih1 dark:bg-hitam2 rounded-[16px] border border-hitam2 hover:shadow-lg transition-shadow relative overflow-hidden"
                >
                  <div className="flex items-center mb-3">
                    <img
                      src={`${API_URL}${forum.profile}`}
                      alt={forum.username}
                      className="w-[40px] h-[40px] rounded-full mr-3 object-cover cursor-pointer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                      }}
                      onClick={() => handleAkun(forum.user_id)}
                    />
                    <div>
                      <div className="flex items-center">
                        <p
                          className="text-[14px] font-ruda text-hitam2 dark:text-putih1 font-semibold me-[6px] cursor-pointer hover:underline"
                          onClick={() => handleAkun(forum.user_id)}
                        >
                          {forum.name}
                        </p>
                        <Ellipse className="fill-black dark:fill-white" />
                        <p
                          className="text-[14px] font-ruda text-hitam3 dark:text-abu font-medium ms-[6px] cursor-pointer hover:underline"
                          onClick={() => handleAkun(forum.user_id)}
                        >
                          @{forum.username}
                        </p>
                      </div>
                      <p className="text-[9px] font-ruda text-hitam4 dark:text-putih3 font-semibold">{forum.relative_time}</p>
                    </div>
                  </div>

                  <div className="w-full grid grid-cols-[1fr_auto] gap-4">
                    <div className="min-w-0">
                      <h2
                        onClick={() => handleGetByID(forum.id)}
                        className="text-[18px] font-bold font-ruda text-hitam2 dark:text-white line-clamp-2 max-h-[53px] overflow-hidden text-ellipsis hover:underline cursor-pointer"
                      >
                        {forum.title}
                      </h2>
                      <div className="mt-[5px] flex flex-wrap">
                        {forum.category_name && (
                          <p className="py-[6px] px-[10px] text-[10px] font-ruda font-bold bg-putih3 dark:bg-hitam4 text-hitam2 dark:text-abu rounded-full me-[5px] mb-[5px]">
                            {forum.category_name}
                          </p>
                        )}
                        {forum.tags && forum.tags.length > 0 && (
                          forum.tags.slice(0, 6).map((tag: any) => (
                            <span
                              key={tag.id}
                              className="py-[6px] px-[10px] text-[10px] font-ruda font-bold bg-putih3 dark:bg-hitam4 text-hitam2 dark:text-abu rounded-full me-[5px] mb-[5px] cursor-pointer hover:bg-ungu hover:text-white"
                              onClick={() => handleHashtagClick(tag.name)}
                            >
                              #{tag.name}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                    {forum.photo && (
                      <img
                        onClick={() => handleGetByID(forum.id)}
                        src={`${API_URL}${forum.photo}`}
                        alt={forum.title}
                        className="w-[200px] h-[200px] rounded-[16px] object-cover flex-shrink-0 -mt-[50px] border border-hitam2 cursor-pointer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                        }}
                      />
                    )}
                  </div>

                  <div className="flex items-center absolute bottom-[20px] left-[20px] dark:text-abu">
                    <button onClick={() => setShowLogin(true)} className="flex font-ruda items-center text-[13px] me-[27px]">
                      {forum.liked ? <Heart className="fill-ungu me-[5px]" /> : <Heart className="fill-abu me-[5px]" />}
                      {forum.like} Like
                    </button>
                    <button onClick={() => handleGetByID(forum.id)} className="flex font-ruda items-center text-[13px]">
                      <span>{getTotalComments(forum)} Komentar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="block top-0 right-0 absolute me-[40px] mt-[90px]">
        <div>
          <PopulerKategori />
        </div>
        <div className="mt-[10px]">
          <PopulerTag onTagClick={handleHashtagClick} />
        </div>
      </div>
      <ModalLogin isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}