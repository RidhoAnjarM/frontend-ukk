'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Alert from '../components/Alert';
import { Back } from '../components/svgs/page';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
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
            setAlertMessage('Username dan password harus diisi');
            setShowAlert(true);
            setLoading(false);
            setTimeout(() => setShowAlert(false), 2000);
            return;
        }

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
                username,
                password,
            });

            const { token, role, username: loggedUsername, status, suspensionEnd } = response.data;

            if (status === 'suspended') {
                const suspensionDate = suspensionEnd ? new Date(suspensionEnd).toLocaleString('id-ID') : 'Waktu tidak diketahui';
                setAlertType('error');
                setAlertMessage(`Akun Anda disuspend hingga ${suspensionDate}`);
                setShowAlert(true);
                setLoading(false);
                setTimeout(() => setShowAlert(false), 10000);
                return;
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ username: loggedUsername }));

            setAlertType('success');
            setAlertMessage('Login berhasil!');
            setShowAlert(true);

            setTimeout(() => {
                setShowAlert(false);
                if (role === 'user') {
                    router.push('/pages/user/Beranda');
                } else if (role === 'admin') {
                    router.push('/pages/admin/Home');
                }
            }, 1000);
        } catch (error: any) {
            let errorMessage = 'Terjadi kesalahan saat login';

            if (error.response) {
                if (error.response.status === 403) {
                    const suspendUntil = error.response.data?.suspend_until || 'waktu tidak diketahui';
                    errorMessage = `Akun anda disuspend hingga ${suspendUntil}`;
                    setAlertType('error');
                    setAlertMessage(errorMessage);
                    setShowAlert(true);
                    setTimeout(() => setShowAlert(false), 10000);
                } else {
                    switch (error.response.status) {
                        case 401:
                            errorMessage = 'Username atau password salah';
                            break;
                        case 404:
                            errorMessage = 'Username tidak ditemukan';
                            break;
                        case 500:
                            errorMessage = 'Terjadi kesalahan pada server';
                            break;
                        default:
                            errorMessage = error.response.data?.error || errorMessage;
                    }
                    setAlertType('error');
                    setAlertMessage(errorMessage);
                    setShowAlert(true);
                    setTimeout(() => setShowAlert(false), 2000);
                }
            } else if (error.message) {
                errorMessage = error.message;
                setAlertType('error');
                setAlertMessage(errorMessage);
                setShowAlert(true);
                setTimeout(() => setShowAlert(false), 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-putih1 to-gray-100 flex items-center justify-center p-4">
            {showAlert && <Alert type={alertType} message={alertMessage} onClose={() => setShowAlert(false)} />}
            <button
                onClick={() => router.push("/")}
                className='absolute top-0 left-0 text-ungu flex items-center text-[20px] font-ruda font-semibold gap-2 mt-4 ml-4 rounded-[10px] px-4 py-2 bg-white shadow-md hover:bg-gray-200 transition-all duration-300'
            >
                <Back className=""/>
            </button>
            <div className="flex w-full max-w-[800px] min-h-[500px] bg-white rounded-[20px] shadow-xl overflow-hidden">
                {/* Bagian Kiri: Form Login */}
                <div className="w-1/2 p-8 flex flex-col items-center">
                    <h1 className="text-[24px] mt-4 font-ruda font-bold text-hitam2 mb-6 animate-fade-in">
                        Masuk ke ForuMedia
                    </h1>
                    <form onSubmit={handleSubmit} className="mt-16">
                        <div>
                            <input
                                id="username"
                                onChange={(e) => setUsername(e.target.value)}
                                type="text"
                                autoComplete="off"
                                placeholder='username'
                                className="w-[300px] h-[40px] bg-putih2 rounded-[10px] placeholder-gray-600 outline-none px-[20px] text-hitam1 focus:ring-2 focus:ring-ungu transition-all duration-200"
                                required
                            />
                        </div>
                        <div className='mt-4'>
                            <input
                                id="password"
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                placeholder='password'
                                className="w-[300px] h-[40px] bg-putih2 rounded-[10px] placeholder-gray-600 outline-none px-[20px] text-hitam1 focus:ring-2 focus:ring-ungu transition-all duration-200"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-[300px] h-[40px] bg-ungu text-white rounded-[10px] font-ruda text-[20px] font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center mt-8"
                        >
                            {loading ? (
                                <div className="flex flex-row gap-2">
                                    <div className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:.7s]"></div>
                                    <div className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:.3s]"></div>
                                    <div className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:.7s]"></div>
                                </div>
                            ) : (
                                'Masuk'
                            )}
                        </button>
                    </form>
                    <p className="text-center mt-20 text-[14px] font-ruda text-hitam2">
                        Belum punya akun?{' '}
                        <a href="/register" className="text-ungu hover:underline font-semibold">
                            Daftar Sekarang
                        </a>
                    </p>
                </div>

                {/* Bagian Kanan: Ilustrasi */}
                <div className="w-1/2 h-[500px] flex items-center justify-center overflow-hidden">
                    <img
                        src="../images/Poster.svg"
                        alt="Ilustrasi Login"
                        className="w-full object-cover"
                    />
                </div>
            </div>
        </div>
    );
};

export default Login;