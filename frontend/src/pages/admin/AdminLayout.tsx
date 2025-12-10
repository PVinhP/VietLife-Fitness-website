import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = () => {
        if(window.confirm('Bạn có chắc muốn đăng xuất?')) {
            localStorage.clear();
            navigate('/signin');
        }
    };

    // Danh sách menu
    const menuItems = [
        { path: '/admin/dashboard', label: 'Tổng quan', icon: '📊' },
        { category: 'Hệ thống' },
        { path: '/admin/users', label: 'Quản lý Tài khoản', icon: '👥' },
        { category: 'Dinh dưỡng' },
        { path: '/admin/foods', label: 'Quản lý Thực phẩm', icon: '🍎' },
        { path: '/admin/recipes', label: 'Công thức nấu ăn', icon: '🍲' },
        { path: '/admin/lessons', label: 'Bài học kiến thức', icon: '📚' },
        { category: 'Tập luyện' },
        { path: '/admin/exercises', label: 'Kho Bài tập', icon: '💪' },
        { path: '/admin/sports', label: 'Môn thể thao', icon: '⚽' },
        { path: '/admin/plans', label: 'Giáo án & Lộ trình', icon: '📋' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            
            {/* --- SIDEBAR --- */}
            <aside className={`bg-slate-900 text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex-shrink-0 flex flex-col fixed h-full z-20`}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-center border-b border-slate-700">
                    <span className="text-2xl font-black text-teal-400">
                        {isSidebarOpen ? 'VietLife ADMIN' : 'VL'}
                    </span>
                </div>

                {/* Menu List */}
                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1">
                        {menuItems.map((item, index) => (
                            item.category ? (
                                isSidebarOpen && (
                                    <li key={index} className="px-6 py-2 mt-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        {item.category}
                                    </li>
                                )
                            ) : (
                                <li key={index}>
                                    <Link 
                                        to={item.path || '#'}
                                        className={`flex items-center px-6 py-3 transition-colors ${
                                            location.pathname.startsWith(item.path!) 
                                            ? 'bg-teal-600 text-white border-r-4 border-teal-300' 
                                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }`}
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        {isSidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
                                    </Link>
                                </li>
                            )
                        ))}
                    </ul>
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-slate-700">
                    <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-red-400 hover:bg-slate-800 rounded transition">
                        <span>🚪</span>
                        {isSidebarOpen && <span className="ml-3 font-bold">Đăng xuất</span>}
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                
                {/* Top Header */}
                <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 sticky top-0 z-10">
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-teal-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                    
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-600">Admin System</span>
                        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold border border-teal-200">
                            A
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6 flex-1 overflow-x-hidden">
                    <Outlet /> {/* Các trang con sẽ hiển thị ở đây */}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;