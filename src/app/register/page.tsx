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

    return (
        <div className="w-full min-h-screen bg-white dark:bg-hitam1 flex justify-center pt-[10px] ">
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
                            className='text-[20px] font-bold font-ruda mb-[10px] dark:text-white'
                        >
                            Nama
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className='border w-full h-[50px] bg-putih1 dark:bg-hitam2 rounded-[10px] border-[0.5] border-hitam2 outline-none dark:text-abu px-[30px]'
                        />
                    </div>
                    <div className="mt-[10px]">
                        <label
                            className='text-[20px] font-bold font-ruda mb-[10px] dark:text-white'
                        >
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className='border w-full h-[50px] bg-putih1 dark:bg-hitam2 rounded-[10px] border-[0.5] border-hitam2 outline-none dark:text-abu px-[30px]'
                        />
                    </div>
                    <div className="mt-[10px]">
                        <label
                            className='text-[20px] font-bold font-ruda mb-[10px] dark:text-white'
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className='border w-full h-[50px] bg-putih1 dark:bg-hitam2 rounded-[10px] border-[0.5] border-hitam2 outline-none dark:text-abu px-[30px]'
                        />
                    </div>
                    <button type="submit" className='w-full h-[50px] bg-ungu text-white rounded-[10px] mt-[30px] font-ruda text-[30px] hover:shadow-lg transition-colors flex justify-center items-center'>
                        {loading ? (
                            <div className="flex flex-row gap-2">
                                <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce [animation-delay:.7s]"></div>
                                <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce [animation-delay:.3s]"></div>
                                <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce [animation-delay:.7s]"></div>
                            </div>
                        ) : (
                            "Register"
                        )}
                    </button>
                </form>
                <p className='text-center mt-3 dark:text-white'>Sudah punya akun? <a href="/login" className='text-blue-900'>Login Sekarang</a></p>
            </div>
        </div>
    );
};

export default Register;
