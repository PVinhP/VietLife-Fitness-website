// 1. Import thêm useRef và useEffect
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaHistory, FaCog, FaSignOutAlt } from 'react-icons/fa';
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
    // Hàm xử lý khi click
    const handleClickOutside = (event: MouseEvent) => {
      // Nếu ref tồn tại VÀ vị trí click không nằm trong phần tử của ref
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false); // Thì đóng dropdown
      }
    };

    // Chỉ thêm trình lắng nghe nếu dropdown đang mở
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Hàm dọn dẹp: Gỡ bỏ trình lắng nghe khi component bị hủy hoặc khi dropdown đóng
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]); // Dependency array: Effect này sẽ chạy lại mỗi khi `isOpen` thay đổi

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
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none">
          {/* ... nội dung dropdown giữ nguyên ... */}
          <div className="px-4 py-3">
            <p className="text-sm">Đăng nhập với tư cách</p>
            <p className="text-sm font-medium text-gray-900 truncate">
              {userName || "Người dùng"}
            </p>
          </div>
          <div className="py-1">
            <Link
              to="/dashboard"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              onClick={toggleDropdown}
            >
              <MdOutlineDashboard className="mr-3 h-5 w-5 text-gray-400" />
              Bảng điều khiển
            </Link>
            <Link
              to="/progress"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              onClick={toggleDropdown}
            >
              <FaHistory className="mr-3 h-4 w-4 text-gray-400" />
              Lịch sử tập luyện
            </Link>
            <Link
              to="/settings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              onClick={toggleDropdown}
            >
              <FaCog className="mr-3 h-4 w-4 text-gray-400" />
              Cài đặt
            </Link>
          </div>
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