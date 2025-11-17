// src/pages/profile/components/Dashboard/QuickActions.tsx
import React from 'react';

export const QuickActions = () => {
  const handleAddMeal = () => {
    alert('Mở modal thêm bữa ăn');
  };

  const handleAddWorkout = () => {
    alert('Mở modal thêm bài tập');
  };

  const handleAddWeight = () => {
    alert('Mở modal thêm cân nặng');
  };

  const actions = [
    {
      id: 'meal',
      label: 'Thêm bữa ăn',
      icon: '🍽️',
      onClick: handleAddMeal,
      bgColor: 'bg-gradient-to-br from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700'
    },
    {
      id: 'workout',
      label: 'Thêm bài tập',
      icon: '🏋️',
      onClick: handleAddWorkout,
      bgColor: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      hoverColor: 'hover:from-indigo-600 hover:to-indigo-700'
    },
    {
      id: 'weight',
      label: 'Thêm cân nặng',
      icon: '⚖️',
      onClick: handleAddWeight,
      bgColor: 'bg-gradient-to-br from-pink-500 to-pink-600',
      hoverColor: 'hover:from-pink-600 hover:to-pink-700'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {actions.map(action => (
        <button
          key={action.id}
          onClick={action.onClick}
          className={`
            ${action.bgColor} ${action.hoverColor}
            text-white p-6 rounded-xl shadow-md
            flex flex-col items-center justify-center gap-3
            transition-all duration-200 transform hover:scale-105
            active:scale-95
          `}
        >
          <span className="text-4xl">{action.icon}</span>
          <span className="text-lg font-semibold">{action.label}</span>
        </button>
      ))}
    </div>
  );
};