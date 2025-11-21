import React, { useState } from 'react';
import { Layers, X } from 'lucide-react';

// Đặt trong: frontend/src/pages/nutrition/foodClassification/AdvancedLevelView.tsx

const ADVANCED_FILTERS = {
  functional: [
    'High-protein', 'High-fiber', 'Vitamin C', 'Omega-3', 'Canxi', 'Sắt',
    'Low-carb', 'Low-fat', 'Low-calorie', 'High-calorie', 'Low GI',
    'Whole-food', 'Processed food'
  ],
  diet: [
    'EatClean', 'Keto / Low-carb', 'Mediterranean', 'High-protein', 
    'Vegan', 'Vegetarian', 'Paleo'
  ],
  nova: [
    'NOVA 1: Unprocessed', 'NOVA 2: Culinary ingredients', 
    'NOVA 3: Processed', 'NOVA 4: Ultra-processed (UPF)'
  ]
};

const FOOD_DATABASE = [
  { name: 'Ức gà', tags: ['High-protein', 'Low-fat', 'Whole-food', 'EatClean', 'NOVA 1: Unprocessed'], calo: 165, desc: 'Nguồn protein nạc tuyệt vời' },
  { name: 'Khoai lang', tags: ['High-fiber', 'Low GI', 'EatClean', 'Vegan', 'NOVA 1: Unprocessed'], calo: 86, desc: 'Tinh bột tốt, giàu vitamin A' },
  { name: 'Cá hồi', tags: ['High-protein', 'Omega-3', 'Low-carb', 'Keto / Low-carb', 'NOVA 1: Unprocessed'], calo: 208, desc: 'Giàu omega-3, tốt cho tim mạch' },
  { name: 'Xúc xích', tags: ['Processed food', 'High-calorie', 'NOVA 4: Ultra-processed (UPF)'], calo: 301, desc: 'Nên hạn chế sử dụng' },
  { name: 'Yến mạch', tags: ['High-fiber', 'Whole-food', 'Low GI', 'EatClean', 'Vegan', 'NOVA 1: Unprocessed'], calo: 389, desc: 'Ngũ cốc nguyên hạt giàu chất xơ' },
  { name: 'Đậu phụ', tags: ['High-protein', 'Vegan', 'Vegetarian', 'Low-carb', 'NOVA 1: Unprocessed'], calo: 76, desc: 'Protein thực vật hoàn chỉnh' },
  { name: 'Bơ (Avocado)', tags: ['Omega-3', 'Low-carb', 'Keto / Low-carb', 'Whole-food', 'NOVA 1: Unprocessed'], calo: 160, desc: 'Chất béo tốt, giàu kali' },
  { name: 'Trứng gà', tags: ['High-protein', 'Low-carb', 'Whole-food', 'EatClean', 'NOVA 1: Unprocessed'], calo: 155, desc: 'Protein hoàn hảo, nhiều vitamin' },
];

function AdvancedLevelView() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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

  // Logic lọc: Thực phẩm phải có TẤT CẢ các tag được chọn
  const filteredFood = selectedTags.length === 0 
    ? FOOD_DATABASE 
    : FOOD_DATABASE.filter(food => selectedTags.every(tag => food.tags.includes(tag)));

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* === SIDEBAR FILTERS === */}
        <div className="lg:col-span-4 space-y-6">
          <FilterSection 
            title="🎯 Mục tiêu Dinh dưỡng" 
            tags={ADVANCED_FILTERS.functional} 
            selected={selectedTags} 
            onToggle={toggleTag} 
            color="blue" 
          />
          <FilterSection 
            title="🥗 Chế độ ăn (Diet)" 
            tags={ADVANCED_FILTERS.diet} 
            selected={selectedTags} 
            onToggle={toggleTag} 
            color="emerald" 
          />
          <FilterSection 
            title="🍭 Mức độ chế biến (NOVA)" 
            tags={ADVANCED_FILTERS.nova} 
            selected={selectedTags} 
            onToggle={toggleTag} 
            color="purple" 
          />
        </div>

        {/* === RESULTS AREA === */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg p-6 min-h-[600px]">
            
            {/* Header kết quả */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-100">
              <div className="flex items-center gap-3">
                <Layers size={24} className="text-teal-600" />
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Kết quả phân tích</h3>
                  <p className="text-sm text-gray-500">
                    {selectedTags.length > 0 
                      ? `Đang lọc theo ${selectedTags.length} tiêu chí` 
                      : 'Hiển thị tất cả thực phẩm'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-teal-600">{filteredFood.length}</div>
                <div className="text-xs text-gray-500">thực phẩm</div>
              </div>
            </div>

            {/* Active filters chips */}
            {selectedTags.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2 items-center">
                <span className="text-sm font-semibold text-gray-600">Bộ lọc đang áp dụng:</span>
                {selectedTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className="flex items-center gap-1 bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-semibold hover:bg-teal-200 transition-colors"
                  >
                    {tag}
                    <X size={14} />
                  </button>
                ))}
                <button 
                  onClick={clearAllFilters}
                  className="text-xs text-red-600 hover:text-red-700 font-semibold underline ml-2"
                >
                  Xóa tất cả
                </button>
              </div>
            )}

            {/* Danh sách kết quả */}
            <div className="space-y-4">
              {filteredFood.length > 0 ? (
                filteredFood.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="border-2 border-gray-100 rounded-xl p-5 hover:shadow-lg hover:border-teal-200 transition-all duration-300 bg-gradient-to-r from-white to-gray-50 hover:from-teal-50 hover:to-white"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-gray-800 mb-1">{item.name}</h4>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-2xl font-bold text-red-500">{item.calo}</span>
                        <span className="text-xs text-gray-500">Calo/100g</span>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.tags.map(tag => (
                        <span 
                          key={tag} 
                          className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                            selectedTags.includes(tag) 
                              ? 'bg-teal-600 text-white border-teal-600 font-semibold' 
                              : 'bg-white text-gray-600 border-gray-300 hover:border-teal-300'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Action button */}
                    <button className="w-full mt-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-md hover:shadow-lg">
                      + Thêm vào Menu
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">
                    Không có thực phẩm nào khớp
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Thử điều chỉnh bộ lọc để tìm thấy thực phẩm phù hợp
                  </p>
                  <button 
                    onClick={clearAllFilters}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Đặt lại bộ lọc
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component phụ: Filter Section
const FilterSection = ({ title, tags, selected, onToggle, color }: any) => (
  <div className="bg-white rounded-xl border-2 border-gray-200 p-5 shadow-md hover:shadow-lg transition-shadow">
    <h4 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
      {title}
    </h4>
    <div className="flex flex-wrap gap-2">
      {tags.map((tag: string) => (
        <button
          key={tag}
          onClick={() => onToggle(tag)}
          className={`text-xs px-3 py-2 rounded-lg transition-all border-2 font-medium ${
            selected.includes(tag)
              ? `bg-${color}-100 text-${color}-800 border-${color}-300 shadow-md`
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  </div>
);

export default AdvancedLevelView;