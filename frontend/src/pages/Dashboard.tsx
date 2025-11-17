// src/pages/profile/tabs/DashboardTab.tsx
// DASHBOARD HYBRID - Kết hợp điểm mạnh của cả 2 phiên bản

import React, { useState, useEffect } from 'react';

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

interface DashboardData {
  userName: string;
  overallScore: number;
  streak: number;
  todayWorkout: {
    name: string;
    duration: number;
    exercises: number;
    status: 'not_started' | 'in_progress' | 'completed';
  };
  suggestions: Array<{
    icon: string;
    text: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  calories: { current: number; target: number };
  macros: { protein: number; carbs: number; fats: number };
  workout: { completed: number; target: number };
  water: { glasses: number; target: number };
  weightProgress: { name: string; kg: number }[];
  prs: { name: string; value: string }[];
  mainGoal: { start: number; current: number; target: number };
  weekComparison: {
    weight: number;
    caloriesAvg: number;
    workouts: number;
  };
  lastWeek: {
    weight: number;
    caloriesAvg: number;
    workouts: number;
  };
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockData: DashboardData = {
      userName: "Đình Lực",
      overallScore: 75,
      streak: 3,
      todayWorkout: {
        name: "Ngực & Tay sau",
        duration: 45,
        exercises: 5,
        status: "not_started"
      },
      suggestions: [
        {
          icon: "💧",
          text: "Bạn chưa uống đủ nước hôm nay",
          action: "Thêm 1 ly nước",
          priority: "high"
        },
        {
          icon: "🍗",
          text: "Protein còn thiếu 30g",
          action: "Xem gợi ý món ăn",
          priority: "medium"
        }
      ],
      calories: { current: 1500, target: 2500 },
      macros: { protein: 80, carbs: 150, fats: 50 },
      workout: { completed: 45, target: 60 },
      water: { glasses: 5, target: 8 },
      weightProgress: [
        { name: 'Tuần 1', kg: 85 },
        { name: 'Tuần 2', kg: 84.5 },
        { name: 'Tuần 3', kg: 84 },
        { name: 'Tuần 4', kg: 83 },
      ],
      prs: [
        { name: 'Đẩy ngực', value: '80kg' },
        { name: 'Squat', value: '100kg' },
        { name: 'Chạy 5km', value: '25:00' },
      ],
      mainGoal: { start: 90, current: 83, target: 80 },
      weekComparison: {
        weight: -0.5,
        caloriesAvg: 1850,
        workouts: 4
      },
      lastWeek: {
        weight: -0.3,
        caloriesAvg: 1900,
        workouts: 3
      }
    };
    
    setData(mockData);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-gray-50 min-h-screen">
        <p className="text-gray-600">Không thể tải dữ liệu.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Chào mừng trở lại, {data.userName}! 👋
        </h1>
        <StreakBadge streak={data.streak} />
      </div>

      {/* HERO SECTION - Chỉ hiển thị trên mobile và tablet */}
      <section className="mb-6 lg:hidden">
        <div className="grid grid-cols-1 gap-4">
          <OverallScoreCard score={data.overallScore} />
          <TodayWorkoutCard workout={data.todayWorkout} />
          <SmartSuggestions suggestions={data.suggestions} />
        </div>
      </section>

      {/* LAYOUT 7/3 - Desktop */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* CỘT TRÁI - 2/3 */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          
          {/* Hero Section cho Desktop - Ngang 3 cột */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-4">
            <OverallScoreCard score={data.overallScore} />
            <TodayWorkoutCard workout={data.todayWorkout} />
            <SmartSuggestions suggestions={data.suggestions} />
          </div>

          {/* Tóm tắt hôm nay */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              📊 Tóm tắt hôm nay
            </h2>
            <DailySummaryCards
              calories={data.calories}
              macros={data.macros}
              workout={data.workout}
              water={data.water}
            />
          </div>

          {/* Biểu đồ Tiến trình */}
          <ProgressChart chartData={data.weightProgress} />

          {/* Ảnh Check-in */}
          <CheckInPhotos />

          {/* So sánh tuần (Chỉ hiện trên mobile) */}
          <div className="lg:hidden">
            <WeekComparison
              weekComparison={data.weekComparison}
              lastWeek={data.lastWeek}
            />
          </div>

        </div>

        {/* CỘT PHẢI - 1/3 (Sidebar) */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Ghi nhanh */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              ⚡ Ghi nhanh
            </h2>
            <QuickActions />
          </div>

          {/* So sánh tuần (Desktop) */}
          <div className="hidden lg:block">
            <WeekComparison
              weekComparison={data.weekComparison}
              lastWeek={data.lastWeek}
            />
          </div>

          {/* Thành tích */}
          <AchievementsCard prs={data.prs} />

          {/* Mục tiêu */}
          <MainGoalCard goal={data.mainGoal} />

        </div>
      </div>

    </div>
  );
};

export default Dashboard;