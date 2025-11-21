// frontend/src/pages/nutrition/FoodLibrarySection.tsx

import React, { useState } from 'react';
import { 
  Search, X, Filter, ChevronDown, ChevronRight, 
  Flame, Info, Apple, Beef, Milk, Wheat 
} from 'lucide-react';

// ============= TYPES =============
interface FoodItem {
  id: number;
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number;
  water_g: number;
  groups: string[];
  tags: string[];
  description?: string;
}

interface FoodGroup {
  id: number;
  name: string;
  icon: string;
  color: string;
  children?: { id: number; name: string; }[];
}

// ============= MOCK DATA =============
const FOOD_GROUPS: FoodGroup[] = [
  { 
    id: 1, 
    name: 'Tinh bột', 
    icon: '🌾', 
    color: 'bg-orange-100 text-orange-700',
    children: [
      { id: 11, name: 'Ngũ cốc nguyên hạt' },
      { id: 12, name: 'Ngũ cốc tinh chế' },
      { id: 13, name: 'Củ giàu tinh bột' },
    ]
  },
  { 
    id: 2, 
    name: 'Đạm', 
    icon: '🥩', 
    color: 'bg-red-100 text-red-700',
    children: [
      { id: 21, name: 'Thịt đỏ' },
      { id: 22, name: 'Thịt trắng' },
      { id: 23, name: 'Cá & Hải sản' },
      { id: 24, name: 'Đạm thực vật' },
      { id: 25, name: 'Trứng' },
    ]
  },
  { 
    id: 3, 
    name: 'Chất béo', 
    icon: '🥑', 
    color: 'bg-yellow-100 text-yellow-700',
    children: [
      { id: 31, name: 'Chất béo tốt' },
      { id: 32, name: 'Chất béo không lành mạnh' },
    ]
  },
  { 
    id: 4, 
    name: 'Rau', 
    icon: '🥬', 
    color: 'bg-green-100 text-green-700',
    children: [
      { id: 41, name: 'Rau xanh lá' },
      { id: 42, name: 'Rau củ nhiều tinh bột' },
    ]
  },
  { 
    id: 5, 
    name: 'Trái cây', 
    icon: '🍎', 
    color: 'bg-pink-100 text-pink-700',
    children: [
      { id: 51, name: 'Trái cây ít đường' },
      { id: 52, name: 'Trái cây nhiều đường' },
    ]
  },
  { 
    id: 6, 
    name: 'Sữa', 
    icon: '🥛', 
    color: 'bg-blue-100 text-blue-700',
    children: [
      { id: 61, name: 'Sữa lành mạnh' },
      { id: 62, name: 'Sản phẩm sữa có đường' },
    ]
  },
];

const DIET_TAGS = [
  { value: 'eat-clean', label: 'Eat Clean', color: 'bg-green-100 text-green-700' },
  { value: 'keto', label: 'Keto', color: 'bg-purple-100 text-purple-700' },
  { value: 'vegan', label: 'Vegan', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'vegetarian', label: 'Vegetarian', color: 'bg-teal-100 text-teal-700' },
];

const NUTRITION_TAGS = [
  { value: 'high-protein', label: 'Giàu đạm', color: 'bg-red-100 text-red-700' },
  { value: 'high-fiber', label: 'Giàu chất xơ', color: 'bg-amber-100 text-amber-700' },
  { value: 'low-carb', label: 'Ít carb', color: 'bg-blue-100 text-blue-700' },
  { value: 'low-fat', label: 'Ít béo', color: 'bg-cyan-100 text-cyan-700' },
  { value: 'omega-3', label: 'Omega-3', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'low-gi', label: 'GI thấp', color: 'bg-pink-100 text-pink-700' },
];

const MOCK_FOODS: FoodItem[] = [
  { id: 1, food_name: 'Ức gà', calories: 165, protein_g: 31, carbs_g: 0, fats_g: 3.6, fiber_g: 0, water_g: 65, groups: ['Đạm', 'Thịt trắng'], tags: ['high-protein', 'low-fat', 'low-carb', 'eat-clean', 'keto'], description: 'Nguồn protein chất lượng cao, ít chất béo' },
  { id: 2, food_name: 'Cơm trắng', calories: 130, protein_g: 2.7, carbs_g: 28.2, fats_g: 0.3, fiber_g: 0.4, water_g: 68, groups: ['Tinh bột', 'Ngũ cốc tinh chế'], tags: [], description: 'Nguồn năng lượng nhanh' },
  { id: 3, food_name: 'Cá hồi', calories: 208, protein_g: 20, carbs_g: 0, fats_g: 13, fiber_g: 0, water_g: 65, groups: ['Đạm', 'Cá & Hải sản'], tags: ['high-protein', 'omega-3', 'eat-clean', 'keto'], description: 'Giàu Omega-3, tốt cho tim mạch' },
  { id: 4, food_name: 'Khoai lang', calories: 86, protein_g: 1.6, carbs_g: 20, fats_g: 0.1, fiber_g: 3, water_g: 75, groups: ['Tinh bột', 'Củ giàu tinh bột'], tags: ['high-fiber', 'low-gi', 'eat-clean', 'vegan'], description: 'Carb phức hợp, chỉ số GI thấp' },
  { id: 5, food_name: 'Bơ (quả)', calories: 160, protein_g: 2, carbs_g: 8.5, fats_g: 15, fiber_g: 6.7, water_g: 73, groups: ['Chất béo', 'Chất béo tốt'], tags: ['high-fiber', 'keto', 'vegan'], description: 'Chất béo lành mạnh, giàu chất xơ' },
  { id: 6, food_name: 'Rau muống', calories: 19, protein_g: 2.6, carbs_g: 3.1, fats_g: 0.2, fiber_g: 2.1, water_g: 92, groups: ['Rau', 'Rau xanh lá'], tags: ['high-fiber', 'vegan', 'vegetarian'], description: 'Ít calo, giàu vitamin' },
  { id: 7, food_name: 'Chuối', calories: 89, protein_g: 1.1, carbs_g: 23, fats_g: 0.3, fiber_g: 2.6, water_g: 75, groups: ['Trái cây', 'Trái cây nhiều đường'], tags: ['high-fiber', 'vegan'], description: 'Giàu kali, năng lượng nhanh' },
  { id: 8, food_name: 'Trứng gà', calories: 155, protein_g: 13, carbs_g: 1.1, fats_g: 11, fiber_g: 0, water_g: 76, groups: ['Đạm', 'Trứng'], tags: ['high-protein', 'low-carb', 'keto'], description: 'Protein hoàn chỉnh, giàu choline' },
  { id: 9, food_name: 'Sữa chua Hy Lạp', calories: 59, protein_g: 10, carbs_g: 3.6, fats_g: 0.4, fiber_g: 0, water_g: 85, groups: ['Sữa', 'Sữa lành mạnh'], tags: ['high-protein', 'low-fat', 'vegetarian'], description: 'Giàu probiotic, protein cao' },
  { id: 10, food_name: 'Yến mạch', calories: 389, protein_g: 16.9, carbs_g: 66, fats_g: 6.9, fiber_g: 10.6, water_g: 8, groups: ['Tinh bột', 'Ngũ cốc nguyên hạt'], tags: ['high-fiber', 'high-protein', 'eat-clean', 'vegan'], description: 'Carb phức hợp, giàu beta-glucan' },
  { id: 11, food_name: 'Đậu phụ', calories: 76, protein_g: 8, carbs_g: 1.9, fats_g: 4.8, fiber_g: 0.3, water_g: 84, groups: ['Đạm', 'Đạm thực vật'], tags: ['high-protein', 'low-carb', 'vegan', 'vegetarian'], description: 'Protein thực vật chất lượng cao' },
  { id: 12, food_name: 'Dâu tây', calories: 32, protein_g: 0.7, carbs_g: 7.7, fats_g: 0.3, fiber_g: 2, water_g: 91, groups: ['Trái cây', 'Trái cây ít đường'], tags: ['low-gi', 'vegan'], description: 'Ít đường, giàu vitamin C' },
];

// ============= MAIN COMPONENT =============
function Plan() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedDietTags, setSelectedDietTags] = useState<string[]>([]);
  const [selectedNutritionTags, setSelectedNutritionTags] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter logic
  const filteredFoods = MOCK_FOODS.filter(food => {
    if (searchTerm && !food.food_name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedGroups.length > 0 && !selectedGroups.some(g => food.groups.includes(g))) {
      return false;
    }
    if (selectedDietTags.length > 0 && !selectedDietTags.some(t => food.tags.includes(t))) {
      return false;
    }
    if (selectedNutritionTags.length > 0 && !selectedNutritionTags.some(t => food.tags.includes(t))) {
      return false;
    }
    return true;
  });

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupName) ? prev.filter(g => g !== groupName) : [...prev, groupName]
    );
  };

  const toggleGroupFilter = (groupName: string) => {
    setSelectedGroups(prev =>
      prev.includes(groupName) ? prev.filter(g => g !== groupName) : [...prev, groupName]
    );
  };

  const toggleDietTag = (tag: string) => {
    setSelectedDietTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleNutritionTag = (tag: string) => {
    setSelectedNutritionTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSelectedGroups([]);
    setSelectedDietTags([]);
    setSelectedNutritionTags([]);
    setSearchTerm('');
  };

  const getTagColor = (tagValue: string) => {
    const dietTag = DIET_TAGS.find(t => t.value === tagValue);
    if (dietTag) return dietTag.color;
    const nutritionTag = NUTRITION_TAGS.find(t => t.value === tagValue);
    if (nutritionTag) return nutritionTag.color;
    return 'bg-gray-100 text-gray-700';
  };

  const getTagLabel = (tagValue: string) => {
    const dietTag = DIET_TAGS.find(t => t.value === tagValue);
    if (dietTag) return dietTag.label;
    const nutritionTag = NUTRITION_TAGS.find(t => t.value === tagValue);
    if (nutritionTag) return nutritionTag.label;
    return tagValue;
  };

  return (
    <div className="py-16 bg-gradient-to-br from-teal-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            📚 Danh Mục Thực Phẩm
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tra cứu thông tin dinh dưỡng chi tiết của hơn 1000+ thực phẩm. 
            Lọc theo nhóm, chế độ ăn và mục tiêu của bạn.
          </p>
        </div>

        {/* Search & Quick Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm thực phẩm (VD: ức gà, cơm trắng...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 text-lg"
              />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:w-auto px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors flex items-center justify-center gap-2"
            >
              <Filter size={20} />
              Bộ lọc
              {(selectedGroups.length + selectedDietTags.length + selectedNutritionTags.length) > 0 && (
                <span className="bg-white text-teal-600 px-2 py-0.5 rounded-full text-sm font-bold">
                  {selectedGroups.length + selectedDietTags.length + selectedNutritionTags.length}
                </span>
              )}
            </button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">Lọc nâng cao</h3>
                {(selectedGroups.length > 0 || selectedDietTags.length > 0 || selectedNutritionTags.length > 0) && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                )}
              </div>

              {/* Food Groups */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Nhóm thực phẩm</h4>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {FOOD_GROUPS.map(group => (
                    <div key={group.id}>
                      <button
                        onClick={() => toggleGroupFilter(group.name)}
                        className={`w-full px-4 py-2 rounded-lg text-left font-medium transition-all ${
                          selectedGroups.includes(group.name)
                            ? 'bg-teal-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {group.icon} {group.name}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diet Tags */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Chế độ ăn</h4>
                <div className="flex flex-wrap gap-2">
                  {DIET_TAGS.map(tag => (
                    <button
                      key={tag.value}
                      onClick={() => toggleDietTag(tag.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedDietTags.includes(tag.value)
                          ? tag.color + ' ring-2 ring-offset-2 ring-teal-500'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nutrition Tags */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Đặc tính dinh dưỡng</h4>
                <div className="flex flex-wrap gap-2">
                  {NUTRITION_TAGS.map(tag => (
                    <button
                      key={tag.value}
                      onClick={() => toggleNutritionTag(tag.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedNutritionTags.includes(tag.value)
                          ? tag.color + ' ring-2 ring-offset-2 ring-teal-500'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            Tìm thấy <span className="font-bold text-teal-600 text-lg">{filteredFoods.length}</span> thực phẩm
          </p>
        </div>

        {/* Food Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFoods.map(food => (
            <div
              key={food.id}
              onClick={() => setSelectedFood(food)}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-teal-400 transform hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-xl text-gray-900">{food.food_name}</h3>
                <div className="flex items-center gap-1 text-orange-600">
                  <Flame size={18} />
                  <span className="font-bold">{food.calories}</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="text-center p-2 bg-red-50 rounded-lg">
                  <div className="font-bold text-red-700">{food.protein_g}g</div>
                  <div className="text-xs text-gray-600">Đạm</div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <div className="font-bold text-blue-700">{food.carbs_g}g</div>
                  <div className="text-xs text-gray-600">Carb</div>
                </div>
                <div className="text-center p-2 bg-yellow-50 rounded-lg">
                  <div className="font-bold text-yellow-700">{food.fats_g}g</div>
                  <div className="text-xs text-gray-600">Béo</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <div className="font-bold text-green-700">{food.fiber_g}g</div>
                  <div className="text-xs text-gray-600">Xơ</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {food.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className={`text-xs px-2 py-1 rounded-full font-medium ${getTagColor(tag)}`}
                  >
                    {getTagLabel(tag)}
                  </span>
                ))}
                {food.tags.length > 3 && (
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-600 font-medium">
                    +{food.tags.length - 3}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredFoods.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Info size={64} className="mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Không tìm thấy thực phẩm</h3>
            <p className="text-gray-500 mb-6">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}

        {/* CTA Button */}
        <div className="text-center mt-12">
          <button className="px-8 py-4 bg-teal-500 text-white font-bold text-lg rounded-full shadow-lg hover:bg-teal-600 transition-colors inline-flex items-center gap-2">
            Khám phá thêm 1000+ thực phẩm
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedFood && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setSelectedFood(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedFood.food_name}</h2>
                  <p className="text-gray-600">{selectedFood.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedFood.groups.map(group => (
                      <span key={group} className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                        {group}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFood(null)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Calories & Water */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-orange-50 rounded-xl p-6 text-center border-2 border-orange-200">
                  <Flame className="w-10 h-10 mx-auto mb-2 text-orange-600" />
                  <div className="text-4xl font-bold text-orange-600">{selectedFood.calories}</div>
                  <div className="text-sm text-gray-600 font-medium">Calories (kcal)</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-6 text-center border-2 border-blue-200">
                  <Apple className="w-10 h-10 mx-auto mb-2 text-blue-600" />
                  <div className="text-4xl font-bold text-blue-600">{selectedFood.water_g}g</div>
                  <div className="text-sm text-gray-600 font-medium">Hàm lượng nước</div>
                </div>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="bg-red-50 rounded-lg p-4 text-center border-2 border-red-200">
                  <div className="text-3xl font-bold text-red-700">{selectedFood.protein_g}g</div>
                  <div className="text-sm text-gray-600 font-medium">Đạm</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center border-2 border-blue-200">
                  <div className="text-3xl font-bold text-blue-700">{selectedFood.carbs_g}g</div>
                  <div className="text-sm text-gray-600 font-medium">Carb</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center border-2 border-yellow-200">
                  <div className="text-3xl font-bold text-yellow-700">{selectedFood.fats_g}g</div>
                  <div className="text-sm text-gray-600 font-medium">Béo</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center border-2 border-green-200">
                  <div className="text-3xl font-bold text-green-700">{selectedFood.fiber_g}g</div>
                  <div className="text-sm text-gray-600 font-medium">Chất xơ</div>
                </div>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Info size={20} className="text-teal-600" />
                  Đặc tính dinh dưỡng & Chế độ ăn
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedFood.tags.map(tag => (
                    <span
                      key={tag}
                      className={`text-sm px-4 py-2 rounded-full font-medium ${getTagColor(tag)}`}
                    >
                      {getTagLabel(tag)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Nutrition Summary */}
              <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 border-2 border-teal-200">
                <h3 className="font-bold text-gray-800 mb-4">Thông tin dinh dưỡng (trên 100g)</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Calories:</span>
                    <span className="font-bold text-gray-900">{selectedFood.calories} kcal</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Protein:</span>
                    <span className="font-bold text-gray-900">{selectedFood.protein_g}g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Carbohydrates:</span>
                    <span className="font-bold text-gray-900">{selectedFood.carbs_g}g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Fats:</span>
                    <span className="font-bold text-gray-900">{selectedFood.fats_g}g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Fiber:</span>
                    <span className="font-bold text-gray-900">{selectedFood.fiber_g}g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Water:</span>
                    <span className="font-bold text-gray-900">{selectedFood.water_g}g</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-3">
                <button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg">
                  Thêm vào Thực Đơn
                </button>
                <button 
                  onClick={() => setSelectedFood(null)}
                  className="px-8 py-4 border-2 border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-bold transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Plan;