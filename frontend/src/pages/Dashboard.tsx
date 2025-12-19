// src/pages/profile/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify'; 

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
import { StreakBadge } from '../components/Dashboard/StreakBadge';

// --- INTERFACES ---
interface MealLog {
  calories: number;
  protein_g: number;
  fats_g: number;
  carbs_g: number;
}

interface SuggestionItem {
  icon: string;
  text: string;
  action: string;
  actionKey?: string;
  priority: 'high' | 'medium' | 'low';
}

interface DashboardData {
  userName: string;
  overallScore: number;
  streak: number;
  todayWorkout: any; // Dữ liệu bài tập sẽ được lấy từ API
  suggestions: SuggestionItem[];
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
      const token = localStorage.getItem('token'); 

      // 1. FETCH DINH DƯỠNG (Giữ nguyên logic cũ của bạn)
      let nutritionTotals = { calories: 0, protein: 0, fats: 0, carbs: 0 };
      try {
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

      // 2. FETCH NƯỚC (Giữ nguyên logic cũ của bạn)
      let waterData = { glasses: 0, target: 8 };
      try {
        const waterRes = await fetch(`http://localhost:8080/api/water?date=${todayStr}`, {
           headers: { 'Authorization': `Bearer ${token}` }
        });
        if (waterRes.ok) {
           const w = await waterRes.json();
           waterData = { glasses: w.glasses, target: w.target };
        }
      } catch (e) { console.error("Lỗi Water API:", e); }

      // --- 3. FETCH BÀI TẬP HÔM NAY (MỚI THÊM) ---
      let workoutDataForCard = { 
          name: "Nghỉ ngơi", 
          duration: 0, 
          exercises: 0, 
          status: "not_started" 
      };

      try {
        const workoutRes = await fetch('http://localhost:8080/api/ai-plan/today-workout', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const wData = await workoutRes.json();

        if (wData.hasPlan && wData.workout) {
            // Mapping dữ liệu từ API sang cấu trúc Card
            workoutDataForCard = {
                name: wData.workout.focus || "Tập luyện theo lịch",
                exercises: wData.workout.exercises ? wData.workout.exercises.length : 0,
                // Ước lượng thời gian: 10 phút/bài nếu không có dữ liệu
                duration: (wData.workout.exercises ? wData.workout.exercises.length : 0) * 10,
                status: "not_started" // Có thể update logic check status sau
            };
        } else if (wData.hasPlan === false) {
             workoutDataForCard.name = "Chưa có lộ trình";
        }
      } catch (e) {
        console.error("Lỗi lấy bài tập:", e);
      }
      // ---------------------------------------------

      // 4. TỔNG HỢP DỮ LIỆU
      const baseData: DashboardData = {
        userName: "",
        overallScore: 75,
        streak: 3,
        
        // Gán dữ liệu bài tập thật vào đây
        todayWorkout: workoutDataForCard, 
        
        suggestions: [],
        calories: { current: Math.round(nutritionTotals.calories), target: 2500 },
        macros: { 
            protein: Math.round(nutritionTotals.protein), 
            carbs: Math.round(nutritionTotals.carbs), 
            fats: Math.round(nutritionTotals.fats) 
        },
        workout: { completed: 0, target: workoutDataForCard.duration || 60 },
        water: waterData,
        weightProgress: [], 
        prs: [], 
        mainGoal: { start: 90, current: 83, target: 80 },
        weekComparison: { weight: 0, caloriesAvg: 0, workouts: 0 },
        lastWeek: { weight: 0, caloriesAvg: 0, workouts: 0 }
      };

      // 5. TẠO GỢI Ý
      baseData.suggestions = generateSuggestions(baseData);

      setData(baseData);
    } catch (error) {
      console.error("Lỗi tải dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = (currentData: DashboardData): SuggestionItem[] => {
      const list: SuggestionItem[] = [];

      // Logic Nước
      const waterLeft = currentData.water.target - currentData.water.glasses;
      if (waterLeft > 0) {
          list.push({
              icon: "💧",
              text: `Bạn mới uống ${currentData.water.glasses}/${currentData.water.target} ly.`,
              action: "Thêm 1 ly (+250ml)",
              actionKey: "log_water",
              priority: waterLeft > 4 ? "high" : "medium"
          });
      }

      // Logic Protein
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

  const handleSuggestionClick = async (actionKey: string) => {
      if (!data) return;

      if (actionKey === 'log_water') {
          const newGlasses = data.water.glasses + 1;
          const updatedData = {
              ...data,
              water: { ...data.water, glasses: newGlasses }
          };
          updatedData.suggestions = generateSuggestions(updatedData);
          setData(updatedData);

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
          }
      }
      else if (actionKey === 'view_protein') {
          toast.info("Gợi ý: Ức gà, Trứng, Whey Protein...");
      }
  };

  if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
  );
  
  if (!data) return <div className="p-12 text-center">Không thể tải dữ liệu</div>;

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Chào mừng trở lại! 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">Hôm nay bạn cảm thấy thế nào?</p>
        </div>
        <StreakBadge streak={data.streak} />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* CỘT TRÁI - 2/3 */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <OverallScoreCard score={data.overallScore} />
            
            {/* CARD BÀI TẬP: Tự động hiện data thật */}
            <TodayWorkoutCard workout={data.todayWorkout} />
            
            {/* CARD GỢI Ý */}
            <SmartSuggestions 
                suggestions={data.suggestions} 
                // @ts-ignore
                onActionClick={handleSuggestionClick} 
            />
          </div>

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