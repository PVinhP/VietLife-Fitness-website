// src/components/NavDropdown.tsx
import React, { useState, useRef, useEffect } from 'react';
// Bỏ import Link vì chúng ta sẽ dùng thẻ <a>
// import { Link } from 'react-router-dom'; 
import { FaChevronDown } from 'react-icons/fa';

interface NavDropdownProps {
  title: string;
  children: React.ReactNode;
}

interface DropdownItemProps {
  to: string; // 'to' bây giờ sẽ được dùng cho 'href'
  children: React.ReactNode;
  onClick?: () => void;
}

const NavDropdown: React.FC<NavDropdownProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative group w-full md:w-auto" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="py-2 px-3 text-white rounded hover:bg-teal-600 md:hover:bg-transparent md:hover:text-teal-200 md:p-0 flex items-center justify-between w-full"
      >
        <span>{title}</span>
        <FaChevronDown
          className={`ml-1 h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} group-hover:rotate-180`}
        />
      </button>

      <div
        className={`
          w-full md:absolute md:top-full md:left-0 md:mt-2 md:w-48
          md:rounded-md md:shadow-lg bg-teal-600 md:bg-white md:ring-1 md:ring-black md:ring-opacity-5
          transition-all duration-200 ease-in-out
          md:transform md:opacity-0 md:invisible md:-translate-y-2
          group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
          ${isOpen ? "block" : "hidden"}
          md:block
        `}
      >
        <div className="py-1" role="menu" aria-orientation="vertical">
          {React.Children.map(children, child =>
            React.cloneElement(child as React.ReactElement<DropdownItemProps>, { onClick: closeMenu })
          )}
        </div>
      </div>
    </div>
  );
};

// === THAY ĐỔI CHÍNH Ở ĐÂY ===
export const DropdownItem: React.FC<DropdownItemProps> = ({ to, children, onClick }) => {
  return (
    // Thay thế <Link> bằng thẻ <a>
    // Thay thế prop 'to' bằng 'href'
    <a
      href={to}
      onClick={onClick}
      className="block px-4 py-2 text-sm text-teal-100 hover:text-white hover:bg-teal-500 md:text-gray-700 md:hover:bg-gray-100 md:hover:text-gray-900"
      role="menuitem"
    >
      {children}
    </a>
  );
};

export default NavDropdown;