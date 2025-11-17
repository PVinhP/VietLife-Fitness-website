// src/pages/profile/components/Dashboard/SmartSuggestions.tsx
import React from 'react';

interface Suggestion {
  icon: string;
  text: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

interface Props {
  suggestions: Suggestion[];
}

export const SmartSuggestions: React.FC<Props> = ({ suggestions }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const handleAction = (suggestion: Suggestion) => {
    alert(`Action: ${suggestion.action}`);
    // TODO: Implement actual action
  };

  if (suggestions.length === 0) {
    return (
      <div className="bg-green-50 p-6 rounded-xl shadow-md border border-green-200">
        <div className="text-center">
          <span className="text-4xl mb-2 block">🎉</span>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            Hoàn hảo!
          </h3>
          <p className="text-sm text-gray-600">
            Bạn đang làm rất tốt hôm nay
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">GỢI Ý CHO BẠN</h3>
        <span className="text-2xl">💡</span>
      </div>

      {/* Show max 2 suggestions */}
      <div className="space-y-3">
        {suggestions.slice(0, 2).map((suggestion, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${getPriorityColor(suggestion.priority)} transition-all hover:shadow-sm`}
          >
            <div className="flex items-start gap-2 mb-2">
              <span className="text-xl">{suggestion.icon}</span>
              <p className="text-sm text-gray-700 flex-1">
                {suggestion.text}
              </p>
            </div>
            <button
              onClick={() => handleAction(suggestion)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
            >
              {suggestion.action} →
            </button>
          </div>
        ))}
      </div>

      {/* Show count if more than 2 */}
      {suggestions.length > 2 && (
        <button className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 font-medium">
          +{suggestions.length - 2} gợi ý khác
        </button>
      )}
    </div>
  );
};