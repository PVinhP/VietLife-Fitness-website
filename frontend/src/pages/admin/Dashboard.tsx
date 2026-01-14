import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// 1. Interface cho dữ liệu API
interface DashboardData {
    stats: {
        users: number;
        exercises: number;
        plans: number;
        lessons: number;
        foods: number;
        sports: number;
    };
    recentActivity: {
        id: number;
        full_name: string;
        email: string;
        created_at: string;
    }[];
}

// 2. Component Card thống kê (Giữ nguyên style cũ của bạn nhưng thêm animation)
const StatCard = ({ title, value, icon, color, link }: any) => (
    <Link to={link} className="block group">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${color} shadow-sm group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</p>
                <h4 className="text-3xl font-extrabold text-gray-800 mt-1">{value.toLocaleString()}</h4>
            </div>
        </div>
    </Link>
);

const AdminDashboard = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    // 3. Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get('http://localhost:8080/api/dashboard/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(res.data);
            } catch (error) {
                console.error("Lỗi tải dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-10 text-center text-gray-500">Đang tải dữ liệu tổng quan...</div>;

    return (
        <div className="animate-fadeIn p-6">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Xin chào, Admin 👋</h2>
                    <p className="text-gray-500 mt-1">Dưới đây là tổng quan tình hình hệ thống hôm nay.</p>
                </div>
                <span className="text-sm bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-medium border border-teal-100">
                    📅 {new Date().toLocaleDateString('vi-VN')}
                </span>
            </div>
            
            {/* 4. Stats Grid (Hiển thị số liệu thật) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Người dùng" 
                    value={data?.stats.users || 0} 
                    icon="👥" 
                    color="bg-blue-100 text-blue-600" 
                    link="/admin/users"
                />
                <StatCard 
                    title="Giáo án" 
                    value={data?.stats.plans || 0} 
                    icon="📋" 
                    color="bg-purple-100 text-purple-600" 
                    link="/admin/plans"
                />
                <StatCard 
                    title="Bài tập" 
                    value={data?.stats.exercises || 0} 
                    icon="💪" 
                    color="bg-green-100 text-green-600" 
                    link="/admin/exercises"
                />
                <StatCard 
                    title="Bài học" 
                    value={data?.stats.lessons || 0} 
                    icon="📚" 
                    color="bg-orange-100 text-orange-600" 
                    link="/admin/lessons"
                />
                <StatCard 
                    title="Thực phẩm" 
                    value={data?.stats.foods || 0} 
                    icon="🍎" 
                    color="bg-red-100 text-red-600" 
                    link="/admin/foods"
                />
                <StatCard 
                    title="Môn thể thao" 
                    value={data?.stats.sports || 0} 
                    icon="⚽" 
                    color="bg-teal-100 text-teal-600" 
                    link="/admin/sports"
                />
            </div>

            {/* 5. Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Cột Trái: Người dùng mới */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800 text-lg">Thành viên mới gia nhập</h3>
                        <Link to="/admin/users" className="text-sm text-teal-600 hover:underline">Xem tất cả</Link>
                    </div>
                    
                    <div className="space-y-4">
                        {data?.recentActivity && data.recentActivity.length > 0 ? (
                            data.recentActivity.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold shadow-md">
                                            {user.full_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-gray-800 font-semibold text-sm">{user.full_name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                        {/* Tính thời gian tương đối đơn giản */}
                                        Mới đây
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-400 py-4">Chưa có hoạt động mới.</p>
                        )}
                    </div>
                </div>

                {/* Cột Phải: Placeholder cho các thống kê khác (Ví dụ: Biểu đồ) */}
                <div className="bg-gradient-to-br from-teal-600 to-blue-700 rounded-2xl shadow-lg p-8 text-white flex flex-col justify-center items-center text-center">
                    <div className="text-5xl mb-4">🚀</div>
                    <h3 className="text-2xl font-bold mb-2">Sẵn sàng bứt phá?</h3>
                    <p className="text-teal-100 mb-6 max-w-md">Hệ thống đang hoạt động ổn định. Hãy kiểm tra các giáo án mới và cập nhật bài học để thu hút thêm người dùng.</p>
                    <Link to="/admin/plans" className="bg-white text-teal-700 px-6 py-2.5 rounded-lg font-bold hover:bg-teal-50 transition shadow-md">
                        Quản lý Giáo án ngay
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;