import React, { useState } from 'react';
import { Leaf, Activity, ShieldCheck, ChevronUp, ChevronDown, Info } from 'lucide-react';
import BasicLevelView from '../../components/LibraryFood/BasicLevelView';
import IntermediateLevelView from '../../components/LibraryFood/IntermediateLevelView';
import AdvancedLevelView from '../../components/LibraryFood/AdvancedLevelView';

function LibraryFood() {
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1);
  const [showIntro, setShowIntro] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. HEADER SECTION (Animation giữ nguyên) */}
        <div 
          className={`grid transition-all duration-500 ease-in-out ${
            showIntro 
              ? 'grid-rows-[1fr] opacity-100 border-b border-gray-100 mb-0' 
              : 'grid-rows-[0fr] opacity-0 border-b-0 mb-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="text-center py-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                🍎 Thư Viện Dinh Dưỡng
              </h2>
              <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                Hệ thống dữ liệu dinh dưỡng đa tầng, phù hợp từ người mới bắt đầu đến vận động viên chuyên nghiệp.
              </p>
            </div>
          </div>
        </div>

        {/* 2. STICKY TAB BAR (Đã tối ưu hóa diện tích) */}
        <div className={`sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm transition-all duration-300`}>
          {/* Sử dụng Flex Row + Relative để đặt nút bấm sang góc phải, không chiếm dòng riêng */}
          <div className="flex items-center justify-center relative px-2 py-3"> 
            
            {/* Tab Group */}
            <div className="bg-white p-1.5 rounded-xl shadow-md border border-gray-200 inline-flex">
              <TabButton 
                level={1} 
                current={activeTab} 
                onClick={setActiveTab} 
                label="Cơ bản" 
                sub="Người mới"
                icon={<Leaf size={16} />}
              />
              <TabButton 
                level={2} 
                current={activeTab} 
                onClick={setActiveTab} 
                label="Trung cấp" 
                sub="Gym / Diet"
                icon={<Activity size={16} />}
              />
              <TabButton 
                level={3} 
                current={activeTab} 
                onClick={setActiveTab} 
                label="Nâng cao" 
                sub="Chuyên gia"
                icon={<ShieldCheck size={16} />}
              />
            </div>

            {/* Toggle Button - Đặt tuyệt đối bên phải (hoặc flex-end trên mobile) */}
            {/* Thay đổi: Chỉ hiện Icon tròn nhỏ để tiết kiệm diện tích tối đa */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pr-2 sm:pr-4">
                <button 
                onClick={() => setShowIntro(!showIntro)}
                className={`
                    group flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200
                    ${showIntro 
                        ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' 
                        : 'bg-teal-50 text-teal-600 hover:bg-teal-100 ring-2 ring-teal-500/20'
                    }
                `}
                title={showIntro ? "Thu gọn giới thiệu" : "Hiện giới thiệu"}
                >
                {showIntro ? (
                    <ChevronUp size={18} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
                ) : (
                    <Info size={18} className="transition-transform duration-300 group-hover:scale-110" />
                )}
                </button>
            </div>

          </div>
        </div>

        {/* Content Area */}
        <div className="py-6">
          {activeTab === 1 && <BasicLevelView />}
          {activeTab === 2 && <IntermediateLevelView />}
          {activeTab === 3 && <AdvancedLevelView />}
        </div>

      </div>
    </div>
  );
}

// Tab Button Component (Đã tinh chỉnh padding nhỏ lại 1 chút cho gọn)
const TabButton = ({ level, current, onClick, label, sub, icon }: any) => {
  const isActive = current === level;
  return (
    <button
      onClick={() => onClick(level)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        isActive 
        ? 'bg-teal-500 text-white shadow-sm' 
        : 'bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <div className={`${isActive ? 'text-white' : 'text-gray-400'}`}>
        {icon}
      </div>
      <div className="text-left hidden sm:block"> {/* Ẩn text trên màn hình siêu nhỏ nếu cần */}
        <div className={`font-bold text-sm leading-tight ${isActive ? 'text-white' : 'text-gray-700'}`}>
          {label}
        </div>
        <div className={`text-[10px] ${isActive ? 'text-teal-100' : 'text-gray-400'}`}>
          {sub}
        </div>
      </div>
    </button>
  );
};

export default LibraryFood;