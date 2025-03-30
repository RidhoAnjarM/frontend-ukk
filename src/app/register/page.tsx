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
                        errorMessage = 'Username sudah digunakan';
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
        <div className="w-full min-h-screen bg-gradient-to-br from-putih1 to-gray-100 flex justify-center items-center">
            <div>
                {showAlert && (
                    <Alert
                        type={alertType}
                        message={alertMessage}
                        onClose={() => setShowAlert(false)}
                    />
                )}
                <form onSubmit={handleSubmit} className='w-[400px] bg-white rounded-[20px] shadow-xl overflow-hidden flex flex-col items-center p-8'>
                    <h1 className="text-[24px] mt-4 font-ruda font-bold text-hitam2 mb-20 animate-fade-in">
                        Daftar ke ForuMedia
                    </h1>
                    <div>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder='Nama Lengkap'
                            className='w-[300px] h-[40px] bg-putih2 rounded-[10px] placeholder-gray-600 outline-none px-[20px] text-hitam1 focus:ring-2 focus:ring-ungu transition-all duration-200'
                        />
                    </div>
                    <div className="mt-4">
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder='Username'
                            className='w-[300px] h-[40px] bg-putih2 rounded-[10px] placeholder-gray-600 outline-none px-[20px] text-hitam1 focus:ring-2 focus:ring-ungu transition-all duration-200'
                        />
                    </div>
                    <div className="mt-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder='Password'
                            className='w-[300px] h-[40px] bg-putih2 rounded-[10px] placeholder-gray-600 outline-none px-[20px] text-hitam1 focus:ring-2 focus:ring-ungu transition-all duration-200'
                        />
                    </div>
                    <button type="submit" className='w-[300px] h-[40px] bg-ungu text-white rounded-[10px] font-ruda text-[20px] font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center mt-8'>
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
                    <p className="text-center mt-20 text-[14px] font-ruda text-hitam2">
                        Sudah punya akun?{' '}
                        <a href="/login" className="text-ungu hover:underline font-semibold">
                            Login Sekarang
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
