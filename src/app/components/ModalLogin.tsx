'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

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

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`relative w-full max-w-md p-8 bg-gradient-to-br from-putih1 to-gray-100 dark:from-hitam2 dark:to-gray-800 rounded-[20px] shadow-2xl transform transition-all duration-300 ${
          isVisible ? 'translate-y-0 scale-100' : 'translate-y-12 scale-95'
        }`}
      >
        {/* Tombol Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-hitam2 dark:text-abu bg-putih3 dark:bg-hitam3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
        >
          ✕
        </button>

        {/* Konten Modal */}
        <div className="text-center font-ruda">
          {/* Pesan */}
          <h2 className="text-[22px] font-bold text-hitam1 dark:text-putih1 mb-2">
            Login Dulu, Yuk!
          </h2>
          <p className="text-[16px] text-hitam2 dark:text-abu mb-6">
            Akses fitur ini dengan login ke akunmu <br/> sekarang!
          </p>

          {/* Tombol */}
          <div className="flex justify-center gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 text-[15px] text-hitam2 dark:text-abu font-semibold rounded-full hover:underline hover:text-ungu dark:hover:text-ungu transition-all duration-200"
            >
              Batal
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2 bg-ungu text-white font-semibold rounded-full hover:bg-ungu-dark hover:shadow-lg transition-all duration-300"
            >
              Login Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalLogin;