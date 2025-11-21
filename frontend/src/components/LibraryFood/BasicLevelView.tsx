import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';

// Import các Modal đã tách
import GroupFoodListModal from './GroupFoodListModal';
import FoodDetailModal from './FoodDetailModal';

// Import Types (Đảm bảo bạn đã tạo file types/nutrition.ts như hướng dẫn trước)
import { FoodGroup, FoodItem } from '../../types/nutrition'; 

const API_BASE_URL = 'http://localhost:8080/api/food-classification';

// --- DỮ LIỆU FALLBACK (Dùng khi API lỗi hoặc chưa có data) ---
const FALLBACK_GROUPS: FoodGroup[] = [
  { id: 1, name: 'Tinh bột', icon: '🍞', color_class: 'bg-orange-100 text-orange-700 border-orange-200', hover: 'hover:bg-orange-200' },
  { id: 2, name: 'Đạm', icon: '🥩', color_class: 'bg-red-100 text-red-700 border-red-200', hover: 'hover:bg-red-200' },
  { id: 3, name: 'Chất béo', icon: '🥑', color_class: 'bg-yellow-100 text-yellow-700 border-yellow-200', hover: 'hover:bg-yellow-200' },
  { id: 4, name: 'Rau', icon: '🥦', color_class: 'bg-green-100 text-green-700 border-green-200', hover: 'hover:bg-green-200' },
  { id: 5, name: 'Trái cây', icon: '🍎', color_class: 'bg-pink-100 text-pink-700 border-pink-200', hover: 'hover:bg-pink-200' },
  { id: 6, name: 'Sữa', icon: '🥛', color_class: 'bg-blue-100 text-blue-700 border-blue-200', hover: 'hover:bg-blue-200' },
  { id: 7, name: 'Đồ uống', icon: '🥤', color_class: 'bg-purple-100 text-purple-700 border-purple-200', hover: 'hover:bg-purple-200' },
  { id: 34, name: 'Món ăn chính', icon: '🍱', color_class: 'bg-amber-100 text-amber-700 border-amber-200', hover: 'hover:bg-amber-200' },
  { id: 35, name: 'TP Công nghiệp', icon: '🏭', color_class: 'bg-slate-100 text-slate-700 border-slate-200', hover: 'hover:bg-slate-200' },
  { id: 36, name: 'Ăn vặt', icon: '🍩', color_class: 'bg-rose-100 text-rose-700 border-rose-200', hover: 'hover:bg-rose-200' },
  { id: 37, name: 'Gia vị', icon: '🧂', color_class: 'bg-gray-100 text-gray-700 border-gray-200', hover: 'hover:bg-gray-200' },
];

type BasicGroupsResponse = {
  success: boolean;
  groups?: FoodGroup[];
};

const BasicLevelView: React.FC = () => {
  // --- STATE ---
  const [groups, setGroups] = useState<FoodGroup[]>(FALLBACK_GROUPS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State quản lý Modal
  const [selectedGroup, setSelectedGroup] = useState<FoodGroup | null>(null);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  // --- EFFECT ---
  useEffect(() => {
    fetchBasicGroups();
  }, []);

  // --- API CALL ---
  const fetchBasicGroups = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/basic-groups`);
      const data: BasicGroupsResponse = await response.json();

      if (data.success && data.groups) {
        // Map dữ liệu API về format chuẩn cho UI
        const formattedGroups: FoodGroup[] = data.groups.map((group) => {
          const colorClass = group.color_class || 'bg-gray-100 text-gray-700 border-gray-200';
          // Tự động tạo class hover dựa trên bg-color
          const bgClass = colorClass.split(' ').find((c) => c.startsWith('bg-')) || 'bg-gray-100';
          const hoverBgClass = bgClass.replace('-100', '-200');

          return {
            ...group,
            icon: group.icon || '🍽️',
            color_class: colorClass,
            hover: `hover:${hoverBgClass}`,
          };
        });
        setGroups(formattedGroups);
      }
    } catch (err) {
      console.error('Lỗi khi fetch basic groups:', err);
      setError('Không thể kết nối server. Đang hiển thị dữ liệu mẫu.');
      setGroups(FALLBACK_GROUPS);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in relative min-h-[500px]">
      
      {/* Thông báo lỗi (nếu có) */}
      {error && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2 text-yellow-800 text-sm">
          <Info size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        <>
         
          {/* --- DANH SÁCH NHÓM THỰC PHẨM (GRID) --- */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => setSelectedGroup(group)} // <--- SỰ KIỆN CLICK MỞ MODAL
                className={`
                  ${group.color_class} ${group.hover} 
                  border-2 rounded-2xl p-6 
                  flex flex-col items-center text-center 
                  cursor-pointer transform transition-all duration-300 
                  hover:scale-105 hover:shadow-xl active:scale-95
                `}
              >
                <div className="text-6xl mb-4 transform transition-transform duration-300 hover:scale-110">
                  {group.icon}
                </div>
                <h3 className="font-bold text-lg mb-1">{group.name}</h3>
                <span className="text-xs opacity-70 font-medium uppercase tracking-wider">
                  Bấm để xem
                </span>
              </div>
            ))}
          </div>

          
        </>
      )}

      {/* --- CÁC MODAL POPUP (Render có điều kiện) --- */}

      {/* 1. Modal Danh sách món (Hiện khi chọn Nhóm) */}
      {selectedGroup && (
        <GroupFoodListModal 
          group={selectedGroup} 
          onClose={() => setSelectedGroup(null)} 
          onSelectFood={(food) => setSelectedFood(food)} // Khi chọn món -> Mở Modal chi tiết
        />
      )}

      {/* 2. Modal Chi tiết dinh dưỡng (Hiện khi chọn Món - Đè lên trên) */}
      {selectedFood && (
        <FoodDetailModal 
          food={selectedFood} 
          onClose={() => setSelectedFood(null)} 
        />
      )}
     {/* Hướng dẫn sử dụng */}
      <div className="bg-white rounded-xl border-2 border-emerald-100 shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="bg-emerald-100 rounded-full p-3 shrink-0">
            <Info className="text-emerald-600" size={24} />
          </div>
          <div>
            <h4 className="font-bold text-gray-800 text-lg mb-2">
              📚 Hướng dẫn sử dụng Mức Cơ bản
            </h4>
            <p className="text-gray-600 leading-relaxed mb-3">
              Mức này giúp bạn làm quen với khái niệm nhóm chất dinh dưỡng cơ bản. 
              Hãy đảm bảo bữa ăn của bạn có đủ 4 nhóm chính:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-orange-500 font-bold">🍞</span>
                <strong>Tinh bột:</strong> Cung cấp năng lượng (cơm, bánh mì, khoai)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-500 font-bold">🥩</span>
                <strong>Đạm (Protein):</strong> Xây dựng cơ bắp (thịt, cá, trứng, đậu)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-500 font-bold">🥑</span>
                <strong>Chất béo:</strong> Hỗ trợ hormone và hấp thu vitamin (dầu ô liu, hạt, bơ)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500 font-bold">🥦</span>
                <strong>Rau:</strong> Cung cấp vitamin và chất xơ (rau xanh, rau củ)
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tips box */}
      <div className="mt-6 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-6 border border-teal-200">
        <h5 className="font-bold text-teal-800 mb-2 flex items-center gap-2">
          💡 Mẹo nhỏ
        </h5>
        <p className="text-teal-700 text-sm leading-relaxed">
          Một bữa ăn cân bằng thường có: <strong>1 nắm cơm (tinh bột)</strong> + 
          <strong> 1 lòng bàn tay thịt/cá (đạm)</strong> + 
          <strong> 1 chén rau</strong> + 
          <strong> ít dầu/mề tốt (béo)</strong>. Đơn giản mà hiệu quả!
        </p>
      </div>
    </div>
  );
};

export default BasicLevelView;