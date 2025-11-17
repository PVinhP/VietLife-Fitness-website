// src/components/layout/UserDropdown.tsx
// (Phiên bản cập nhật theo cấu trúc 7 mục)

// 1. Import thêm useRef, useEffect và các icon mới
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUserCircle, 
  FaHistory, 
  FaCog, 
  FaSignOutAlt,
  FaChartPie,    // Icon cho Dinh dưỡng
  FaBook,        // Icon cho Học tập (MỚI)
  FaTrophy,      // Icon cho Thành tích (MỚI)
  FaCommentDots  // Icon cho Phản hồi (MỚI)
} from 'react-icons/fa';
import { MdOutlineDashboard } from "react-icons/md";

interface UserDropdownProps {
  userName: string;
  onLogout: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ userName, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  // 2. Tạo một ref để tham chiếu đến div của dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // 3. Sử dụng useEffect để xử lý việc click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false); 
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]); 

  return (
    // 4. Gắn ref vào div cha của dropdown
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center text-white bg-black hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm px-4 py-2 text-center"
      >
        <FaUserCircle className="text-xl mr-2" />
        <span>{userName || "Người dùng"}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-50">
          {/* Thông tin người dùng */}
          <div className="px-4 py-3">
            <p className="text-sm">Đăng nhập với tư cách</p>
            <p className="text-sm font-medium text-gray-900 truncate">
              {userName || "Người dùng"}
            </p>
          </div>
          
          {/* ===== PHẦN LINKS MỚI VỚI 7 MỤC ===== */}
          <div className="py-1">
            {/* 1. Tổng quan */}
            <Link
              to="/profile/dashboard"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              onClick={toggleDropdown}
            >
              <MdOutlineDashboard className="mr-3 h-5 w-5 text-gray-400" />
              Tổng quan
            </Link>
            
            {/* 2. Nhật ký Dinh dưỡng */}
            <Link
              to="/profile/nutrition"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              onClick={toggleDropdown}
            >
              <FaChartPie className="mr-3 h-4 w-4 text-gray-400" />
              Nhật ký Dinh dưỡng
            </Link>

            {/* 3. Lịch sử Tập luyện */}
            <Link
              to="/profile/workouts"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              onClick={toggleDropdown}
            >
              <FaHistory className="mr-3 h-4 w-4 text-gray-400" />
              Lịch sử tập luyện
            </Link>

            {/* 4. Tiến trình học tập (MỚI) */}
            <Link
              to="/profile/learning"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              onClick={toggleDropdown}
            >
              <FaBook className="mr-3 h-4 w-4 text-gray-400" />
              Tiến trình học tập
            </Link>

            {/* 5. Mục tiêu & Thành tích (MỚI) */}
            <Link
              to="/profile/goals"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              onClick={toggleDropdown}
            >
              <FaTrophy className="mr-3 h-4 w-4 text-gray-400" />
              Mục tiêu & Thành tích
            </Link>

            {/* 6. Hồ sơ & Cài đặt */}
            <Link
              to="/profile/settings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              onClick={toggleDropdown}
            >
              <FaCog className="mr-3 h-4 w-4 text-gray-400" />
              Hồ sơ & Cài đặt
            </Link>

            {/* 7. Phản hồi (MỚI) */}
            <Link
              to="/profile/feedback"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              onClick={toggleDropdown}
            >
              <FaCommentDots className="mr-3 h-4 w-4 text-gray-400" />
              Phản hồi
            </Link>

          </div>
          
          {/* Đăng xuất */}
          <div className="py-1">
            <button
              onClick={() => {
                onLogout();
                toggleDropdown();
              }}
              className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <FaSignOutAlt className="mr-3 h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;