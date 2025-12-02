import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// [CẬP NHẬT] Thêm total_exercises vào interface
interface HistoryItem {
    plan_id: number;
    plan_name: string;
    image_url: string;
    exercises_done: number;
    total_exercises: number; // <--- Mới thêm
    last_workout: string;
}

const WorkoutHistory = () => {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    // Hàm tính thời gian tương đối (Giữ nguyên như cũ)
    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        if (diffInSeconds < 60) return 'Vừa xong';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
        if (diffInSeconds < 172800) return 'Hôm qua';
        return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    };

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        const fetchHistory = async () => {
            try {
                const res = await axios.get('http://localhost:8080/api/workout-progress/history', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHistory(res.data);
            } catch (error) {
                console.error("Lỗi tải lịch sử:", error);
            } finally {
                setTimeout(() => setLoading(false), 500);
            }
        };
        fetchHistory();
    }, [token, navigate]);

    // Loading Skeleton (Giữ nguyên)...
    if (loading) return <div className="min-h-screen bg-gray-50 flex justify-center items-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-teal-500"></div></div>;

    // Empty State (Giữ nguyên)...
    if (history.length === 0) return <div className="p-10 text-center">Bạn chưa có lịch sử tập luyện.</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-10 pb-20 font-sans">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-gray-200 pb-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight">
                            Lịch sử tập luyện <span className="text-teal-500">.</span>
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium">Tiếp tục duy trì ngọn lửa đam mê 🔥</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {history.map((item) => {
                        // [LOGIC MỚI] Tính toán phần trăm
                        // Nếu total = 0 (tránh chia cho 0) thì set là 1 để không lỗi
                        const total = item.total_exercises || 1; 
                        const percent = Math.round((item.exercises_done / total) * 100);
                        // Giới hạn max 100%
                        const displayPercent = percent > 100 ? 100 : percent;

                        return (
                            <Link 
                                to={`/training/plans/${item.plan_id}`} 
                                key={item.plan_id}
                                state={{ from: 'history' }}
                                className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl hover:border-teal-100 transition-all duration-300 flex flex-col relative"
                            >
                                <div className="h-48 overflow-hidden relative">
                                    <img 
                                        src={item.image_url} 
                                        alt={item.plan_name} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>
                                    <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20">
                                        🕒 {getRelativeTime(item.last_workout)}
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-teal-600 transition-colors line-clamp-1 mb-2">
                                        {item.plan_name}
                                    </h3>

                                    {/* [GIAO DIỆN MỚI] THANH TIẾN ĐỘ & PHẦN TRĂM */}
                                    <div className="mb-6">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tiến độ</span>
                                            <span className="text-lg font-black text-teal-600">{displayPercent}%</span>
                                        </div>
                                        
                                        {/* Thanh Progress Bar Background */}
                                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                            {/* Thanh Progress Bar Fill */}
                                            <div 
                                                className="bg-teal-500 h-full rounded-full transition-all duration-1000 ease-out group-hover:bg-teal-400" 
                                                style={{ width: `${displayPercent}%` }}
                                            ></div>
                                        </div>
                                        
                                        <div className="mt-2 text-right text-xs text-gray-400 font-medium">
                                            Đã xong {item.exercises_done}/{item.total_exercises} bài
                                        </div>
                                    </div>

                                    <div className="mt-auto">
                                        <button className="w-full py-3 rounded-xl bg-gray-50 text-gray-600 font-bold text-sm group-hover:bg-teal-600 group-hover:text-white transition-all flex items-center justify-center gap-2">
                                            Tiếp tục ngay →
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default WorkoutHistory;