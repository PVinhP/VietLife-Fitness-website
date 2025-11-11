// src/components/Navbar.tsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from "../Assests/WellLogo.png";
import UserDropdown from "./UserDropdown";
import NavDropdown, { DropdownItem } from "./NavDropdown"; // Import component menu con

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  const loggeduser = localStorage.getItem("VietLifeuser") || "User";
  const isAuth = !!localStorage.getItem("auth");

  const showToastMessage = () => {
    toast.success('Đăng xuất thành công!', { position: toast.POSITION.TOP_CENTER });
  };

  const handlelogout = () => {
    localStorage.clear();
    showToastMessage();
    navigate("/");
  };

  // Tự động đóng menu mobile khi chuyển trang
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="sticky top-0 border-gray-200 bg-teal-500 z-50">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        {/* === Logo === */}
        <Link to="/" className="flex items-center space-x-3">
          <img src={logo} className="h-8" alt="VietLife Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">
            VietLife
          </span>
        </Link>

        {/* === User/Login Buttons & Mobile Menu Toggle === */}
        <div className="flex md:order-2 items-center space-x-3">
          {isAuth ? (
            <UserDropdown userName={loggeduser} onLogout={handlelogout} />
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Link to="/signin">
                <button type="button" className="text-white bg-black hover:bg-gray-800 font-medium rounded-lg text-sm px-4 py-2 text-center">
                  Đăng nhập
                </button>
              </Link>
              <Link to="/signup">
                <button type="button" className="text-white bg-black hover:bg-gray-800 font-medium rounded-lg text-sm px-4 py-2 text-center">
                  Đăng ký
                </button>
              </Link>
            </div>
          )}
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-white rounded-lg md:hidden hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-controls="navbar-menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="sr-only">Open main menu</span>
            <svg className="w-5 h-5" aria-hidden="true" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
            </svg>
          </button>
        </div>

        {/* === Navigation Links (Desktop & Mobile) === */}
        <div
          className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${isMobileMenuOpen ? "block" : "hidden"}`}
          id="navbar-menu"
        >
          <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-teal-500 md:flex-row md:items-center md:space-x-8 md:mt-0 md:border-0">
            <li><Link to="/" className="block py-2 px-3 text-white rounded hover:bg-teal-600 md:hover:bg-transparent md:hover:text-teal-200 md:p-0">Trang chủ</Link></li>
            {/*<li><Link to="/blogs" className="block py-2 px-3 text-white rounded hover:bg-teal-600 md:hover:bg-transparent md:hover:text-teal-200 md:p-0">Kiến thức</Link></li>*/}
             <li className="w-full md:w-auto">
              <NavDropdown title="Kiến thức">
                <DropdownItem to="/nutrition/lessons">Bài học Dinh dưỡng</DropdownItem>
                <DropdownItem to="/blogs">Khám phá Chuyên sâu</DropdownItem>
              </NavDropdown>
            </li>
            {/* --- MỤC DINH DƯỠNG MỚI VỚI MENU CON --- */}
            <li className="w-full md:w-auto">
              <NavDropdown title="Dinh dưỡng">
                <DropdownItem to="/nutrition/tools">Công cụ (Tra cứu & TDEE)</DropdownItem>
                <DropdownItem to="/nutrition/recipes">Công thức & Kế hoạch ăn uống</DropdownItem>
                <DropdownItem to="/nutrition/explore">Khám phá Chuyên sâu</DropdownItem>
                <DropdownItem to="/nutrition">Xem tất cả</DropdownItem>
              </NavDropdown>
            </li>

            {/* --- MỤC TẬP LUYỆN VỚI MENU CON --- */}
            <li className="w-full md:w-auto">
              <NavDropdown title="Tập luyện">
                <DropdownItem to="/cardio">Cardio & HIIT</DropdownItem>
                <DropdownItem to="/exercise">Tập Sức mạnh (Tạ)</DropdownItem>
                <DropdownItem to="/yoga">Yoga & Giãn cơ</DropdownItem>
                {/* <DropdownItem to="/exercise/yoga">Yoga & Giãn cơ</DropdownItem> */}
                <DropdownItem to="/exercise/all">Xem tất cả</DropdownItem>
              </NavDropdown>
            </li>

            <li><Link to="/plan" className="block py-2 px-3 text-white rounded hover:bg-teal-600 md:hover:bg-transparent md:hover:text-teal-200 md:p-0">Lộ trình</Link></li>

            {/* Login/Signup for Mobile */}
            {!isAuth && (
              <li className="mt-4 border-t border-teal-400 pt-4 md:hidden">
                <div className="flex flex-col space-y-2">
                  <Link to="/signin">
                    <button type="button" className="w-full text-white bg-black hover:bg-gray-800 font-medium rounded-lg text-sm px-4 py-2 text-center">
                      Đăng nhập
                    </button>
                  </Link>
                  <Link to="/signup">
                    <button type="button" className="w-full text-white bg-black hover:bg-gray-800 font-medium rounded-lg text-sm px-4 py-2 text-center">
                      Đăng ký
                    </button>
                  </Link>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
      <ToastContainer autoClose={2000} />
    </nav>
  );
}

export default Navbar;