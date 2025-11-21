import React, { useState } from 'react';
import { Leaf, Activity, ShieldCheck, Info } from 'lucide-react';
import BasicLevelView from '../../components/LibraryFood/BasicLevelView';
import IntermediateLevelView from '../../components/LibraryFood/IntermediateLevelView';
import AdvancedLevelView from '../../components/LibraryFood/AdvancedLevelView';

// Component chính - Đặt trong: frontend/src/pages/nutrition/FoodClassificationSection.tsx

function LibraryFood() {
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1);

  return (
    <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            🍎 Thư Viện Dinh Dưỡng
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hệ thống dữ liệu dinh dưỡng đa tầng, phù hợp từ người mới bắt đầu đến vận động viên chuyên nghiệp.
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-white p-2 rounded-xl shadow-lg border border-gray-200 inline-flex">
            <TabButton 
              level={1} 
              current={activeTab} 
              onClick={setActiveTab} 
              label="Cơ bản" 
              sub="Người mới"
              icon={<Leaf size={20} />}
            />
            <TabButton 
              level={2} 
              current={activeTab} 
              onClick={setActiveTab} 
              label="Trung cấp" 
              sub="Gym / Diet"
              icon={<Activity size={20} />}
            />
            <TabButton 
              level={3} 
              current={activeTab} 
              onClick={setActiveTab} 
              label="Nâng cao" 
              sub="Chuyên gia"
              icon={<ShieldCheck size={20} />}
            />
          </div>
        </div>

        {/* Content Area with smooth transition */}
        <div className="transition-all duration-300 ease-in-out">
          {activeTab === 1 && <BasicLevelView />}
          {activeTab === 2 && <IntermediateLevelView />}
          {activeTab === 3 && <AdvancedLevelView />}
        </div>

        {/* Info Footer */}
        <div className="mt-12 bg-teal-50 border border-teal-200 rounded-xl p-6 max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <Info className="text-teal-600 shrink-0 mt-1" size={24} />
            <div>
              <h4 className="font-bold text-teal-900 mb-2">💡 Gợi ý sử dụng</h4>
              <p className="text-teal-800 leading-relaxed">
                Bắt đầu với <strong>Mức Cơ bản</strong> để làm quen với 7 nhóm thực phẩm chính. 
                Tiến tới <strong>Mức Trung cấp</strong> để hiểu rõ hơn về chất lượng thực phẩm trong từng nhóm. 
                Cuối cùng, sử dụng <strong>Mức Nâng cao</strong> để lọc và lựa chọn thực phẩm theo mục tiêu cụ thể của bạn.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Tab Button Component
const TabButton = ({ level, current, onClick, label, sub, icon }: any) => {
  const isActive = current === level;
  return (
    <button
      onClick={() => onClick(level)}
      className={`flex items-center px-6 py-3 rounded-lg transition-all duration-300 ${
        isActive 
        ? 'bg-teal-500 text-white shadow-lg scale-105' 
        : 'bg-transparent text-gray-600 hover:bg-gray-50'
      }`}
    >
      <div className="mr-3">{icon}</div>
      <div className="text-left">
        <div className={`font-bold text-sm ${isActive ? 'text-white' : 'text-gray-800'}`}>
          {label}
        </div>
        <div className={`text-xs ${isActive ? 'text-teal-100' : 'text-gray-500'}`}>
          {sub}
        </div>
      </div>
    </button>
  );
};

export default LibraryFood;