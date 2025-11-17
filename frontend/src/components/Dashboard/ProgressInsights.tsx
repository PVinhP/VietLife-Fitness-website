// src/pages/profile/components/Dashboard/ProgressInsights.tsx
import React from 'react';

interface Props {
  weightProgress: { date: string; kg: number }[];
  mainGoal: { start: number; current: number; target: number };
}

export const ProgressInsights: React.FC<Props> = ({ weightProgress, mainGoal }) => {
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Biểu đồ 7 ngày gần nhất */}
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
                  className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-lg transition-all duration-300"
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
  );
};