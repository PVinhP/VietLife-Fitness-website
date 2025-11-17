// src/pages/profile/components/Dashboard/StreakBadge.tsx
import React from 'react';

interface Props {
  streak: number;
}

export const StreakBadge: React.FC<Props> = ({ streak }) => {
  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full shadow-md">
      <span className="text-2xl animate-pulse">🔥</span>
      <div className="flex flex-col">
        <span className="text-xs font-medium opacity-90">Chuỗi ngày</span>
        <span className="text-lg font-bold leading-none">{streak} ngày</span>
      </div>
    </div>
  );
};