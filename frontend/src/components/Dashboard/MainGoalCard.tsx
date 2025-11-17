// src/pages/profile/tabs/widgets/MainGoalCard.tsx

import React from 'react';

// Định nghĩa kiểu dữ liệu cho props
interface GoalProps {
  goal: {
    start: number;
    current: number;
    target: number;
  };
}

export const MainGoalCard: React.FC<GoalProps> = ({ goal }) => {
  // --- Logic tính toán tiến độ ---
  const { start, current, target } = goal;

  // Tổng quãng đường cần đi (ví dụ: 90kg -> 80kg là 10kg)
  const totalDistance = Math.abs(start - target); 
  // Quãng đường đã đi (ví dụ: 90kg -> 85kg là 5kg)
  const distanceCovered = Math.abs(start - current);
  // Số kg còn lại (ví dụ: 85kg -> 80kg là 5kg)
  const remaining = Math.abs(current - target);

  // Tính phần trăm, đảm bảo không chia cho 0
  let percent = 0;
  if (totalDistance > 0) {
    percent = (distanceCovered / totalDistance) * 100;
  }
  
  // Đảm bảo không vượt quá 100%
  percent = Math.min(Math.max(percent, 0), 100); 
  // --- Hết Logic ---

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Mục tiêu của tôi</h2>
      <p className="text-gray-500 text-sm">
        Mục tiêu chính: <span className="font-semibold text-gray-700">Giảm cân</span>
      </p>
      
      {/* Thanh tiến độ động */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 my-3">
        <div 
          className="bg-indigo-500 h-2.5 rounded-full" 
          style={{ width: `${percent}%` }}
        ></div>
      </div>
      
      {/* Nhãn động */}
      <div className="flex justify-between text-sm font-medium text-gray-600">
        <span>Bắt đầu: {start}kg</span>
        <span>Mục tiêu: {target}kg</span>
      </div>
      
      <p className="text-center text-2xl font-bold text-indigo-600 mt-3">
        Còn {remaining}kg nữa!
      </p>
    </div>
  );
};