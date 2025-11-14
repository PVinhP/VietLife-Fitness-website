import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Plus, Trash2, TrendingUp } from 'lucide-react';

// ĐỊNH NGHĨA INTERFACE
interface Food {
  id: number;
  food_name: string;
  unit: string;
  calories: number;
  water_g: number;
  protein_g: number;
  fats_g: number;
  carbs_g: number;
  fiber_g: number;
}

interface Meal extends Food {
  inputQuantity: number;
  inputUnit: string;
}

const NutritionMealPlanner = () => {
  // --- STATES ---
  const [searchInput, setSearchInput] = useState('');
  const [mealList, setMealList] = useState<Meal[]>([]);
  const [suggestions, setSuggestions] = useState<Food[]>([]);
  const [selectedQuantity, setSelectedQuantity] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // [UX CẢI TIẾN] Ref cho ô input số lượng
  const quantityInputRef = useRef<HTMLInputElement>(null);

  // --- LOGIC ---

  // useEffect cho Tìm kiếm
  useEffect(() => {
    if (!searchInput.trim()) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    
    fetch(`http://localhost:8080/nutrition/search?name=${encodeURIComponent(searchInput)}`, {
      method: "GET",
      headers: { "Content-type": "application/json" }
    })
      .then((res) => res.json())
      .then((res) => {
        const data = Array.isArray(res) ? res : (res && res.data && Array.isArray(res.data)) ? res.data : [];
        setSuggestions(data);
      })
      .catch((error) => {
        console.error("Lỗi khi tìm kiếm:", error);
        setSuggestions([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [searchInput]);

  // [UX CẢI TIẾN] useEffect để tự động focus vào ô số lượng
  useEffect(() => {
    if (selectedFood) {
      // Tự động focus và chọn toàn bộ text để người dùng gõ đè
      quantityInputRef.current?.focus();
      quantityInputRef.current?.select(); 
    }
  }, [selectedFood]); // Kích hoạt mỗi khi 'selectedFood' thay đổi

  // [UX CẢI TIẾN] Xử lý khi người dùng "đổi ý"
  const handleSearch = (value: string) => {
    setSearchInput(value);

    // Nếu người dùng đang gõ và nội dung không còn khớp với món đã chọn
    if (selectedFood && value !== selectedFood.food_name) {
      // Reset lựa chọn
      setSelectedFood(null);
      setSelectedUnit('');
      setSelectedQuantity('');
    }
  };

  // =================================================================
  // [SỬA LỖI ĐƠN VỊ "đĩag"] + [UX CẢI TIẾN] Tự động điền số lượng
  // =================================================================
  const handleSelectFood = (food: Food) => {
    setSelectedFood(food);
    setSearchInput(food.food_name); 
    setSuggestions([]); 
    
    // 1. Lấy số lượng mặc định (defaultQuantity)
    let defaultQuantity = parseFloat(food.unit); // "1 ổ (250g)" -> 1; "100g" -> 100
    const baseUnitTextCheck = food.unit.replace(/[\d.\s()]/g, '').toLowerCase(); // Dùng để kiểm tra "g" hay "ml"

    if (isNaN(defaultQuantity)) { // "g" -> NaN
      if (baseUnitTextCheck === 'g' || baseUnitTextCheck === 'ml') {
        defaultQuantity = 100; // Mặc định là 100g
      } else {
        defaultQuantity = 1; // "quả", "cái", "bát" -> 1
      }
    }
    
    // Set số lượng mặc định
    setSelectedQuantity(defaultQuantity.toString()); 

    // 2. [SỬA LỖI] Xử lý 'selectedUnit'
    const unitString = food.unit.toLowerCase();

    // Trường hợp 1: "g" hoặc "ml" (đứng một mình)
    if (unitString === 'g') {
        setSelectedUnit('g');
    } else if (unitString === 'ml') {
        setSelectedUnit('ml');
    }
    // Trường hợp 2: "100g", "100ml" (không có ngoặc)
    else if (unitString.includes('g') && !unitString.includes('(')) {
      setSelectedUnit('g');
    } else if (unitString.includes('ml') && !unitString.includes('(')) {
      setSelectedUnit('ml');
    }
    // Trường hợp 3: "1 đĩa (550g)", "1 bát (500g)", "1 quả"
    else {
      // Lấy phần chữ đầu tiên sau số (vd: "1 đĩa (550g)" -> " đĩa (550g)")
      let unitText = food.unit.substring(parseFloat(food.unit).toString().length).trim(); 
      // "đĩa (550g)"
      
      // Lấy phần text trước dấu "("
      const parenthesisIndex = unitText.indexOf('(');
      if (parenthesisIndex !== -1) {
        unitText = unitText.substring(0, parenthesisIndex).trim(); // "đĩa"
      }
      
      setSelectedUnit(unitText); // "đĩa" hoặc "quả"
    }
  };

  // [SỬA LỖI] Hàm tính toán đã sửa
  const handleAddFood = () => {
    if (!selectedFood) {
      alert('Vui lòng chọn một thực phẩm từ gợi ý.');
      return;
    }
    if (!selectedQuantity) {
      alert('Vui lòng nhập số lượng');
      return;
    }
    const quantity = parseFloat(selectedQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      alert('Số lượng phải là số dương');
      return;
    }
    
    // 1. Lấy số lượng cơ sở (baseAmount) từ CSDL
    // "1 ổ (250g)" -> 1
    // "100g" -> 100
    let baseAmount = parseFloat(selectedFood.unit); 
    const baseUnitText = selectedFood.unit.replace(/[\d.\s]/g, '').toLowerCase();

    // Xử lý các trường hợp đơn vị không có số (vd: "g", "quả", "cái")
    if (isNaN(baseAmount)) {
      if (baseUnitText === 'g' || baseUnitText === 'ml') {
        baseAmount = 100;
      } else {
        baseAmount = 1;
      }
    }
    
    // 2. Tính toán hệ số nhân
    // vd: User nhập 2 (ổ), baseAmount là 1 (từ "1 ổ") -> multiplier = 2
    // vd: User nhập 150 (g), baseAmount là 100 (từ "100g") -> multiplier = 1.5
    const multiplier = quantity / baseAmount;

    // 3. Tạo đối tượng Meal mới
    const meal: Meal = {
      ...selectedFood,
      id: Date.now(), 
      inputQuantity: quantity, 
      inputUnit: selectedUnit,  
      calories: Math.round(selectedFood.calories * multiplier),
      protein_g: Math.round(selectedFood.protein_g * multiplier * 10) / 10,
      fats_g: Math.round(selectedFood.fats_g * multiplier * 10) / 10,
      carbs_g: Math.round(selectedFood.carbs_g * multiplier * 10) / 10,
      fiber_g: Math.round(selectedFood.fiber_g * multiplier * 10) / 10,
    };

    // 4. Cập nhật state và reset
    setMealList([...mealList, meal]);
    setSearchInput('');
    setSuggestions([]);
    setSelectedQuantity('');
    setSelectedUnit('');
    setSelectedFood(null);
  };

  // [UX CẢI TIẾN] Hàm xử lý nhấn Enter để Thêm
  const handleQuantityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Ngăn hành vi mặc định của Enter
      handleAddFood();    // Gọi hàm thêm món ăn
    }
  };

  // Hàm xóa món ăn
  const handleRemoveMeal = (id: number) => {
    setMealList(mealList.filter(m => m.id !== id));
  };

  // Tính toán tổng dinh dưỡng
  const totals = useMemo(() => {
    return {
      calories: Math.round(mealList.reduce((sum, m) => sum + m.calories, 0)),
      protein: Math.round(mealList.reduce((sum, m) => sum + m.protein_g, 0) * 10) / 10,
      fats: Math.round(mealList.reduce((sum, m) => sum + m.fats_g, 0) * 10) / 10,
      carbs: Math.round(mealList.reduce((sum, m) => sum + m.carbs_g, 0) * 10) / 10,
      fiber: Math.round(mealList.reduce((sum, m) => sum + m.fiber_g, 0) * 10) / 10,
    };
  }, [mealList]);

  // --- RENDER (Phần JSX) ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <TrendingUp className="text-emerald-600" size={36} />
            Meal Planner - Tính Toán Dinh Dưỡng
          </h1>
          <p className="text-gray-600">Tìm kiếm, thêm thực phẩm và theo dõi lượng dinh dưỡng</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột trái: Thêm thực phẩm & Thực đơn */}
          <div className="lg:col-span-2">
            
            {/* Box: Thêm Thực Phẩm */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Thêm Thực Phẩm</h2>
              
              {/* Search Input */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Nhập tên thực phẩm (vd: bánh tráng, cơm, gà)..."
                  value={searchInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 transition text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="mb-6 text-center py-4 text-gray-500">
                  Đang tìm kiếm...
                </div>
              )}
              
              {/* Suggestions */}
              {!isLoading && suggestions.length > 0 && (
                <div className="mb-6 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                  {suggestions.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => handleSelectFood(food)}
                      className="w-full text-left px-4 py-3 hover:bg-emerald-50 border-b last:border-b-0 transition flex justify-between items-center group"
                    >
                      <span className="font-medium text-gray-900">{food.food_name}</span>
                      <span className="text-sm text-gray-500 group-hover:text-emerald-600">{food.calories} cal/{food.unit}</span>
                    </button>
                  ))}
                </div>
              )}
              
              {/* No Results */}
              {!isLoading && searchInput.trim() && suggestions.length === 0 && (
                <div className="mb-6 text-center py-4 text-gray-500">
                  Không tìm thấy kết quả
                </div>
              )}

              {/* Input Số Lượng (Chỉ hiện khi đã chọn món) */}
              {selectedFood && (
                <div className="grid grid-cols-3 gap-3 mb-4 p-4 bg-emerald-50 rounded-lg">
                  <input
                    type="number"
                    placeholder="Số lượng"
                    value={selectedQuantity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedQuantity(e.target.value)}
                    ref={quantityInputRef}
                    onKeyDown={handleQuantityKeyDown}
                    className="col-span-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 text-gray-900 placeholder-gray-500 bg-white"
                  />
                  <input
                    type="text"
                    value={selectedUnit} 
                    readOnly
                    placeholder="Đơn vị"
                    className="col-span-1 px-3 py-2 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                  <button
                    onClick={handleAddFood}
                    className="col-span-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Plus size={20} />
                    Thêm
                  </button>
                </div>
              )}
            </div>

            {/* Box: Thực Đơn Hôm Nay */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Thực Đơn Hôm Nay</h2>
              {mealList.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Chưa có thực phẩm nào được thêm</p>
              ) : (
                <div className="space-y-2">
                  {mealList.map((meal) => (
                    <div
                      key={meal.id}
                      className="flex items-start justify-between bg-gradient-to-r from-emerald-50 to-blue-50 p-4 rounded-lg border-l-4 border-emerald-500"
                    >
                      {/* Khối văn bản bên trái, dùng flex-1 để lấp đầy không gian */}
                      <div className="flex-1 pr-4">
                        
                        {/* Dòng 1: Tên và Calo/Đơn vị (Không đổi) */}
                        <p className="text-lg font-semibold text-gray-900">
                          {meal.food_name}
                          <span className="text-sm text-gray-600 font-medium pl-2">
                            ({meal.inputQuantity} {meal.inputUnit} • {meal.calories} Calo)
                          </span>
                        </p>
                        
                        {/* [SỬA] Dòng 2: Thông tin macros (Dùng 3 ô màu) */}
                        <div className="grid grid-cols-3 gap-2 mt-2"> 
                          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-lg text-center">
                            Protein: {meal.protein_g}g
                          </span>
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2.5 py-1 rounded-lg text-center">
                            Chất béo: {meal.fats_g}g
                          </span>
                          <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-lg text-center">
                            Carbohydrate: {meal.carbs_g}g
                          </span>
                        </div>
                      </div>

                      {/* Nút Xóa (Không đổi) */}
                      <button
                        onClick={() => handleRemoveMeal(meal.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition shrink-0"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cột phải: Tổng Dinh Dưỡng */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl shadow-lg p-6 text-white sticky top-6">
              <h2 className="text-2xl font-bold mb-6">Tổng Dinh Dưỡng</h2>
              
              <div className="space-y-4">
                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-emerald-100 text-sm font-semibold">CALORIES</p>
                  <p className="text-4xl font-bold">{totals.calories}</p>
                  <p className="text-emerald-100 text-xs mt-1">kcal</p>
                </div>

                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-emerald-100 text-sm font-semibold">PROTEIN</p>
                  <p className="text-3xl font-bold">{totals.protein}g</p>
                  <div className="w-full bg-white/30 rounded-full h-2 mt-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((totals.protein / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-emerald-100 text-sm font-semibold">FATS</p>
                  <p className="text-3xl font-bold">{totals.fats}g</p>
                  <div className="w-full bg-white/30 rounded-full h-2 mt-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((totals.fats / 70) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-emerald-100 text-sm font-semibold">CARBS</p>
                  <p className="text-3xl font-bold">{totals.carbs}g</p>
                  <div className="w-full bg-white/30 rounded-full h-2 mt-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((totals.carbs / 300) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-emerald-100 text-sm font-semibold">FIBER</p>
                  <p className="text-3xl font-bold">{totals.fiber}g</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setMealList([]);
                  setSearchInput('');
                  setSuggestions([]);
                  setSelectedQuantity('');
                  setSelectedUnit('');
                  setSelectedFood(null);
                }}
                className="w-full mt-6 bg-white text-emerald-600 font-bold py-3 rounded-lg hover:bg-gray-100 transition"
              >
                Xóa Tất Cả
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionMealPlanner;