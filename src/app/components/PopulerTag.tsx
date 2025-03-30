import React, { useEffect, useState } from 'react';
import { Tags } from '../types/types';

interface PopulerTagProps {
  onTagClick?: (tag: string) => void;
}

export default function PopulerTag({ onTagClick }: PopulerTagProps) {
  const [tags, setTags] = useState<Tags[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/populer/tag`);
        const data = await response.json();
        setTags(data.popular_tags.slice(0, 8));
      } catch (error) {
        console.error('Error fetching trending tags:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  return (
    <div className="w-[300px] bg-gradient-to-br from-putih1 to-gray-100 dark:from-hitam2 dark:to-gray-800 border border-hitam2 rounded-[20px] p-5 shadow-md hover:shadow-xl transition-shadow duration-300">
      <h2 className="text-[22px] font-ruda font-bold text-hitam1 dark:text-putih1 mb-4 flex items-center gap-2">
         Hastag Populer 🔥
      </h2>
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <div
              key={`loading-${index}`}
              className="h-[25px] w-[220px] bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"
            />
          ))
        ) : (
          tags.map((tag, index) => (
            <div
              key={tag.id}
              className="group flex items-center justify-between bg-putih3 dark:bg-hitam3 p-2 rounded-lg hover:bg-ungu hover:bg-opacity-10 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
              onClick={() => onTagClick && onTagClick(tag.name)}
            >
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-ruda font-semibold text-ungu dark:text-ungu">
                  #{index + 1}
                </span>
                <h3
                  className="font-ruda text-[15px] font-bold text-hitam1 dark:text-putih1 group-hover:text-ungu transition-colors duration-200"
                >
                  #{tag.name}
                </h3>
              </div>
              <p className="text-[11px] font-ruda text-hitam4 dark:text-abu bg-putih1 dark:bg-hitam4 px-2 py-1 rounded-full">
                {tag.usage_count} posts
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}