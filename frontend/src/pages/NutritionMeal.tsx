import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Plus, Trash2, TrendingUp, Save, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


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

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | '';

const NutritionMealPlanner = () => {
  // --- STATE CHÍNH ---
  const [searchInput, setSearchInput] = useState('');
  const [mealList, setMealList] = useState<Meal[]>([]);
  const [suggestions, setSuggestions] = useState<Food[]>([]);
  const [selectedQuantity, setSelectedQuantity] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const quantityInputRef = useRef<HTMLInputElement>(null);

  // --- STATE LƯU THỰC ĐƠN ---
  const [isSaving, setIsSaving] = useState(false);
  const [mealType, setMealType] = useState<MealType>('');

  // Ngày hôm nay (YYYY-MM-DD) theo timezone local
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const [mealDate, setMealDate] = useState(today.toISOString().split('T')[0]);

  const navigate = useNavigate();

  // ================== LOGIC TÌM KIẾM ==================
  useEffect(() => {
    if (!searchInput.trim()) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);

    fetch(`http://localhost:8080/nutrition/search?name=${encodeURIComponent(searchInput)}`, {
      method: 'GET',
      headers: { 'Content-type': 'application/json' }
    })
      .then((res) => res.json())
      .then((res) => {
        const data = Array.isArray(res)
          ? res
          : res && res.data && Array.isArray(res.data)
          ? res.data
          : [];
        setSuggestions(data);
      })
      .catch((error) => {
        console.error('Lỗi khi tìm kiếm:', error);
        setSuggestions([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [searchInput]);

  useEffect(() => {
    if (selectedFood) {
      quantityInputRef.current?.focus();
      quantityInputRef.current?.select();
    }
  }, [selectedFood]);

  const handleSearch = (value: string) => {
    setSearchInput(value);
    if (selectedFood && value !== selectedFood.food_name) {
      setSelectedFood(null);
      setSelectedUnit('');
      setSelectedQuantity('');
    }
  };

  const handleSelectFood = (food: Food) => {
    setSelectedFood(food);
    setSearchInput(food.food_name);
    setSuggestions([]);

    let defaultQuantity = parseFloat(food.unit);
    const baseUnitTextCheck = food.unit.replace(/[\d.\s()]/g, '').toLowerCase();

    if (isNaN(defaultQuantity)) {
      if (baseUnitTextCheck === 'g' || baseUnitTextCheck === 'ml') {
        defaultQuantity = 100;
      } else {
        defaultQuantity = 1;
      }
    }

    setSelectedQuantity(defaultQuantity.toString());

    const unitString = food.unit.toLowerCase();
    if (unitString === 'g') {
      setSelectedUnit('g');
    } else if (unitString === 'ml') {
      setSelectedUnit('ml');
    } else if (unitString.includes('g') && !unitString.includes('(')) {
      setSelectedUnit('g');
    } else if (unitString.includes('ml') && !unitString.includes('(')) {
      setSelectedUnit('ml');
    } else {
      let unitText = food.unit.substring(parseFloat(food.unit).toString().length).trim();
      const parenthesisIndex = unitText.indexOf('(');
      if (parenthesisIndex !== -1) {
        unitText = unitText.substring(0, parenthesisIndex).trim();
      }
      setSelectedUnit(unitText);
    }
  };

  // ================== THÊM / XÓA MÓN ==================
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

    let baseAmount = parseFloat(selectedFood.unit);
    const baseUnitText = selectedFood.unit.replace(/[\d.\s]/g, '').toLowerCase();

    if (isNaN(baseAmount)) {
      if (baseUnitText === 'g' || baseUnitText === 'ml') {
        baseAmount = 100;
      } else {
        baseAmount = 1;
      }
    }

    const multiplier = quantity / baseAmount;

    const meal: Meal = {
      ...selectedFood,
      id: Date.now(),
      inputQuantity: quantity,
      inputUnit: selectedUnit,
      calories: Math.round(selectedFood.calories * multiplier),
      protein_g: Math.round(selectedFood.protein_g * multiplier * 10) / 10,
      fats_g: Math.round(selectedFood.fats_g * multiplier * 10) / 10,
      carbs_g: Math.round(selectedFood.carbs_g * multiplier * 10) / 10,
      fiber_g: Math.round(selectedFood.fiber_g * multiplier * 10) / 10
    };

    setMealList((prev) => [...prev, meal]);
    setSearchInput('');
    setSuggestions([]);
    setSelectedQuantity('');
    setSelectedUnit('');
    setSelectedFood(null);
  };

  const handleQuantityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFood();
    }
  };

  const handleRemoveMeal = (id: number) => {
    setMealList((prev) => prev.filter((m) => m.id !== id));
  };

  // ================== TỔNG DINH DƯỠNG ==================
  const totals = useMemo(
    () => ({
      calories: Math.round(mealList.reduce((sum, m) => sum + m.calories, 0)),
      protein: Math.round(mealList.reduce((sum, m) => sum + m.protein_g, 0) * 10) / 10,
      fats: Math.round(mealList.reduce((sum, m) => sum + m.fats_g, 0) * 10) / 10,
      carbs: Math.round(mealList.reduce((sum, m) => sum + m.carbs_g, 0) * 10) / 10,
      fiber: Math.round(mealList.reduce((sum, m) => sum + m.fiber_g, 0) * 10) / 10
    }),
    [mealList]
  );

  // ================== LƯU THỰC ĐƠN ==================
  const handleSaveMeal = async () => {
    if (mealList.length === 0) {
      alert('Thực đơn rỗng, không có gì để lưu.');
      return;
    }
    if (!mealType) {
      alert('Vui lòng chọn một bữa ăn (sáng, trưa, tối, phụ).');
      return;
    }
    
    setIsSaving(true);

    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user || !user.id) {
      alert("Bạn chưa đăng nhập! Vui lòng đăng nhập lại.");
      return;
    }

    const dataToSave = {
      user_id: user.id, // Lấy ID thật từ localStorage
      meal_date: mealDate,
      meal_type: mealType,
      mealList: mealList
    };

    try {
      const response = await fetch('http://localhost:8080/nutrition/meal-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Có lỗi xảy ra khi lưu');
      }

      alert('Đã lưu thực đơn thành công!');
      setMealList([]);
      setMealType('');
    } catch (error) {
      console.error('Lỗi khi lưu:', error);

      let errorMessage = 'Có lỗi không xác định xảy ra.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      alert(`Không thể lưu thực đơn: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ================== RENDER ==================
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <TrendingUp className="text-emerald-600" size={36} />
            Meal Planner - Tính Toán Dinh Dưỡng
          </h1>
          <p className="text-gray-600">
            Tìm kiếm, thêm thực phẩm và theo dõi lượng dinh dưỡng
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột trái: Thêm thực phẩm & Thực đơn & Lưu lịch sử */}
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
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 transition text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Loading / Suggestions / No Results */}
              {isLoading && (
                <div className="mb-6 text-center py-4 text-gray-500">Đang tìm kiếm...</div>
              )}

              {!isLoading && suggestions.length > 0 && (
                <div className="mb-6 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                  {suggestions.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => handleSelectFood(food)}
                      className="w-full text-left px-4 py-3 hover:bg-emerald-50 border-b last:border-b-0 transition flex justify-between items-center group"
                    >
                      <span className="font-medium text-gray-900">{food.food_name}</span>
                      <span className="text-sm text-gray-500 group-hover:text-emerald-600">
                        {food.calories} cal/{food.unit}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {!isLoading && searchInput.trim() && suggestions.length === 0 && (
                <div className="mb-6 text-center py-4 text-gray-500">
                  Không tìm thấy kết quả
                </div>
              )}

              {/* Input Số Lượng */}
              {selectedFood && (
                <div className="grid grid-cols-3 gap-3 mb-4 p-4 bg-emerald-50 rounded-lg">
                  <input
                    type="number"
                    placeholder="Số lượng"
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(e.target.value)}
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
                <p className="text-gray-500 text-center py-8">
                  Chưa có thực phẩm nào được thêm
                </p>
              ) : (
                <div className="space-y-2">
                  {mealList.map((meal) => (
                    <div
                      key={meal.id}
                      className="flex items-start justify-between bg-gradient-to-r from-emerald-50 to-blue-50 p-4 rounded-lg border-l-4 border-emerald-500"
                    >
                      <div className="flex-1 pr-4">
                        <p className="text-lg font-semibold text-gray-900">
                          {meal.food_name}
                          <span className="text-sm text-gray-600 font-medium pl-2">
                            ({meal.inputQuantity} {meal.inputUnit} • {meal.calories} Calo)
                          </span>
                        </p>
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

            {/* Box: Lưu Thực Đơn & Lịch Sử – ĐÃ CHUYỂN XUỐNG DƯỚI THỰC ĐƠN */}
            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Lưu & Lịch Sử</h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="meal-date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Ngày
                  </label>
                  <input
                    type="date"
                    id="meal-date"
                    value={mealDate}
                    onChange={(e) => setMealDate(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="meal-type"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Bữa ăn
                  </label>
                  <select
                    id="meal-type"
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value as MealType)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
                  >
                    <option value="">-- Chọn bữa ăn --</option>
                    <option value="breakfast">Bữa sáng</option>
                    <option value="lunch">Bữa trưa</option>
                    <option value="dinner">Bữa tối</option>
                    <option value="snack">Bữa phụ</option>
                  </select>
                </div>

                <button
                  onClick={handleSaveMeal}
                  disabled={isSaving || mealList.length === 0}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {isSaving ? 'Đang lưu...' : 'Lưu Thực Đơn'}
                </button>

                <button
                  onClick={() => navigate('/profile/nutrition')}
                  className="w-full flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition"
                >
                  <CalendarDays size={18} />
                  Xem Lịch Sử
                </button>
              </div>
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
                      style={{
                        width: `${Math.min((totals.protein / 100) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-emerald-100 text-sm font-semibold">FATS</p>
                  <p className="text-3xl font-bold">{totals.fats}g</p>
                  <div className="w-full bg-white/30 rounded-full h-2 mt-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min((totals.fats / 70) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-emerald-100 text-sm font-semibold">CARBS</p>
                  <p className="text-3xl font-bold">{totals.carbs}g</p>
                  <div className="w-full bg-white/30 rounded-full h-2 mt-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min((totals.carbs / 300) * 100, 100)}%`
                      }}
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
