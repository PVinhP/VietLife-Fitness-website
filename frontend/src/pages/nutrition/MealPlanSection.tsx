// frontend/src/pages/nutrition/MealPlanSection.tsx

import React from 'react';

interface MealPlan {
    id: number;
    title: string;
    description: string;
    duration: number; // Số ngày
    avgCalories: number; // Calo trung bình/ngày
    goal: 'Giảm mỡ' | 'Tăng cơ' | 'Ăn sạch';
}

const DUMMY_PLANS: MealPlan[] = [
    { id: 101, title: "Kế hoạch 7 ngày Giảm mỡ cấp tốc", description: "Thực đơn calo thấp, giàu protein giúp đốt mỡ hiệu quả.", duration: 7, avgCalories: 1500, goal: 'Giảm mỡ' },
    { id: 102, title: "Thực đơn 14 ngày Tăng cơ Lean Bulk", description: "Cân bằng Protein/Carb/Fat để tăng cơ nạc tối đa.", duration: 14, avgCalories: 2200, goal: 'Tăng cơ' },
    { id: 103, title: "Lộ trình 30 ngày Ăn sạch toàn diện", description: "Loại bỏ đường tinh luyện, tập trung vào thực phẩm tươi, nguyên chất.", duration: 30, avgCalories: 1800, goal: 'Ăn sạch' },
];

function MealPlanSection() {
    const renderPlanCard = (plan: MealPlan) => (
        <div 
            key={plan.id} 
            className="bg-white rounded-xl p-6 shadow-xl border-l-4 border-teal-500 cursor-pointer transform transition-all hover:shadow-2xl hover:scale-[1.02]"
            // Giả lập navigation
            onClick={() => console.log(`Maps to Meal Plan Detail ${plan.id}`)}
        >
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-2xl font-extrabold text-gray-900 hover:text-teal-600 transition-colors">
                    {plan.title}
                </h3>
                <span className={`px-3 py-1 text-xs font-bold rounded-full text-white ${
                    plan.goal === 'Giảm mỡ' ? 'bg-red-500' : 
                    plan.goal === 'Tăng cơ' ? 'bg-green-500' : 'bg-blue-500'
                }`}>
                    {plan.goal}
                </span>
            </div>
            <p className="text-gray-600 mb-4 text-sm line-clamp-2">{plan.description}</p>
            <div className="flex justify-between items-center border-t pt-4">
                <div className="flex space-x-4">
                    <span className="text-sm font-semibold text-gray-700">
                        🗓️ {plan.duration} Ngày
                    </span>
                    <span className="text-sm font-semibold text-gray-700">
                        🔥 {plan.avgCalories} Calo/ngày
                    </span>
                </div>
                <span className="text-teal-500 font-bold hover:text-teal-600">
                    Bắt đầu Kế hoạch →
                </span>
            </div>
        </div>
    );

    return (
        <div className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">🎯 Kế Hoạch Ăn Uống (Meal Plans)</h2>
                    <p className="text-xl text-gray-600">Giải pháp trọn gói - Không cần phải suy nghĩ hôm nay ăn gì.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {DUMMY_PLANS.map(renderPlanCard)}
                </div>

                <div className="text-center mt-12">
                    <button className="px-8 py-3 bg-teal-500 text-white font-bold text-lg rounded-full shadow-lg hover:bg-teal-600 transition-colors">
                        Xem Tất Cả Kế Hoạch
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MealPlanSection;