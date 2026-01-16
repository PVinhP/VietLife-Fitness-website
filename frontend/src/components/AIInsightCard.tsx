// src/components/AIInsightCard.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bot, Lightbulb, Info, AlertTriangle, Trophy, Frown, CheckCircle } from 'lucide-react';

interface AIInsightCardProps {
  startDate: string;
  endDate: string;
}

interface InsightData {
  scenario: string;
  message: string;
  action: string;
  footer: string;
}

const AIInsightCard: React.FC<AIInsightCardProps> = ({ startDate, endDate }) => {
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(false);

  // Hàm gọi API
  const fetchInsight = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const token = localStorage.getItem("token"); // Nếu có dùng token

      // Đảm bảo đúng đường dẫn API của bạn
      const res = await axios.get('http://localhost:8080/nutrition/quick-insight', {
        params: { startDate, endDate },
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (error) {
      console.error("Lỗi lấy nhận xét AI:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gọi lại khi ngày tháng thay đổi
  useEffect(() => {
    if (startDate && endDate) {
      fetchInsight();
    }
  }, [startDate, endDate]);

  // --- LOGIC CHỌN MÀU SẮC & ICON THEO KỊCH BẢN ---
  const getTheme = (scenario: string) => {
    const s = scenario?.toUpperCase() || "";
    if (s.includes("SKINNY FAT") || s.includes("TÍCH MỠ") || s.includes("CÔNG CỐC")) {
      return { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: <AlertTriangle /> };
    }
    if (s.includes("XUẤT SẮC") || s.includes("SIẾT CƠ") || s.includes("CHUẨN")) {
      return { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: <Trophy /> };
    }
    if (s.includes("THIẾU CHẤT")) {
      return { color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", icon: <Frown /> };
    }
    return { color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", icon: <Bot /> };
  };

  const theme = data ? getTheme(data.scenario) : { color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200", icon: <Bot /> };

  return (
    <div className={`w-full p-6 rounded-2xl border shadow-sm transition-all duration-300 ${theme.bg} ${theme.border} mb-8`}>
      {loading ? (
        // Giao diện Skeleton khi đang tải
        <div className="animate-pulse flex gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ) : data ? (
        // Giao diện hiển thị kết quả
        <div className="flex flex-col md:flex-row gap-5">
          {/* Cột trái: Avatar & Scenario */}
          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-white shadow-sm border-2 ${theme.border} ${theme.color}`}>
              {theme.icon}
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full bg-white border ${theme.border} ${theme.color}`}>
              {data.scenario}
            </span>
          </div>

          {/* Cột phải: Nội dung */}
          <div className="flex-1 space-y-3">
            <div>
              <h4 className={`font-bold text-sm uppercase mb-1 flex items-center gap-2 ${theme.color}`}>
                PT AI Nhắn nhủ:
              </h4>
              <p className="text-slate-700 text-lg font-medium leading-relaxed italic">
                "{data.message}"
              </p>
            </div>

            {/* Hộp hành động */}
            <div className="bg-white/60 p-3 rounded-xl border border-dashed border-gray-300 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase">Hành động ngay:</span>
                <span className="text-slate-800 font-semibold">{data.action}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-gray-200/50 flex items-center gap-2 text-xs text-slate-400">
              <Info size={14} />
              {data.footer}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-slate-400 py-4">Không có dữ liệu phân tích.</div>
      )}
    </div>
  );
};

export default AIInsightCard;