'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Alert from '@/app/components/Alert';
import Navbar from '@/app/components/Navbar';

const Posting = () => {
    const [title, setTitle] = useState('');
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
        if (selectedCategory) formData.append('category_id', selectedCategory);
        if (photo) formData.append('photo', photo);

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

    return (
        <div className="">
            <Navbar />
            <div className="w-[500px] mx-auto p-5 bg-white rounded-lg shadow-lg">
                <form onSubmit={handleSubmit}>
                    {showAlert && (
                        <Alert
                            type={alertType}
                            message={alertMessage}
                            onClose={() => setShowAlert(false)}
                        />
                    )}

                    <div className="mb-6">
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Apa yang akan dibahas?"
                            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>

                    <div className="mb-6">
                        <select
                            id="category"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        >
                            <option value="">kategori</option>
                            {categories.map((category: any) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="relative mb-6">
                        <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute w-full h-full opacity-0 cursor-pointer rounded-[5px]"
                        />
                        <div className="flex items-center justify-between w-full h-[50px] px-4 border rounded-[10px] bg-white hover:bg-gray-100 transition duration-200 cursor-pointer">
                            <span className="text-black text-sm">
                                {fileName || 'tambah gambar'}
                            </span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M7 16l-4-4m0 0l4-4m-4 4h18"
                                />
                            </svg>
                        </div>
                    </div>

                    {photo && (
                        <div className="relative mb-6">
                            <img
                                src={URL.createObjectURL(photo)}
                                alt="Preview"
                                className="w-full h-[200px] object-cover rounded-[10px]"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setPhoto(null);
                                    setFileName('');
                                    setError(null);
                                }}
                                className="absolute top-2 right-2 text-white bg-red-500 rounded-full p-1"
                            >
                                X
                            </button>
                        </div>
                    )}

                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                    <button
                        type="submit"
                        className="w-full py-3 mt-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none transition"
                        disabled={loading}
                    >
                        {loading ? 'tunggu sebentar...' : 'kirim'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Posting;
