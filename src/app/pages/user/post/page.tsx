'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Alert from '@/app/components/Alert';
import Sidebar from '@/app/components/Sidebar';
import { Tag } from '@/app/types/types';

const Posting = () => {
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

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/category/`);
                setCategories(response.data);
            } catch (error) {
                console.error('Failed to fetch categories', error);
            }
        };

        fetchCategories();
    }, []);

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

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        if (selectedCategory) formData.append('category_id', selectedCategory);
        if (photo) formData.append('photo', photo);
        selectedTags.forEach(tag => formData.append('tags', tag.name));

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/forum/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            setAlertType('success');
            setAlertMessage('Forum berhasil dibuat.');
            setShowAlert(true);

            setTimeout(() => {
                router.push('/pages/user/Home');
            }, 1500);
        } catch (error: any) {
            let errorMessage = 'gagal membuat forum';
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        errorMessage = 'gagal upload.';
                        break;
                    case 500:
                        errorMessage = 'Server error.';
                        break;
                    default:
                        errorMessage = error.response.data.message || 'Unexpected error occurred.';
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            setAlertType('error');
            setAlertMessage(errorMessage);
            setShowAlert(true);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e?: React.ChangeEvent<HTMLInputElement>) => {
        if (!e || !e.target.files || !e.target.files[0]) {
            setPhoto(null);
            setFileName('');
            setError(null);
            return;
        }

        const file = e.target.files[0];
        const fileType = file.type;
        if (!fileType.startsWith('image/')) {
            setError('Please upload a valid image file.');
            return;
        }
        setPhoto(file);
        setFileName(file.name);
        setError(null);
    };

    const clearFileInput = () => {
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
        handleFileChange();
    };

    const fetchSuggestions = async (q: string) => {
        if (q.trim() === "") {
            setSuggestions([]);
            return;
        }
        try {
            const response = await axios.get("http://localhost:5000/api/tags/", {
                params: { q },
            });
            setSuggestions(response.data ?? []);
        } catch (error) {
            console.error("Fetch error:", error);
            setSuggestions([]);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchSuggestions(query);
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleConfirmTag = async () => {
        const existingTag = suggestions.find(tag => tag.name === query);
        const alreadySelected = selectedTags.some(tag => tag.name === query);
        if (alreadySelected) {
            alert("Tag sudah dipilih");
            return;
        }
        if (existingTag) {
            setSelectedTags(prevTags => [...prevTags, existingTag]);
            setQuery("");
            setSuggestions([]);
        } else {
            try {
                const response = await axios.post("http://localhost:5000/api/tags/", { name: query });
                if (response.status === 201) {
                    const newTag = response.data.tag;
                    setSelectedTags(prevTags => [...prevTags, newTag]);
                    setSuggestions(prev => [...prev, newTag]);
                    setQuery("");
                } else {
                    alert("Gagal membuat tag");
                }
            } catch (error) {
                console.error("Create tag error:", error);
                alert("Terjadi kesalahan saat membuat tag");
            }
        }
    };

    const handleRemoveTag = (id: number) => {
        setSelectedTags(prevTags => prevTags.filter(tag => tag.id !== id));
    };

    return (
        <div>
            <Sidebar />
            <div className="ps-[270px] pt-[60px]">
                <div className="fixed top-0 w-full ms-[85px] z-10 transition-transform duration-300">
                    <div className="bg-white backdrop-blur-md bg-opacity-20 w-[700px] h-[60px] border border-t-0 flex items-center px-[30px]">
                        <h1 className="text-[20px] text-primary font-ruda font-black">
                            Postingan Baru
                        </h1>
                    </div>
                </div>
                <div className="w-[700px] h-[calc(100vh)] border border-gray-300 border-t-0 ms-[85px] p-5">
                    <form onSubmit={handleSubmit}>
                        {showAlert && (
                            <Alert
                                type={alertType}
                                message={alertMessage}
                                onClose={() => setShowAlert(false)}
                            />
                        )}
                        <div className="w-full h-[200px] border rounded-md border-gray-300 p-[10px]">
                            <div className="flex">
                                <select
                                    id="category"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-[180px] h-[40px] border border-gray-300 rounded-[10px] text-[14px] font-ruda ps-[10px] me-[10px] outline-none"
                                >
                                    <option value="">pilih kategori</option>
                                    {categories.map((category: any) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="relative ">
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute w-[150px] h-[40px] opacity-0 cursor-pointer rounded-[10px]"
                                    />
                                    <div className="h-[40px] border border-gray-300 rounded-[10px] text-[14px] font-ruda px-[8px] flex items-center justify-between">
                                        <img src="../../icons/image.svg" alt="" />
                                        <span className="text-black text-[14px] ms-2">
                                            {fileName || 'tambah gambar'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-[10px] px-[10px]">
                                <textarea
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Apa yang akan dibahas?"
                                    className="w-full h-[90px] mb-2 font-ruda text-[14px] outline-none overflow-hidden resize-none"
                                />
                            </div>
                            <div className="mt-[10px] px-[10px]">
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Apa yang akan dibahas?"
                                    className="w-full h-[90px] mb-2 font-ruda text-[14px] outline-none overflow-hidden resize-none"
                                />
                            </div>
                            <div className="-mt-5 ms-[10px] ">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Tambah hastag"
                                    className="w-[450px] relative z-0 outline-none h-[40px] font-ruda text-[14px] "
                                />

                                {query.trim() && (
                                    <button
                                        type="button"
                                        onClick={handleConfirmTag}
                                        className="w-[70px] h-[35px] bg-primary rounded-md text-white font-ruda text-[14px]"
                                    >
                                        tambah
                                    </button>
                                )}
                            </div>
                            <div className="absolute">
                                {suggestions.length > 0 && (
                                    <ul className='bg-gray-200 p-2 rounded-md'>
                                        {suggestions.map(tag => (
                                            <li key={tag.id} onClick={() => {
                                                if (!selectedTags.some(selected => selected.id === tag.id)) {
                                                    setSelectedTags([...selectedTags, tag]);
                                                    setQuery("");
                                                    setSuggestions([]);
                                                }
                                            }}
                                            className="hover:underline cursor-pointer">
                                            {tag.name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="w-full flex justify-end -mt-[37px] z-10">
                                <button
                                    type="submit"
                                    className="w-[100px] h-[35px] rounded-full bg-primary flex items-center justify-center right-0"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div>
                                            <p className='text-white'>wait</p>
                                        </div>
                                    ) : (
                                        <div className='flex items-center justify-center text-white gap-2'>
                                            <p>Posting</p>
                                            <img src="../../icons/paperplane.svg" alt="" />
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className='mt-3 w-full flex flex-wrap'>
                            {selectedTags.map(tag => (
                                <span key={tag.id} onClick={() => handleRemoveTag(tag.id)} className='cursor-pointer bg-gray-300 rounded-md px-2 py-1 me-1 mb-1'>
                                    #{tag.name}
                                </span>
                            ))}
                        </div>

                        <div>
                            {photo && (
                                <div className="mt-[10px] relative">
                                    <img
                                        src={URL.createObjectURL(photo)}
                                        alt="Preview"
                                        className="w-full object-cover rounded-[10px]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPhoto(null);
                                            setFileName('');
                                            setError(null);
                                        }}
                                        className="top-2 right-2 absolute text-white bg-red-500 rounded-full w-[25px] h-[25px]"
                                    >
                                        x
                                    </button>
                                </div>
                            )}
                        </div>

                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                    </form>
                </div>
            </div>
        </div>
    );
};

export default Posting;
