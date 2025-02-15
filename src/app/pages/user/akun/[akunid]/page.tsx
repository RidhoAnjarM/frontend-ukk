'use client';

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { UserProfile, Forum } from "@/app/types/types";
import Navbar from "@/app/components/Navbar";

const ProfilePage = () => {
  const router = useRouter();
  const { akunid } = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!akunid) return;

    const fetchUser = async () => {
      try {
        console.log("Fetching user with ID:", akunid);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${akunid}`);
        console.log("Response dari backend:", response.data);

        if (response.data.profile) {
          setUser(response.data.profile);
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!user) return <p>Profile not found</p>;

  return (
    <div>
      <Navbar />
      <div className="ps-[270px] pt-[59px]'>">
        <div className="w-[350px] h-[400px] rounded-[10px] fixed top-0 right-0 me-[60px] mt-[30px] p-[15px] bg-white border border-gray-300 ">
          <div className='w-full grid justify-center text-center'>
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${user.profile}`}
              alt="Profile"
              className="w-[140px] h-[140px] rounded-full flex items-center justify-center overflow-hidden"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
              }}
            />
            <p className="text-[24px] font-ruda font-bold my-[15px]">{user.name}</p>
            <p className="text-[15px] font-ruda font-bold text-gray-400">@{user.username}</p>
          </div>
          <p className='mt-[50px] ms-[50px] text-[15px] font-ruda'>Postingan: {user.forums ? user.forums.length : 0}</p>
        </div>
        <div
          className={`fixed top-0 w-full ms-[85px] z-10 transition-transform duration-300`}
        >
          <div className="bg-white backdrop-blur-md bg-opacity-20 w-[700px] h-[60px] border border-t-0 flex items-center px-[30px]">
            <button
              onClick={() => router.back()}
              className="flex justify-center items-center me-[30px] hover:bg-black hover:bg-opacity-20 rounded-full px-1 py-2 transition-colors">
              <img src="../../../icons/back.svg" alt="" className='' />
            </button>
            <h1 className="text-[20px] text-primary font-ruda font-black">
              Profil <span>{user.name}</span>
            </h1>
          </div>
        </div>
        <div className="pt-[59px]">
          {user.forums && user.forums.length > 0 ? (
            user.forums.map((forum: Forum) => (
              <div key={forum.id} className="w-[700px] p-[30px] bg-white border border-gray-300 border-t-0 ms-[85px]">
                <div className="flex justify-between w-full items-center">
                  <div className="flex">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${forum.profile}`}
                      alt=""
                      className="w-[40px] h-[40px] bg-cover rounded-full"
                      onError={(e) => {
                        console.log(`Image not found for user: ${forum.profile}, setting to default.`);
                        (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                      }}
                    />
                    <div className="ms-[10px] py-[1px]">
                      <div className="flex gap-1">
                        <p className="text-[14px] font-ruda font-bold">{forum.name}</p>
                        <p className="text-[14px] font-sans text-gray-500 -mt-[2px]">@{forum.username}</p>
                      </div>
                      <p className="text-[10px] font-sans">{forum.relative_time}</p>
                    </div>
                  </div>
                  <div className="relative dropdown-container">
                    <button
                      // onClick={() => handleAccount(forum.id)}
                      className="focus:outline-none"
                    >
                      <img src="../../../icons/menu.svg" alt="menu" className='w-[25px]' />
                    </button>

                  </div>
                </div>
                <div className="mt-[5px] text-[16px] font-sans ps-[50px]">
                  <h2>{forum.title}</h2>
                  {forum.photo && (
                    <div className="w-[400px] h-[400px] bg-white bg-opacity-50 backdrop-blur-70 rounded-[15px] mt-[10px] border border-gray-400 flex justify-center items-center overflow-hidden group">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}${forum.photo}`}
                        alt={forum.title}
                        className="max-w-full max-h-full"
                        onError={(e) => {
                          console.log(`Image not found for user: ${forum.photo}, setting to default.`);
                          (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="mt-[15px] flex ms-[50px]">
                  <div className="text-primary font-ruda mt-[10px] mb-[10px] flex items-center text-[15px]">
                    <button>
                      <img src="../../../icons/like.svg" alt=""
                        className="w-[15px] h-[15px] mr-[20px]" />
                    </button>
                  </div>
                  <button
                    // onClick={() => handleCommentClick(forum.id)}
                    className="font-ruda mt-[10px] mb-[10px] flex items-center text-[15px]"
                  >
                    <img src="../../../icons/comment.svg"
                      className="w-[15px] h-[15px] mr-[5px]"
                    />
                    <p className='mt-[1px]'>{forum.comments ? forum.comments.length + forum.comments.reduce((acc, comment) => acc + (comment.replies ? comment.replies.length : 0), 0) : 0}</p>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No forums posted.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
