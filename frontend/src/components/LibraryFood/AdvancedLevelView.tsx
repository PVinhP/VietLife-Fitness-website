import React, { useState, useEffect } from 'react';
import { Layers, X, Filter, Loader2, Frown } from 'lucide-react';

// Import Modal chi tiết món ăn (để xem được Calories, Macro...)
import FoodDetailModal from './FoodDetailModal'; 
import { FoodItem } from '../../types/nutrition';

const API_BASE_URL = 'http://localhost:8080/api/food-classification';

interface FilterState {
  functional: string[];
  diet: string[];
  nova: string[];
}

function AdvancedLevelView() {
  // --- STATE ---
  // Danh sách tags load từ API
  const [availableFilters, setAvailableFilters] = useState<FilterState>({ functional: [], diet: [], nova: [] });
  // Các tags người dùng đang chọn
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  // Danh sách món ăn kết quả
  const [foods, setFoods] = useState<FoodItem[]>([]);
  
  const [loadingTags, setLoadingTags] = useState(true);
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [selectedFoodDetail, setSelectedFoodDetail] = useState<FoodItem | null>(null);

  // --- 1. FETCH DANH SÁCH TAGS (Lúc mới vào trang) ---
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/tags`);
        const data = await res.json();
        if (data.success) {
          setAvailableFilters(data.filters);
        }
      } catch (error) {
        console.error("Lỗi tải tags:", error);
      } finally {
        setLoadingTags(false);
      }
    };
    fetchTags();
  }, []);

  // --- 2. FETCH MÓN ĂN (Khi selectedTags thay đổi) ---
  useEffect(() => {
    const fetchFilteredFoods = async () => {
      setLoadingFoods(true);
      try {
        // Tạo query string: ?tags=High-protein,EatClean
        const queryParams = selectedTags.length > 0 
          ? `?tags=${encodeURIComponent(selectedTags.join(','))}`
          : ''; // Nếu không chọn tag nào thì lấy tất cả (hoặc rỗng tuỳ logic backend, ở đây backend sẽ limit 100 món)
        
        const res = await fetch(`${API_BASE_URL}/foods${queryParams}`);
        const data = await res.json();
        
        if (data.success) {
          setFoods(data.foods);
        } else {
          setFoods([]);
        }
      } catch (error) {
        console.error("Lỗi lọc món ăn:", error);
        setFoods([]);
      } finally {
        setLoadingFoods(false);
      }
    };

    // Debounce nhỏ để tránh spam API khi click nhanh
    const timer = setTimeout(() => {
      fetchFilteredFoods();
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedTags]);

  // --- HANDLERS ---
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const clearAllFilters = () => {
    setSelectedTags([]);
  };

  return (
    <div className="animate-fade-in min-h-[600px]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* === LEFT SIDEBAR: BỘ LỌC === */}
        <div className="lg:col-span-4 space-y-6">
          {loadingTags ? (
             <div className="flex justify-center py-10"><Loader2 className="animate-spin text-teal-500"/></div>
          ) : (
            <>
              <FilterSection 
                title="🎯 Mục tiêu Dinh dưỡng" 
                tags={availableFilters.functional} 
                selected={selectedTags} 
                onToggle={toggleTag} 
                color="blue" 
              />
              <FilterSection 
                title="🥗 Chế độ ăn (Diet)" 
                tags={availableFilters.diet} 
                selected={selectedTags} 
                onToggle={toggleTag} 
                color="emerald" 
              />
              <FilterSection 
                title="🍭 Mức độ chế biến (NOVA)" 
                tags={availableFilters.nova} 
                selected={selectedTags} 
                onToggle={toggleTag} 
                color="purple" 
              />
            </>
          )}
        </div>

        {/* === RIGHT SIDE: KẾT QUẢ === */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg p-6 min-h-[600px] flex flex-col">
            
            {/* Header kết quả */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 text-teal-600 rounded-lg">
                   <Layers size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Kết quả phân tích</h3>
                  <p className="text-sm text-gray-500">
                    {selectedTags.length > 0 
                      ? `Đang lọc theo ${selectedTags.length} tiêu chí` 
                      : 'Hiển thị tất cả thực phẩm phổ biến'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-teal-600">
                    {loadingFoods ? '...' : foods.length}
                </div>
                <div className="text-xs text-gray-500 font-medium">thực phẩm khớp</div>
              </div>
            </div>

            {/* Chips hiển thị các filter đang chọn */}
            {selectedTags.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2 items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                  <Filter size={14}/> Đang lọc:
                </span>
                {selectedTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className="flex items-center gap-1 bg-white border border-teal-200 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm"
                  >
                    {tag}
                    <X size={14} />
                  </button>
                ))}
                <button 
                  onClick={clearAllFilters}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold underline ml-auto pl-2"
                >
                  Xóa tất cả
                </button>
              </div>
            )}

            {/* Danh sách kết quả */}
            <div className="space-y-4 flex-1">
              {loadingFoods ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
                  <Loader2 className="animate-spin text-teal-500" size={40} />
                  <p>Đang tìm món ngon phù hợp...</p>
                </div>
              ) : foods.length > 0 ? (
                foods.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedFoodDetail(item)} // Mở Modal chi tiết
                    className="group border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-teal-300 transition-all duration-300 bg-white cursor-pointer relative overflow-hidden"
                  >
                    {/* Hover Effect Bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="flex justify-between items-start mb-3 pl-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-teal-700 transition-colors">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {item.description || 'Chưa có mô tả chi tiết'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 bg-orange-50 px-3 py-1 rounded-lg border border-orange-100">
                        <span className="text-xl font-bold text-orange-500">{item.calories}</span>
                        <span className="text-[10px] uppercase font-bold text-gray-400">Kcal</span>
                      </div>
                    </div>
                    
                    {/* Tags Badge của từng món */}
                    <div className="flex flex-wrap gap-2 pl-2">
                      {/* Hiển thị tối đa 4 tags để đỡ rối */}
                      {(item.tags || []).slice(0, 4).map((tag: any, idx: number) => (
                        <span 
                          key={idx} 
                          className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                            selectedTags.includes(tag) 
                              ? 'bg-teal-600 text-white border-teal-600 font-medium shadow-sm' 
                              : 'bg-gray-50 text-gray-500 border-gray-200'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                      {(item.tags || []).length > 4 && (
                         <span className="text-[10px] text-gray-400 px-1 py-0.5"> +{(item.tags || []).length - 4}</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 flex flex-col items-center">
                  <div className="bg-gray-50 p-6 rounded-full mb-4">
                    <Frown size={48} className="text-gray-300" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">
                    Không tìm thấy thực phẩm nào
                  </h4>
                  <p className="text-gray-500 mb-6 max-w-xs mx-auto">
                    Có vẻ như chưa có món ăn nào thỏa mãn TẤT CẢ các tiêu chí bạn chọn. Hãy thử bỏ bớt một vài bộ lọc xem sao nhé!
                  </p>
                  <button 
                    onClick={clearAllFilters}
                    className="bg-white border-2 border-teal-500 text-teal-600 hover:bg-teal-50 px-6 py-2 rounded-lg font-bold transition-colors"
                  >
                    Xóa bộ lọc & Thử lại
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CHI TIẾT */}
      {selectedFoodDetail && (
        <FoodDetailModal 
          food={selectedFoodDetail} 
          onClose={() => setSelectedFoodDetail(null)} 
        />
      )}
    </div>
  );
}

// Component phụ: Filter Section (Giữ nguyên style nhưng thêm logic loading)
const FilterSection = ({ title, tags, selected, onToggle, color }: any) => {
  // Map màu sắc cho đẹp
  const colorStyles: any = {
    blue: {
      active: 'bg-blue-100 text-blue-800 border-blue-300',
      hover: 'hover:border-blue-300 hover:bg-blue-50'
    },
    emerald: {
      active: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      hover: 'hover:border-emerald-300 hover:bg-emerald-50'
    },
    purple: {
      active: 'bg-purple-100 text-purple-800 border-purple-300',
      hover: 'hover:border-purple-300 hover:bg-purple-50'
    }
  };

  const style = colorStyles[color] || colorStyles.blue;

  if (!tags || tags.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <h4 className="font-bold text-gray-700 mb-4 text-xs uppercase tracking-wider flex items-center gap-2 border-b pb-2 border-gray-100">
        {title}
      </h4>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag: string) => (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-all border font-medium ${
              selected.includes(tag)
                ? `${style.active} shadow-sm ring-1 ring-offset-1 ring-white ring-${color}-200`
                : `bg-white text-gray-500 border-gray-200 ${style.hover}`
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdvancedLevelView;