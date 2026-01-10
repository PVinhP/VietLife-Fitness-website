import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, TrendingUp, Utensils, Coffee, Sun, Moon, Apple, Trash2, ArrowLeft } from 'lucide-react';

interface MealLog {
  id: number;
  user_id: number;
  meal_date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_name: string;
  input_quantity: number;
  input_unit: string;
  calories: number;
  protein_g: number;
  fats_g: number;
  carbs_g: number;
  fiber_g: number;
}

interface GroupedMeals {
  breakfast: MealLog[];
  lunch: MealLog[];
  dinner: MealLog[];
  snack: MealLog[];
}

const NutritionDiary = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().split('T')[0];
  });
  
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch dữ liệu khi selectedDate thay đổi
  useEffect(() => {
    fetchMealLogs();
  }, [selectedDate]);

  const fetchMealLogs = async () => {
    setIsLoading(true);
    setError(null);
    
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (!user || !user.id) {
        setError("Vui lòng đăng nhập để xem dữ liệu");
        setIsLoading(false);
        return;
    }

    try {
      // Thay số 1 bằng user.id
      const response = await fetch(
        `https://vietlife-fitness-website-host.onrender.com/nutrition/meal-logs?user_id=${user.id}&date=${selectedDate}`
      );
      
      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu');
      }
      
      const data = await response.json();
      setMealLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      setMealLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Nhóm các món ăn theo bữa
  const groupedMeals: GroupedMeals = {
    breakfast: mealLogs.filter(m => m.meal_type === 'breakfast'),
    lunch: mealLogs.filter(m => m.meal_type === 'lunch'),
    dinner: mealLogs.filter(m => m.meal_type === 'dinner'),
    snack: mealLogs.filter(m => m.meal_type === 'snack')
  };

  // Tính tổng dinh dưỡng cho từng bữa
  const calculateMealTotals = (meals: MealLog[]) => ({
    calories: meals.reduce((sum, m) => sum + m.calories, 0),
    protein: Math.round(meals.reduce((sum, m) => sum + m.protein_g, 0) * 10) / 10,
    fats: Math.round(meals.reduce((sum, m) => sum + m.fats_g, 0) * 10) / 10,
    carbs: Math.round(meals.reduce((sum, m) => sum + m.carbs_g, 0) * 10) / 10,
    fiber: Math.round(meals.reduce((sum, m) => sum + m.fiber_g, 0) * 10) / 10
  });

  // Tổng dinh dưỡng cả ngày
  const dailyTotals = calculateMealTotals(mealLogs);

  // Xử lý chuyển ngày
  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  // Format ngày hiển thị
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);
    
    if (selected.getTime() === today.getTime()) {
      return 'Hôm nay';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (selected.getTime() === yesterday.getTime()) {
      return 'Hôm qua';
    }
    
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Icon và màu cho từng bữa ăn
  const mealConfig = {
    breakfast: { 
      icon: Sun, 
      label: 'Bữa Sáng', 
      color: 'from-orange-400 to-yellow-400',
      bgLight: 'bg-orange-50',
      border: 'border-orange-400'
    },
    lunch: { 
      icon: Utensils, 
      label: 'Bữa Trưa', 
      color: 'from-blue-400 to-cyan-400',
      bgLight: 'bg-blue-50',
      border: 'border-blue-400'
    },
    dinner: { 
      icon: Moon, 
      label: 'Bữa Tối', 
      color: 'from-indigo-400 to-purple-400',
      bgLight: 'bg-indigo-50',
      border: 'border-indigo-400'
    },
    snack: { 
      icon: Apple, 
      label: 'Bữa Phụ', 
      color: 'from-green-400 to-emerald-400',
      bgLight: 'bg-green-50',
      border: 'border-green-400'
    }
  };

  // Xóa một món ăn
  const handleDeleteMeal = async (mealId: number) => {
    
    
    try {
      const response = await fetch(`https://vietlife-fitness-website-host.onrender.com/nutrition/meal-logs/${mealId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchMealLogs(); // Tải lại dữ liệu
      }
    } catch (err) {
      alert('Không thể xóa món ăn');
    }
  };

  // Render một bữa ăn
  const renderMealSection = (type: keyof GroupedMeals) => {
    const meals = groupedMeals[type];
    const config = mealConfig[type];
    const Icon = config.icon;
    
    if (meals.length === 0) return null;
    
    const totals = calculateMealTotals(meals);
    
    return (
      <div key={type} className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        {/* Header bữa ăn */}
        <div className={`bg-gradient-to-r ${config.color} p-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <Icon className="text-white" size={28} />
            <div>
              <h3 className="text-xl font-bold text-white">{config.label}</h3>
              <p className="text-white/90 text-sm">{totals.calories} kcal</p>
            </div>
          </div>
          <div className="text-right text-white/90 text-sm">
            <div>P: {totals.protein}g • F: {totals.fats}g</div>
            <div>C: {totals.carbs}g</div>
          </div>
        </div>
        
        {/* Danh sách món ăn */}
        <div className="p-4 space-y-3">
          {meals.map((meal) => (
            <div 
              key={meal.id}
              className={`${config.bgLight} border-l-4 ${config.border} p-4 rounded-lg flex justify-between items-start`}
            >
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-lg">
                  {meal.food_name}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  {meal.input_quantity} {meal.input_unit} • {meal.calories} cal
                </p>
                <div className="grid grid-cols-4 gap-2 mt-3">
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded text-center">
                    P: {meal.protein_g}g
                  </span>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded text-center">
                    F: {meal.fats_g}g
                  </span>
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded text-center">
                    C: {meal.carbs_g}g
                  </span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded text-center">
                    Fb: {meal.fiber_g}g
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDeleteMeal(meal.id)}
                className="ml-4 text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition"
                title="Xóa món ăn"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-white/50 rounded-lg transition"
            >
              <ArrowLeft size={24} className="text-gray-700" />
            </button>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="text-purple-600" size={36} />
              Nhật Ký Dinh Dưỡng
            </h1>
          </div>
          <p className="text-gray-600">Theo dõi lịch sử ăn uống và dinh dưỡng của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột trái: Lịch sử các bữa ăn */}
          <div className="lg:col-span-2">
            {/* Điều khiển chọn ngày */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => changeDate(-1)}
                  className="p-3 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronLeft size={24} className="text-gray-700" />
                </button>
                
                <div className="flex-1 text-center">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="text-xl font-bold text-gray-900 border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-gray-600 mt-2">{formatDate(selectedDate)}</p>
                </div>
                
                <button
                  onClick={() => changeDate(1)}
                  className="p-3 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronRight size={24} className="text-gray-700" />
                </button>
              </div>
            </div>

            {/* Nội dung chính */}
            {isLoading ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải dữ liệu...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <p className="text-red-600 font-semibold mb-2">⚠️ {error}</p>
                <button
                  onClick={fetchMealLogs}
                  className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Thử lại
                </button>
              </div>
            ) : mealLogs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Coffee size={64} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Chưa có dữ liệu cho ngày này</p>
                <p className="text-gray-500 text-sm mt-2">Hãy thêm bữa ăn của bạn vào nhật ký!</p>
              </div>
            ) : (
              <div>
                {renderMealSection('breakfast')}
                {renderMealSection('lunch')}
                {renderMealSection('dinner')}
                {renderMealSection('snack')}
              </div>
            )}
          </div>

          {/* Cột phải: Tổng kết dinh dưỡng */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white sticky top-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp size={28} />
                Tổng Kết Ngày
              </h2>

              <div className="space-y-4">
                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-purple-100 text-sm font-semibold">TỔNG CALORIES</p>
                  <p className="text-5xl font-bold">{dailyTotals.calories}</p>
                  <p className="text-purple-100 text-xs mt-1">kcal</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-purple-100 text-xs font-semibold">PROTEIN</p>
                    <p className="text-2xl font-bold">{dailyTotals.protein}g</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-purple-100 text-xs font-semibold">FATS</p>
                    <p className="text-2xl font-bold">{dailyTotals.fats}g</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-purple-100 text-xs font-semibold">CARBS</p>
                    <p className="text-2xl font-bold">{dailyTotals.carbs}g</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-purple-100 text-xs font-semibold">FIBER</p>
                    <p className="text-2xl font-bold">{dailyTotals.fiber}g</p>
                  </div>
                </div>

                <div className="bg-white/20 rounded-lg p-4 mt-6">
                  <p className="text-purple-100 text-xs font-semibold mb-2">SỐ BỮA ĂN</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {groupedMeals.breakfast.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Sun size={16} />
                        <span>Sáng: {groupedMeals.breakfast.length}</span>
                      </div>
                    )}
                    {groupedMeals.lunch.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Utensils size={16} />
                        <span>Trưa: {groupedMeals.lunch.length}</span>
                      </div>
                    )}
                    {groupedMeals.dinner.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Moon size={16} />
                        <span>Tối: {groupedMeals.dinner.length}</span>
                      </div>
                    )}
                    {groupedMeals.snack.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Apple size={16} />
                        <span>Phụ: {groupedMeals.snack.length}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionDiary;