'use client';

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { UserProfile, Forum } from "@/app/types/types";
import Sidebar from "@/app/components/Sidebar";
import { Back, Ellipse, Heart } from "@/app/components/svgs/page";

const API_URL = process.env.NEXT_PUBLIC_API_URL

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
      console.error('Error liking forum:', error)
      alert('Gagal menyukai forum')
    }
  }

  const getTotalComments = (forum: any) => {
    if (!forum.comments || !Array.isArray(forum.comments)) return 0
    const commentsCount = forum.comments.length
    const repliesCount = forum.comments.reduce((total: number, comment: any) => {
      return total + (comment.replies && Array.isArray(comment.replies) ? comment.replies.length : 0)
    }, 0)
    return commentsCount + repliesCount
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}> {error} </p>;
  if (!user || !user.forums) return <p>Profile not found or no forums available </p>;

  return (
    <div className="bg-white dark:bg-hitam1 w-full h-screen" >
      <Sidebar />
      <div className="" >
        <button
          onClick={() => router.back()}
          className="absolute mt-[80px] ms-[200px]"
        >
          <Back className="fill-hitam2 dark:fill-white" />
        </button>
        <div className="fixed w-[750px] h-[170px] bg-putih1 dark:bg-hitam2 border border-hitam2 rounded-[16px] top-0 ms-[280px] mt-[57px] overflow-hidden z-10" >
          <div className="w-full h-[90px] bg-abu" >
            <img src="../../../images/latar.jpg" alt="" className="w-full h-[90px] object-cover" />
          </div>
          <div className="w-full h-[90px] flex relative" >
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${user.profile}`}
              alt="Profile"
              className="w-[100px] h-[100px] rounded-full object-cover ms-[35px] -mt-[45px]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
              }}
            />
            <div className='ms-[12px] p-0 grid-cols-1 items-start' >
              <p className="text-[24px] font-ruda font-medium text-hitam1 dark:text-putih1" > {user.name} </p>
              <p className="text-[16px] font-ruda font-medium text-hitam4 dark:text-abu -mt-[5px]" > @{user.username} </p>
              <p className='text-[13px] font-ruda font-medium text-hitam2 dark:text-putih1' > {user.forums ? user.forums.length : 0} Postingan </p>
            </div>
          </div>
        </div>

        <h1 className="text-[24px] font-ruda font-medium text-hitam1 dark:text-putih1 ms-[300px] mt-[240px] fixed" >
          Postingan {user.name}
        </h1>

        <div className="fixed w-[770px] bg-putih1 dark:bg-hitam2 ms-[270px] mt-[290px] rounded-[16px] overflow-y-auto max-h-[calc(100vh-290px)] scrollbar-hide grid justify-center p-[10px]" >
          {user.forums && user.forums.length > 0 ? (
              user.forums
                .sort((a: Forum, b: Forum) => b.id - a.id)
                .map((forum: Forum) => (
                  <div
                    key={forum.id}
                    className="w-[750px] h-[242px] p-[20px] bg-putih1 dark:bg-hitam3 rounded-[16px] border border-hitam2 hover:shadow-lg transition-shadow overflow-hidden relative z-0 mb-[10px]"
                  >
                    {/* Konten forum sama seperti sebelumnya */}
                    <div className="flex items-center mb-3" >
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}${forum.profile}`}
                        alt={forum.username}
                        className="w-[40px] h-[40px] rounded-full mr-3 object-cover"
                        onError={(e) => {
                          console.log(`Image not found for user: ${forum.profile}, setting to default.`);
                          (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                        }}
                      />
                      <div className="" >
                        <div className='flex items-center' >
                          <p className="text-[14px] font-ruda text-hitam2 dark:text-putih1 font-semibold me-[6px]" > {forum.name} </p>
                          < Ellipse className="fill-black dark:fill-white" />
                          <p className="text-[14px] font-ruda text-hitam3 dark:text-abu font-medium ms-[6px]" > {forum.username} </p>
                        </div>
                        < p className='text-[9px] font-ruda text-hitam4 dark:text-putih3 font-semibold' > {forum.relative_time} </p>
                      </div>
                    </div>

                    <div className="w-full flex justify-between" >
                      <div className="" >
                        <h2 onClick={() => handleGetByID(forum.id)} className="text-[18px] font-bold font-ruda text-hitam2 dark:text-white line-clamp-2 max-h-[53px] flex-1 min-w-0 overflow-hidden hover:underline cursor-pointer" > {forum.title} </h2>
                        <div className="mt-[5px] flex flex-wrap" >
                          {
                            forum.category_name ? (
                              <p className="py-[6px] px-[10px] text-[10px] font-ruda font-bold bg-putih3 dark:bg-hitam4 text-hitam2 dark:text-abu rounded-full me-[5px] mb-[5px]" >
                                {forum.category_name}
                              </p>
                            ) : null}
                          {
                            forum.tags && forum.tags.length > 0 ? (
                              forum.tags.map((tag: any) => (
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

                    <div className="flex items-center absolute bottom-[20px] left-[20px] dark:text-abu" >
                      <button
                        onClick={() => handleLikeForum(forum.id)}
                        className="flex font-ruda items-center text-[13px] me-[27px]"
                      >
                        {
                          forum.liked ? (
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
                ))
            ) : (
              <div className="w-[750px] h-[200px] flex items-center justify-center rounded-[16px] bg-putih1 dark:bg-hitam3 dark:border-hitam3 dark:text-abu border-t-0 text-center" >
                <p className="text-gray-500" > Tidak ada Postingan.</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;