// frontend/src/pages/admin/PlanManager.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import PlanBuilder from '../../components/pt/PlanBuilder'; // Import file bạn đã có

interface Plan {
    id: number;
    name: string;
    description: string;
    level: string;
    duration_weeks: number;
    days_per_week: number;
    image_url: string;
}

const PlanManager = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // 1. Fetch Plans
    const fetchPlans = async () => {
        try {
            const res = await axios.get('https://vietlife-fitness-website-host.onrender.com/api/plans');
            setPlans(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    // 2. Handlers
    const handleCreate = () => {
        setEditingId(null);
        setIsBuilderOpen(true);
    };

    const handleEdit = (id: number) => {
        setEditingId(id);
        setIsBuilderOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa giáo án này không?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`https://vietlife-fitness-website-host.onrender.com/api/plans/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Đã xóa giáo án.");
            fetchPlans();
        } catch (error) {
            toast.error("Lỗi khi xóa.");
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 min-h-[600px] animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">📋 Quản lý Giáo Án & Lộ Trình</h2>
                <button 
                    onClick={handleCreate} 
                    className="bg-teal-600 text-white px-5 py-2.5 rounded-lg hover:bg-teal-700 font-bold flex items-center gap-2 shadow-md transition-all"
                >
                    <span>➕</span> Thiết kế Giáo Án Mới
                </button>
            </div>

            {/* Grid List */}
            {loading ? (
                <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {plans.map(plan => (
                        <div key={plan.id} className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                            {/* Image Header */}
                            <div className="relative h-48 overflow-hidden">
                                <img 
                                    src={plan.image_url || 'https://via.placeholder.com/400x200?text=No+Image'} 
                                    alt={plan.name} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-teal-700 shadow-sm">
                                    {plan.level}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1" title={plan.name}>
                                    {plan.name}
                                </h3>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
                                    {plan.description || "Chưa có mô tả."}
                                </p>
                                
                                <div className="flex items-center justify-between text-xs text-gray-600 font-medium mb-4 bg-gray-50 p-2 rounded-lg">
                                    <div className="flex items-center gap-1">
                                        <span>🗓</span> {plan.duration_weeks} Tuần
                                    </div>
                                    <div className="w-px h-4 bg-gray-300"></div>
                                    <div className="flex items-center gap-1">
                                        <span>💪</span> {plan.days_per_week} Buổi/Tuần
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 mt-auto">
                                    <button 
                                        onClick={() => handleEdit(plan.id)}
                                        className="flex-1 bg-teal-50 text-teal-700 py-2.5 rounded-lg font-bold hover:bg-teal-100 transition-colors border border-teal-100"
                                    >
                                        ✏️ Chỉnh sửa
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(plan.id)}
                                        className="px-4 bg-white text-red-500 border border-red-100 py-2.5 rounded-lg hover:bg-red-50 transition-colors"
                                        title="Xóa giáo án này"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- MODAL PLAN BUILDER (TÁI SỬ DỤNG) --- */}
            {isBuilderOpen && (
                <PlanBuilder 
                    onClose={() => setIsBuilderOpen(false)}
                    onSuccess={() => {
                        fetchPlans(); // Reload list sau khi lưu
                    }}
                    editingPlanId={editingId}
                />
            )}
        </div>
    );
};

export default PlanManager;