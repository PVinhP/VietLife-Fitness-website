// src/pages/profile/components/Dashboard/WeekComparison.tsx
import React from 'react';

interface Props {
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

export const WeekComparison: React.FC<Props> = ({ weekComparison, lastWeek }) => {
  // Tính toán sự khác biệt
  const weightDiff = weekComparison.weight - lastWeek.weight;
  const weightPercent = lastWeek.weight !== 0 
    ? ((Math.abs(weightDiff) / Math.abs(lastWeek.weight)) * 100).toFixed(0)
    : 0;
  const workoutDiff = weekComparison.workouts - lastWeek.workouts;
  const caloriesDiff = weekComparison.caloriesAvg - lastWeek.caloriesAvg;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <span>📈</span> So với tuần trước
      </h2>
      
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
  );
};