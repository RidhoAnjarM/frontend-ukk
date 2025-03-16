import React, { useEffect, useState } from 'react';
import { Category } from '../types/types';
import Modal from './Modal'; 
import { Lihat } from './svgs/page';

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function PopulerKategori() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/api/populer/category`);
        const data = await response.json();
        setCategories(data.popular_categories.slice(0, 6)); 
        setAllCategories(data.popular_categories); 
      } catch (error) {
        console.error('Error fetching popular categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleTitleClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className='w-[300px] border border-hitam2 rounded-[16px] bg-putih1 dark:bg-hitam2 ps-[25px] pb-[15px] pt-[15px] hover:shadow-lg'>
        <h2 
          className='text-[20px] font-ruda font-medium dark:text-putih1 mb-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 flex items-center hover:underline'
          onClick={handleTitleClick}
        >
          Kategori Populer <Lihat className="stroke-black dark:stroke-putih1 ms-2 stroke-2"/>
        </h2>
        <div>
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`loading-${index}`}
                className="h-[40px] w-[250px] bg-gray-300 rounded animate-pulse mb-2"
              />
            ))
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="mb-2 flex"
              >
                <img
                  src={`${API_URL}${category.photo}`}
                  className='w-[40px] h-[40px] rounded-[4px] object-cover border me-[10px]'
                  onError={(e) => {
                    console.log(`Image not found for user: ${category.photo}, setting to default.`);
                    (e.target as HTMLImageElement).src = 'https://i.pinimg.com/736x/fc/7e/ce/fc7ece8e8ee1f5db97577a4622f33975.jpg';
                  }}
                />
                <div className="">
                  <h3 className="font-bold font-ruda text-[14px] text-hitam1 dark:text-putih1">{category.name}</h3>
                  <p className="text-[10px] font-ruda text-hitam4 dark:text-abu">Digunakan {category.usage_count} kali</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal untuk menampilkan semua kategori */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className='text-[24px] font-ruda font-medium dark:text-putih1 mb-4 text-center'>Semua Kategori</h2>
        <div className="max-h-[550px] overflow-y-auto scrollbar-hide cursor-grabbing">
          {allCategories.map((category) => (
            <div
              key={category.id}
              className="mb-3 flex items-center"
            >
              <img
                src={`${API_URL}${category.photo}`}
                className='w-[50px] h-[50px] rounded-[4px] object-cover border me-[15px]'
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://i.pinimg.com/736x/fc/7e/ce/fc7ece8e8ee1f5db97577a4622f33975.jpg';
                }}
              />
              <div>
                <h3 className="font-bold font-ruda text-[16px] text-hitam1 dark:text-putih1">{category.name}</h3>
                <p className="text-[12px] font-ruda text-hitam4 dark:text-abu">Digunakan {category.usage_count} kali</p>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}