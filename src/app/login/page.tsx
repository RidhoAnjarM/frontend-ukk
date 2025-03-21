'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Alert from '../components/Alert';
import ThemeToggle from '../components/ThemeTogle';

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
            setTimeout(() => {
                setShowAlert(false);
            }, 2000);
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
                setTimeout(() => {
                    setShowAlert(false);
                }, 10000); // Sudah 10 detik untuk kasus suspend dari response
                return;
            }
    
            // Jika statusnya 'active', lanjutkan login
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
                    const suspendUntil = error.response.data?.suspend_until || "waktu tidak diketahui";
                    errorMessage = `Akun anda disuspend hingga ${suspendUntil}`;
                    setAlertType('error');
                    setAlertMessage(errorMessage);
                    setShowAlert(true);
                    setTimeout(() => {
                        setShowAlert(false);
                    }, 10000); // Tambahkan 10 detik untuk kasus suspend dari error 403
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
                    setTimeout(() => {
                        setShowAlert(false);
                    }, 2000);
                }
            } else if (error.message) {
                errorMessage = error.message;
                setAlertType('error');
                setAlertMessage(errorMessage);
                setShowAlert(true);
                setTimeout(() => {
                    setShowAlert(false);
                }, 2000);
            }
    
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='h-screen bg-white dark:bg-hitam1 dark:text-gray-200 transition-colors ' >
            {showAlert && (
                <Alert
                    type={alertType}
                    message={alertMessage}
                    onClose={() => setShowAlert(false)}
                />
            )}
            <div className="w-full flex justify-center" >
                <div>
                    <img src="../images/ilustration.svg" alt="" className='relative mt-[60px]' />
                    <form onSubmit={handleSubmit} className='w-[500px]' >
                        <div>
                            <label htmlFor="username" className='text-[20px] font-ruda font-bold mb-[10px]' >
                                Username
                            </label>
                            < input
                                id='username'
                                onChange={(e) => setUsername(e.target.value)}
                                type="text"
                                autoComplete='off'
                                className='border w-full h-[50px] bg-putih1 dark:bg-hitam2 rounded-[10px] border-[0.5] border-hitam2 outline-none px-[30px]'
                                required
                            />
                        </div>
                        <div className="mt-[20px]" >
                            <label htmlFor="password" className='text-[20px] font-ruda font-bold mb-[10px]' >
                                Password
                            </label>
                            < input
                                id='password'
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                className='border w-full h-[50px] bg-putih1 dark:bg-hitam2 rounded-[10px] border-[0.5] border-hitam2 outline-none px-[30px]'
                                required
                            />
                        </div>
                        <button type="submit" className='w-full h-[50px] bg-ungu text-white rounded-[10px] mt-[50px] font-ruda text-[30px] hover:shadow-lg transition-colors flex justify-center items-center' >
                            {
                                loading ? (
                                    <div className="flex flex-row gap-2" >
                                        <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce [animation-delay:.7s]"> </div>
                                        < div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce [animation-delay:.3s]" > </div>
                                        < div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce [animation-delay:.7s]" > </div>
                                    </div>
                                ) : (
                                    "Login"
                                )}
                        </button>
                    </form>
                    < p className='text-center mt-3' >
                        Belum punya akun ? <a href="/register" className='text-blue-900' > Daftar Sekarang </a>
                    </p>
                </div>
            </div>

        </div>
    );
};

export default Login;
