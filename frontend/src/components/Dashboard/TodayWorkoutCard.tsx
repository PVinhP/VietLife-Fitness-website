// src/pages/profile/components/Dashboard/TodayWorkoutCard.tsx
import React from 'react';

interface Props {
  workout: {
    name: string;
    duration: number;
    exercises: number;
    status: 'not_started' | 'in_progress' | 'completed';
  };
}

export const TodayWorkoutCard: React.FC<Props> = ({ workout }) => {
  const getStatusConfig = () => {
    switch (workout.status) {
      case 'completed':
        return {
          bg: 'bg-green-50 border-green-200',
          buttonBg: 'bg-green-600 hover:bg-green-700',
          buttonText: 'Đã hoàn thành',
          icon: '✅',
          disabled: true
        };
      case 'in_progress':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
          buttonText: 'Tiếp tục',
          icon: '⏸️',
          disabled: false
        };
      default:
        return {
          bg: 'bg-purple-50 border-purple-200',
          buttonBg: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700',
          buttonText: 'Bắt đầu tập',
          icon: '🏋️',
          disabled: false
        };
    }
  };

  const config = getStatusConfig();

  const handleStart = () => {
    if (!config.disabled) {
      alert(`Bắt đầu buổi tập: ${workout.name}`);
      // TODO: Navigate to workout screen
    }
  };

  return (
    <div className={`${config.bg} p-6 rounded-xl shadow-md border hover:shadow-lg transition-all`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-600">BUỔI TẬP HÔM NAY</h3>
        <span className="text-2xl">{config.icon}</span>
      </div>

      {/* Workout Name */}
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        {workout.name}
      </h2>

      {/* Details */}
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
        <span className="flex items-center gap-1">
          <span>⏱</span> {workout.duration} phút
        </span>
        <span className="flex items-center gap-1">
          <span>📋</span> {workout.exercises} bài tập
        </span>
      </div>

      {/* Action Button */}
      <button
        onClick={handleStart}
        disabled={config.disabled}
        className={`
          w-full ${config.buttonBg} text-white font-semibold py-3 px-4 rounded-lg
          transition-all duration-200 transform
          ${!config.disabled ? 'hover:scale-105 active:scale-95' : 'opacity-70 cursor-not-allowed'}
          shadow-md
        `}
      >
        {config.buttonText} 🔥
      </button>
    </div>
  );
};