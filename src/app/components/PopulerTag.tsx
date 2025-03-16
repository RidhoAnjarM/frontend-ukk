import React, { useEffect, useState } from 'react';
import { Tags } from '../types/types';

export default function PopulerTag() {
  const [tags, setTags] = useState<Tags[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/populer/tag`);
        const data = await response.json();
        setTags(data.popular_tags.slice(0, 8));
      } catch (error) {
        console.error('Error fetching popular categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);
  return (
    <div className='w-[300px] border border-hitam2 rounded-[16px] bg-putih1 dark:bg-hitam2 ps-[25px] py-[12px] hover:shadow-lg'>
      <h2 className='text-[20px] font-ruda font-medium dark:text-putih1 mb-2'>Hastag Populer</h2>
      <div>
        {loading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <div
              key={`loading-${index}`}
              className="h-[20px] w-[200px] bg-gray-300 rounded animate-pulse mb-1"
            />
          ))
        ) : (
          tags.map((tag) => (
              <div
                key={tag.id}
                className="mb-1 flex"
              >
                <div className="flex items-center gap-1">
                  <h3 className="font-bold font-ruda text-[14px] text-hitam1 dark:text-putih1">#{tag.name}</h3>
                  <p className="text-[10px] font-ruda text-hitam4 dark:text-abu">Digunakan {tag.usage_count} kali</p>
                </div>
              </div>
          ))
        )}
      </div>
    </div>
  )
}
