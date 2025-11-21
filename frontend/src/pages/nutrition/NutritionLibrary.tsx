import React, { useState } from 'react';
import { 
  Leaf, Beef, Milk, Droplet, 
  Target, Zap, Activity, ShieldCheck, 
  ChevronRight, Info, Filter, Layers 
} from 'lucide-react';

// --- 1. MOCK DATA (DỮ LIỆU MẪU) ---

// Mức 1: Nhóm cơ bản
const BASIC_GROUPS = [
  { id: 1, name: 'Tinh bột', icon: '🍞', color: 'bg-orange-100 text-orange-700' },
  { id: 2, name: 'Đạm', icon: '🥩', color: 'bg-red-100 text-red-700' },
  { id: 3, name: 'Chất béo', icon: '🥑', color: 'bg-yellow-100 text-yellow-700' },
  { id: 4, name: 'Rau', icon: '🥦', color: 'bg-green-100 text-green-700' },
  { id: 5, name: 'Trái cây', icon: '🍎', color: 'bg-pink-100 text-pink-700' },
  { id: 6, name: 'Sữa', icon: '🥛', color: 'bg-blue-100 text-blue-700' },
  { id: 7, name: 'Đồ uống & Ăn vặt', icon: '🥤', color: 'bg-purple-100 text-purple-700' },
];

// Mức 2: Nhóm trung cấp (Map với Mức 1 để hiển thị theo nhóm)
const INTERMEDIATE_GROUPS = [
  {
    parentId: 1, // Tinh bột
    parentName: 'Nhóm Tinh Bột',
    items: [
      { name: 'Ngũ cốc nguyên hạt (Whole grains)', desc: 'Yến mạch, quinoa, gạo lứt', healthy: true },
      { name: 'Ngũ cốc tinh chế (Refined grains)', desc: 'Bánh mì trắng, bún, phở', healthy: false },
      { name: 'Củ giàu tinh bột (Starchy vegetables)', desc: 'Khoai lang, khoai tây', healthy: true },
    ]
  },
  {
    parentId: 2, // Đạm
    parentName: 'Nhóm Đạm (Protein)',
    items: [
      { name: 'Thịt đỏ (Red meat)', desc: 'Bò, heo, dê', healthy: 'moderate' },
      { name: 'Thịt trắng (Poultry)', desc: 'Gà, vịt', healthy: true },
      { name: 'Cá & Hải sản', desc: 'Cá hồi, tôm', healthy: true },
      { name: 'Đạm thực vật', desc: 'Đậu phụ, hạt đậu', healthy: true },
      { name: 'Trứng', desc: 'Gà, vịt', healthy: true },
    ]
  },
  {
    parentId: 3, // Chất béo
    parentName: 'Nhóm Chất Béo',
    items: [
      { name: 'Chất béo tốt (Healthy fats)', desc: 'Olive, bơ, hạt', healthy: true },
      { name: 'Chất béo xấu (Unhealthy fats)', desc: 'Mỡ động vật, đồ chiên', healthy: false },
    ]
  },
  // ... (Có thể thêm các nhóm Rau, Trái cây, Sữa tương tự)
];

// Mức 3: Advanced Filters
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

// Dữ liệu thực phẩm mẫu để test filter (Mức 3)
const FOOD_DATABASE = [
  { name: 'Ức gà', tags: ['High-protein', 'Low-fat', 'Whole-food', 'EatClean', 'NOVA 1: Unprocessed'] },
  { name: 'Khoai lang', tags: ['High-fiber', 'Low GI', 'EatClean', 'Vegan', 'NOVA 1: Unprocessed'] },
  { name: 'Cá hồi', tags: ['High-protein', 'Omega-3', 'Healthy fats', 'Keto / Low-carb', 'NOVA 1: Unprocessed'] },
  { name: 'Xúc xích', tags: ['Processed food', 'High-calorie', 'NOVA 4: Ultra-processed (UPF)'] },
];

// --- COMPONENTS ---

export default function NutritionLevels() {
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-emerald-800 mb-3">Phân loại Thực Phẩm</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hệ thống dữ liệu dinh dưỡng đa tầng, phù hợp từ người mới bắt đầu đến vận động viên chuyên nghiệp.
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
            <TabButton 
              level={1} 
              current={activeTab} 
              onClick={setActiveTab} 
              label="Cơ bản" 
              sub="Người mới"
              icon={<Leaf size={18} />}
            />
            <TabButton 
              level={2} 
              current={activeTab} 
              onClick={setActiveTab} 
              label="Trung cấp" 
              sub="Gym / Diet"
              icon={<Activity size={18} />}
            />
            <TabButton 
              level={3} 
              current={activeTab} 
              onClick={setActiveTab} 
              label="Nâng cao" 
              sub="Chuyên gia"
              icon={<ShieldCheck size={18} />}
            />
          </div>
        </div>

        {/* Content Render */}
        <div className="animate-fade-in-up">
          {activeTab === 1 && <Level1Basic />}
          {activeTab === 2 && <Level2Intermediate />}
          {activeTab === 3 && <Level3Advanced />}
        </div>

      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

const TabButton = ({ level, current, onClick, label, sub, icon }: any) => {
  const isActive = current === level;
  return (
    <button
      onClick={() => onClick(level)}
      className={`flex items-center px-6 py-3 rounded-lg transition-all duration-300 ${
        isActive 
        ? 'bg-emerald-600 text-white shadow-md' 
        : 'bg-transparent text-gray-500 hover:bg-gray-100'
      }`}
    >
      <div className="mr-3">{icon}</div>
      <div className="text-left">
        <div className={`font-bold text-sm ${isActive ? 'text-white' : 'text-gray-800'}`}>{label}</div>
        <div className={`text-xs ${isActive ? 'text-emerald-100' : 'text-gray-400'}`}>{sub}</div>
      </div>
    </button>
  );
};

// VIEW MỨC 1: CƠ BẢN (GRID LỚN)
const Level1Basic = () => {
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {BASIC_GROUPS.map((group) => (
          <div key={group.id} className={`${group.color} rounded-2xl p-6 flex flex-col items-center text-center cursor-pointer transform transition hover:scale-105 hover:shadow-lg`}>
            <div className="text-5xl mb-4">{group.icon}</div>
            <h3 className="font-bold text-lg mb-1">{group.name}</h3>
            <span className="text-xs opacity-80 font-medium uppercase tracking-wider">Cơ bản</span>
          </div>
        ))}
      </div>
      <div className="mt-8 bg-white p-4 rounded-lg border border-emerald-100 flex items-start gap-3 text-emerald-800 text-sm">
        <Info className="shrink-0 mt-0.5" size={18} />
        <p>Mức này giúp bạn làm quen với khái niệm nhóm chất. Hãy đảm bảo bữa ăn của bạn có đủ 4 nhóm chính: Tinh bột, Đạm, Béo và Rau.</p>
      </div>
    </div>
  );
};

// VIEW MỨC 2: TRUNG CẤP (LIST CHI TIẾT)
const Level2Intermediate = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {INTERMEDIATE_GROUPS.map((group, index) => (
        <div key={index} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">{group.parentName}</h3>
            <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">{group.items.length} nhóm nhỏ</span>
          </div>
          <div className="divide-y divide-gray-100">
            {group.items.map((item, idx) => (
              <div key={idx} className="px-6 py-4 hover:bg-gray-50 transition flex items-start justify-between group cursor-pointer">
                <div>
                  <div className="font-semibold text-gray-700 group-hover:text-emerald-700 flex items-center gap-2">
                    {item.name}
                    {/* Chỉ thị màu sắc sức khỏe */}
                    {item.healthy === true && <span className="w-2 h-2 rounded-full bg-emerald-500" title="Khuyên dùng"></span>}
                    {item.healthy === false && <span className="w-2 h-2 rounded-full bg-red-500" title="Hạn chế"></span>}
                    {item.healthy === 'moderate' && <span className="w-2 h-2 rounded-full bg-yellow-500" title="Ăn vừa phải"></span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-emerald-500 mt-1" />
              </div>
            ))}
          </div>
        </div>
      ))}
      {/* Placeholder cho các nhóm khác để UI đẹp */}
      <div className="bg-gray-100 rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center p-10 text-gray-400">
        <span className="text-4xl mb-2">🥦 + 🍎 + 🥛</span>
        <p>Các nhóm Rau, Trái cây, Sữa hiển thị tương tự...</p>
      </div>
    </div>
  );
};

// VIEW MỨC 3: NÂNG CAO (FILTER SYSTEM)
const Level3Advanced = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Logic lọc đơn giản
  const filteredFood = selectedTags.length === 0 
    ? FOOD_DATABASE 
    : FOOD_DATABASE.filter(food => selectedTags.every(tag => food.tags.includes(tag)));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar Filters */}
      <div className="lg:col-span-4 space-y-6">
        <FilterSection title="🎯 Mục tiêu Dinh dưỡng" tags={ADVANCED_FILTERS.functional} selected={selectedTags} onToggle={toggleTag} color="blue" />
        <FilterSection title="🥗 Chế độ ăn (Diet)" tags={ADVANCED_FILTERS.diet} selected={selectedTags} onToggle={toggleTag} color="emerald" />
        <FilterSection title="🏭 Mức độ chế biến (NOVA)" tags={ADVANCED_FILTERS.nova} selected={selectedTags} onToggle={toggleTag} color="purple" />
      </div>

      {/* Results Area */}
      <div className="lg:col-span-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 min-h-[500px]">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Layers size={20} className="text-emerald-600" />
            Kết quả phân tích
            <span className="text-xs font-normal text-gray-500 ml-auto">
              {selectedTags.length > 0 ? `Đang lọc theo ${selectedTags.length} tiêu chí` : 'Hiển thị tất cả'}
            </span>
          </h3>

          {selectedTags.length > 0 && (
             <button 
                onClick={() => setSelectedTags([])}
                className="text-xs text-red-500 hover:underline mb-4"
             >
                Xóa bộ lọc
             </button>
          )}

          <div className="space-y-3">
            {filteredFood.length > 0 ? filteredFood.map((item, idx) => (
              <div key={idx} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition bg-gray-50 hover:bg-white">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-lg text-gray-800">{item.name}</h4>
                  {/* Demo Logic TDEE/MealPlan có thể gắn vào đây */}
                  <button className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-200">
                    + Thêm vào Menu
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {item.tags.map(tag => (
                    <span key={tag} className={`text-xs px-2 py-1 rounded border ${
                      selectedTags.includes(tag) 
                      ? 'bg-emerald-600 text-white border-emerald-600' 
                      : 'bg-white text-gray-600 border-gray-200'
                    }`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )) : (
               <div className="text-center py-10 text-gray-400">
                  Không có thực phẩm nào khớp với tiêu chí này.
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterSection = ({ title, tags, selected, onToggle, color }: any) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
    <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wider">{title}</h4>
    <div className="flex flex-wrap gap-2">
      {tags.map((tag: string) => (
        <button
          key={tag}
          onClick={() => onToggle(tag)}
          className={`text-xs px-3 py-1.5 rounded-full transition-all border ${
            selected.includes(tag)
            ? `bg-${color}-100 text-${color}-800 border-${color}-200 font-semibold`
            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  </div>
);
