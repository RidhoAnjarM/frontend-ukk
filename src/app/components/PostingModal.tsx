'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Alert from '@/app/components/Alert';
import { Tag } from '@/app/types/types';
import { useRouter } from 'next/navigation';
import { Image } from './svgs/page';

interface PostingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const PostingModal: React.FC<PostingModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('error');
  const [alertMessage, setAlertMessage] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [renderModal, setRenderModal] = useState(false);

  // Fetch categories
  useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        try {
          const response = await axios.get(`${API_URL}/api/category/`);
          setCategories(response.data);
        } catch (error) {
          console.error('Failed to fetch categories', error);
        }
      };
      fetchCategories();
    }
  }, [isOpen]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setAlertType('warning');
      setAlertMessage('Token is missing! Please login.');
      setShowAlert(true);
      setLoading(false);
      return;
    }

    if (!selectedCategory) {
      setAlertType('error');
      setAlertMessage('Kategori wajib diisi.');
      setShowAlert(true);
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category_id', selectedCategory);
    if (photo) formData.append('photo', photo);
    selectedTags.forEach(tag => formData.append('tags', tag.name));

    try {
      await axios.post(`${API_URL}/api/forum/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

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
          case 400: errorMessage = 'Gagal membuat forum, pastikan field diisi dengan benar.'; break;
          case 500: errorMessage = 'Server error.'; break;
          default: errorMessage = error.response.data.message || 'Unexpected error occurred.';
        }
      }
      setAlertType('error');
      setAlertMessage(errorMessage);
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  // File handling functions
  const handleFileChange = (e?: React.ChangeEvent<HTMLInputElement>) => {
    if (!e || !e.target.files || !e.target.files[0]) {
      setPhoto(null);
      setFileName('');
      setError(null);
      return;
    }
    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }
    setPhoto(file);
    setFileName(file.name);
    setError(null);
  };

  // Tag handling functions
  const fetchSuggestions = async (q: string) => {
    if (q.trim() === "") {
      setSuggestions([]);
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/api/tags/`, { params: { q } });
      setSuggestions(response.data ?? []);
    } catch (error) {
      console.error("Fetch error:", error);
      setSuggestions([]);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (isOpen) fetchSuggestions(query);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [query, isOpen]);

  const handleConfirmTag = async () => {
    // Batasi maksimal 10 tag
    if (selectedTags.length >= 10) {
      setAlertType('warning');
      setAlertMessage('Maksimal 10 tag diperbolehkan.');
      setShowAlert(true);
      return;
    }

    const existingTag = suggestions.find(tag => tag.name === query);
    const alreadySelected = selectedTags.some(tag => tag.name === query);
    if (alreadySelected) {
      setAlertType('warning');
      setAlertMessage('Tag sudah dipilih.');
      setShowAlert(true);
      return;
    }
    if (existingTag) {
      setSelectedTags(prev => [...prev, existingTag]);
      setQuery("");
      setSuggestions([]);
    } else {
      try {
        const response = await axios.post(`${API_URL}/api/tags/`, { name: query });
        if (response.status === 201) {
          const newTag = response.data.tag;
          setSelectedTags(prev => [...prev, newTag]);
          setQuery("");
        }
      } catch (error) {
        setAlertType('error');
        setAlertMessage('Terjadi kesalahan saat membuat tag.');
        setShowAlert(true);
      }
    }
  };

  const handleRemoveTag = (id: number) => {
    setSelectedTags(prev => prev.filter(tag => tag.id !== id));
  };

  useEffect(() => {
    if (isOpen) {
      setRenderModal(true);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      const timeout = setTimeout(() => setRenderModal(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!renderModal) return null;
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}>
      <div className={`relative w-[700px] max-h-[780px] px-[50px] py-[30px] overflow-y-auto bg-white dark:bg-hitam2 rounded-lg transform transition-transform duration-300 ${isVisible ? "translate-y-0 scale-100" : "translate-y-10 scale-95"}`}>
        <div className="flex justify-between items-center">
          <div></div>
          <h1 className="text-[24px] font-ruda text-hitam2 dark:text-putih1">Postingan Baru</h1>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {showAlert && (
            <Alert
              type={alertType}
              message={alertMessage}
              onClose={() => setShowAlert(false)}
            />
          )}

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full h-[40px] border border-gray-300 dark:border-hitam4 rounded-[6px] text-[14px] font-ruda ps-[10px] outline-none mt-[20px] bg-putih1 dark:bg-hitam3 dark:text-abu"
          >
            <option value="">Pilih kategori diskusi...</option>
            {categories.map((category: any) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>

          <div className='mt-[15px]'>
            {/* <label className='ms-[25px] text-[14px] font-ruda dark:text-putih1'>Judul</label> */}
            <textarea
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tulis judul diskusi..."
              className="w-full h-[60px] p-[10px] border border-gray-300 dark:border-hitam4 rounded-[6px] font-ruda text-[14px] outline-none resize-none bg-putih1 dark:bg-hitam3 dark:text-abu"
            />
          </div>

          <div className='mt-[10px] '>
            {/* <label className='ms-[25px] text-[14px] font-ruda dark:text-putih1'>Deskripsi</label> */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan lebih lanjut tentang topik ini..."
              className="w-full h-[100px] p-[10px] border border-gray-300 dark:border-hitam4 rounded-[6px] font-ruda text-[14px] outline-none resize-none bg-putih1 dark:bg-hitam3 dark:text-abu"
            />
          </div>

          <div className="mt-[10px]">
            {/* <label className='ms-[25px] text-[14px] font-ruda dark:text-putih1'>Hastag</label> */}
            <div className="flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ketik disini untuk menambahkan hashtag"
                className="w-[510px] h-[40px] border border-gray-300 dark:border-hitam4 rounded-[6px] text-[14px] font-ruda ps-[10px] outline-none bg-putih1 dark:bg-hitam3 dark:text-abu"
              />
              {/* {query.trim() && ( */}
              <button
                type="button"
                onClick={handleConfirmTag}
                className="w-[80px] h-[40px] bg-ungu rounded-md text-white font-ruda text-[14px] ms-[10px]"
              >
                Tambah
              </button>
              {/* )} */}
            </div>

            {suggestions.length > 0 && (
              <ul className="bg-gray-200 p-2 rounded-md mt-1 w-[200px] max-h-[120px] overflow-y-auto absolute z-20">
                {suggestions.map(tag => (
                  <li
                    key={tag.id}
                    onClick={() => {
                      if (!selectedTags.some(selected => selected.id === tag.id)) {
                        setSelectedTags([...selectedTags, tag]);
                        setQuery("");
                        setSuggestions([]);
                      }
                    }}
                    className="hover:underline cursor-pointer"
                  >
                    {tag.name}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-2 flex flex-wrap gap-2">
              {selectedTags.map(tag => (
                <span
                  key={tag.id}
                  onClick={() => handleRemoveTag(tag.id)}
                  className="cursor-pointer bg-gray-300 rounded-md px-2 py-1"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-[10px]">
            {/* <label className='ms-[25px] text-[14px] font-ruda dark:text-putih1'>Gambar(opsional)</label> */}
            <div className="relative w-full">
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute w-full h-[40px] opacity-0 cursor-pointer rounded-[10px]"
              />
              <div className="w-full h-[40px] border border-gray-300 dark:border-hitam4 rounded-[6px] text-[14px] font-ruda px-[8px] flex items-center gap-2 bg-putih1 dark:bg-hitam3 dark:text-abu">
                <Image className="fill-black dark:fill-white" />
                <span>{fileName || 'Unggah gambar terkait (opsional)...'}</span>
              </div>
            </div>
            {photo && (
              <div className="mt-3 relative">
                <img
                  src={URL.createObjectURL(photo)}
                  alt="Preview"
                  className="w-[400px] object-cover rounded-[10px]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhoto(null);
                    setFileName('');
                    setError(null);
                  }}
                  className="absolute top-2 right-2 text-white bg-red-500 rounded-full w-[25px] h-[25px] flex items-center justify-center"
                >
                  x
                </button>
              </div>
            )}
          </div>

          <div className='w-full mt-4 flex items-center justify-end'>
            <button onClick={onClose} className="text-hitam1 dark:text-abu me-4 hover:underline">kembali</button>
            <button
              type="submit"
              className="w-[150px] h-[40px] rounded-full bg-ungu flex items-center justify-center text-white"
              disabled={loading}
            >
              {loading ? 'tunggu bentar...' : (
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
  );
};

export default PostingModal;