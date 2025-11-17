// src/pages/profile/tabs/widgets/AchievementsCard.tsx

import React from 'react';

// Định nghĩa kiểu dữ liệu cho props
interface PrItem {
  name: string;
  value: string;
}

interface AchievementsProps {
  prs: PrItem[];
}

export const AchievementsCard: React.FC<AchievementsProps> = ({ prs }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">🏆 Thành tích</h2>
      
      {/* Huy hiệu (Tạm thời để tĩnh) */}
      <div className="flex gap-3 mb-4">
        <span className="text-3xl p-2 bg-yellow-100 rounded-full" title="Chuỗi 3 ngày">🔥</span>
        <span className="text-3xl p-2 bg-blue-100 rounded-full" title="Đạt mục tiêu cân nặng">🥇</span>
        <span className="text-3xl p-2 bg-green-100 rounded-full" title="Hoàn thành 10 buổi tập">💯</span>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-700 mb-2">📈 Kỷ lục cá nhân (PRs)</h3>
      
      {/* Danh sách PRs (Lấy từ props) */}
      <ul className="list-disc list-inside text-gray-600 space-y-1">
        {prs.length > 0 ? (
          prs.map(pr => (
            <li key={pr.name}>
              {pr.name}: <span className="font-semibold">{pr.value}</span>
            </li>
          ))
        ) : (
          <p className="text-sm text-gray-500">Chưa có PR nào được ghi nhận.</p>
        )}
      </ul>
    </div>
  );
};