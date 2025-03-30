// components/Dropdown.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Horizontal } from './svgs/page';

interface DropdownProps {
  id: number;
  userId: number;
  onReportForum: (forumId: number) => void;
  onReportAccount: (userId: number) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ id, userId, onReportForum, onReportAccount }) => {
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const router = useRouter();

  const handleAkun = (akunId: number) => {
    router.push(`/pages/user/akun/${akunId}`);
  };

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container') && !target.closest('.dropdown-item')) {
      setActiveDropdown(null);
    }
  };

  useEffect(() => {
    if (activeDropdown !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  const handleAccount = (postId: number) => {
    setActiveDropdown((prev) => (prev === postId ? null : postId));
  };

  return (
    <div className="dropdown-container" >
      <div className="flex items-center justify-center">
        <button onClick={() => handleAccount(id)}>
          <Horizontal className="fill-hitam2 dark:fill-abu ms-[15px]" />
        </button>
      </div>
      {activeDropdown === id && (
        <div className="absolute bg-[#F2F2F2] shadow w-[150px] rounded-[6px] overflow-hidden text-[12px] mt-2 -ms-[45px]" >
          <button
            onClick={() => handleAkun(userId)}
            className="block px-4 py-2 text-primary hover:bg-gray-200 w-full text-center font-ruda"
          >
            Lihat Akun
          </button>
          < button
            onClick={() => onReportForum(id)}
            className="block px-4 py-2 text-primary hover:bg-gray-200 w-full text-center font-ruda"
          >
            Laporkan Postingan
          </button>
          < button
            onClick={() => onReportAccount(userId)}
            className="block px-4 py-2 text-primary hover:bg-gray-200 w-full text-center font-ruda"
          >
            Laporkan Akun
          </button>
        </div>
      )}
    </div>
  );
};

export default Dropdown;