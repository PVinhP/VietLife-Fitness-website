// src/pages/profile/tabs/DashboardTab.tsx
import React, { useState, useEffect } from 'react';

// Hero Section Components
import { OverallScoreCard } from '../components/Dashboard/OverallScoreCard';
import { TodayWorkoutCard } from '../components/Dashboard/TodayWorkoutCard';
import { SmartSuggestions } from '../components/Dashboard/SmartSuggestions';

// Main Components
import { DailySummaryCards } from '../components/Dashboard/DailySummaryCards';
import { QuickActions } from '../components/Dashboard/QuickActions';
import { ProgressSection } from '../components/Dashboard/ProgressSection';
import { RecentActivity } from '../components/Dashboard/RecentActivity';
import { StreakBadge } from '../components/Dashboard/StreakBadge';

interface DashboardData {
  userName: string;
  overallScore: number;
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
  weightProgress: { date: string; kg: number }[];
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
  achievements: string[];
  recentActivities: Array<{
    id: string;
    type: 'meal' | 'workout' | 'weight';
    title: string;
    detail: string;
    time: string;
  }>;
  streak: number;
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockData: DashboardData = {
      userName: "Đình Lực",
      overallScore: 75,
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
        { date: '11/11', kg: 85.2 },
        { date: '12/11', kg: 85.0 },
        { date: '13/11', kg: 84.8 },
        { date: '14/11', kg: 84.5 },
        { date: '15/11', kg: 84.3 },
        { date: '16/11', kg: 84.0 },
        { date: '17/11', kg: 83.8 },
      ],
      mainGoal: { start: 90, current: 83.8, target: 80 },
      weekComparison: {
        weight: -0.5,
        caloriesAvg: 1850,
        workouts: 4
      },
      lastWeek: {
        weight: -0.3,
        caloriesAvg: 1900,
        workouts: 3
      },
      achievements: [
        "Đạt mục tiêu calo 5/7 ngày",
        "Hoàn thành 4/4 buổi tập",
        "Chuỗi 3 ngày liên tiếp"
      ],
      recentActivities: [
        {
          id: '1',
          type: 'meal',
          title: 'Bữa sáng',
          detail: 'Phở gà - 450 kcal',
          time: '7:30'
        },
        {
          id: '2',
          type: 'workout',
          title: 'Vai & Lưng',
          detail: 'Hoàn thành - 50 phút',
          time: 'Hôm qua'
        },
        {
          id: '3',
          type: 'weight',
          title: 'Cân nặng',
          detail: '83.8kg (-0.2kg)',
          time: 'Hôm nay'
        }
      ],
      streak: 3
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
          Chào {data.userName}! 👋
        </h1>
        <StreakBadge streak={data.streak} />
      </div>

      {/* HERO SECTION - Trả lời 3 câu hỏi trong 5 giây */}
      <section className="mb-6 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <OverallScoreCard score={data.overallScore} />
          <TodayWorkoutCard workout={data.todayWorkout} />
          <SmartSuggestions suggestions={data.suggestions} />
        </div>
      </section>

      {/* SECTION 1: Tóm tắt hôm nay */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span>📊</span> Tóm tắt hôm nay
        </h2>
        <DailySummaryCards
          calories={data.calories}
          macros={data.macros}
          workout={data.workout}
          water={data.water}
        />
      </section>

      {/* SECTION 2: Hành động nhanh */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span>⚡</span> Hành động nhanh
        </h2>
        <QuickActions />
      </section>

      {/* SECTION 3: Tiến độ & Động lực */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span>🎯</span> Tiến độ của bạn
        </h2>
        <ProgressSection
          weightProgress={data.weightProgress}
          mainGoal={data.mainGoal}
          weekComparison={data.weekComparison}
          lastWeek={data.lastWeek}
          achievements={data.achievements}
        />
      </section>

      {/* SECTION 4: Hoạt động gần đây */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span>📝</span> Hoạt động gần đây
        </h2>
        <RecentActivity activities={data.recentActivities} />
      </section>
    </div>
  );
};

export default Dashboard;