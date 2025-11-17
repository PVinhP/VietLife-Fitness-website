import React, { useState } from 'react';
// import { LineChart, ... } from 'recharts'; // Import thật ở đây

interface ChartData {
  chartData: { name: string; kg: number }[];
}

export const ProgressChart: React.FC<ChartData> = ({ chartData }) => {
  // 1. Quản lý tab đang active
  const [activeTab, setActiveTab] = useState('weight');

  const tabs = [
    { key: 'weight', label: 'Cân nặng' },
    { key: 'waist', label: 'Vòng eo' },
    { key: 'chest', label: 'Vòng ngực' },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">Tiến trình của bạn</h2>
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              // 2. Class động dựa trên state
              className={`text-sm font-medium pb-1 ${
                activeTab === tab.key
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* 3. Hiển thị nội dung dựa trên tab */}
      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        {activeTab === 'weight' && <p>[Biểu đồ Cân nặng (dùng `chartData`)]</p>}
        {activeTab === 'waist' && <p>[Biểu đồ Vòng eo (chưa có data)]</p>}
        {activeTab === 'chest' && <p>[Biểu đồ Vòng ngực (chưa có data)]</p>}
      </div>
    </div>
  );
};