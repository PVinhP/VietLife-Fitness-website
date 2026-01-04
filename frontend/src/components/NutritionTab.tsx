import React, { useState } from 'react';
import { FaUtensils, FaFire, FaCheckCircle, FaRedo, FaExclamationCircle } from 'react-icons/fa';

// --- 1. DEFINITIONS ---
interface Meal {
    type: string;
    name: string;
    calories: string;
    info: string;
}

interface DailyMenu {
    day: string;
    meals: Meal[];
}

interface NutritionSummary {
    total_calories: number;
    macro_ratio: { 
        protein: string; 
        carbs: string; 
        fat: string 
    };
    advice: string;
}

interface NutritionTabProps {
    data: {
        summary: NutritionSummary;
        weekly_menu: DailyMenu[];
    };
    // Hàm callback để báo cho Parent biết cần cập nhật lại Plan tổng
    onUpdateMeal: (dayIdx: number, mealIdx: number, newMeal: Meal) => void;
}

const NutritionTab: React.FC<NutritionTabProps> = ({ data, onUpdateMeal }) => {
    // --- LOCAL STATE ---
    const [selectedMenuDay, setSelectedMenuDay] = useState(0);
    const [swappingMeal, setSwappingMeal] = useState<{ dayIdx: number, mealIdx: number } | null>(null);

    // --- SAFETY CHECK: XỬ LÝ DỮ LIỆU CŨ ---
    // Ngăn chặn lỗi "Cannot read properties of undefined (reading 'total_calories')"
    // Nếu data hiện tại không có cấu trúc mới (summary), hiển thị UI yêu cầu tạo lại.
    if (!data || !data.summary || !data.weekly_menu) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-dashed border-gray-300 animate-fade-in">
                <div className="bg-yellow-100 p-4 rounded-full mb-4 text-yellow-600">
                    <FaExclamationCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Cần cập nhật lộ trình</h3>
                <p className="text-gray-500 mb-6 text-center max-w-md px-4 leading-relaxed">
                    Dữ liệu dinh dưỡng hiện tại đang ở phiên bản cũ. <br/>
                    Vui lòng bấm nút <span className="font-bold text-teal-600 border border-teal-200 bg-teal-50 px-2 py-0.5 rounded">Tạo mới</span> (hoặc Tạo lại) ở góc trên bên phải màn hình để AI nâng cấp lên <strong>Thực đơn thông minh 7 ngày</strong>.
                </p>
            </div>
        );
    }

    // --- LOGIC ĐỔI MÓN ---
    const handleSwapMeal = async (dayIdx: number, mealIdx: number, currentMeal: Meal) => {
        setSwappingMeal({ dayIdx, mealIdx });
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://vietlife-fitness-website-host.onrender.com/api/ai-plan/regenerate-meal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ 
                    oldMealName: currentMeal.name,
                    mealType: currentMeal.type, 
                    calories: currentMeal.calories 
                })
            });

            const resData = await response.json();
            
            if (response.ok) {
                // Tạo đối tượng món ăn mới từ phản hồi AI
                const newMeal: Meal = {
                    ...currentMeal,
                    name: resData.meal.name,
                    info: resData.meal.info
                };
                
                // Gọi ngược lên Parent để cập nhật State tổng
                onUpdateMeal(dayIdx, mealIdx, newMeal);
            } else {
                alert("Không thể đổi món lúc này. Vui lòng thử lại sau.");
            }
        } catch (error) {
            console.error("Lỗi đổi món:", error);
        } finally {
            setSwappingMeal(null);
        }
    };

    // --- RENDER ---
    return (
        <div className="animate-fade-in-up space-y-8">
            {/* A. MACRO DASHBOARD */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Cột trái: Tổng Calo */}
                    <div className="text-center md:text-left z-10">
                        <div className="flex items-center gap-2 justify-center md:justify-start text-orange-600 font-bold uppercase text-xs tracking-wider mb-1">
                            <FaFire /> Mục tiêu hàng ngày
                        </div>
                        <div className="text-5xl font-black text-slate-800 mb-2">
                            {data.summary.total_calories}
                            <span className="text-lg font-medium text-gray-400 ml-1">kcal</span>
                        </div>
                        <p className="text-sm text-gray-500 italic max-w-xs leading-tight opacity-80">"{data.summary.advice}"</p>
                    </div>
                    
                    {/* Cột phải: Thanh Macro */}
                    <div className="flex-1 w-full space-y-4 bg-orange-50/50 p-5 rounded-xl border border-orange-100">
                        {['protein', 'carbs', 'fat'].map((macro) => {
                            const ratio = (data.summary.macro_ratio as any)[macro] || "30%";
                            const color = macro === 'protein' ? 'bg-blue-500' : macro === 'carbs' ? 'bg-green-500' : 'bg-yellow-500';
                            const label = macro === 'protein' ? 'Đạm (Protein)' : macro === 'carbs' ? 'Tinh bột (Carbs)' : 'Béo (Fat)';
                            
                            return (
                                <div key={macro}>
                                    <div className="flex justify-between text-xs font-bold mb-1 uppercase text-gray-600">
                                        <span>{label}</span>
                                        <span className={macro === 'protein' ? 'text-blue-600' : macro === 'carbs' ? 'text-green-600' : 'text-yellow-600'}>{ratio}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                        <div className={`${color} h-2.5 rounded-full shadow-sm transition-all duration-1000 ease-out`} style={{ width: ratio }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* B. MENU SELECTOR (7 NGÀY) */}
            <div>
                <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-hide mb-2">
                    {data.weekly_menu?.map((menu, idx) => (
                        <button key={idx} onClick={() => setSelectedMenuDay(idx)}
                            className={`flex-shrink-0 px-5 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap border ${
                                selectedMenuDay === idx 
                                ? 'bg-orange-500 text-white shadow-md border-orange-500 transform scale-105' 
                                : 'bg-white text-gray-500 border-gray-200 hover:text-orange-500 hover:border-orange-200 hover:bg-orange-50'
                            }`}>
                            {menu.day}
                        </button>
                    ))}
                </div>

                {/* C. MEAL LIST */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                    {data.weekly_menu?.[selectedMenuDay]?.meals.map((meal, idx) => {
                        const isSwapping = swappingMeal?.dayIdx === selectedMenuDay && swappingMeal?.mealIdx === idx;
                        
                        return (
                            <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-orange-50 flex items-start gap-4 hover:shadow-md transition-all group relative overflow-hidden">
                                {/* Icon Loại bữa ăn */}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm flex-shrink-0 transition-transform ${
                                    isSwapping ? 'animate-spin bg-gray-100' : 
                                    meal.type.includes('Sáng') ? 'bg-yellow-100 text-yellow-600' : 
                                    meal.type.includes('Trưa') ? 'bg-orange-100 text-orange-600' : 
                                    meal.type.includes('Tối') ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'
                                }`}>
                                    {isSwapping ? '🔄' : 
                                     meal.type.includes('Sáng') ? '🍳' : 
                                     meal.type.includes('Trưa') ? '🍱' : 
                                     meal.type.includes('Tối') ? '🥗' : '🍎'}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{meal.type}</span>
                                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-mono font-bold">
                                            {meal.calories}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-base leading-tight group-hover:text-orange-600 transition-colors pr-6">
                                        {/* Đã xóa class 'truncate' để tên món ăn tự xuống dòng */}
                                        {meal.name}
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1 flex items-start gap-1">
                                        {/* Đổi items-center thành items-start và thêm mt-0.5 để icon căn đều với dòng đầu tiên */}
                                        <FaCheckCircle className="text-green-400 text-[10px] flex-shrink-0 mt-0.5" /> 
                                        
                                        {/* Nếu muốn hiện hết thì để nguyên thẻ span. 
                                            Nếu muốn giới hạn 2 dòng thì thêm class 'line-clamp-2' vào thẻ span dưới đây */}
                                        <span>{meal.info}</span>
                                    </p>
                                </div>

                                {/* Nút Đổi món (Chỉ hiện khi Hover) */}
                                {!isSwapping && (
                                    <button 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            handleSwapMeal(selectedMenuDay, idx, meal); 
                                        }}
                                        className="absolute bottom-2 right-2 p-2 text-gray-300 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100" 
                                        title="Đổi món khác"
                                    >
                                        <FaRedo size={14} />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
                
                {/* Empty State dự phòng */}
                {(!data.weekly_menu || data.weekly_menu.length === 0) && (
                    <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                        Chưa có thực đơn chi tiết. Vui lòng tạo lại lộ trình.
                    </div>
                )}
            </div>
        </div>
    );
};

export default NutritionTab;