import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Flame, Info } from 'lucide-react';
import { FoodItem } from '../../types/nutrition';

// Định nghĩa URL API Nutrition
const NUTRITION_API_URL = 'http://localhost:8080/api/nutrition';

interface Props {
  food: FoodItem | null;
  onClose: () => void;
}

const FoodDetailModal: React.FC<Props> = ({ food: initialFood, onClose }) => {
  const [foodDetails, setFoodDetails] = useState<FoodItem | null>(initialFood);
  const [loading, setLoading] = useState<boolean>(false);

  // 1. Khóa cuộn trang khi mở Modal
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // 2. Fetch dữ liệu từ NutritionRoute khi Modal mở
  useEffect(() => {
    if (initialFood?.id) {
      setLoading(true);
      fetch(`${NUTRITION_API_URL}/foods/${initialFood.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.food) {
            setFoodDetails(data.food); // Cập nhật dữ liệu chi tiết từ server
          }
        })
        .catch(err => console.error("Lỗi tải chi tiết món:", err))
        .finally(() => setLoading(false));
    }
  }, [initialFood]);

  if (!initialFood) return null;

  const displayFood = foodDetails || initialFood;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-teal-600 p-6 text-white relative">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition"
          >
            <X size={24} />
          </button>
          <h3 className="text-2xl font-bold pr-8">{displayFood.name}</h3>
          <p className="opacity-90 text-sm mt-1">
            {displayFood.description || 'Thông tin dinh dưỡng chi tiết'}
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          
          {loading ? (
             <div className="text-center py-8">
               <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mb-2"></div>
               <p className="text-gray-500 text-sm">Đang cập nhật số liệu...</p>
             </div>
          ) : (
            <>
              {/* Calories Badge */}
              <div className="flex justify-center mb-8">
                <div className="bg-orange-50 text-orange-600 border-2 border-orange-100 px-6 py-3 rounded-full flex items-center gap-2 shadow-sm transform transition hover:scale-105">
                  <Flame size={24} fill="currentColor" />
                  <span className="text-3xl font-bold">{displayFood.calories}</span>
                  <div className="flex flex-col text-left leading-tight">
                    <span className="text-xs font-bold uppercase">Kcal</span>
                    <span className="text-[10px] opacity-80">/ 100g</span>
                  </div>
                </div>
              </div>

              {/* Macros Grid */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <MacroCard 
                  label="Đạm" 
                  value={displayFood.protein_g} 
                  color="red" 
                  unit="g"
                />
                <MacroCard 
                  label="Tinh bột & Đường" 
                  value={displayFood.carbs_g} 
                  color="yellow" 
                  unit="g"
                />
                <MacroCard 
                  label="Béo" 
                  value={displayFood.fats_g} 
                  color="blue" 
                  unit="g"
                />
              </div>

              {/* Extra Info */}
              <div className="mt-6 grid grid-cols-1 gap-3">
                 <div className="bg-green-50 p-3 rounded-xl border border-green-100 flex items-center justify-between px-4">
                    <span className="text-green-700 font-medium flex items-center gap-2 text-sm">
                       <Info size={18} /> Chất xơ (Fiber)
                    </span>
                    <span className="text-lg font-bold text-gray-800">{displayFood.fiber_g}g</span>
                 </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

// Component con để hiển thị ô Macro cho gọn code
const MacroCard = ({ label, value, color, unit }: any) => {
  const colorClasses: any = {
    red: 'bg-red-50 border-red-100 text-red-500',
    yellow: 'bg-yellow-50 border-yellow-100 text-yellow-600',
    blue: 'bg-blue-50 border-blue-100 text-blue-500',
  };

  return (
    <div className={`${colorClasses[color]} p-4 rounded-2xl border hover:shadow-md transition duration-200`}>
      <p className="text-xs font-bold uppercase mb-1 opacity-80">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}<span className="text-sm font-normal text-gray-500">{unit}</span></p>
    </div>
  );
};

export default FoodDetailModal;