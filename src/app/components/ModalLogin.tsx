'use client'

import { useRouter } from "next/navigation";
import React, { ReactNode, useState, useEffect } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ModalLogin: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [renderModal, setRenderModal] = useState(false);
    const router = useRouter();

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
        <div className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}>
            <div className={`relative w-full max-w-lg p-6 bg-white dark:bg-hitam2 rounded-lg transform transition-transform duration-300 ${isVisible ? "translate-y-0 scale-100" : "translate-y-10 scale-95"}`}>
                <div className="flex justify-between items-center">
                    <div></div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <div className="w-full text-hitam1 dark:text-abu font-ruda">
                    <p className="text-center text-[18px]">Untuk Mengakses Fitur Tersebut Anda harus Login!</p>
                    <div className="w-full gap-2 flex justify-end items-center mt-5">
                        <button
                            className="hover:underline text-[15px]"
                            onClick={onClose} >
                            batal
                        </button>
                        <button
                            className="w-[100px] h-[35px] bg-ungu rounded-full me-[20px]"
                            onClick={() => router.push("/login")}>
                            Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalLogin;