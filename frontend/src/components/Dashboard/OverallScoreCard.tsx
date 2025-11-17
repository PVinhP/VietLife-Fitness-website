// src/pages/profile/components/Dashboard/OverallScoreCard.tsx
import React from 'react';

interface Props {
  score: number;
}

export const OverallScoreCard: React.FC<Props> = ({ score }) => {
  // Xác định màu sắc và message dựa trên điểm
  const getScoreColor = () => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-blue-500 to-indigo-600';
    if (score >= 40) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const getScoreMessage = () => {
    if (score >= 80) return 'Xuất sắc! 🎉';
    if (score >= 60) return 'Tốt lắm! 💪';
    if (score >= 40) return 'Cố lên! 👍';
    return 'Cần cải thiện 💫';
  };

  const getRemainingTasks = () => {
    const remaining = Math.ceil((100 - score) / 10);
    if (remaining <= 0) return 'Hoàn thành tất cả!';
    return `Còn ${remaining} mục tiêu nữa`;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-600">HÔM NAY</h3>
        <span className="text-2xl">💪</span>
      </div>

      {/* Score Display */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {score}
        </span>
        <span className="text-2xl text-gray-400 font-semibold">/100</span>
      </div>

      {/* Message */}
      <p className="text-lg font-semibold text-gray-700 mb-3">
        {getScoreMessage()}
      </p>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`bg-gradient-to-r ${getScoreColor()} h-2.5 rounded-full transition-all duration-500`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Remaining Tasks */}
      <p className="text-sm text-gray-500">
        {getRemainingTasks()}
      </p>
    </div>
  );
};