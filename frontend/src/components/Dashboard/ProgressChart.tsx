import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';
// Import các hàm API service (đảm bảo bạn đã tạo file trackingService như hướng dẫn trước)
import { getTrackingHistory, addTrackingMetric } from '../../services/trackingService';

// Định nghĩa kiểu dữ liệu cho một điểm trên biểu đồ
interface ChartDataPoint {
  date: string;
  weight?: number;
  waist?: number;
  chest?: number;
}

export const ProgressChart: React.FC = () => {
  // --- STATE QUẢN LÝ DỮ LIỆU & UI ---
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'weight' | 'waist' | 'chest'>('weight');
  const today = new Date().toISOString().split('T')[0];
  const minDate = "2025-01-01";
  // --- STATE QUẢN LÝ FORM NHẬP LIỆU ---
  const [inputDate, setInputDate] = useState(new Date().toISOString().split('T')[0]); // Mặc định hôm nay
  const [inputWeight, setInputWeight] = useState('');
  const [inputWaist, setInputWaist] = useState('');
  const [inputChest, setInputChest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lấy token (tùy cách bạn lưu trữ)
  const token = localStorage.getItem('token');

  // --- HÀM 1: TẢI DỮ LIỆU ---
  const fetchData = async () => {
    try {
      const history = await getTrackingHistory(token);
      setData(history);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gọi hàm tải dữ liệu khi component vừa hiện lên
  useEffect(() => {
    fetchData();
  }, []);

  // --- HÀM 2: XỬ LÝ NỘP FORM (SUBMIT) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      date: inputDate,
      weight: inputWeight ? parseFloat(inputWeight) : undefined,
      waist: inputWaist ? parseFloat(inputWaist) : undefined,
      chest: inputChest ? parseFloat(inputChest) : undefined,
    };

    try {
      await addTrackingMetric(payload, token);
      
      // Reset form sau khi lưu thành công (giữ lại ngày)
      setInputWeight('');
      setInputWaist('');
      setInputChest('');
      
      // Tải lại biểu đồ ngay lập tức để hiện điểm mới
      await fetchData();
      
      alert("Đã cập nhật chỉ số thành công!");
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cấu hình màu sắc cho các Tab
  const tabs = [
    { key: 'weight', label: 'Cân nặng (kg)', color: '#4F46E5' },
    { key: 'waist', label: 'Vòng eo (cm)', color: '#10B981' },
    { key: 'chest', label: 'Vòng ngực (cm)', color: '#F59E0B' },
  ];
  const currentTabConfig = tabs.find(t => t.key === activeTab);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      
      {/* --- PHẦN 1: HEADER & TABS --- */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Theo dõi tiến độ</h2>
          <p className="text-sm text-gray-500">Cập nhật và theo dõi thay đổi cơ thể</p>
        </div>
        
        {/* Bộ chuyển đổi Tab */}
        <div className="flex bg-gray-50 p-1 rounded-lg">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- PHẦN 2: BIỂU ĐỒ (CHART) --- */}
      <div className="p-6 bg-gray-50/50">
        <div className="h-72 w-full bg-white rounded-lg border border-gray-100 p-2">
          {loading ? (
            <div className="h-full flex items-center justify-center text-gray-400">Đang tải dữ liệu...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#9CA3AF' }} 
                  tickLine={false} axisLine={false} dy={10}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#9CA3AF' }} 
                  tickLine={false} axisLine={false} 
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: currentTabConfig?.color, fontWeight: 600 }}
                />
                <Line
                  type="monotone"
                  dataKey={activeTab}
                  stroke={currentTabConfig?.color}
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#fff', stroke: currentTabConfig?.color, strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: currentTabConfig?.color, stroke: '#fff', strokeWidth: 2 }}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* --- PHẦN 3: FORM NHẬP LIỆU --- */}
      <div className="p-6 bg-white border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
          Cập nhật chỉ số hôm nay
        </h3>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          {/* Chọn ngày */}
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Ngày ghi nhận</label>
            <input 
              type="date" 
              required
              value={inputDate}
              max={today}
              min={minDate}
              onChange={(e) => setInputDate(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-black"
            />
          </div>

          {/* Nhập Cân nặng */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Cân nặng (kg)</label>
            <input 
              type="number" step="0.1" placeholder="0.0"
              value={inputWeight}
              onChange={(e) => setInputWeight(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-black"
            />
          </div>

          {/* Nhập Vòng eo */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Vòng eo (cm)</label>
            <input 
              type="number" step="0.1" placeholder="0.0"
              value={inputWaist}
              onChange={(e) => setInputWaist(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-black"
            />
          </div>

          {/* Nhập Vòng ngực */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Vòng ngực (cm)</label>
            <input 
              type="number" step="0.1" placeholder="0.0"
              value={inputChest}
              onChange={(e) => setInputChest(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-black"
            />
          </div>

          {/* Nút Submit */}
          <div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu chỉ số'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};