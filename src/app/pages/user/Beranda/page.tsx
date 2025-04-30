'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/app/components/Sidebar';
import { Ellipse, Search, Heart } from '@/app/components/svgs';
import { User } from '@/app/types/types';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import PopulerTag from '@/app/components/PopulerTag';
import Dropdown from '@/app/components/Dropdown';
import ReportModal from '@/app/components/ReportModal';
import PostingModal from '@/app/components/PostingModal';


export default function Beranda() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const [forums, setForums] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [filteredForums, setFilteredForums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showReportModalForum, setShowReportModalForum] = useState<boolean>(false);
  const [reportedUserId, setReportedUserId] = useState<number | null>(null);
  const [reportedForumId, setReportedForumId] = useState<number | null>(null);
  const [showPostingModal, setShowPostingModal] = useState(false);

  const handleHashtagClick = (hashtag: string) => {
    const hashtagText = `#${hashtag}`;
    setSearchQuery(hashtagText);
  };

  const getTotalComments = (forum: any) => {
    if (!forum.comments || !Array.isArray(forum.comments)) return 0;
    const commentsCount = forum.comments.length;
    const repliesCount = forum.comments.reduce((total: number, comment: any) => {
      return total + (comment.replies && Array.isArray(comment.replies) ? comment.replies.length : 0);
    }, 0);
    return commentsCount + repliesCount;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found in localStorage');

        const forumResponse = await fetch(`${API_URL}/api/forum/`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!forumResponse.ok) throw new Error(`Forum HTTP error! status: ${forumResponse.status}`);
        const forumData = await forumResponse.json();
        setForums(Array.isArray(forumData) ? forumData : []);
        setFilteredForums(Array.isArray(forumData) ? forumData : []);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setForums([]);
        setFilteredForums([]);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...forums];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((forum) => {
        const titleMatch = forum.title.toLowerCase().includes(query);
        const usernameMatch = forum.username.toLowerCase().includes(query);
        const hashtagMatch = forum.tags && forum.tags.some((tag: any) => `#${tag.name.toLowerCase()}` === query);
        return titleMatch || usernameMatch || hashtagMatch;
      });
    }

    if (sortOption) {
      switch (sortOption) {
        case 'terbaru':
          result.sort((a, b) => new Date(b.createAt).getTime() - new Date(a.createAt).getTime());
          break;
        case 'terhot':
          result.sort((a, b) => getTotalComments(b) - getTotalComments(a));
          break;
        case 'terlama':
          result.sort((a, b) => new Date(a.createAt).getTime() - new Date(b.createAt).getTime());
          break;
      }
    }

    setFilteredForums(result);
  }, [searchQuery, sortOption, forums]);

  const handleLikeForum = async (forumId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Silakan login untuk menyukai forum');
        return;
      }

      const response = await fetch(`${API_URL}/api/like/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ forum_id: forumId }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();

      setForums((prevForums) =>
        prevForums.map((forum) =>
          forum.id === forumId
            ? { ...forum, liked: result.liked, like: result.liked ? forum.like + 1 : forum.like - 1 }
            : forum
        )
      );
    } catch (error) {
      console.error('Error liking forum:', error);
      alert('Gagal menyukai forum');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get(`${API_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
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

  const handleReportAccount = (userId: number) => {
    setReportedUserId(userId);
    setShowReportModal(true);
  };

  const handleReportForum = (forumId: number) => {
    setReportedForumId(forumId);
    setShowReportModalForum(true);
  };

  const handleGetByID = (postid: number) => {
    router.push(`/pages/user/forum/${postid}`);
  };

  const handleAkun = (akunid: number) => {
    router.push(`/pages/user/akun/${akunid}`);
  };

  const isActive = (path: string) => {
    if (typeof window !== 'undefined') return window.location.pathname === path;
    return false;
  };

  const isProfilePage = isActive('/pages/user/profile');

  return (
    <div className="w-full min-h-screen bg-white dark:bg-hitam1 overflow-hidden">
      <Sidebar />
      <div className="fixed top-0 w-full h-[60px] lg:h-[80px] bg-putih1 dark:bg-hitam2 border border-t-0 border-hitam2 flex items-center justify-between rounded-b-[16px] z-10 px-6 lg:px-4">
        <div className="text-[20px] lg:text-[24px] font-ruda text-hitam2 dark:text-white ms-0 lg:ms-[57px]">
          <h1 className="block lg:hidden">FM</h1>
          <h1 className="hidden lg:block">ForuMedia</h1>
        </div>
        <div className="flex items-center">
          <div className="flex items-center me-[10px] lg:me-[20px]">
            <input
              type="text"
              placeholder="Cari judul atau username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[180px] lg:w-[440px] h-[32px] lg:h-[40px] outline-none bg-putih2 dark:bg-hitam3 border border-hitam3 rounded-[6px] font-ruda text-[10px] lg:text-[14px] text-hitam1 dark:text-abu px-[10px] lg:px-[20px] ms-[10px] lg:ms-[20px]"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="-ms-[25px] lg:-ms-[30px] w-[25px] h-[25px] flex items-center justify-center"
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
              <Search className="stroke-hitam1 dark:stroke-putih1 -ms-[25px] lg:-ms-[30px] hidden lg:w-[25px]" />
            )}
          </div>
          <div className="hidden lg:block">
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
          </div>
        </div>
        <div className="lg:me-[50px] flex items-center">
          {loading ? (
            <p>loading...</p>
          ) : user ? (
            <div className="text-center">
              <div className="flex justify-center items-center">
                {!isProfilePage && (
                  <div className="flex items-center hover:underline">
                    <div className="me-[15px] hidden lg:block">
                      <p
                        className="text-[14px] text-hitam1 dark:text-putih1 font-ruda hover:underline cursor-pointer"
                        onClick={() => router.push('/pages/user/profile')}
                      >
                        {user.name}
                      </p>
                      <p
                        className="text-[12px] text-hitam4 dark:text-abu font-ruda hover:underline cursor-pointer"
                        onClick={() => router.push('/pages/user/profile')}
                      >
                        @{user.username}
                      </p>
                    </div>
                    <img
                      src={
                        user.profile
                          ? `${API_URL}${user.profile}`
                          : 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg'
                      }
                      alt="User profile"
                      className="w-[35px] h-[35px] lg:w-[45px] lg:h-[45px] bg-white rounded-full lg:rounded-[6px] flex items-center justify-center object-cover cursor-pointer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                      }}
                      onClick={() => router.push('/pages/user/profile')}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center dark:text-abu">
              <p>servernya error</p>
            </div>
          )}
        </div>
      </div>

      <div className="ms-0 lg:ms-[280px] pt-[70px] lg:pt-[90px] pb-[120px] lg:pb-4 px-6 lg:px-4">
        <div
          onClick={() => setShowPostingModal(true)}
          className="w-full lg:w-[750px] h-auto lg:h-[90px] bg-putih1 dark:bg-hitam2 border border-hitam2 rounded-[16px] mt-[20px] flex flex-col lg:flex-row items-center px-[20px] py-4 lg:py-0"
        >
          {loading ? (
            <div className="flex flex-col lg:flex-row items-center justify-between w-full">
              <div className="w-[40px] h-[40px] bg-gray-300 rounded-full animate-pulse mb-3 lg:mb-0"></div>
              <div className="w-full lg:w-[500px] h-[40px] bg-gray-300 rounded-[6px] animate-pulse mb-3 lg:mb-0"></div>
              <div className="w-[100px] lg:w-[120px] h-[36px] bg-ungu rounded-[6px] animate-pulse"></div>
            </div>
          ) : user ? (
            <div className="w-full">
              {!isProfilePage && (
                <div className="flex lg:flex-row items-center justify-between w-full">
                  <img
                    src={
                      user.profile
                        ? `${API_URL}${user.profile}`
                        : 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg'
                    }
                    alt="User profile"
                    className="w-[40px] h-[40px] bg-white rounded-full object-cover mb-3 lg:mb-0 hidden lg:block"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                    }}
                  />
                  <div className="w-[235px] lg:w-[500px] h-[36px] bg-putih3 dark:bg-hitam3 rounded-[6px] flex items-center text-[12px] lg:text-[16px] text-black dark:text-abu font-ruda px-[10px] cursor-pointer">
                    <p>Apa yang mau dibahas hari ini?</p>
                  </div>
                  <div className="w-[80px] lg:w-[120px] h-[36px] bg-ungu rounded-[6px] flex items-center justify-center text-white font-ruda text-[10px] lg:text-[14px] cursor-pointer">
                    <p>Buat Postingan</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center dark:text-abu">
              <p>Servernya error</p>
            </div>
          )}
        </div>

        <div className="mt-[20px]">
          {loading ? (
            <div className="w-full lg:w-[750px] h-auto lg:h-[242px] bg-gray-300 rounded-[16px] p-[20px] animate-pulse">
              <div className="flex items-center mb-3">
                <div className="w-[32px] lg:w-[40px] h-[32px] lg:h-[40px] rounded-full bg-gray-400 animate-pulse"></div>
                <div className="ms-3">
                  <div className="flex items-center">
                    <div className="w-[120px] lg:w-[150px] h-[16px] lg:h-[20px] bg-gray-400 animate-pulse me-2"></div>
                    <div className="w-[120px] lg:w-[150px] h-[16px] lg:h-[20px] bg-gray-400 animate-pulse"></div>
                  </div>
                  <div className="w-[100px] lg:w-[150px] h-[8px] lg:h-[10px] bg-gray-400 animate-pulse mt-1"></div>
                </div>
              </div>
              <div className="w-full h-[40px] lg:h-[50px] bg-gray-400 rounded animate-pulse"></div>
              <div className="w-full h-[40px] lg:h-[50px] bg-gray-400 rounded animate-pulse mt-4"></div>
            </div>
          ) : filteredForums.length === 0 ? (
            <div className="w-full lg:w-[750px] text-center">
              <p className="text-gray-700 dark:text-gray-300">Postingan tidak ditemukan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredForums.map((forum) => (
                <div
                  key={forum.id}
                  className="w-full lg:w-[750px] h-auto lg:h-[242px] p-[20px] bg-putih1 dark:bg-hitam2 rounded-[16px] border border-hitam2 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className="flex items-center mb-3">
                    <img
                      src={`${API_URL}${forum.profile}`}
                      alt={forum.username}
                      className="w-[32px] lg:w-[40px] h-[32px] lg:h-[40px] rounded-full mr-3 object-cover cursor-pointer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                      }}
                      onClick={() => handleAkun(forum.user_id)}
                    />
                    <div>
                      <div className="flex items-center">
                        <p
                          className="text-[12px] lg:text-[14px] font-ruda text-hitam2 dark:text-putih1 font-semibold me-[6px] cursor-pointer hover:underline"
                          onClick={() => handleAkun(forum.user_id)}
                        >
                          {forum.name}
                        </p>
                        <Ellipse className="fill-black dark:fill-white w-1.5 lg:w-2 h-1.5 lg:h-2" />
                        <p
                          className="text-[12px] lg:text-[14px] font-ruda text-hitam3 dark:text-abu font-medium ms-[6px] cursor-pointer hover:underline"
                          onClick={() => handleAkun(forum.user_id)}
                        >
                          @{forum.username}
                        </p>
                        <Dropdown
                          id={forum.id}
                          userId={forum.user_id}
                          onReportForum={handleReportForum}
                          onReportAccount={handleReportAccount}
                        />
                      </div>
                      <p className="text-[9px] font-ruda text-hitam4 dark:text-putih3 font-semibold">
                        {forum.relative_time}
                      </p>
                    </div>
                  </div>

                  <div className="w-full flex flex-col lg:grid lg:grid-cols-[1fr_auto] gap-4">
                    <div className="min-w-0">
                      <h2
                        onClick={() => handleGetByID(forum.id)}
                        className="text-[16px] lg:text-[18px] font-bold font-ruda text-hitam2 dark:text-white line-clamp-2 max-h-[53px] overflow-hidden text-ellipsis hover:underline cursor-pointer"
                      >
                        {forum.title}
                      </h2>
                      <div className="mt-[5px] flex flex-wrap gap-2">
                        {forum.tags &&
                          forum.tags.length > 0 &&
                          forum.tags.slice(0, 6).map((tag: any) => (
                            <span
                              key={tag.id}
                              className="py-[4px] lg:py-[6px] px-[8px] lg:px-[10px] text-[10px] font-ruda font-bold bg-putih3 dark:bg-hitam4 text-hitam2 dark:text-abu rounded-full me-[5px] mb-[5px] cursor-pointer hover:bg-ungu hover:text-white dark:hover:bg-ungu hover:underline"
                              onClick={() => handleHashtagClick(tag.name)}
                            >
                              #{tag.name}
                            </span>
                          ))}
                      </div>
                    </div>
                    {(forum.photo || (forum.photos && forum.photos.length > 0)) && (
                      <div className="relative w-full lg:w-[200px] h-[150px] lg:h-[200px] mt-0 lg:-mt-[50px] flex-shrink-0">
                        <img
                          onClick={() => handleGetByID(forum.id)}
                          src={`${API_URL}${forum.photo || forum.photos[0]}`}
                          alt={forum.title}
                          className="w-full h-full rounded-[16px] object-cover border border-hitam2 cursor-pointer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                          }}
                        />
                        {forum.photos && forum.photos.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-[10px] lg:text-[12px] font-ruda px-2 py-1 rounded">
                            +{Math.min(forum.photos.length - 1, 4)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center static lg:absolute mt-4 lg:mt-0 lg:bottom-[20px] lg:left-[20px] dark:text-abu">
                    <button
                      onClick={() => handleLikeForum(forum.id)}
                      className="flex font-ruda items-center text-[11px] lg:text-[13px] me-[27px] text-hitam1 dark:text-abu"
                    >
                      {forum.liked ? (
                        <Heart className="fill-ungu me-[5px] w-3.5 lg:w-4 h-3.5 lg:h-4" />
                      ) : (
                        <Heart className="fill-abu me-[5px] w-3.5 lg:w-4 h-3.5 lg:h-4" />
                      )}
                      {forum.like} Suka
                    </button>
                    <button
                      onClick={() => handleGetByID(forum.id)}
                      className="flex font-ruda items-center text-[11px] lg:text-[13px] text-hitam1 dark:text-abu"
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

      <div className="top-0 right-0 absolute me-[40px] mt-[90px] hidden lg:block">
        <div className="mt-[10px]">
          <PopulerTag onTagClick={handleHashtagClick} />
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
      <PostingModal isOpen={showPostingModal} onClose={() => setShowPostingModal(false)} />
    </div>
  );
}