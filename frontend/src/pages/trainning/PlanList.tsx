import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PlanBuilder from '../../components/pt/PlanBuilder';

interface Plan {
    id: number;
    name: string;
    description: string;
    level: string;
    duration_weeks: number;
    days_per_week: number;
    image_url: string;
}

const PlanList = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false); // State mở modal
    const userRole = localStorage.getItem("role"); // Lấy role
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await axios.get('http://localhost:8080/api/plans');
                setPlans(res.data);
            } catch (error) {
                console.error("Lỗi tải giáo án:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    // Helper: Chọn màu badge theo độ khó
    const getLevelColor = (level: string) => {
        switch (level) {
            case 'Beginner': return 'bg-green-100 text-green-700 border-green-200';
            case 'Intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Advanced': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header Banner */}
            <div className="bg-teal-700 text-white py-16 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
                        Giáo Án Tập Luyện
                    </h1>
                    {(userRole === 'admin' || userRole === 'pt') && (
                        <button
                            onClick={() => setIsBuilderOpen(true)}
                            className="fixed top-25 left-6 bg-teal-600 text-black p-4 rounded-full shadow-lg hover:bg-teal-700 z-40 flex items-center gap-2 font-bold animate-bounce-slow"
                        >
                            <span className="text-2xl">+</span> Tạo Giáo Án
                        </button>
                    )}
                    <p className="text-teal-100 text-lg md:text-xl max-w-2xl mx-auto">
                        Lộ trình được thiết kế khoa học giúp bạn đạt mục tiêu nhanh nhất. Không cần suy nghĩ hôm nay tập gì.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
                {loading ? (
                    <div className="flex justify-center py-20 bg-white rounded-2xl shadow-lg">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {plans.map((plan) => (
                            <Link 
                                key={plan.id} 
                                to={`/training/plans/${plan.id}`}
                                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full border border-gray-100"
                            >
                                {/* Image Area */}
                                <div className="h-56 overflow-hidden relative">
                                    <img 
                                        src={plan.image_url} 
                                        alt={plan.name} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80" />
                                    
                                    {/* Level Badge on Image */}
                                    <div className="absolute bottom-4 left-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getLevelColor(plan.level)} shadow-sm bg-white/90 backdrop-blur-sm`}>
                                            {plan.level}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-teal-600 transition-colors">
                                        {plan.name}
                                    </h3>
                                    
                                    {/* Stats Row */}
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 border-b border-gray-100 pb-4">
                                        <div className="flex items-center gap-1">
                                            <span className="text-teal-500">📅</span> {plan.duration_weeks} Tuần
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-teal-500">💪</span> {plan.days_per_week} Buổi/tuần
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">
                                        {plan.description}
                                    </p>

                                    <div className="w-full py-3 bg-teal-50 text-teal-700 font-bold rounded-lg text-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                        Xem lịch tập chi tiết
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
            {/* --- MODAL PLAN BUILDER --- */}
            {isBuilderOpen && (
                <PlanBuilder 
                    onClose={() => setIsBuilderOpen(false)}
                    onSuccess={() => {
                        // Load lại danh sách giáo án mới tạo
                        const fetchPlans = async () => { /* ...gọi lại hàm fetch... */ };
                        fetchPlans(); 
                        // Hoặc đơn giản là: window.location.reload();
                    }}
                />
            )}
        </div>
    );
};

export default PlanList;