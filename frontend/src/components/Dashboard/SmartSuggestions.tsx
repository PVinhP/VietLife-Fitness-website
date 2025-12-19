import React from 'react';

// Export interface này để dùng chung được ở Dashboard
export interface Suggestion {
  icon: string;
  text: string;
  action: string;
  actionKey?: string; // Key định danh hành động (VD: 'log_water')
  priority: 'high' | 'medium' | 'low';
}

interface Props {
  suggestions: Suggestion[];
  onActionClick: (key: string) => void; // Hàm callback gửi key về Dashboard
}

export const SmartSuggestions: React.FC<Props> = ({ suggestions, onActionClick }) => {
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  if (suggestions.length === 0) {
    return (
      <div className="bg-green-50 p-6 rounded-xl shadow-md border border-green-200 h-full flex flex-col justify-center items-center">
        <div className="text-center">
          <span className="text-4xl mb-2 block">🎉</span>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            Tuyệt vời!
          </h3>
          <p className="text-sm text-gray-600">
            Bạn đang làm rất tốt, không có nhắc nhở nào lúc này.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">GỢI Ý CHO BẠN</h3>
        <span className="text-2xl">💡</span>
      </div>

      {/* Show max 3 suggestions (đã tăng lên 3 để hiện đủ nước, protein...) */}
      <div className="space-y-3">
        {suggestions.slice(0, 3).map((suggestion, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${getPriorityColor(suggestion.priority)} transition-all hover:shadow-sm`}
          >
            <div className="flex items-start gap-2 mb-2">
              <span className="text-xl">{suggestion.icon}</span>
              <p className="text-sm text-gray-700 flex-1 font-medium">
                {suggestion.text}
              </p>
            </div>
            <button
              onClick={() => {
                if (suggestion.actionKey) {
                  onActionClick(suggestion.actionKey);
                }
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors bg-white/60 px-2 py-1.5 rounded-md border border-indigo-100 shadow-sm"
            >
              {suggestion.action} →
            </button>
          </div>
        ))}
      </div>

      {/* Show count if more than 3 */}
      {suggestions.length > 3 && (
        <button className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 font-medium text-center">
          +{suggestions.length - 3} gợi ý khác
        </button>
      )}
    </div>
  );
};