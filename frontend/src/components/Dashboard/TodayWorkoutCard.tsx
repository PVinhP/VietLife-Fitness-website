// src/pages/profile/components/Dashboard/TodayWorkoutCard.tsx
import { useNavigate } from 'react-router-dom';
import React from 'react';

interface Props {
  workout: {
    name: string;        // Tên buổi tập (VD: Ngực & Tay sau)
    duration: number;    // Thời gian (phút)
    exercises: number;   // Số lượng bài tập
    status: 'not_started' | 'in_progress' | 'completed';
  };
}

export const TodayWorkoutCard: React.FC<Props> = ({ workout }) => {
  const navigate = useNavigate();
  
  // Cấu hình giao diện dựa trên trạng thái
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
      // Chuyển hướng sang trang danh sách bài tập chi tiết
      navigate('/workout/today'); 
    }
  };

  return (
    <div className={`${config.bg} p-6 rounded-xl shadow-md border hover:shadow-lg transition-all h-full flex flex-col justify-between`}>
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">BUỔI TẬP HÔM NAY</h3>
          <span className="text-2xl">{config.icon}</span>
        </div>

        {/* TÊN BUỔI TẬP */}
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-3 line-clamp-2">
          {workout.name}
        </h2>

        {/* CHI TIẾT SỐ LIỆU */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-6 bg-white/60 p-2 rounded-lg w-fit backdrop-blur-sm">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="text-orange-500">⏱</span> {workout.duration} phút
          </span>
          <div className="w-px h-4 bg-gray-300"></div>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="text-blue-500">📋</span> {workout.exercises} bài tập
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleStart}
        disabled={config.disabled}
        className={`
          w-full ${config.buttonBg} text-white font-bold py-3 px-4 rounded-xl
          transition-all duration-200 transform shadow-lg shadow-purple-200/50
          ${!config.disabled ? 'hover:scale-[1.02] active:scale-95' : 'opacity-70 cursor-not-allowed'}
          flex items-center justify-center gap-2
        `}
      >
        {config.buttonText} {workout.status !== 'completed' && '🔥'}
      </button>
    </div>
  );
};