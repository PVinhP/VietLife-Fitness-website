// src/components/NavDropdown.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';

interface NavDropdownProps {
  title: string;
  children: React.ReactNode;
}

interface DropdownItemProps {
  to: string;
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
        // === CẢI THIỆN ACCESSIBILITY ===
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="py-2 px-3 text-white rounded hover:bg-teal-600 md:hover:bg-transparent md:hover:text-teal-200 md:p-0 flex items-center justify-between w-full"
      >
        <span>{title}</span>
        <FaChevronDown
          className={`ml-1 h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} group-hover:rotate-180`}
        />
      </button>

      {/* === CẢI THIỆN GIAO DIỆN MOBILE & DESKTOP === */}
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

export const DropdownItem: React.FC<DropdownItemProps> = ({ to, children, onClick }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      // === CLASS MỚI ĐỂ HIỂN THỊ ĐỒNG BỘ TRÊN MOBILE & DESKTOP ===
      className="block px-4 py-2 text-sm text-teal-100 hover:text-white hover:bg-teal-500 md:text-gray-700 md:hover:bg-gray-100 md:hover:text-gray-900"
      role="menuitem"
    >
      {children}
    </Link>
  );
};

export default NavDropdown;