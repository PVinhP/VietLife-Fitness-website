import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Area
} from 'recharts';
import { 
  AlertCircle, CheckCircle, TrendingUp, Calendar, 
  Activity, ArrowRight, Loader2, BarChart2
} from 'lucide-react';

// --- 1. ĐỊNH NGHĨA TYPES (INTERFACES) ---

interface NutritionSnapshot {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

interface AIAnalysisResult {
  score: number;
  headline: string;
  analysis: {
    calories_comment: string;
    macro_comment: string;
    habit_warning: string;
  };
  action_plan: string[];
  pt_message: string;
}

interface ReviewLog {
  id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  score: number;
  headline: string;
  // Dữ liệu từ MySQL có thể là string (JSON) hoặc Object
  input_snapshot: string | NutritionSnapshot;
  ai_content: string | AIAnalysisResult;
  created_at: string;
}

// Interface cho dữ liệu biểu đồ lịch sử
interface HistoryChartData {
  date: string;
  score: number;
  calories: number;
  fullDate: string;
}

const API_BASE = 'http://localhost:8080/nutrition'; 

// --- 2. HELPER FUNCTIONS ---

const parseData = <T,>(data: string | T): T => {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data) as T;
    } catch (e) {
      console.error("Lỗi parse JSON:", e);
      return {} as T;
    }
  }
  return data;
};

const getScoreColor = (score: number) => {
  if (score >= 80) return { text: 'text-emerald-600', border: 'border-emerald-500', hex: '#10b981', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-800' };
  if (score >= 50) return { text: 'text-amber-600', border: 'border-amber-500', hex: '#f59e0b', bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-800' };
  return { text: 'text-rose-600', border: 'border-rose-500', hex: '#ef4444', bg: 'bg-rose-50', badge: 'bg-rose-100 text-rose-800' };
};

// --- 3. MAIN COMPONENT ---

const NutritionAnalytics: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewLog[]>([]);
  const [selectedReview, setSelectedReview] = useState<ReviewLog | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  
  // Giả lập lấy token (Thay bằng logic thật của bạn)
  const token = localStorage.getItem('token'); 

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(res.data);
      if (res.data.length > 0) {
        setSelectedReview(res.data[0]); 
      }
    } catch (err) {
      console.error("Lỗi tải lịch sử:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      
      // 1. Gọi API và lấy kết quả trả về (res)
      const res = await axios.post(`${API_BASE}/analyze`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 2. Kiểm tra xem Backend có trả về cờ "is_cached" không
      if (res.data.is_cached) {
        // Hiển thị thông báo cho người dùng
        alert("⚠️ Dữ liệu ăn uống của bạn chưa thay đổi so với lần đánh giá trước.\nHệ thống sẽ hiển thị lại báo cáo gần nhất.");
      } else {
        // (Tùy chọn) Thông báo nếu tạo mới thành công
        // alert("✅ Đã hoàn thành phân tích dữ liệu mới!");
      }

      // 3. Tải lại lịch sử để hiện báo cáo (cũ hoặc mới) lên đầu danh sách
      await fetchHistory(); 
      
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.msg || "Có lỗi xảy ra khi phân tích.");
    } finally {
      setAnalyzing(false);
    }
  };

  // --- Xử lý dữ liệu cho biểu đồ lịch sử ---
  // Dùng useMemo để không phải tính lại mỗi lần render
  const chartData = useMemo(() => {
    // Clone mảng và đảo ngược để hiển thị từ cũ đến mới (trái qua phải)
    const sortedReviews = [...reviews].reverse();
    
    return sortedReviews.map(review => {
      const snapshot = parseData<NutritionSnapshot>(review.input_snapshot);
      const dateObj = new Date(review.start_date);
      return {
        date: `${dateObj.getDate()}/${dateObj.getMonth() + 1}`, // VD: 14/11
        fullDate: new Date(review.end_date).toLocaleDateString('vi-VN'),
        score: review.score,
        calories: snapshot.calories || 0
      };
    });
  }, [reviews]);

  if (loading && reviews.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500 bg-gray-50">
        <Loader2 className="animate-spin mr-2" /> Đang tải dữ liệu huấn luyện viên...
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-60px)] bg-gray-50 font-sans overflow-hidden">
      
      {/* --- SIDEBAR: LỊCH SỬ --- */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-lg z-20">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <button 
            onClick={handleAnalyze} 
            disabled={analyzing}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3 px-4 rounded-xl font-bold shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {analyzing ? <Loader2 className="animate-spin w-5 h-5" /> : <Activity className="w-5 h-5" />}
            {analyzing ? 'AI Đang Phân Tích...' : 'Tạo Báo Cáo Mới'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2 mt-2">Lịch sử đánh giá</h3>
          {reviews.map((item) => {
            const colors = getScoreColor(item.score);
            const isSelected = selectedReview?.id === item.id;
            
            return (
              <div 
                key={item.id} 
                onClick={() => setSelectedReview(item)}
                className={`
                  group p-4 rounded-xl cursor-pointer transition-all border
                  ${isSelected 
                    ? 'bg-indigo-50 border-indigo-200 shadow-sm translate-x-1' 
                    : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'
                  }
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-md">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(item.start_date).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'})} 
                    <ArrowRight className="w-3 h-3 mx-1 text-gray-400" />
                    {new Date(item.end_date).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'})}
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${colors.badge}`}>
                    {item.score}/100
                  </span>
                </div>
                <div className={`text-sm font-semibold line-clamp-2 ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                  {item.headline}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
        
        {/* [MỚI] BIỂU ĐỒ LỊCH SỬ TIẾN BỘ */}
        {reviews.length > 1 && (
          <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <BarChart2 className="w-5 h-5 mr-2 text-indigo-500" /> 
                Xu hướng dinh dưỡng & Sức khỏe
              </h3>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center"><div className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>Calories TB</div>
                <div className="flex items-center"><div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>Điểm sức khỏe</div>
              </div>
            </div>
            
            <div className="w-full h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9ca3af', fontSize: 12}} 
                    dy={10}
                  />
                  <YAxis 
                    yAxisId="left" 
                    orientation="left" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9ca3af', fontSize: 12}} 
                    label={{ value: 'Kcal', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 10 }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    domain={[0, 100]} 
                    axisLine={false} 
                    tickLine={false}
                    tick={{fill: '#10b981', fontSize: 12}}
                    label={{ value: 'Score', angle: 90, position: 'insideRight', fill: '#10b981', fontSize: 10 }}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                    labelStyle={{color: '#6b7280', marginBottom: '5px'}}
                  />
                  <Bar yAxisId="left" dataKey="calories" name="Calories TB" fill="#6366f1" barSize={30} radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="score" name="Điểm số" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHI TIẾT BÁO CÁO ĐANG CHỌN */}
        {selectedReview ? (
          <ReportDetail review={selectedReview} />
        ) : (
          <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400">
            <TrendingUp className="w-20 h-20 mb-6 opacity-20" />
            <p className="text-xl font-medium">Chọn một báo cáo để xem chi tiết</p>
            <p className="text-sm mt-2">Hoặc bấm nút "Tạo Báo Cáo Mới" để bắt đầu</p>
          </div>
        )}
      </main>
    </div>
  );
};

// --- 4. SUB COMPONENT: REPORT DETAIL ---

const ReportDetail: React.FC<{ review: ReviewLog }> = ({ review }) => {
  const aiResult = parseData<AIAnalysisResult>(review.ai_content);
  const snapshot = parseData<NutritionSnapshot>(review.input_snapshot);
  const colors = getScoreColor(review.score);

  // Data cho biểu đồ Macro
  const macroData = [
    { name: 'Đạm (Protein)', value: snapshot.protein || 0, color: '#3b82f6' }, // Blue
    { name: 'Tinh bột (Carbs)', value: snapshot.carbs || 0, color: '#f59e0b' },   // Amber
    { name: 'Chất béo (Fat)', value: snapshot.fat || 0, color: '#ef4444' }     // Red
  ];

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
        {/* Background Decoration */}
        <div className={`absolute top-0 left-0 w-2 h-full ${colors.bg.replace('bg-', 'bg-gradient-to-b from-')}-500 to-transparent`}></div>

        {/* Điểm số */}
        <div className={`
          w-32 h-32 rounded-full border-8 flex flex-col items-center justify-center shrink-0
          ${colors.border} bg-white shadow-xl z-10
        `}>
          <span className={`text-4xl font-black ${colors.text}`}>{review.score}</span>
          <span className="text-[10px] uppercase font-bold text-gray-400 mt-1">Health Score</span>
        </div>

        {/* Headline & Message */}
        <div className="flex-1 z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {new Date(review.start_date).toLocaleDateString('vi-VN')} - {new Date(review.end_date).toLocaleDateString('vi-VN')}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4 leading-tight">
            "{review.headline}"
          </h1>
          <div className="relative bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 text-gray-700 italic">
            <div className="absolute -top-3 left-6 bg-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-md flex items-center gap-1">
              <Activity size={12}/> PT Nhắn nhủ
            </div>
            "{aiResult.pt_message}"
          </div>
        </div>
      </div>

      {/* Grid Layout chính */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* CỘT TRÁI: BIỂU ĐỒ TRÒN & CALORIES */}
        <div className="lg:col-span-1 space-y-8">
          {/* Card: Biểu đồ Macro */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
            <h3 className="text-gray-700 font-bold mb-4 flex items-center w-full">
              <Activity className="w-5 h-5 mr-2 text-indigo-500" /> Phân bổ Macro
            </h3>
            <div className="w-full h-56 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={macroData} 
                    cx="50%" cy="50%" 
                    innerRadius={50} 
                    outerRadius={70} 
                    paddingAngle={5} 
                    dataKey="value"
                    stroke="none"
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} 
                  />
                  <Legend verticalAlign="bottom" iconType="circle" iconSize={8}/>
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[65%] text-center pointer-events-none">
                <span className="text-xs text-gray-400 font-medium">Tổng quan</span>
              </div>
            </div>
            <div className="w-full grid grid-cols-3 gap-2 text-center mt-2">
               <div className="bg-blue-50 p-2 rounded-xl"><div className="text-blue-600 font-bold text-sm">{snapshot.protein}g</div><div className="text-[10px] text-gray-500">Đạm</div></div>
               <div className="bg-amber-50 p-2 rounded-xl"><div className="text-amber-600 font-bold text-sm">{snapshot.carbs}g</div><div className="text-[10px] text-gray-500">Tinh bột</div></div>
               <div className="bg-red-50 p-2 rounded-xl"><div className="text-red-600 font-bold text-sm">{snapshot.fat}g</div><div className="text-[10px] text-gray-500">Béo</div></div>
            </div>
          </div>

          {/* Card: Tổng quan Calo */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp className="w-24 h-24 text-indigo-600" />
            </div>
            <h3 className="text-gray-700 font-bold mb-4 flex items-center relative z-10">
              <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" /> Năng lượng
            </h3>
            
            <div className="mb-2 relative z-10">
              <span className="text-5xl font-black text-gray-800">{snapshot.calories}</span>
              <span className="text-gray-400 text-lg ml-2 font-medium">kcal</span>
            </div>
            <p className="text-gray-500 text-sm bg-gray-100 px-3 py-1 rounded-full inline-block mb-4 relative z-10">
              Trung bình / ngày
            </p>
            <div className="text-left text-sm text-gray-600 bg-gray-50 p-4 rounded-xl relative z-10">
              {aiResult.analysis.calories_comment}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: PHÂN TÍCH CHI TIẾT & ACTION PLAN */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Analysis Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 shadow-sm">
                <Activity className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-800 mb-2 text-lg">Chất lượng dinh dưỡng</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {aiResult.analysis.macro_comment}
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 shadow-sm">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-800 mb-2 text-lg">Cảnh báo thói quen</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {aiResult.analysis.habit_warning}
              </p>
            </div>
          </div>

          {/* Action Plan - Làm nổi bật */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-500 opacity-20 rounded-full blur-3xl"></div>

            <h4 className="font-bold text-xl mb-6 flex items-center relative z-10">
              <CheckCircle className="w-6 h-6 mr-3 text-emerald-400" /> 
              Kế hoạch hành động tuần tới
            </h4>
            <ul className="space-y-4 relative z-10">
              {aiResult.action_plan.map((action, idx) => (
                <li key={idx} className="flex items-start bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors">
                  <span className="flex items-center justify-center w-6 h-6 bg-emerald-500 text-white font-bold text-xs rounded-full mr-3 mt-0.5 shadow-sm shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-medium opacity-95 text-sm md:text-base leading-relaxed">{action}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
};

export default NutritionAnalytics;