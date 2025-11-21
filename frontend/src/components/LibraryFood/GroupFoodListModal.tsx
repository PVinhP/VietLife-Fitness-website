import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // <--- 1. IMPORT CÁI NÀY
import { X, Utensils } from 'lucide-react';
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

  // Khóa cuộn trang web khi modal mở
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Fetch dữ liệu
  useEffect(() => {
    if (group?.id) {
      setLoading(true);
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

  if (!group) return null;

  const headerBgClass = group.color_class?.split(' ')[0] || 'bg-gray-100';

  // --- NỘI DUNG MODAL ---
  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose} 
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-scale-up overflow-hidden"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header */}
        <div className={`p-6 flex justify-between items-center border-b ${headerBgClass}`}>
          <div className="flex items-center gap-3">
            <span className="text-4xl drop-shadow-md">{group.icon}</span>
            <div>
               <h3 className="text-xl font-bold text-gray-800">Thực phẩm nhóm: {group.name}</h3>
               <p className="text-sm text-gray-600 font-medium">Danh sách gợi ý phổ biến</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-white/60 hover:bg-red-50 hover:text-red-500 rounded-full transition duration-200 shadow-sm"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
               <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mb-3"></div>
               <p>Đang tải danh sách...</p>
            </div>
          ) : foods.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl mx-4">
               Chưa có dữ liệu thực phẩm cho nhóm này.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {foods.map((food) => (
                <div 
                  key={food.id}
                  onClick={() => onSelectFood(food)}
                  className="flex items-center justify-between p-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-teal-400 hover:shadow-md hover:bg-teal-50 cursor-pointer transition-all duration-200 group relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="pl-2">
                    <h4 className="font-bold text-gray-800 group-hover:text-teal-700 text-base mb-1">{food.name}</h4>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 group-hover:bg-teal-100 group-hover:text-teal-700">
                      {food.calories} Kcal
                    </span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-full group-hover:bg-white shadow-sm">
                    <Utensils size={18} className="text-gray-400 group-hover:text-teal-500"/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // <--- 2. DÙNG PORTAL ĐỂ ĐƯA MODAL RA BODY
  // Đảm bảo document.body tồn tại (tránh lỗi SSR nếu có dùng Next.js, còn React thường thì ok)
  if (typeof document === 'undefined') return null;
  
  return createPortal(modalContent, document.body);
};

export default GroupFoodListModal;