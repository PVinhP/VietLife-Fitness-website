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
    
    // State cho Modal
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    
    // [MỚI] State để lưu ID giáo án đang sửa
    const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
    
    const userRole = localStorage.getItem("role");

    // Fetch dữ liệu
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

    useEffect(() => {
        fetchPlans();
    }, []);

    // Helper: Màu sắc theo cấp độ
    const getLevelColor = (level: string) => {
        switch (level) {
            case 'Beginner': return 'bg-green-100 text-green-700 border-green-200';
            case 'Intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Advanced': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    // [MỚI] Hàm xử lý khi bấm nút "Tạo mới"
    const handleCreateClick = () => {
        setEditingPlanId(null); // Reset ID về null để Builder biết là đang tạo mới
        setIsBuilderOpen(true);
    };

    // [MỚI] Hàm xử lý khi bấm nút "Sửa"
    const handleEditClick = (e: React.MouseEvent, planId: number) => {
        e.preventDefault(); // Chặn Link chuyển trang
        e.stopPropagation(); // Chặn sự kiện nổi bọt
        setEditingPlanId(planId); // Lưu ID cần sửa
        setIsBuilderOpen(true);   // Mở Modal
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
                    
                    <p className="text-teal-100 text-lg md:text-xl max-w-2xl mx-auto mb-8">
                        Lộ trình được thiết kế khoa học giúp bạn đạt mục tiêu nhanh nhất.
                    </p>

                    {/* Nút Tạo Giáo Án Mới */}
                    {(userRole === 'admin' || userRole === 'pt') && (
                        <button
                            onClick={handleCreateClick} // Gọi hàm handleCreateClick
                            className="inline-flex items-center gap-2 bg-white text-teal-800 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-teal-50 hover:scale-105 transition-all duration-300"
                        >
                            <span className="text-xl font-extrabold">+</span> Tạo Giáo Án Mới
                        </button>
                    )}
                </div>
            </div>

            {/* Content Grid */}
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
                                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full border border-gray-100 relative"
                            >
                                {/* --- NÚT SỬA (Chỉ hiện cho PT/Admin) --- */}
                                {(userRole === 'admin' || userRole === 'pt') && (
                                    <button
                                        onClick={(e) => handleEditClick(e, plan.id)}
                                        className="absolute top-3 right-3 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-full text-yellow-600 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-yellow-500 hover:text-white transform hover:scale-110"
                                        title="Sửa giáo án này"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                        </svg>
                                    </button>
                                )}
                                {/* --------------------------------------- */}

                                {/* Image Area */}
                                <div className="h-56 overflow-hidden relative">
                                    <img 
                                        src={plan.image_url} 
                                        alt={plan.name} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/400x300?text=No+Image"; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80" />
                                    
                                    {/* Level Badge */}
                                    <div className="absolute bottom-4 left-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getLevelColor(plan.level)} shadow-sm bg-white/90 backdrop-blur-sm`}>
                                            {plan.level}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-teal-600 transition-colors line-clamp-1">
                                        {plan.name}
                                    </h3>
                                    
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
                        fetchPlans(); // Load lại danh sách sau khi Tạo/Sửa thành công
                    }}
                    editingPlanId={editingPlanId} // Truyền ID vào đây (null = tạo, có số = sửa)
                />
            )}
        </div>
    );
};

export default PlanList;