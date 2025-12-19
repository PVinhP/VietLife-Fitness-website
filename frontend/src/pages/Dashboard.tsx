import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify'; // Nếu chưa có thư viện này thì có thể dùng alert hoặc console.log

// Hero Components
import { OverallScoreCard } from '../components/Dashboard/OverallScoreCard';
import { TodayWorkoutCard } from '../components/Dashboard/TodayWorkoutCard';
import { SmartSuggestions } from '../components/Dashboard/SmartSuggestions';

// Main Components
import { DailySummaryCards } from '../components/Dashboard/DailySummaryCards';
import { QuickActions } from '../components/Dashboard/QuickActions';
import { ProgressChart } from '../components/Dashboard/ProgressChart';
import { CheckInPhotos } from '../components/Dashboard/CheckInPhotos';
import { AchievementsCard } from '../components/Dashboard/AchievementsCard';
import { MainGoalCard } from '../components/Dashboard/MainGoalCard';
import { WeekComparison } from '../components/Dashboard/WeekComparison';
import { StreakBadge } from '../components/Dashboard/StreakBadge';

// --- INTERFACES ---
interface MealLog {
  calories: number;
  protein_g: number;
  fats_g: number;
  carbs_g: number;
}

// Cập nhật lại interface Suggestion để hỗ trợ xử lý click
interface SuggestionItem {
  icon: string;
  text: string;
  action: string;
  actionKey?: string; // Key để phân biệt hành động (VD: 'log_water')
  priority: 'high' | 'medium' | 'low';
}

interface DashboardData {
  userName: string;
  overallScore: number;
  streak: number;
  todayWorkout: any;
  suggestions: SuggestionItem[]; // Dùng interface mới
  calories: { current: number; target: number };
  macros: { protein: number; carbs: number; fats: number };
  workout: { completed: number; target: number };
  water: { glasses: number; target: number };
  weightProgress: any[];
  prs: any[];
  mainGoal: any;
  weekComparison: any;
  lastWeek: any;
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper: Lấy ngày YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().split('T')[0];
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const todayStr = getTodayDate();
      const token = localStorage.getItem('token'); // Lấy token để xác thực

      // 1. FETCH DINH DƯỠNG (MEAL LOGS)
      let nutritionTotals = { calories: 0, protein: 0, fats: 0, carbs: 0 };
      try {
        // Thay user_id=1 bằng user_id thật hoặc lấy từ token ở backend
        const res = await fetch(`http://localhost:8080/nutrition/meal-logs?user_id=1&date=${todayStr}`);
        if (res.ok) {
          const logs: MealLog[] = await res.json();
          nutritionTotals = logs.reduce((acc, item) => ({
            calories: acc.calories + item.calories,
            protein: acc.protein + item.protein_g,
            fats: acc.fats + item.fats_g,
            carbs: acc.carbs + item.carbs_g
          }), { calories: 0, protein: 0, fats: 0, carbs: 0 });
        }
      } catch (e) { console.error("Lỗi Nutrition:", e); }

      // 2. FETCH NƯỚC (GỌI API MỚI)
      let waterData = { glasses: 0, target: 8 }; // Mặc định
      try {
        const waterRes = await fetch(`http://localhost:8080/api/water?date=${todayStr}`, {
           headers: { 'Authorization': `Bearer ${token}` }
        });
        if (waterRes.ok) {
           // API trả về: { glasses: 2, target: 8 }
           const w = await waterRes.json();
           waterData = { glasses: w.glasses, target: w.target };
        }
      } catch (e) { console.error("Lỗi Water API:", e); }


      // 3. TẠO DỮ LIỆU DASHBOARD
      const baseData: DashboardData = {
        userName: "Đình Lực",
        overallScore: 75,
        streak: 3,
        todayWorkout: { name: "Ngực & Tay sau", duration: 45, exercises: 5, status: "not_started" },
        suggestions: [], // Để trống, sẽ tính toán bên dưới
        calories: { current: Math.round(nutritionTotals.calories), target: 2500 },
        macros: { 
            protein: Math.round(nutritionTotals.protein), 
            carbs: Math.round(nutritionTotals.carbs), 
            fats: Math.round(nutritionTotals.fats) 
        },
        workout: { completed: 45, target: 60 },
        water: waterData, // Dữ liệu nước thật
        weightProgress: [], // ... (giữ nguyên mock data biểu đồ)
        prs: [], 
        mainGoal: { start: 90, current: 83, target: 80 },
        weekComparison: { weight: 0, caloriesAvg: 0, workouts: 0 },
        lastWeek: { weight: 0, caloriesAvg: 0, workouts: 0 }
      };

      // 4. TÍNH TOÁN GỢI Ý THÔNG MINH
      baseData.suggestions = generateSuggestions(baseData);

      setData(baseData);
    } catch (error) {
      console.error("Lỗi tải dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- HÀM TẠO GỢI Ý ĐỘNG ---
  const generateSuggestions = (currentData: DashboardData): SuggestionItem[] => {
      const list: SuggestionItem[] = [];

      // Logic Nước: Nếu chưa uống đủ target (8 ly) thì hiện gợi ý
      const waterLeft = currentData.water.target - currentData.water.glasses;
      if (waterLeft > 0) {
          list.push({
              icon: "💧",
              text: `Bạn mới uống ${currentData.water.glasses}/${currentData.water.target} ly.`,
              action: "Thêm 1 ly (+250ml)",
              actionKey: "log_water", // Key để xử lý click
              priority: waterLeft > 4 ? "high" : "medium"
          });
      }

      // Logic Protein (Ví dụ)
      if (currentData.macros.protein < 50) {
          list.push({
              icon: "🍗",
              text: "Lượng đạm hôm nay còn thấp.",
              action: "Xem thực phẩm giàu đạm",
              actionKey: "view_protein",
              priority: "medium"
          });
      }

      return list;
  };

  // --- HÀM XỬ LÝ KHI BẤM NÚT GỢI Ý ---
  // Bạn cần sửa SmartSuggestions.tsx để nhận prop `onActionClick` như đã bàn ở các bước trước
  // Nếu chưa sửa component con, bạn có thể truyền hàm này vào nhưng nó sẽ chưa chạy được.
  const handleSuggestionClick = async (actionKey: string) => {
      if (!data) return;

      if (actionKey === 'log_water') {
          // 1. Optimistic Update (Cập nhật giao diện ngay lập tức cho mượt)
          const newGlasses = data.water.glasses + 1;
          const updatedData = {
              ...data,
              water: { ...data.water, glasses: newGlasses }
          };
          // Tính lại gợi ý (nếu đủ nước thì gợi ý sẽ mất)
          updatedData.suggestions = generateSuggestions(updatedData);
          setData(updatedData);

          // 2. Gọi API cập nhật ngầm
          try {
              const token = localStorage.getItem('token');
              await fetch('http://localhost:8080/api/water/log', {
                  method: 'POST',
                  headers: { 
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                      date: getTodayDate(),
                      amount: 1
                  })
              });
              toast.success("Đã thêm 1 ly nước!");
          } catch (err) {
              console.error("Lỗi cập nhật nước", err);
              // Nếu lỗi thì nên revert lại state (tùy chọn)
          }
      }
      else if (actionKey === 'view_protein') {
          toast.info("Gợi ý: Ức gà, Trứng, Whey Protein...");
      }
  };


  if (loading) return <div className="p-12 text-center">Đang tải...</div>;
  if (!data) return <div className="p-12 text-center">Lỗi dữ liệu</div>;

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Chào mừng trở lại, {data.userName}! 👋
        </h1>
        <StreakBadge streak={data.streak} />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* CỘT TRÁI - 2/3 */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          
          <div className="hidden lg:grid lg:grid-cols-3 gap-4">
            <OverallScoreCard score={data.overallScore} />
            <TodayWorkoutCard workout={data.todayWorkout} />
            
            {/* TRUYỀN SUGGESTIONS VÀ HÀM XỬ LÝ CLICK */}
            {/* Lưu ý: Bạn cần chắc chắn SmartSuggestions đã được sửa để nhận prop onActionClick */}
            <SmartSuggestions 
                suggestions={data.suggestions} 
                // @ts-ignore: Bỏ qua lỗi TS nếu component con chưa định nghĩa type onActionClick
                onActionClick={handleSuggestionClick} 
            />
          </div>

          {/* Mobile view */}
          <section className="lg:hidden grid gap-4">
             <SmartSuggestions 
                suggestions={data.suggestions} 
                // @ts-ignore
                onActionClick={handleSuggestionClick}
             />
          </section>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">📊 Tóm tắt hôm nay</h2>
            <DailySummaryCards
              calories={data.calories}
              macros={data.macros}
              workout={data.workout}
              water={data.water} 
            />
          </div>

          <ProgressChart  />
          <CheckInPhotos />
        </div>

        {/* CỘT PHẢI - 1/3 */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">⚡ Ghi nhanh</h2>
            <QuickActions />
          </div>
          <AchievementsCard prs={data.prs} />
          <MainGoalCard goal={data.mainGoal} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;