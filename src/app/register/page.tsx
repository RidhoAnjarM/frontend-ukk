'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Alert from '../components/Alert';

const Register = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [profile, setProfile] = useState<File | null>(null);
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

        if (!username || !password) {
            setAlertType('warning');
            setAlertMessage('Username dan password wajib diisi');
            setShowAlert(true);
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('username', username);
        formData.append('password', password);
        if (profile) {
            formData.append('profile', profile);
        }

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/register`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setAlertType('success');
            setAlertMessage('Registrasi berhasil! Silakan login.');
            setShowAlert(true);

            setTimeout(() => {
                router.push('/login');
            }, 1000);
        } catch (error: any) {
            let errorMessage = 'Terjadi kesalahan saat registrasi';

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
            setProfile(null);
            setError(null);
            return;
        }

        const file = e.target.files[0];
        const fileType = file.type;
        if (!fileType.startsWith('image/')) {
            setError('Please upload an image file.');
            return;
        }
        setProfile(file);
    };

    const clearFileInput = () => {
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
        handleFileChange();
    };

    return (
        <div className="w-full flex justify-center mt-[10px]">
            <div>
                <img src="../images/ilustration.svg" alt="" className='' />
                <form onSubmit={handleSubmit} className='w-[500px]'>
                    {showAlert && (
                        <Alert
                            type={alertType}
                            message={alertMessage}
                            onClose={() => setShowAlert(false)}
                        />
                    )}
                    <div>
                        <label
                            className='text-[20px] font-bold font-ruda mb-[10px]'
                        >
                            Nama
                        </label>
                        <input
                            type="text"
                            placeholder="Nama"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className='border w-full h-[50px] bg-white rounded-[10px] border-[0.5] outline-none px-[30px]'
                        />
                    </div>
                    <div className="mt-[10px]">
                        <label
                            className='text-[20px] font-bold font-ruda mb-[10px]'
                        >
                            Username
                        </label>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className='border w-full h-[50px] bg-white rounded-[10px] border-[0.5] outline-none px-[30px]'
                        />
                    </div>
                    <div className="mt-[10px]">
                        <label
                            className='text-[20px] font-bold font-ruda mb-[10px]'
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className='border w-full h-[50px] bg-white rounded-[10px] border-[0.5] outline-none px-[30px]'
                        />
                    </div>
                    <button type="submit" className='w-full h-[50px] bg-primary text-white rounded-[10px] mt-[30px] font-ruda text-[30px] hover:bg-black transition-colors flex justify-center items-center'>
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
                <p className='text-center mt-3'>Sudah punya akun? <a href="/login" className='text-blue-900'>Login Sekarang</a></p>
            </div>
        </div>
    );
};

export default Register;
