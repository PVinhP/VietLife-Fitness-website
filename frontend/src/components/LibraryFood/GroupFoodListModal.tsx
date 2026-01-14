import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Utensils, Search, Frown } from 'lucide-react';
import { FoodGroup, FoodItem } from '../../types/nutrition';

const API_BASE_URL = 'http://localhost:8080/api/food-classification';

interface Props {
  group: FoodGroup | null;
  onClose: () => void;
  onSelectFood: (food: FoodItem) => void;
}

const GroupFoodListModal: React.FC<Props> = ({ group, onClose, onSelectFood }) => {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Khóa cuộn trang web khi modal mở
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // 2. Fetch dữ liệu khi chọn nhóm
  useEffect(() => {
    if (group?.id) {
      setLoading(true);
      setSearchTerm(''); // Reset từ khóa tìm kiếm
      fetch(`${API_BASE_URL}/foods?groupId=${group.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setFoods(data.foods);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [group]);

  // 3. Logic lọc món ăn (Client-side filtering)
  const filteredFoods = foods.filter(food => 
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!group) return null;

  // Xử lý màu nền header và border focus
  const headerBgClass = group.color_class?.split(' ')[0] || 'bg-gray-100';
  const borderFocusClass = group.color_class?.includes('orange') ? 'focus:border-orange-400 focus:ring-orange-100' :
                           group.color_class?.includes('red') ? 'focus:border-red-400 focus:ring-red-100' :
                           group.color_class?.includes('green') ? 'focus:border-green-400 focus:ring-green-100' :
                           'focus:border-teal-400 focus:ring-teal-100';

  // --- NỘI DUNG MODAL ---
  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose} 
    >
      <div 
        // SỬ DỤNG h-[80vh] ĐỂ CỐ ĐỊNH CHIỀU CAO
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col animate-scale-up overflow-hidden"
        onClick={(e) => e.stopPropagation()} 
      >
        
        {/* --- HEADER (Phần cố định) --- */}
        <div className={`px-6 pt-6 pb-4 border-b ${headerBgClass} flex flex-col gap-4 shrink-0`}>
          
          {/* Title Row */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <span className="text-4xl drop-shadow-md">{group.icon}</span>
              <div>
                 <h3 className="text-xl font-bold text-gray-800">Nhóm: {group.name}</h3>
                 <p className="text-sm text-gray-600 font-medium opacity-80">
                   {loading ? 'Đang tải...' : `${foods.length} món ăn`}
                 </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 bg-white/60 hover:bg-white hover:text-red-500 rounded-full transition shadow-sm"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input 
              type="text" 
              placeholder={`Tìm trong ${group.name.toLowerCase()}...`}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-white/50 bg-white/80 backdrop-blur placeholder-gray-400 text-gray-700 outline-none transition-all ${borderFocusClass}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* --- BODY LIST (Phần cuộn) --- */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50">
          
          {/* 1. Loading State */}
          {loading && (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
               <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mb-3"></div>
               <p>Đang tải danh sách...</p>
            </div>
          )}

          {/* 2. Empty Data State */}
          {!loading && foods.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl mx-4">
               <p>Chưa có dữ liệu cho nhóm này.</p>
            </div>
          )}

          {/* 3. No Search Results State */}
          {!loading && foods.length > 0 && filteredFoods.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
               <Frown size={48} className="mb-3 opacity-50"/>
               <p>Không tìm thấy món nào tên "{searchTerm}"</p>
            </div>
          )}

          {/* 4. List Items Grid */}
          {!loading && filteredFoods.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
              {filteredFoods.map((food) => (
                <div 
                  key={food.id}
                  onClick={() => onSelectFood(food)}
                  className="flex items-center justify-between p-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-teal-400 hover:shadow-md hover:bg-teal-50 cursor-pointer transition-all duration-200 group relative overflow-hidden"
                >
                  {/* Hover stripe effect */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="pl-2 overflow-hidden">
                    <h4 className="font-bold text-gray-800 group-hover:text-teal-700 text-base mb-1 truncate">
                      {food.name}
                    </h4>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 group-hover:bg-teal-100 group-hover:text-teal-700">
                      {food.calories} Kcal
                    </span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-full group-hover:bg-white shadow-sm shrink-0">
                    <Utensils size={18} className="text-gray-400 group-hover:text-teal-500"/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* --- FOOTER (Phần cố định dưới cùng) --- */}
        {!loading && (
          <div className="p-3 bg-gray-50 border-t text-center text-xs text-gray-400 shrink-0">
            Hiển thị {filteredFoods.length} / {foods.length} món
          </div>
        )}

      </div>
    </div>
  );

  // Dùng Portal để render ra ngoài body
  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

export default GroupFoodListModal;