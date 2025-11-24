import React, { useEffect, useState } from 'react';
import { ChevronRight, Loader2, AlertCircle } from 'lucide-react';

// Import Modals (Đảm bảo đường dẫn import đúng với cấu trúc folder của bạn)
import GroupFoodListModal from './GroupFoodListModal';
import FoodDetailModal from './FoodDetailModal';

// Import Types
import { FoodGroup, FoodItem } from '../../types/nutrition';

// Cấu hình URL API
const API_BASE_URL = 'http://localhost:8080/api/food-classification';

// --- ĐỊNH NGHĨA INTERFACE CHO DỮ LIỆU ---
interface SubGroupItem {
  id: number;
  name: string;
  nameEn?: string;
  desc?: string;
  healthy: 'healthy' | 'moderate' | 'unhealthy';
  icon?: string;       // Có thể null nếu backend chưa gửi
  color_class?: string; // Có thể null
}

interface ParentGroup {
  id: number;
  name: string;
  icon: string;
  color_class: string; // Backend đã fix để trả về trường này
  items: SubGroupItem[];
}

const IntermediateLevelView: React.FC = () => {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [groups, setGroups] = useState<ParentGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- STATE QUẢN LÝ MODAL ---
  const [selectedSubGroup, setSelectedSubGroup] = useState<FoodGroup | null>(null);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  // --- FETCH DỮ LIỆU TỪ API ---
  useEffect(() => {
    const fetchIntermediateGroups = async () => {
      try {
        setIsLoading(true);
        // Gọi API lấy nhóm trung cấp
        const response = await fetch(`${API_BASE_URL}/intermediate-groups`);
        
        if (!response.ok) {
          throw new Error('Không thể kết nối đến máy chủ');
        }

        const data = await response.json();
        
        if (data.success && Array.isArray(data.groups)) {
          setGroups(data.groups);
        } else {
          // Fallback nếu API trả về lỗi logic
          setGroups([]); 
          console.warn("Dữ liệu trả về không đúng định dạng:", data);
        }
      } catch (err) {
        console.error("Lỗi fetch groups:", err);
        setError("Không tải được dữ liệu. Vui lòng kiểm tra kết nối Server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchIntermediateGroups();
  }, []);

  // --- XỬ LÝ SỰ KIỆN CLICK ---
  const handleSubGroupClick = (subItem: SubGroupItem, parentGroup: ParentGroup) => {
    // Chuyển đổi dữ liệu SubGroup thành dạng FoodGroup để Modal hiểu
    // Ưu tiên dùng màu/icon của con, nếu không có thì lấy của cha
    const mappedGroup: FoodGroup = {
      id: subItem.id,
      name: subItem.name,
      icon: subItem.icon || parentGroup.icon || '🍽️',
      color_class: subItem.color_class || parentGroup.color_class || 'bg-gray-100 text-gray-700',
      hover: '' // Không quan trọng trong modal
    };
    setSelectedSubGroup(mappedGroup);
  };

  // --- RENDER LOADING ---
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-3">
        <Loader2 className="animate-spin text-teal-500" size={40} />
        <p className="text-gray-500 font-medium">Đang tải dữ liệu phân loại...</p>
      </div>
    );
  }

  // --- RENDER ERROR ---
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-red-500 bg-red-50 rounded-xl border border-red-200 p-6">
        <AlertCircle size={40} className="mb-2" />
        <p className="font-bold">Đã xảy ra lỗi!</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  // --- RENDER CHÍNH ---
  return (
    <div className="animate-fade-in min-h-[500px]">
      
      {/* Grid layout cho các nhóm Cha (Level 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {groups.map((group) => {
          // [FIX] Xử lý an toàn cho color_class để tránh lỗi .split() undefined
          // Nếu group.color_class null/undefined -> dùng mặc định 'bg-gray-100'
          const safeColorClass = group.color_class || 'bg-gray-100 text-gray-800 border-gray-200';
          
          // Lấy class nền (ví dụ: bg-red-100) để làm màu header nhạt
          const bgBaseClass = safeColorClass.split(' ')[0] || 'bg-gray-100';

          return (
            <div 
              key={group.id} 
              className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              {/* Header của nhóm Cha */}
              <div className={`px-6 py-4 border-b-2 border-gray-100 flex justify-between items-center ${bgBaseClass} bg-opacity-30`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl drop-shadow-sm">{group.icon}</span>
                  <h3 className="font-bold text-gray-800 text-lg">{group.name}</h3>
                </div>
                <span className="text-xs bg-white/90 backdrop-blur px-3 py-1 rounded-full font-bold shadow-sm text-gray-600 border border-gray-100">
                  {group.items.length} loại
                </span>
              </div>

              {/* Danh sách các nhóm Con (Level 2) */}
              <div className="divide-y divide-gray-50 flex-1">
                {group.items.length > 0 ? (
                  group.items.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => handleSubGroupClick(item, group)}
                      className="px-6 py-4 hover:bg-teal-50 transition-colors duration-200 flex items-start justify-between group cursor-pointer relative"
                    >
                      {/* Hover indicator line */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="flex-1 pr-4">
                        <div className="font-semibold text-gray-800 group-hover:text-teal-700 flex items-center flex-wrap gap-2 mb-1 transition-colors">
                          {item.name}
                          
                          {/* Chỉ thị màu sắc sức khỏe (Badge nhỏ gọn) */}
                          {item.healthy === 'healthy' && (
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" title="Khuyên dùng"></span>
                            </span>
                          )}
                          {item.healthy === 'moderate' && (
                            <span className="h-2 w-2 rounded-full bg-yellow-500 shadow-sm" title="Ăn vừa phải"/>
                          )}
                          {item.healthy === 'unhealthy' && (
                            <span className="h-2 w-2 rounded-full bg-red-500 shadow-sm" title="Hạn chế"/>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {item.desc || 'Bấm để xem danh sách thực phẩm...'}
                        </p>
                      </div>
                      <ChevronRight 
                        size={18} 
                        className="text-gray-300 group-hover:text-teal-500 transition-colors shrink-0 mt-1" 
                      />
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-400 text-sm italic">
                    Chưa có nhóm phụ nào được cập nhật.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend / Chú thích màu sắc */}
      <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm p-6 mb-8">
        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          🎨 Hướng dẫn chọn thực phẩm
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100 transition hover:shadow-sm">
            <span className="w-4 h-4 rounded-full bg-emerald-500 shrink-0 shadow-sm ring-2 ring-white" />
            <div>
              <div className="font-bold text-emerald-800 text-sm">Khuyên dùng (Healthy)</div>
              <div className="text-xs text-emerald-600 mt-0.5">Giàu dinh dưỡng, tốt cho cơ bắp & sức khỏe.</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100 transition hover:shadow-sm">
            <span className="w-4 h-4 rounded-full bg-yellow-500 shrink-0 shadow-sm ring-2 ring-white" />
            <div>
              <div className="font-bold text-yellow-800 text-sm">Vừa phải (Moderate)</div>
              <div className="text-xs text-yellow-600 mt-0.5">Ăn đủ lượng cần thiết, kiểm soát calo đầu vào.</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100 transition hover:shadow-sm">
            <span className="w-4 h-4 rounded-full bg-red-500 shrink-0 shadow-sm ring-2 ring-white" />
            <div>
              <div className="font-bold text-red-800 text-sm">Hạn chế (Unhealthy)</div>
              <div className="text-xs text-red-600 mt-0.5">Chứa nhiều đường, chất béo xấu hoặc calo rỗng.</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      
      {/* Modal 1: Danh sách món ăn trong nhóm con */}
      {selectedSubGroup && (
        <GroupFoodListModal 
          group={selectedSubGroup} 
          onClose={() => setSelectedSubGroup(null)} 
          onSelectFood={(food) => setSelectedFood(food)} 
        />
      )}

      {/* Modal 2: Chi tiết dinh dưỡng của món ăn */}
      {selectedFood && (
        <FoodDetailModal 
          food={selectedFood} 
          onClose={() => setSelectedFood(null)} 
        />
      )}

    </div>
  );
}

export default IntermediateLevelView;