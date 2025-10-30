// src/components/Profile/DashboardTab.tsx
import React from 'react';

const DashboardTab: React.FC = () => {
    // TODO: Lấy dữ liệu profile và tính toán BMI, TDEE
    const bmi = 22.5; // Giả sử
    const tdee = 2500; // Giả sử

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Bảng điều khiển</h2>
            
            {/* Grid các chỉ số */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-teal-100 p-4 rounded-lg shadow">
                    <h3 className="text-sm font-semibold text-teal-700">Mục tiêu Calo (TDEE)</h3>
                    <p className="text-3xl font-bold text-teal-900">{tdee} <span className="text-base font-normal">Kcal</span></p>
                </div>
                 <div className="bg-blue-100 p-4 rounded-lg shadow">
                    <h3 className="text-sm font-semibold text-blue-700">Chỉ số BMI</h3>
                    <p className="text-3xl font-bold text-blue-900">{bmi} <span className="text-base font-normal">(Bình thường)</span></p>
                </div>
                 <div className="bg-green-100 p-4 rounded-lg shadow">
                    <h3 className="text-sm font-semibold text-green-700">Mục tiêu</h3>
                    <p className="text-3xl font-bold text-green-900">Giảm cân</p>
                </div>
            </div>

            {/* Khu vực biểu đồ */}
            <div className="bg-gray-50 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Biểu đồ Cân nặng</h3>
                <div className="h-64 flex items-center justify-center text-gray-400">
                    [Biểu đồ sẽ được hiển thị ở đây - Dùng thư viện như Chart.js hoặc Recharts]
                </div>
            </div>
        </div>
    );
};

export default DashboardTab;