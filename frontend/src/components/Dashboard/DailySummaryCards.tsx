// src/components/Dashboard/DailySummaryCards.tsx
import React from 'react';

interface Props {
  calories: { current: number; target: number };
  macros: { protein: number; carbs: number; fats: number };
  workout: { completed: number; target: number };
  water: { glasses: number; target: number };
}

export const DailySummaryCards: React.FC<Props> = ({ 
  calories, 
  macros, 
  workout, 
  water 
}) => {
  const caloriesPercent = Math.min((calories.current / calories.target) * 100, 100);
  const workoutPercent = Math.min((workout.completed / workout.target) * 100, 100);
  const waterPercent = Math.min((water.glasses / water.target) * 100, 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Thẻ Calo */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl shadow-sm border border-orange-200">
        <div className="flex justify-between items-start mb-2">
          <span className="text-2xl">🔥</span>
          <span className="text-xs font-semibold text-orange-700 bg-orange-200 px-2 py-1 rounded-full">
            {Math.round(caloriesPercent)}%
          </span>
        </div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">Calo</h3>
        <p className="text-2xl font-bold text-gray-800">
          {calories.current.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500">
          / {calories.target.toLocaleString()} kcal
        </p>
        <div className="w-full bg-orange-200 rounded-full h-1.5 mt-3">
          <div 
            className="bg-orange-500 h-1.5 rounded-full transition-all duration-300" 
            style={{ width: `${caloriesPercent}%` }}
          />
        </div>
      </div>

      {/* Thẻ Macros */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl shadow-sm border border-blue-200">
        <div className="flex justify-between items-start mb-2">
          <span className="text-2xl">🍗</span>
        </div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">Macros</h3>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Protein:</span>
            <span className="text-sm font-bold text-blue-700">{macros.protein}g</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Carbs:</span>
            <span className="text-sm font-bold text-blue-700">{macros.carbs}g</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Fats:</span>
            <span className="text-sm font-bold text-blue-700">{macros.fats}g</span>
          </div>
        </div>
      </div>

      {/* Thẻ Tập luyện */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl shadow-sm border border-purple-200">
        <div className="flex justify-between items-start mb-2">
          <span className="text-2xl">💪</span>
          <span className="text-xs font-semibold text-purple-700 bg-purple-200 px-2 py-1 rounded-full">
            {Math.round(workoutPercent)}%
          </span>
        </div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">Tập luyện</h3>
        <p className="text-2xl font-bold text-gray-800">
          {workout.completed} phút
        </p>
        <p className="text-xs text-gray-500">
          / {workout.target} phút
        </p>
        <div className="w-full bg-purple-200 rounded-full h-1.5 mt-3">
          <div 
            className="bg-purple-500 h-1.5 rounded-full transition-all duration-300" 
            style={{ width: `${workoutPercent}%` }}
          />
        </div>
      </div>

      {/* Thẻ Nước uống */}
      <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-5 rounded-xl shadow-sm border border-cyan-200">
        <div className="flex justify-between items-start mb-2">
          <span className="text-2xl">💧</span>
          <span className="text-xs font-semibold text-cyan-700 bg-cyan-200 px-2 py-1 rounded-full">
            {Math.round(waterPercent)}%
          </span>
        </div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">Nước uống</h3>
        <p className="text-2xl font-bold text-gray-800">
          {water.glasses} ly
        </p>
        <p className="text-xs text-gray-500">
          / {water.target} ly
        </p>
        <div className="w-full bg-cyan-200 rounded-full h-1.5 mt-3">
          <div 
            className="bg-cyan-500 h-1.5 rounded-full transition-all duration-300" 
            style={{ width: `${waterPercent}%` }}
          />
        </div>
      </div>

    </div>
  );
};