// src/pages/profile/components/Dashboard/RecentActivity.tsx
import React from 'react';

interface Activity {
  id: string;
  type: 'meal' | 'workout' | 'weight';
  title: string;
  detail: string;
  time: string;
}

interface Props {
  activities: Activity[];
}

export const RecentActivity: React.FC<Props> = ({ activities }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'meal': return '🍽️';
      case 'workout': return '💪';
      case 'weight': return '⚖️';
      default: return '📝';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'meal': return 'bg-green-100 border-green-200';
      case 'workout': return 'bg-purple-100 border-purple-200';
      case 'weight': return 'bg-blue-100 border-blue-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center">
        <span className="text-4xl mb-2 block">📭</span>
        <p className="text-gray-500">Chưa có hoạt động nào được ghi nhận</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`flex items-start gap-4 p-4 rounded-lg border ${getActivityColor(activity.type)} transition-all hover:shadow-sm`}
          >
            {/* Icon */}
            <div className="flex-shrink-0">
              <span className="text-2xl">{getActivityIcon(activity.type)}</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-800 mb-1">
                {activity.title}
              </h4>
              <p className="text-sm text-gray-600">
                {activity.detail}
              </p>
            </div>

            {/* Time */}
            <div className="flex-shrink-0">
              <span className="text-xs text-gray-500 font-medium">
                {activity.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <button className="w-full mt-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
        Xem tất cả hoạt động →
      </button>
    </div>
  );
};