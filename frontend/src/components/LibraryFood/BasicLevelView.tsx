import React, { useState, useEffect, useRef } from 'react';
// 1. Import thêm các icon từ lucide-react thay thế cho Emoji
import { 
  Info, Search, Loader2, XCircle, 
  Wheat, Drumstick, Droplets, Salad, Apple, Milk, 
  CupSoda, Utensils, Factory, Cookie, ChefHat, Pizza 
} from 'lucide-react';

import GroupFoodListModal from './GroupFoodListModal';
import FoodDetailModal from './FoodDetailModal';
import { FoodGroup, FoodItem } from '../../types/nutrition'; 

const API_BASE_URL = 'http://localhost:8080/api/food-classification';

// 2. Tạo một hàm helper để lấy Icon dựa trên ID nhóm
// Cách này an toàn nhất, dù API có trả về icon lỗi thì FE vẫn hiển thị đúng icon đẹp
const getGroupIcon = (id: number) => {
  switch (id) {
    case 1: return <Wheat size={40} strokeWidth={1.5} />;       // Tinh bột
    case 2: return <Drumstick size={40} strokeWidth={1.5} />;   // Đạm
    case 3: return <Droplets size={40} strokeWidth={1.5} />;    // Chất béo
    case 4: return <Salad size={40} strokeWidth={1.5} />;       // Rau
    case 5: return <Apple size={40} strokeWidth={1.5} />;       // Trái cây
    case 6: return <Milk size={40} strokeWidth={1.5} />;        // Sữa
    case 7: return <CupSoda size={40} strokeWidth={1.5} />;     // Đồ uống
    case 34: return <Utensils size={40} strokeWidth={1.5} />;   // Món chính
    case 35: return <Factory size={40} strokeWidth={1.5} />;    // TP Công nghiệp
    case 36: return <Cookie size={40} strokeWidth={1.5} />;     // Ăn vặt
    case 37: return <ChefHat size={40} strokeWidth={1.5} />;    // Gia vị
    default: return <Pizza size={40} strokeWidth={1.5} />;      // Mặc định
  }
};

// --- DỮ LIỆU FALLBACK (Đã bỏ thuộc tính icon cứng) ---
const FALLBACK_GROUPS: FoodGroup[] = [
  { id: 1, name: 'Tinh bột', icon: '', color_class: 'bg-orange-100 text-orange-700 border-orange-200', hover: 'hover:bg-orange-200' },
  { id: 2, name: 'Đạm', icon: '', color_class: 'bg-red-100 text-red-700 border-red-200', hover: 'hover:bg-red-200' },
  { id: 3, name: 'Chất béo', icon: '', color_class: 'bg-yellow-100 text-yellow-700 border-yellow-200', hover: 'hover:bg-yellow-200' },
  { id: 4, name: 'Rau', icon: '', color_class: 'bg-green-100 text-green-700 border-green-200', hover: 'hover:bg-green-200' },
  { id: 5, name: 'Trái cây', icon: '', color_class: 'bg-pink-100 text-pink-700 border-pink-200', hover: 'hover:bg-pink-200' },
  { id: 6, name: 'Sữa', icon: '', color_class: 'bg-blue-100 text-blue-700 border-blue-200', hover: 'hover:bg-blue-200' },
  { id: 7, name: 'Đồ uống', icon: '', color_class: 'bg-purple-100 text-purple-700 border-purple-200', hover: 'hover:bg-purple-200' },
  { id: 34, name: 'Món ăn chính', icon: '', color_class: 'bg-amber-100 text-amber-700 border-amber-200', hover: 'hover:bg-amber-200' },
  { id: 35, name: 'TP Công nghiệp', icon: '', color_class: 'bg-slate-100 text-slate-700 border-slate-200', hover: 'hover:bg-slate-200' },
  { id: 36, name: 'Ăn vặt', icon: '', color_class: 'bg-rose-100 text-rose-700 border-rose-200', hover: 'hover:bg-rose-200' },
  { id: 37, name: 'Gia vị', icon: '', color_class: 'bg-gray-100 text-gray-700 border-gray-200', hover: 'hover:bg-gray-200' },
];

const BasicLevelView: React.FC = () => {
  const [groups, setGroups] = useState<FoodGroup[]>(FALLBACK_GROUPS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const [selectedGroup, setSelectedGroup] = useState<FoodGroup | null>(null);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBasicGroups = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/basic-groups`);
        const data = await response.json();
        if (data.success && data.groups) {
          const formattedGroups = data.groups.map((group: any) => {
            const colorClass = group.color_class || 'bg-gray-100 text-gray-700 border-gray-200';
            const bgClass = colorClass.split(' ').find((c: string) => c.startsWith('bg-')) || 'bg-gray-100';
            const hoverBgClass = bgClass.replace('-100', '-200');
            // Bỏ qua icon từ API, ta sẽ dùng icon từ FE map theo ID
            return { ...group, icon: '', color_class: colorClass, hover: `hover:${hoverBgClass}` };
          });
          setGroups(formattedGroups);
        }
      } catch (err) {
        console.error(err);
        setGroups(FALLBACK_GROUPS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBasicGroups();
  }, []);

  // ... (Giữ nguyên phần xử lý click outside và search debounce của bạn) ...
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 1) {
        setIsSearching(true);
        setShowDropdown(true);
        try {
          const response = await fetch(`${API_BASE_URL}/foods?search=${encodeURIComponent(searchTerm)}`);
          const data = await response.json();
          if (data.success) {
            setSearchResults(data.foods);
          } else {
            setSearchResults([]);
          }
        } catch (error) {
          console.error("Lỗi tìm kiếm:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="animate-fade-in relative min-h-[500px]">
      
      {/* --- THANH TÌM KIẾM --- */}
      <div className="max-w-2xl mx-auto mb-10 relative z-30" ref={searchRef}>
        <div className="relative">
            {/* ... (Giữ nguyên Input) ... */}
            <input
            type="text"
            placeholder="Tìm nhanh món ăn (VD: Phở, Cơm tấm, Táo...)"
            className="w-full pl-12 pr-10 py-4 rounded-full border-2 border-teal-100 bg-white shadow-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-50 focus:outline-none transition-all text-gray-700 placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm.length > 1 && setShowDropdown(true)}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-500" size={22} />
          
          {searchTerm && (
            <button 
              onClick={() => { setSearchTerm(''); setSearchResults([]); setShowDropdown(false); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
            >
              <XCircle size={20} />
            </button>
          )}
        </div>

        {/* --- DROPDOWN KẾT QUẢ --- */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-h-[400px] overflow-y-auto animate-slide-up custom-scrollbar">
            {isSearching ? (
              <div className="p-6 text-center text-gray-500 flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-teal-500" size={24} />
                <span>Đang tìm món ngon...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <ul>
                {searchResults.map((food) => (
                  <li 
                    key={food.id}
                    onClick={() => {
                      setSelectedFood(food);
                      setShowDropdown(false);
                    }}
                    className="px-6 py-3 hover:bg-teal-50 cursor-pointer flex justify-between items-center group border-b border-gray-50 last:border-0 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Utensils size={18} className="text-gray-400" /> 
                      <div>
                        <div className="font-bold text-gray-700 group-hover:text-teal-700">{food.name}</div>
                        <div className="text-xs text-gray-400">Click để xem dinh dưỡng</div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-orange-500 bg-orange-50 px-2 py-1 rounded-lg group-hover:bg-white">
                      {food.calories} Kcal
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-gray-400">
                Không tìm thấy món nào tên "{searchTerm}" 😓
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- LOADING GRID --- */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        <>
          {/* --- GRID DANH SÁCH NHÓM THỰC PHẨM (ĐÃ UPDATE ICON) --- */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => setSelectedGroup(group)}
                className={`
                  ${group.color_class} ${group.hover} 
                  border-2 rounded-2xl p-6 
                  flex flex-col items-center text-center 
                  cursor-pointer transform transition-all duration-300 
                  hover:scale-105 hover:shadow-xl active:scale-95
                  group
                `}
              >
                {/* 3. Gọi hàm getGroupIcon tại đây thay vì render text */}
                <div className="mb-4 transform transition-transform duration-300 group-hover:scale-110">
                  {getGroupIcon(group.id)}
                </div>
                <h3 className="font-bold text-lg mb-1">{group.name}</h3>
                <span className="text-xs opacity-70 font-medium uppercase tracking-wider">
                  Bấm để xem
                </span>
              </div>
            ))}
          </div>

          {/* Hướng dẫn sử dụng (Cập nhật icon nhỏ) */}
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
                    <span className="text-orange-500"><Wheat size={18} /></span>
                    <strong>Tinh bột:</strong> Cung cấp năng lượng (cơm, bánh mì, khoai)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-500"><Drumstick size={18} /></span>
                    <strong>Đạm (Protein):</strong> Xây dựng cơ bắp (thịt, cá, trứng, đậu)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-500"><Droplets size={18} /></span>
                    <strong>Chất béo:</strong> Hỗ trợ hormone và hấp thu vitamin (dầu, hạt, bơ)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500"><Salad size={18} /></span>
                    <strong>Rau:</strong> Cung cấp vitamin và chất xơ (rau xanh, rau củ)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tips box - Giữ nguyên */}
          <div className="mt-6 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-6 border border-teal-200">
            <h5 className="font-bold text-teal-800 mb-2 flex items-center gap-2">
              💡 Mẹo nhỏ
            </h5>
            <p className="text-teal-700 text-sm leading-relaxed">
              Một bữa ăn cân bằng thường có: <strong>1 nắm cơm (tinh bột)</strong> + 
              <strong> 1 lòng bàn tay thịt/cá (đạm)</strong> + 
              <strong> 1 chén rau</strong> + 
              <strong> ít dầu/mỡ tốt (béo)</strong>. Đơn giản mà hiệu quả!
            </p>
          </div>
        </>
      )}

      {/* --- MODALS --- */}
      {selectedGroup && (
        <GroupFoodListModal 
          group={selectedGroup} 
          onClose={() => setSelectedGroup(null)} 
          onSelectFood={(food) => setSelectedFood(food)} 
        />
      )}

      {selectedFood && (
        <FoodDetailModal 
          food={selectedFood} 
          onClose={() => setSelectedFood(null)} 
        />
      )}
    </div>
  );
};

export default BasicLevelView;