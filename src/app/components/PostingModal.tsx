'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Alert from '@/app/components/Alert';
import { Tag } from '@/app/types/types';
import { Emote2, Image } from './svgs';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface PostingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const PostingModal: React.FC<PostingModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('error');
  const [alertMessage, setAlertMessage] = useState('');
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [renderModal, setRenderModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showTitleEmojiPicker, setShowTitleEmojiPicker] = useState(false);
  const [showDescEmojiPicker, setShowDescEmojiPicker] = useState(false);

  useEffect(() => {
    if (isOpen) {
      resetForm();
      resetAlert();
      setRenderModal(true);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      const timeout = setTimeout(() => setRenderModal(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  const isFormDirty = () => {
    return (
      title.trim() !== '' ||
      description.trim() !== '' ||
      photos.length > 0 ||
      selectedTags.length > 0 ||
      query.trim() !== ''
    );
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPhotos([]);
    setFileNames([]);
    setSelectedTags([]);
    setQuery('');
    setSuggestions([]);
    setError(null);
  };

  const resetAlert = () => {
    setShowAlert(false);
    setAlertType('error');
    setAlertMessage('');
  };

  const handleClose = () => {
    if (isFormDirty()) {
      setShowConfirmModal(true);
    } else {
      onClose();
    }
  };

  const handleContinue = () => {
    setShowConfirmModal(false);
  };

  const handleDiscard = () => {
    resetForm();
    resetAlert();
    setShowConfirmModal(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    resetAlert();

    const token = localStorage.getItem('token');
    if (!token) {
      setAlertType('warning');
      setAlertMessage('Token is missing! Please login.');
      setShowAlert(true);
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    photos.forEach((photo) => formData.append('photos', photo));
    selectedTags.forEach((tag) => formData.append('tags', tag.name));

    try {
      const response = await axios.post(`${API_URL}/api/forum/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Submit success:', response.data);

      setAlertType('success');
      setAlertMessage('Forum berhasil dibuat.');
      setShowAlert(true);

      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      let errorMessage = 'Gagal membuat forum';
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = 'Gagal membuat forum, pastikan field diisi dengan benar.';
            break;
          case 500:
            errorMessage = 'Server error.';
            break;
          default:
            errorMessage = error.response.data.message || 'Unexpected error occurred.';
        }
      }
      setAlertType('error');
      setAlertMessage(errorMessage);
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e?: React.ChangeEvent<HTMLInputElement>) => {
    if (!e || !e.target.files || e.target.files.length === 0) {
      setPhotos([]);
      setFileNames([]);
      setError(null);
      return;
    }

    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError('Maksimal 5 foto diperbolehkan.');
      return;
    }

    const validFiles = files.filter((file) => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      setError('Hanya file gambar yang diperbolehkan.');
      return;
    }

    setPhotos(validFiles);
    setFileNames(validFiles.map((file) => file.name));
    setError(null);
  };

  const fetchSuggestions = async (q: string) => {
    if (q.trim() === '') {
      setSuggestions([]);
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/api/tags/`, { params: { q } });
      setSuggestions(response.data ?? []);
    } catch (error) {
      console.error('Fetch suggestions error:', error);
      setAlertType('error');
      setAlertMessage('Gagal memuat saran tag.');
      setShowAlert(true);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (isOpen) fetchSuggestions(query);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [query, isOpen]);

  const handleConfirmTag = async () => {
    if (selectedTags.length >= 10) {
      setAlertType('warning');
      setAlertMessage('Maksimal 10 tag diperbolehkan.');
      setShowAlert(true);
      return;
    }

    const existingTag = suggestions.find((tag) => tag.name === query);
    const alreadySelected = selectedTags.some((tag) => tag.name === query);
    if (alreadySelected) {
      setAlertType('warning');
      setAlertMessage('Tag sudah dipilih.');
      setShowAlert(true);
      return;
    }
    if (existingTag) {
      setSelectedTags((prev) => [...prev, existingTag]);
      setQuery('');
      setSuggestions([]);
    } else {
      try {
        const response = await axios.post(`${API_URL}/api/tags/`, { name: query });
        if (response.status === 201) {
          const newTag = response.data.tag;
          setSelectedTags((prev) => [...prev, newTag]);
          setQuery('');
        }
      } catch (error) {
        setAlertType('error');
        setAlertMessage('Terjadi kesalahan saat membuat tag.');
        setShowAlert(true);
      }
    }
  };

  const handleRemoveTag = (id: number) => {
    setSelectedTags((prev) => prev.filter((tag) => tag.id !== id));
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setFileNames((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEmojiClick = (emojiData: EmojiClickData, target: 'title' | 'description') => {
    if (target === 'title') {
      setTitle((prev) => prev + emojiData.emoji);
      setShowTitleEmojiPicker(false);
    } else if (target === 'description') {
      setDescription((prev) => prev + emojiData.emoji);
      setShowDescEmojiPicker(false);
    }
  };

  if (!renderModal) return null;

  return (
    <>
      <div
        className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
          }`}
      >
        {showAlert && <Alert type={alertType} message={alertMessage} onClose={() => setShowAlert(false)} />}
        <div
          className={`relative w-[700px] max-h-[780px] px-[50px] py-[30px] bg-white dark:bg-hitam2 rounded-[16px] transform transition-transform duration-300 ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-10 scale-95'
            }`}
        >
          <div className="flex justify-between items-center">
            <div></div>
            <h1 className="text-[24px] font-ruda text-hitam2 dark:text-putih1">Postingan Baru</h1>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="mt-[15px] relative">
              <textarea
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tulis judul diskusi yang menarik ya!"
                className="w-full h-[60px] p-[10px] border border-gray-300 dark:border-hitam4 rounded-[6px] font-ruda text-[14px] outline-none resize-none bg-putih1 dark:bg-hitam3 dark:text-abu text-black pr-[40px]"
              />
              <button
                type="button"
                className="absolute top-[10px] right-[10px] text-hitam1 dark:text-abu"
                onClick={() => setShowTitleEmojiPicker((prev) => !prev)}
              >
                <Emote2 className="fill-gray-500 dark:fill-abu" />
              </button>
              {showTitleEmojiPicker && (
                <div className="absolute top-[10px] right-[-350px] z-50">
                  <EmojiPicker onEmojiClick={(data) => handleEmojiClick(data, 'title')} />
                </div>
              )}
            </div>

            <div className="mt-[10px] relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsiin topiknya disini"
                className="w-full h-[100px] p-[10px] border border-gray-300 dark:border-hitam4 rounded-[6px] font-ruda text-[14px] outline-none resize-none bg-putih1 dark:bg-hitam3 dark:text-abu text-black pr-[40px]"
              />
              <button
                type="button"
                className="absolute top-[10px] right-[10px] text-hitam1 dark:text-abu"
                onClick={() => setShowDescEmojiPicker((prev) => !prev)}
              >
                <Emote2 className="fill-gray-500 dark:fill-abu" />
              </button>
              {showDescEmojiPicker && (
                <div className="absolute top-[10px] right-[-350px] z-50">
                  <EmojiPicker onEmojiClick={(data) => handleEmojiClick(data, 'description')} />
                </div>
              )}
            </div>

            <div className="mt-[10px]">
              <div className="flex items-center">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tambahin hastag disini(tidak perlu pake #)"
                  className="w-[510px] h-[40px] border border-gray-300 dark:border-hitam4 rounded-[6px] text-[14px] font-ruda ps-[10px] outline-none bg-putih1 dark:bg-hitam3 dark:text-abu text-black"
                />
                <button
                  type="button"
                  onClick={handleConfirmTag}
                  className="w-[80px] h-[40px] bg-ungu rounded-md text-white font-ruda text-[14px] ms-[10px]"
                >
                  Tambah
                </button>
              </div>

              {suggestions.length > 0 && (
                <ul className="bg-gray-200 p-2 rounded-md mt-1 w-[200px] max-h-[120px] overflow-y-auto absolute z-20">
                  {suggestions.map((tag) => (
                    <li
                      key={tag.id}
                      onClick={() => {
                        if (!selectedTags.some((selected) => selected.id === tag.id)) {
                          setSelectedTags([...selectedTags, tag]);
                          setQuery('');
                          setSuggestions([]);
                        }
                      }}
                      className="hover:underline cursor-pointer text-black"
                    >
                      {tag.name}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-2 flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag.id}
                    onClick={() => handleRemoveTag(tag.id)}
                    className="cursor-pointer bg-gray-300 rounded-md px-2 py-1 text-black"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-[10px]">
              <div className="relative w-full">
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="absolute w-full h-[40px] opacity-0 cursor-pointer rounded-[10px]"
                />
                <div className="w-full h-[40px] border border-gray-300 dark:border-hitam4 rounded-[6px] text-[14px] font-ruda px-[8px] flex items-center gap-2 bg-putih1 dark:bg-hitam3 dark:text-abu text-black">
                  <Image className="fill-black dark:fill-white" />
                  <span>
                    {fileNames.length > 0 ? `${fileNames.length} foto dipilih` : 'Unggah gambar terkait (opsional, maks 5)...'}
                  </span>
                </div>
              </div>
              {photos.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Preview ${index}`}
                        className="w-[100px] h-[100px] object-cover rounded-[10px]"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 text-white bg-red-500 rounded-full w-[20px] h-[20px] flex items-center justify-center"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full mt-4 flex items-center justify-end">
              <button type="button" onClick={handleClose} className="text-hitam1 dark:text-abu me-4 hover:underline">
                Kembali
              </button>
              <button
                type="submit"
                className="w-[150px] h-[40px] rounded-full bg-ungu flex items-center justify-center text-white"
                disabled={loading}
              >
                {loading ? (
                  'Tunggu bentar...'
                ) : (
                  <div className="flex items-center gap-2">
                    <p>Posting</p>
                    <img src="/icons/paperplane.svg" alt="" />
                  </div>
                )}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </form>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-hitam2 rounded-[16px] p-6 w-[400px] transform transition-transform duration-300 scale-100">
            <h2 className="text-[20px] font-ruda font-bold text-hitam2 dark:text-putih1 mb-4">
              Data Belum Disimpan
            </h2>
            <p className="text-[14px] font-ruda text-hitam2 dark:text-abu mb-6">
              Ada perubahan di form yang belum disimpan. Apa yang ingin kamu lakukan?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleDiscard}
                className="px-4 py-2 bg-red-500 text-white font-ruda rounded-full hover:bg-red-600 transition-all"
              >
                Hapus
              </button>
              <button
                onClick={handleContinue}
                className="px-4 py-2 bg-ungu text-white font-ruda rounded-full hover:bg-ungu-dark transition-all"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostingModal;