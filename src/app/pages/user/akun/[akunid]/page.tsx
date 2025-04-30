'use client';

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { UserProfile, Forum } from "@/app/types/types";
import Sidebar from "@/app/components/Sidebar";
import { Back, Ellipse, Heart } from "@/app/components/svgs";
import Navbar from "@/app/components/Navbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const ProfilePage = () => {
  const router = useRouter();
  const { akunid } = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!akunid) return;

    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Unauthorized: Please log in first.");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching user with ID:", akunid);
        const response = await axios.get(
          `${API_URL}/api/users/${akunid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.profile) {
          setUser({
            ...response.data.profile,
            forums: response.data.profile.forums || [],
          });
          setError("");
        } else {
          setError("Profile not found");
        }
      } catch (err) {
        console.error("Gagal mengambil data user:", err);
        setError("Profile not found");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [akunid]);

  const handleGetByID = (postid: number) => {
    router.push(`/pages/user/forum/${postid}`);
  };

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
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ forum_id: forumId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Like Response:', result);

      setUser((prev: any) => ({
        ...prev,
        forums: prev.forums.map((forum: any) =>
          forum.id === forumId
            ? {
              ...forum,
              liked: result.liked,
              like: result.liked ? forum.like + 1 : forum.like - 1,
            }
            : forum
        ),
      }));
    } catch (error) {
      console.error('Error liking forum:', error);
      alert('Gagal menyukai forum');
    }
  };

  const getTotalComments = (forum: any) => {
    if (!forum.comments || !Array.isArray(forum.comments)) return 0;
    const commentsCount = forum.comments.length;
    const repliesCount = forum.comments.reduce((total: number, comment: any) => {
      return total + (comment.replies && Array.isArray(comment.replies) ? comment.replies.length : 0);
    }, 0);
    return commentsCount + repliesCount;
  };

  const getTotalLikes = () => {
    if (!user?.forums || !Array.isArray(user.forums)) return 0;
    return user.forums.reduce((total: number, forum: any) => total + (forum.like || 0), 0);
  };

  // Tidak pakai full-screen loading/error lagi
  return (
    <div className="bg-white dark:bg-hitam1 w-full min-h-screen">
      <Navbar />
      <Sidebar />
      <div>
        {loading ? (
          <div className="w-full h-screen flex items-center justify-center">
            <p className="text-hitam1 dark:text-abu font-ruda text-[16px]">Memuat profil...</p>
          </div>
        ) : error ? (
          <div className="w-full h-screen flex items-center justify-center">
            <p className="text-red-500 font-ruda text-[16px]">{error}</p>
          </div>
        ) : !user ? (
          <div className="w-full h-screen flex items-center justify-center">
            <p className="text-hitam1 dark:text-abu font-ruda text-[16px]">Profil tidak ditemukan</p>
          </div>
        ) : (
          <>
            <div className="fixed w-full lg:w-[750px] h-[140px] lg:h-[170px] bg-putih1 dark:bg-hitam2 border border-hitam2 rounded-[16px] top-0 ms-0 lg:ms-[280px] mt-[70px] lg:mt-[90px] overflow-hidden z-10 mx-auto">
              <div className="w-full h-[70px] lg:h-[90px] bg-abu">
                <img src="../../../images/latar.jpg" alt="" className="w-full h-[70px] lg:h-[90px] object-cover" />
              </div>
              <div className="w-full h-[70px] lg:h-[90px] flex relative">
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}${user.profile}`}
                  alt="Profile"
                  className="w-[80px] lg:w-[100px] h-[80px] lg:h-[100px] rounded-full object-cover ms-[20px] lg:ms-[35px] -mt-[35px] lg:-mt-[45px]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                  }}
                />
                <div className="ms-[10px] lg:ms-[12px] p-0 grid-cols-1 items-start">
                  <div className="flex items-center gap-1.5 lg:gap-2">
                    <p className="text-[20px] lg:text-[24px] font-ruda font-medium text-hitam1 dark:text-putih1">{user.name}</p>
                    <p className="text-[14px] lg:text-[16px] font-ruda font-medium text-hitam4 dark:text-abu">@{user.username}</p>
                  </div>
                  <div className="flex gap-3 lg:gap-4 text-[12px] lg:text-[13px] font-ruda text-hitam2 dark:text-putih1">
                    <span>{user.forums ? user.forums.length : 0} Postingan</span>
                    <span>{getTotalLikes()} Suka</span>
                  </div>
                </div>
              </div>
            </div>

            <h1 className="text-[18px] lg:text-[20px] font-ruda font-medium text-hitam1 dark:text-putih1 ms-5 lg:ms-[300px] mt-[220px] lg:mt-[265px] fixed">
              Postingan {user.name}
            </h1>

            <div className="fixed w-full lg:w-[770px] bg-putih1 dark:bg-hitam2 ms-0 lg:ms-[270px] mt-[250px] lg:mt-[280px] rounded-[16px] overflow-y-auto max-h-[calc(100vh-210px)] lg:max-h-[calc(100vh-290px)] scrollbar-hide grid justify-center p-[8px] lg:p-[10px] overflow-hidden mx-auto">
              {user.forums && user.forums.length > 0 ? (
                user.forums
                  .sort((a: Forum, b: Forum) => b.id - a.id)
                  .map((forum: Forum) => (
                    <div
                      key={forum.id}
                      className="w-full lg:w-[750px] h-auto lg:h-[242px] p-[16px] lg:p-[20px] bg-putih1 dark:bg-hitam2 rounded-[16px] border border-hitam2 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden mb-[8px] lg:mb-[10px]"
                    >
                      <div className="flex items-center mb-2 lg:mb-3">
                        <img
                          src={`${API_URL}${forum.profile}`}
                          alt={forum.username}
                          className="w-[32px] lg:w-[40px] h-[32px] lg:h-[40px] rounded-full mr-2 lg:mr-3 object-cover"
                          onError={(e) => {
                            console.log(`Image not found for user: ${forum.profile}, setting to default.`);
                            (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                          }}
                        />
                        <div className="">
                          <div className="flex items-center">
                            <p className="text-[12px] lg:text-[14px] font-ruda text-hitam2 dark:text-putih1 font-semibold me-[5px] lg:me-[6px]">{forum.name}</p>
                            <Ellipse className="fill-black dark:fill-white w-1.5 lg:w-2 h-1.5 lg:h-2" />
                            <p className="text-[12px] lg:text-[14px] font-ruda text-hitam3 dark:text-abu font-medium ms-[5px] lg:ms-[6px]">{forum.username}</p>
                          </div>
                          <p className="text-[8px] lg:text-[9px] font-ruda text-hitam4 dark:text-putih3 font-semibold">{forum.relative_time}</p>
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
                          <div className="mt-[4px] lg:mt-[5px] flex flex-wrap gap-1.5 lg:gap-2">
                            {forum.tags &&
                              forum.tags.length > 0 &&
                              forum.tags.slice(0, 6).map((tag: any) => (
                                <span
                                  key={tag.id}
                                  className="py-[4px] lg:py-[6px] px-[8px] lg:px-[10px] text-[9px] lg:text-[10px] font-ruda font-bold bg-putih3 dark:bg-hitam4 text-hitam2 dark:text-abu rounded-full me-[4px] lg:me-[5px] mb-[4px] lg:mb-[5px] cursor-pointer hover:bg-ungu hover:text-white dark:hover:bg-ungu hover:underline"
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

                      <div className="flex items-center static lg:absolute mt-3 lg:mt-0 lg:bottom-[20px] lg:left-[20px] dark:text-abu">
                        <button
                          onClick={() => handleLikeForum(forum.id)}
                          className="flex font-ruda items-center text-[11px] lg:text-[13px] me-[20px] lg:me-[27px] text-hitam1 dark:text-abu"
                        >
                          {forum.liked ? (
                            <Heart className="fill-ungu me-[4px] lg:me-[5px] w-3.5 lg:w-4 h-3.5 lg:h-4" />
                          ) : (
                            <Heart className="fill-abu me-[4px] lg:me-[5px] w-3.5 lg:w-4 h-3.5 lg:h-4" />
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
                  ))
              ) : (
                <div className="w-[750px] h-[200px] flex items-center justify-center rounded-[16px] bg-putih1 dark:bg-hitam3 dark:border-hitam3 dark:text-abu border-t-0 text-center">
                  <p className="text-gray-500">Tidak ada Postingan.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;