import React, { useEffect, useState } from 'react';
import { Category } from '../types/types';

export default function PopulerKategori() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/populer/category');
        const data = await response.json();
        setCategories(data.popular_categories);
      } catch (error) {
        console.error('Error fetching popular categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className='w-[300px] border border-hitam2 rounded-[16px] dark:bg-hitam2 ps-[25px] py-[35px] mr-[40px] mt-[100px] top-0 right-0 absolute'>
      <h2 className='text-[20px] font-ruda font-medium dark:text-putih1'>Kategori Populer</h2>
      <div>
        {loading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <div
              key={`loading-${index}`}
              className="h-6 bg-gray-300 rounded animate-pulse mb-2"
            />
          ))
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="mb-2 flex"
            >
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}${category.photo}`}
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
  );
}
 