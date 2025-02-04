'use client';

import Alert from '@/app/components/Alert';
import Modal from '@/app/components/Modal';
import Navbar from '@/app/components/Navbar';
import { ForumPost } from '@/app/types/types';
import React, { useEffect, useState } from 'react';

const Profile = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [forumToDelete, setForumToDelete] = useState<number | null>(null);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
    });
    const [profileImage, setProfileImage] = useState<File | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profil/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch profile');
                }

                const data = await response.json();
                setProfile(data.profile);
                setFormData({
                    name: data.profile.name,
                    username: data.profile.username,
                    password: '',
                });
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleUpdateProfile = async () => {
        setShowEditModal(false);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('username', formData.username);
            if (formData.password) {
                formDataToSend.append('password', formData.password);
            }
            if (profileImage) {
                formDataToSend.append('profile', profileImage);
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${profile.id}`, {
                method: 'PUT',
                body: formDataToSend,
            });

            if (!response.ok) {
                throw new Error('Profil gagal diupdate');
            }

            const data = await response.json();
            setProfile({ ...profile, name: data.name, username: data.username, profile: data.profile });
            setEditMode(false);
            setShowEdit(false);
            setAlertMessage('Profil berhasil diupdate');

            setTimeout(() => {
                setAlertMessage('');
            }, 1500);
        } catch (err) {
            setAlertMessage(err instanceof Error ? err.message : 'An unknown error occurred');

            setTimeout(() => {
                setAlertMessage('');
            }, 1500);
        }
    };

    const handleDeleteForum = async () => {
        setShowDeleteModal(false);
        if (!forumToDelete) return;
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/forum/${forumToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Gagal menghapus postingan');
            }

            setProfile((prev: any) => ({
                ...prev,
                forums: prev.forums.filter((forum: any) => forum.id !== forumToDelete),
            }));
            setAlertMessage('Postingan berhasil dihapus');

            setTimeout(() => {
                setAlertMessage('');
            }, 1500);
        } catch (err) {
            setAlertMessage(err instanceof Error ? err.message : 'An unknown error occurred');

            setTimeout(() => {
                setAlertMessage('');
            }, 1500);
        }
    };


    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!profile) return <div>No profile data found</div>;

    return (
        <div>
            <Navbar />
            <div className='ps-[270px] pt-[59px]'>
                {alertMessage && <Alert type="success" message={alertMessage} onClose={() => setAlertMessage(null)} />}
                <div className="w-[350px] h-[400px] rounded-[10px] fixed top-0 right-0 me-[60px] mt-[30px] p-[15px] bg-white border border-gray-300 ">
                    <div className="w-full flex justify-end">
                        <button
                            onClick={() => setShowEdit(true)}
                            className="w-[80px] h-[30px] bg-primary text-white rounded-[10px] text-[12px] flex items-center justify-center font-ruda"
                        >
                            Edit Profile
                        </button>
                    </div>
                    <div className='w-full grid justify-center text-center'>
                        <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}${profile.profile}`}
                            alt="Profile"
                            className="w-[140px] h-[140px] rounded-full flex items-center justify-center overflow-hidden"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                            }}
                        />
                        <p className="text-[24px] font-ruda font-bold my-[15px]">{profile.name}</p>
                        <p className="text-[15px] font-ruda font-bold text-gray-400">@{profile.username}</p>
                    </div>
                    <p className='mt-[50px] ms-[50px] text-[15px] font-ruda'>Postingan: {profile.forums ? profile.forums.length : 0}</p>
                </div>
                <div
                    className={`fixed top-0 w-full ms-[85px] z-10 transition-transform duration-300`}
                >
                    <div className="bg-white backdrop-blur-md bg-opacity-20 w-[700px] h-[60px] border border-t-0 flex items-center px-[30px]">
                        <h1 className="text-[20px] text-primary font-ruda font-black">
                            Postingan Anda
                        </h1>
                    </div>
                </div>
                <div className="">
                    {profile.forums && profile.forums.length > 0 ? (
                        profile.forums.map((forum: ForumPost) => (
                            <div key={forum.id} className="w-[700px] p-[30px] bg-white border border-gray-300 border-t-0 ms-[85px]">
                                <div className="">
                                    <div className="flex">
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_API_URL}${forum.profile}`}
                                            alt={forum.title}
                                            className="w-[40px] h-[40px] mt-[10px] rounded-full bg-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://i.pinimg.com/236x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg';
                                            }}
                                        />
                                        <div className="ms-[10px] py-[1px]">
                                            <p className="text-[16px] font-ruda font-bold">{forum.username}</p>
                                            <p className="text-[10px] font-ruda font-bold">{forum.title}</p>
                                        </div>
                                    </div>
                                </div>


                                <button onClick={() => { setForumToDelete(forum.id); setShowDeleteModal(true); }}
                                    className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md">
                                    Delete
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">No forums created yet.</p>
                    )}
                </div>

                <Modal isOpen={showEdit} onClose={() => setShowEdit(false)}>
                    <div className="p-4">
                        <h2 className="text-[20px] font-bold">Edit Profile</h2>
                        <div className="mt-[10px]">
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                            />
                        </div>
                        <div className="mt-[10px]">
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                            />
                        </div>
                        <div className="mt-[10px]">
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                            />
                        </div>
                        <div className="mt-[10px]">
                            <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                            />
                        </div>
                        <div className="mt-[10px] flex gap-2">
                            <button
                                onClick={handleUpdateProfile}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setShowEdit(false)}
                                className="px-4 py-2 bg-gray-500 text-white rounded-md"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </Modal>

                <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
                    <div>
                        Are you sure you want to update your profile?
                        <button onClick={handleUpdateProfile} className="px-4 py-2 bg-blue-500 text-white rounded-md mt-2">Confirm</button>
                    </div>
                </Modal>

                <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                    <div>
                        Are you sure you want to delete this forum?
                        <button onClick={handleDeleteForum} className="px-4 py-2 bg-red-500 text-white rounded-md mt-2">Confirm</button>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default Profile;