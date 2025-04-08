'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { ForumPost, User, DecodedToken, Reply } from '@/app/types/types';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { Ellipse, Emote, Heart, Vertikal } from './svgs/page';
import Dropdown from './Dropdown';
import ReportModal from './ReportModal';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const DetailForum = () => {
  const [post, setPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { postid } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [reportedUserId, setReportedUserId] = useState<number | null>(null);
  const [reportedForumId, setReportedForumId] = useState<number | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showReportModalForum, setShowReportModalForum] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [visibleComments, setVisibleComments] = useState<number | null>(null);
  const [inputMode, setInputMode] = useState<{ type: 'comment' | 'reply' | 'subreply'; targetId: number | null }>({
    type: 'comment',
    targetId: null,
  });
  const [inputValue, setInputValue] = useState<string>('');
  const [sortOption, setSortOption] = useState<'terbaru' | 'terpopuler'>('terbaru');
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container') && !target.closest('.dropdown-item')) {
      setActiveDropdown(null);
    }
  };

  useEffect(() => {
    if (activeDropdown !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  const handleShowDropdown = (postId: number) => {
    setActiveDropdown((prev) => (prev === postId ? null : postId));
  };

  const handleReportAccount = (userId: number) => {
    setReportedUserId(userId);
    setShowReportModal(true);
  };

  const handleReportForum = (forumId: number) => {
    setReportedForumId(forumId);
    setShowReportModalForum(true);
  };

  const handleAkun = (akunid: number) => {
    router.push(`/pages/user/akun/${akunid}`);
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
          console.error('Gagal Mengambil data:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!postid) return;

    const fetchPostDetail = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/forum/${postid}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setPost(response.data);
        setInputMode({ type: 'comment', targetId: response.data.id });
      } catch (err) {
        setError('Gagal mengambil data.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetail();
  }, [postid]);

  const handleSubmit = async () => {
    if (!inputValue.trim() || !inputMode.targetId) return;

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      if (inputMode.type === 'comment') {
        const formData = new FormData();
        formData.append('forum_id', inputMode.targetId.toString());
        formData.append('content', inputValue);

        const response = await axios.post(`${API_URL}/api/comment/`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const newCommentData = {
          ...response.data.comment,
          replies: [],
          created_at: response.data.comment.created_at || new Date().toISOString(),  
          relative_time: 'Baru saja',  
        };

        setPost((prevPost) =>
          prevPost ? { ...prevPost, comments: [...(prevPost.comments || []), newCommentData] } : prevPost
        );
      } else if (inputMode.type === 'reply' || inputMode.type === 'subreply') {
        const commentId = inputMode.type === 'reply' ? inputMode.targetId : getCommentIdByReplyId(inputMode.targetId);
        const parentReplyId = inputMode.type === 'subreply' ? inputMode.targetId : null;

        const formData = new FormData();
        formData.append('parent_id', commentId!.toString());
        formData.append('content', inputValue);
        if (parentReplyId) formData.append('parent_reply_id', parentReplyId.toString());

        const response = await axios.post(`${API_URL}/api/comment/reply`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const newReplyData = { ...response.data.reply, replies: [] };

        setPost((prevPost) =>
          prevPost
            ? {
              ...prevPost,
              comments: prevPost.comments.map((comment) =>
                comment.id === commentId
                  ? { ...comment, replies: [...(comment.replies || []), newReplyData] }
                  : comment
              ),
            }
            : prevPost
        );
      }

      setInputValue('');
      setInputMode({ type: 'comment', targetId: post?.id || null });
    } catch (error) {
      console.error('Error submitting:', error);
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setInputValue((prev) => prev + emojiData.emoji);
  };

  const handleClickOutsideEmoji = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.emoji-picker-container') && !target.closest('.emoji-button')) {
      setShowEmojiPicker(false);
    }
  };

  useEffect(() => {
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutsideEmoji);
    } else {
      document.removeEventListener('mousedown', handleClickOutsideEmoji);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideEmoji);
    };
  }, [showEmojiPicker]);

  const handleDeleteComment = async (commentId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.delete(`${API_URL}/api/comment/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPost((prevPost) =>
        prevPost ? { ...prevPost, comments: prevPost.comments.filter((comment) => comment.id !== commentId) } : prevPost
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleDeleteReply = async (commentId: number, replyId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.delete(`${API_URL}/api/comment/reply/${replyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPost((prevPost) =>
        prevPost
          ? {
            ...prevPost,
            comments: prevPost.comments.map((comment) =>
              comment.id === commentId
                ? { ...comment, replies: (comment.replies ?? []).filter((reply) => reply.id !== replyId) }
                : comment
            ),
          }
          : prevPost
      );
    } catch (error) {
      console.error('Error deleting reply:', error);
    }
  };

  const getCommentIdByReplyId = (replyId: number | null) => {
    if (!post || !replyId) return null;
    for (const comment of post.comments) {
      if (comment.replies?.some((reply) => reply.id === replyId)) {
        return comment.id;
      }
    }
    return null;
  };

  const getUsernameByReplyId = (replyId: number | null) => {
    if (!post || !replyId) return '';
    for (const comment of post.comments) {
      const reply = comment.replies?.find((r) => r.id === replyId);
      if (reply) return reply.username;
    }
    return '';
  };

  const getUsernameByCommentId = (commentId: number | null) => {
    if (!post || !commentId) return '';
    const comment = post.comments.find((c) => c.id === commentId);
    return comment ? comment.username : '';
  };

  const getCurrentUserId = (): number | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const decoded: DecodedToken = jwtDecode(token);
      return decoded.id;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId) setCurrentUserId(userId);
  }, []);

  const sortComments = (comments: any[]) => {
    if (!comments) return [];
  
    const sortedComments = [...comments];
    if (sortOption === 'terbaru') {
      return sortedComments.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA; 
      });
    } else if (sortOption === 'terpopuler') {
      return sortedComments.sort((a, b) => (b.replies?.length || 0) - (a.replies?.length || 0));
    }
    return sortedComments;
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
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ forum_id: forumId }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();

      setPost((prevPost) =>
        prevPost ? { ...prevPost, liked: result.liked, like: result.liked ? prevPost.like + 1 : prevPost.like - 1 } : null
      );
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

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : (post?.photos?.length || 1) - 1));
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev < (post?.photos?.length || 1) - 1 ? prev + 1 : 0));
  };

  const openImageModal = () => {
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
  };

  return (
    <div className="relative min-h-screen pb-20">
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
      ) : error ? (
        <div className="w-[750px] h-[242px] p-[25px] bg-white dark:bg-hitam2 rounded-[16px] dark:text-abu flex items-center justify-center">
          <p>{error}</p>
        </div>
      ) : post ? (
        <div className="w-[750px] p-[25px] bg-white dark:bg-hitam2 rounded-[16px] border border-hitam2 hover:shadow-lg transition-shadow relative z-0">
          <div className="flex justify-between w-full items-center">
            <div className="flex">
              <img
                src={`${API_URL}${post.profile}`}
                alt=""
                className="w-[40px] h-[40px] object-cover rounded-full border border-hitam2"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                }}
              />
              <div className="ms-[10px]">
                <div className="flex items-center">
                  <p
                    className="text-[15px] font-ruda text-hitam2 dark:text-putih1 font-semibold me-[6px] cursor-pointer hover:underline"
                    onClick={() => handleAkun(post.user_id)}
                  >
                    {post.name}
                  </p>
                  <Ellipse className="fill-black dark:fill-white" />
                  <p
                    className="text-[14px] font-ruda text-hitam3 dark:text-abu font-medium ms-[6px] cursor-pointer hover:underline"
                    onClick={() => handleAkun(post.user_id)}
                  >
                    @{post.username}
                  </p>
                </div>
                <p className="text-[9px] font-ruda text-hitam4 dark:text-putih3 font-semibold">{post.relative_time}</p>
              </div>
            </div>
            <Dropdown id={post.id} userId={post.user_id} onReportForum={handleReportForum} onReportAccount={handleReportAccount} />
          </div>

          <div>
            <h2 className="text-[17px] font-ruda font-bold mt-1 text-hitam1 dark:text-abu whitespace-pre-wrap">{post.title}</h2>
            <p className="text-[15px] font-ruda font-medium mt-3 text-hitam1 dark:text-putih1 whitespace-pre-wrap">{post.description}</p>
            <div className="mt-[5px] flex flex-wrap">
              {post.tags &&
                post.tags.map((tag: any) => (
                  <span
                    key={tag.id}
                    className="py-[6px] px-[10px] text-[10px] font-ruda font-bold bg-putih3 dark:bg-hitam4 text-hitam2 dark:text-abu rounded-full me-[5px] mb-[5px]"
                  >
                    #{tag.name}
                  </span>
                ))}
            </div>
            {post.photo && (
              <div className="w-[500px] bg-white bg-opacity-50 backdrop-blur-70 rounded-[15px] mt-3 border border-gray-400 object-cover overflow-hidden">
                <img src={`${API_URL}${post.photo}`} alt={post.title} onClick={openImageModal} className="w-full bg-cover cursor-pointer" />
              </div>
            )}
            {post.photos && post.photos.length > 0 && (
              <div className="mt-3">
                {post.photos.length === 1 ? (
                  <div className="w-[500px] h-[500px] bg-white bg-opacity-50 backdrop-blur-md rounded-[15px] border border-gray-400 object-cover overflow-hidden flex items-center justify-center">
                    <img
                      src={`${API_URL}${post.photos[0]}`}
                      alt={post.title}
                      className="w-full cursor-pointer"
                      onClick={openImageModal}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                      }}
                    />
                  </div>
                ) : (
                  <div className="relative w-[500px] h-[500px] bg-white bg-opacity-50 backdrop-blur-md rounded-[15px] border border-gray-400 overflow-hidden flex items-center justify-center">
                    <img
                      src={`${API_URL}${post.photos[currentPhotoIndex]}`}
                      alt={post.title}
                      className="w-full transition-opacity duration-300 cursor-pointer"
                      onClick={openImageModal}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                      }}
                    />
                    <button
                      onClick={handlePrevPhoto}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                    >
                      ‹
                    </button>
                    <button
                      onClick={handleNextPhoto}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                    >
                      ›
                    </button>
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {post.photos.map((_, index) => (
                        <span
                          key={index}
                          className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentPhotoIndex ? 'bg-ungu scale-125' : 'bg-gray-400'
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center dark:text-abu mt-3">
              <button onClick={() => handleLikeForum(post.id)} className="flex font-ruda items-center text-[13px] me-[27px] text-hitam1 dark:text-abu">
                {post.liked ? <Heart className="fill-ungu me-[5px]" /> : <Heart className="fill-abu me-[5px]" />}
                {post.like} Like
              </button>
              <button className="flex font-ruda items-center text-[13px] text-hitam1 dark:text-abu">
                <span>{getTotalComments(post)} Komentar</span>
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center mt-5 mb-4">
            <h3 className="text-[16px] font-ruda text-hitam1 dark:text-abu">Komentar</h3>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as 'terbaru' | 'terpopuler')}
              className="bg-putih1 dark:bg-hitam3 text-hitam1 dark:text-abu text-[14px] font-ruda p-1 rounded outline-none"
            >
              <option value="terbaru">Terbaru</option>
              <option value="terpopuler">Terpopuler</option>
            </select>
          </div>

          <div>
            {post.comments && post.comments.length > 0 ? (
              sortComments(post.comments).map((comment) => (
                <div key={comment.id} className="comment-container w-full bg-putih1 dark:bg-hitam3 rounded-[10px] p-[10px] mt-3">
                  <div className="flex items-center justify-between relative">
                    <div className="flex">
                      <img
                        src={`${API_URL}${comment.profile}`}
                        alt=""
                        className="w-[35px] h-[35px] object-cover rounded-full border border-hitam2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                        }}
                      />
                      <div className="ms-[10px]">
                        <div className="flex items-center">
                          <p
                            className="text-[13px] font-ruda text-hitam2 dark:text-putih1 font-semibold me-[6px] cursor-pointer hover:underline"
                            onClick={() => handleAkun(comment.user_id)}
                          >
                            {comment.name}
                          </p>
                          <Ellipse className="fill-black dark:fill-white" />
                          <p
                            className="text-[12px] font-ruda text-hitam3 dark:text-abu font-medium ms-[6px] cursor-pointer hover:underline"
                            onClick={() => handleAkun(comment.user_id)}
                          >
                            @{comment.username}
                          </p>
                        </div>
                        <p className="text-[9px] font-ruda text-hitam4 dark:text-putih3 font-semibold">{comment.relative_time}</p>
                      </div>
                    </div>
                    <div className="dropdown-container">
                      <button onClick={() => handleShowDropdown(comment.id)}>
                        <Vertikal className="fill-hitam2 dark:fill-abu me-[15px]" />
                      </button>
                      {activeDropdown === comment.id && (
                        <div className="absolute bg-[#F2F2F2] w-[150px] rounded-[6px] overflow-hidden text-[12px] mt-2 -ms-[65px]">
                          <button
                            onClick={() => handleAkun(comment.user_id)}
                            className="block px-4 py-2 text-primary hover:bg-gray-200 w-full text-center font-ruda"
                          >
                            Lihat Akun
                          </button>
                          {comment.user_id === currentUserId && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="block px-4 py-2 text-primary hover:bg-gray-200 w-full text-center font-ruda"
                            >
                              Hapus komentar
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ms-[45px] text-wrap mt-2">
                    <p className="text-[14px] font-ruda text-hitam1 dark:text-putih3 text-wrap">{comment.content}</p>
                    <div className="flex items-center">
                      <hr className="w-[15px] me-1 border border-blue-900 dark:border-abu" />
                      <button
                        onClick={() => {
                          setVisibleComments((prev) => (prev === comment.id ? null : comment.id));
                          setInputMode({ type: 'reply', targetId: comment.id });
                          setInputValue('');
                        }}
                        className="text-blue-900 dark:text-abu text-[12px] hover:underline"
                      >
                        {visibleComments === comment.id && comment.replies && comment.replies.length > 0
                          ? 'Tutup Balasan'
                          : comment.replies && comment.replies.length > 0
                            ? `Lihat Balasan (${comment.replies.length})`
                            : 'Balas'}
                      </button>
                    </div>
                  </div>

                  {visibleComments === comment.id && comment.replies && comment.replies.length > 0 && (
                    <div className="mt-[10px] ms-[45px]">
                      {comment.replies.map((reply: Reply) => (
                        <div key={reply.id} className="relative mt-3">
                          <div className="flex items-center justify-between pe-10">
                            <div className="flex">
                              <img
                                src={`${API_URL}${reply.profile}`}
                                alt=""
                                className="w-[35px] h-[35px] object-cover rounded-full border border-hitam2"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                                }}
                              />
                              <div className="ms-[10px]">
                                <div className="flex items-center">
                                  <p
                                    className="text-[13px] font-ruda text-hitam2 dark:text-putih1 font-semibold me-[6px] cursor-pointer hover:underline"
                                    onClick={() => handleAkun(reply.user_id)}
                                  >
                                    {reply.name}
                                  </p>
                                  <Ellipse className="fill-black dark:fill-white" />
                                  <p
                                    className="text-[12px] font-ruda text-hitam3 dark:text-abu font-medium ms-[6px] cursor-pointer hover:underline"
                                    onClick={() => handleAkun(reply.user_id)}
                                  >
                                    @{reply.username}
                                  </p>
                                </div>
                                <p className="text-[9px] font-ruda text-hitam4 dark:text-putih3 font-semibold">{reply.relative_time}</p>
                              </div>
                            </div>
                            <div className="dropdown-container">
                              <button onClick={() => handleShowDropdown(reply.id)}>
                                <Vertikal className="fill-hitam2 dark:fill-abu me-[15px]" />
                              </button>
                              {activeDropdown === reply.id && (
                                <div className="absolute bg-[#F2F2F2] w-[150px] rounded-[6px] overflow-hidden text-[12px] mt-2 -ms-[65px]">
                                  <button
                                    onClick={() => handleAkun(reply.user_id)}
                                    className="block px-4 py-2 text-primary hover:bg-gray-200 w-full text-center font-ruda"
                                  >
                                    Lihat Akun
                                  </button>
                                  {reply.user_id === currentUserId && (
                                    <button
                                      onClick={() => handleDeleteReply(comment.id, reply.id)}
                                      className="block px-4 py-2 text-primary hover:bg-gray-200 w-full text-center font-ruda"
                                    >
                                      Hapus Komentar
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="ms-[45px] text-wrap mt-1">
                            <p className="text-[14px] font-ruda text-hitam1 dark:text-putih3 text-wrap">{reply.content}</p>
                            <div className="flex items-center mt-1">
                              <button
                                onClick={() => {
                                  setInputMode({ type: 'subreply', targetId: reply.id });
                                  setInputValue(`@${reply.username} `);
                                }}
                                className="text-blue-900 dark:text-abu text-[12px] hover:underline"
                              >
                                Balas
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center mb-5 text-hitam1 dark:text-putih1">Tidak ada komentar.</p>
            )}
          </div>
        </div>
      ) : (
        <p>Tidak ada postingan.</p>
      )}

      {post && (
        <div className="fixed bottom-0 w-[780px] p-4 bg-white dark:bg-hitam2 z-10 rounded-tl-[16px] rounded-tr-[16px] border border-hitam2 -ms-[15px] flex justify-center">
          <div className="w-[650px] h-[45px] bg-putih3 dark:bg-hitam3 flex items-center px-2 rounded-[16px] relative">
            {user && (
              <img
                src={
                  user.profile
                    ? `${API_URL}${user.profile}`
                    : 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg'
                }
                alt="User profile"
                className="w-[27px] h-[27px] object-cover rounded-full border border-hitam2"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                }}
              />
            )}
            <input
              type="text"
              autoComplete="off"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputValue.trim()) {
                  handleSubmit();
                }
              }}
              placeholder={
                inputMode.type === 'comment'
                  ? 'Ketik disini untuk komentar...'
                  : inputMode.type === 'reply'
                    ? `Balas @${getUsernameByCommentId(inputMode.targetId)}...`
                    : `Balas @${getUsernameByReplyId(inputMode.targetId)}...`
              }
              className="w-[550px] h-[35px] bg-putih3 dark:bg-hitam3 outline-none px-[15px] text-[16px] font-sans text-hitam1 dark:text-abu placeholder-hitam4 dark:placeholder-gray-600"
            />
            <button
              className="emoji-button absolute right-[30px] top-1/2 transform -translate-y-1/2 z-10"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
            >
              <span><Emote className="fill-black dark:fill-abu"/></span>
            </button>
            {showEmojiPicker && (
              <div className="emoji-picker-container absolute bottom-[50px] right-0 z-40">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
            {inputMode.type !== 'comment' && (
              <button
                onClick={() => {
                  setInputMode({ type: 'comment', targetId: post.id });
                  setInputValue('');
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-hitam1 dark:text-abu hover:text-ungu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={handleSubmit}
            className={`w-[45px] h-[45px] rounded-[10px] ms-2 flex items-center justify-center ${inputValue.trim() ? 'bg-ungu text-white' : 'bg-gray-400 text-gray-700 cursor-not-allowed'
              }`}
            disabled={!inputValue.trim()}
          >
            <img src="../../../icons/paperplane.svg" alt="" />
          </button>
        </div>
      )}

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

      {isImageModalOpen && post && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center" onClick={closeImageModal}>
          <div className="relative max-w-[90vw] max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={`${API_URL}${post.photos ? post.photos[currentPhotoIndex] : post.photo}`}
              alt={post.title}
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button
              onClick={closeImageModal}
              className="absolute top-0 right-0 mt-[20px] me-[20px] bg-red-500 rounded-full w-[25px] h-[25px] text-black hover:bg-red-400"
            >
              ✕
            </button>
            {post.photos && post.photos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePrevPhoto(); }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2"
                >
                  ‹
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleNextPhoto(); }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailForum;