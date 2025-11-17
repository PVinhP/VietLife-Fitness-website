// src/pages/profile/components/Dashboard/ProgressSection.tsx
import React from 'react';

interface Props {
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
}

export const ProgressSection: React.FC<Props> = ({ 
  weightProgress, 
  mainGoal, 
  weekComparison,
  lastWeek,
  achievements 
}) => {
  const { start, current, target } = mainGoal;
  const remaining = Math.abs(current - target);
  const totalDistance = Math.abs(start - target);
  const progress = ((Math.abs(start - current) / totalDistance) * 100).toFixed(1);

  // Tính toán xu hướng
  const firstWeight = weightProgress[0]?.kg || current;
  const lastWeight = weightProgress[weightProgress.length - 1]?.kg || current;
  const weeklyChange = (firstWeight - lastWeight).toFixed(1);
  const trend = parseFloat(weeklyChange) > 0 ? 'giảm' : 'tăng';
  const trendIcon = parseFloat(weeklyChange) > 0 ? '📉' : '📈';

  // So sánh với tuần trước
  const weightDiff = weekComparison.weight - lastWeek.weight;
  const weightPercent = lastWeek.weight !== 0 
    ? ((Math.abs(weightDiff) / Math.abs(lastWeek.weight)) * 100).toFixed(0)
    : 0;
  const workoutDiff = weekComparison.workouts - lastWeek.workouts;
  const caloriesDiff = weekComparison.caloriesAvg - lastWeek.caloriesAvg;

  return (
    <div className="space-y-6">
      {/* Row 1: Biểu đồ + Mục tiêu */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Biểu đồ 7 ngày */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            📊 Cân nặng 7 ngày qua
          </h3>
          
          {/* Simple bar chart */}
          <div className="flex items-end justify-between h-40 gap-2 mb-4">
            {weightProgress.map((day, index) => {
              const maxWeight = Math.max(...weightProgress.map(d => d.kg));
              const minWeight = Math.min(...weightProgress.map(d => d.kg));
              const range = maxWeight - minWeight || 1;
              const height = ((day.kg - minWeight) / range) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-gray-700">{day.kg}</span>
                  <div 
                    className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-lg transition-all duration-300 hover:from-indigo-600 hover:to-indigo-500"
                    style={{ height: `${Math.max(height, 20)}%` }}
                  />
                  <span className="text-xs text-gray-500 mt-1">{day.date}</span>
                </div>
              );
            })}
          </div>

          {/* Xu hướng */}
          <div className="bg-indigo-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              {trendIcon} Bạn đã <span className="font-bold text-indigo-600">{trend} {Math.abs(parseFloat(weeklyChange))}kg</span> trong 7 ngày qua
            </p>
          </div>
        </div>

        {/* Mục tiêu chính */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            🎯 Mục tiêu chính
          </h3>
          
          <div className="text-center mb-4">
            <p className="text-gray-600 mb-2">Giảm cân</p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold text-indigo-600">{remaining}</span>
              <span className="text-2xl text-gray-500">kg</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">còn lại để đạt mục tiêu!</p>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>{start}kg</span>
              <span className="font-semibold text-indigo-600">{progress}%</span>
              <span>{target}kg</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Current weight */}
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <p className="text-sm text-gray-600">Cân nặng hiện tại</p>
            <p className="text-2xl font-bold text-purple-600">{current}kg</p>
          </div>
        </div>
      </div>

      {/* Row 2: So sánh tuần + Thành tích */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* So sánh với tuần trước */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            📈 So với tuần trước
          </h3>
          
          <div className="space-y-3">
            {/* Cân nặng */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Cân nặng:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">{weekComparison.weight}kg</span>
                <span className={`text-sm font-semibold ${weightDiff < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {weightDiff < 0 ? '▲' : '▼'} {weightPercent}%
                </span>
                {weightDiff < 0 && <span className="text-lg">🎉</span>}
              </div>
            </div>

            {/* Calo trung bình */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Calo TB:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">{weekComparison.caloriesAvg}</span>
                <span className={`text-sm font-semibold ${caloriesDiff < 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  {caloriesDiff < 0 ? '▼' : '▲'} {Math.abs(caloriesDiff)}
                </span>
              </div>
            </div>

            {/* Buổi tập */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Buổi tập:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">{weekComparison.workouts}</span>
                <span className={`text-sm font-semibold ${workoutDiff > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                  {workoutDiff > 0 ? '▲' : '▼'} {Math.abs(workoutDiff)}
                </span>
                {workoutDiff > 0 && <span className="text-lg">💪</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Thành tích tuần này */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl shadow-md border border-orange-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span>🏆</span> Thành tích tuần này
          </h3>
          
          <div className="space-y-3">
            {achievements.map((achievement, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm"
              >
                <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                <p className="text-sm text-gray-700">{achievement}</p>
              </div>
            ))}
          </div>

          {/* Motivational message */}
          <div className="mt-4 p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-white text-center">
            <p className="text-sm font-semibold">
              Tiếp tục phát huy! 🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};