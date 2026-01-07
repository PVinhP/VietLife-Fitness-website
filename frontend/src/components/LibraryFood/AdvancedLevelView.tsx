import React, { useState, useEffect } from 'react';
import { 
  Layers, X, Filter, Loader2, Frown, Sparkles, 
  Dumbbell, Heart, Pill, ChefHat, Clock, Leaf, 
  ShieldAlert, Zap, Utensils, Flame, Info 
} from 'lucide-react';

import FoodDetailModal from './FoodDetailModal'; 
import { FoodItem } from '../../types/nutrition';

const API_BASE_URL = 'https://vietlife-fitness-website-host.onrender.com/api/food-classification';

interface FilterState {
  fitness: string[];
  health: string[];
  vitamin_mineral: string[];
  eastern: string[];
  cooking: string[];
  taste: string[];
  occasion: string[];
  allergen: string[];
  nutrition: string[];
  diet: string[];
  nova: string[];
}

function AdvancedLevelView() {
  const [availableFilters, setAvailableFilters] = useState<FilterState>({
    fitness: [], health: [], vitamin_mineral: [], eastern: [],
    cooking: [], taste: [], occasion: [],
    allergen: [], nutrition: [], diet: [], nova: []
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  
  const [loadingTags, setLoadingTags] = useState(true);
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [selectedFoodDetail, setSelectedFoodDetail] = useState<FoodItem | null>(null);

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

  useEffect(() => {
    const fetchFilteredFoods = async () => {
      setLoadingFoods(true);
      try {
        const queryParams = selectedTags.length > 0 
          ? `?tags=${encodeURIComponent(selectedTags.join(','))}`
          : ''; 
        
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

    const timer = setTimeout(() => {
      fetchFilteredFoods();
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedTags]);

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
    // [LAYOUT CHÍNH] Sử dụng chiều cao cố định theo màn hình (viewport height)
    // Trừ đi khoảng 140px cho Header/Nav của web để vừa khít màn hình
    <div className="animate-fade-in h-[calc(100vh-140px)] min-h-[500px] overflow-hidden">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        
        {/* === LEFT SIDEBAR: CUỘN ĐỘC LẬP === */}
        {/* h-full + overflow-y-auto: Giúp cột này cuộn riêng, không ảnh hưởng cột bên phải */}
        <div className="lg:col-span-4 h-full overflow-y-auto pr-2 pb-10 custom-scrollbar border-r border-gray-100">
          {loadingTags ? (
             <div className="flex justify-center py-10"><Loader2 className="animate-spin text-teal-500"/></div>
          ) : (
            <div className="space-y-4 pr-2">
              <h3 className="font-bold text-gray-800 text-lg sticky top-0 bg-white/95 backdrop-blur z-10 py-2 border-b mb-2 flex items-center gap-2">
                 <Filter size={20} className="text-teal-600"/> Bộ lọc chi tiết
              </h3>

              {/* 1. Nhóm Ưu tiên */}
              <FilterSection title="Vitamin & Khoáng chất" icon={<Pill size={16}/>} tags={availableFilters.vitamin_mineral} selected={selectedTags} onToggle={toggleTag} color="emerald" />
              <FilterSection title="Mục tiêu Thể hình" icon={<Dumbbell size={16}/>} tags={availableFilters.fitness} selected={selectedTags} onToggle={toggleTag} color="blue" />
              <FilterSection title="Bệnh lý & Sức khỏe" icon={<Heart size={16}/>} tags={availableFilters.health} selected={selectedTags} onToggle={toggleTag} color="rose" />
              <FilterSection title="Đông Y & Tính chất" icon={<Leaf size={16}/>} tags={availableFilters.eastern} selected={selectedTags} onToggle={toggleTag} color="indigo" />

              <div className="border-t border-gray-100"></div>

              {/* 2. Nhóm Thói quen */}
              <FilterSection title="Cách chế biến" icon={<ChefHat size={16}/>} tags={availableFilters.cooking} selected={selectedTags} onToggle={toggleTag} color="orange" />
              <FilterSection title="Vị giác & Khẩu vị" icon={<Flame size={16}/>} tags={availableFilters.taste} selected={selectedTags} onToggle={toggleTag} color="amber" />
              <FilterSection title="Thời điểm & Dịp" icon={<Clock size={16}/>} tags={availableFilters.occasion} selected={selectedTags} onToggle={toggleTag} color="teal" />

              <div className="border-t border-gray-100"></div>

              {/* 3. Nhóm Kỹ thuật */}
              <FilterSection title="Dị ứng & An toàn" icon={<ShieldAlert size={16}/>} tags={availableFilters.allergen} selected={selectedTags} onToggle={toggleTag} color="red" />
              <FilterSection title="Dinh dưỡng Vĩ mô (Macro)" icon={<Zap size={16}/>} tags={availableFilters.nutrition} selected={selectedTags} onToggle={toggleTag} color="violet" />
              
              {/* Diet & Nova */}
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                <h4 className="font-bold text-gray-500 mb-2 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Utensils size={14} /> Chế độ ăn & Lối sống
                </h4>
                <div className="space-y-3">
                   <div className="flex flex-wrap gap-2">
                    {availableFilters.diet.map(tag => (
                      <button key={tag} onClick={() => toggleTag(tag)} className={`text-xs px-2 py-1 rounded border ${selectedTags.includes(tag) ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-300'}`}>
                        {tag}
                      </button>
                    ))}
                   </div>
                   <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                    {availableFilters.nova.map(tag => (
                      <button key={tag} onClick={() => toggleTag(tag)} className={`text-xs px-2 py-1 rounded border ${selectedTags.includes(tag) ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-500 border-gray-300'}`}>
                        {tag}
                      </button>
                    ))}
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* === RIGHT SIDE: CUỘN ĐỘC LẬP === */}
        {/* h-full + overflow-y-auto: Cột này cũng cuộn riêng */}
        <div className="lg:col-span-8 h-full overflow-y-auto pb-20 custom-scrollbar">
          <div className="bg-white rounded-xl border-2 border-gray-100 shadow-sm p-6 min-h-full flex flex-col">
            
            {/* Header kết quả */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-lg shadow-md">
                   <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Kết quả tìm kiếm</h3>
                  <p className="text-sm text-gray-500">
                    {selectedTags.length > 0 
                      ? `Tìm thấy ${foods.length} món phù hợp` 
                      : 'Vui lòng chọn bộ lọc bên trái'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-teal-600">
                    {loadingFoods ? '...' : foods.length}
                </div>
              </div>
            </div>

            {/* Chips hiển thị các filter đang chọn */}
            {selectedTags.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2 items-center bg-gray-50 p-3 rounded-xl border border-gray-100 animate-slide-up sticky top-0 z-10">
                <span className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                  <Filter size={14}/> Đang chọn:
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
                  className="text-xs text-red-500 hover:text-red-700 font-bold ml-auto pl-2 uppercase tracking-wide"
                >
                  Xóa hết
                </button>
              </div>
            )}

            {/* Danh sách kết quả */}
            <div className="space-y-4 flex-1">
              {loadingFoods ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
                  <Loader2 className="animate-spin text-teal-500" size={40} />
                  <p className="animate-pulse">Đang tìm món ngon phù hợp...</p>
                </div>
              ) : foods.length > 0 ? (
                foods.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedFoodDetail(item)}
                    className="group border border-gray-100 rounded-xl p-4 hover:shadow-lg hover:border-teal-300 transition-all duration-300 bg-white cursor-pointer relative overflow-hidden flex flex-col sm:flex-row gap-4"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-teal-700 transition-colors">
                          {item.name}
                        </h4>
                        <div className="bg-orange-50 px-2 py-1 rounded-lg border border-orange-100 text-orange-600 font-bold text-xs flex flex-col items-center leading-tight">
                           <span className="text-sm">{item.calories}</span>
                           <span className="text-[9px] opacity-70">KCAL</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3 pr-8">
                        {item.description || 'Chưa có mô tả chi tiết.'}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {(item.tags || []).slice(0, 6).map((tag: any, idx: number) => (
                          <span 
                            key={idx} 
                            className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                              selectedTags.includes(tag) 
                                ? 'bg-teal-600 text-white border-teal-600 font-medium shadow-sm' 
                                : 'bg-gray-100 text-gray-600 border-transparent'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                        {(item.tags || []).length > 6 && (
                           <span className="text-[10px] text-gray-400 px-1 py-0.5 font-medium">
                             +{(item.tags || []).length - 6}
                           </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 flex flex-col items-center">
                  <div className="bg-gray-50 p-6 rounded-full mb-4">
                    <Info size={48} className="text-gray-300" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">
                    {selectedTags.length > 0 ? "Không tìm thấy kết quả" : "Bắt đầu tìm kiếm"}
                  </h4>
                  <p className="text-gray-500 mb-6 max-w-xs mx-auto text-sm">
                    {selectedTags.length > 0 
                      ? "Chưa có món nào khớp với TẤT CẢ tiêu chí bạn chọn."
                      : "Chọn các thẻ bên trái để chúng tôi gợi ý món ăn."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {selectedFoodDetail && (
        <FoodDetailModal 
          food={selectedFoodDetail} 
          onClose={() => setSelectedFoodDetail(null)} 
        />
      )}
    </div>
  );
}

// Sub-component: Filter Section
const FilterSection = ({ title, tags, selected, onToggle, color, icon }: any) => {
  const colorStyles: any = {
    blue: { active: 'bg-blue-100 text-blue-800 border-blue-300', hover: 'hover:border-blue-300 hover:bg-blue-50' },
    emerald: { active: 'bg-emerald-100 text-emerald-800 border-emerald-300', hover: 'hover:border-emerald-300 hover:bg-emerald-50' },
    teal: { active: 'bg-teal-100 text-teal-800 border-teal-300', hover: 'hover:border-teal-300 hover:bg-teal-50' },
    rose: { active: 'bg-rose-100 text-rose-800 border-rose-300', hover: 'hover:border-rose-300 hover:bg-rose-50' },
    orange: { active: 'bg-orange-100 text-orange-800 border-orange-300', hover: 'hover:border-orange-300 hover:bg-orange-50' },
    amber: { active: 'bg-amber-100 text-amber-800 border-amber-300', hover: 'hover:border-amber-300 hover:bg-amber-50' },
    indigo: { active: 'bg-indigo-100 text-indigo-800 border-indigo-300', hover: 'hover:border-indigo-300 hover:bg-indigo-50' },
    violet: { active: 'bg-violet-100 text-violet-800 border-violet-300', hover: 'hover:border-violet-300 hover:bg-violet-50' },
    red: { active: 'bg-red-100 text-red-800 border-red-300', hover: 'hover:border-red-300 hover:bg-red-50' },
  };

  const style = colorStyles[color] || colorStyles.blue;

  if (!tags || tags.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all">
      <h4 className="font-bold text-gray-700 mb-3 text-xs uppercase tracking-wider flex items-center gap-2 border-b pb-2 border-gray-50">
        {icon} {title}
      </h4>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag: string) => (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-all border font-medium ${
              selected.includes(tag)
                ? `${style.active} shadow-sm ring-1 ring-offset-1 ring-white`
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