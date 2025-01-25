'use client';

import React from 'react'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Alert from '@/app/components/Alert';

const Posting = () => {
    const [title, setTitle] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('error');
    const [alertMessage, setAlertMessage] = useState('');
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!title || !photo) {
            setAlertType('warning');
            setAlertMessage('Title harus diisi!');
            setShowAlert(true);
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('title', title);

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/forum`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setAlertType('success');
            setAlertMessage('Forum created success.');
            setShowAlert(true);

            setTimeout(() => {
                router.push('/login');
            }, 1500);
        } catch (error: any) {
            let errorMessage = 'gagal buat forum';

            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        errorMessage = 'Data tidak valid atau sudah digunakan';
                        break;
                    case 500:
                        errorMessage = 'Terjadi kesalahan pada server';
                        break;
                }
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
            setError(null);
            return;
        }

        const file = e.target.files[0];
        const fileType = file.type;
        if (!fileType.startsWith('image/')) {
            setError('Please upload an image file.');
            return;
        }
        setPhoto(file);
    };

    const clearFileInput = () => {
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
        handleFileChange();
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className='w-[500px]'>
                {showAlert && (
                    <Alert
                        type={alertType}
                        message={alertMessage}
                        onClose={() => setShowAlert(false)}
                    />
                )}
                <div className="">
                    <label
                        className='text-[20px] font-bold font-ruda mb-[10px]'
                    >
                        Title
                    </label>
                    <input
                        type="text"
                        placeholder="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className='border w-full h-[50px] bg-white rounded-[10px] border-[0.5] outline-none px-[30px]'
                    />
                </div>

                <div>
                    <div className="relative mt-[20px]">
                        <label
                            className='text-[20px] font-bold font-ruda mb-[10px]'
                        >
                            Profile Photo
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                handleFileChange(e);
                                setPhoto(e.target.files ? e.target.files[0] : null);
                            }}
                            className="absolute w-full h-full opacity-0 cursor-pointer rounded-[5px]"
                        />
                        <div className="flex items-center justify-between w-full h-[50px] px-4 border rounded-[10px] bg-white hover:bg-gray-100 transition duration-200 cursor-pointer">
                            <span className="text-black text-sm">
                                {fileName || 'Pilih file gambar'}
                            </span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="w-5 h-5 text-gray-500"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 16.5V3m0 0L8.25 6.75M12 3l3.75 3.75M8.25 20.25h7.5"
                                />
                            </svg>
                        </div>
                    </div>
                    {fileName && (
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setFileName('');
                                    clearFileInput();
                                }}
                                className="text-red-600 text-sm font-medium hover:underline"
                            >
                                Batalkan
                            </button>
                        </div>
                    )}
                </div>
                <button type="submit" className='w-full h-[50px] bg-primary text-white rounded-[10px] mt-[40px] font-ruda text-[30px] hover:bg-black transition-colors flex justify-center items-center'>
                    {loading ? (
                        <div className="flex flex-row gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:.7s]"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:.3s]"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:.7s]"></div>
                        </div>
                    ) : (
                        "Register"
                    )}
                </button>
            </form>
        </div>
    )
}

export default Posting