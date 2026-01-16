// src/components/NutritionAnalytics.tsx
import React, { useState, useEffect, useMemo } from 'react';
import AIInsightCard from '../components/AIInsightCard'; // Thêm dòng này
import axios from 'axios';
import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine, Cell
} from 'recharts';
import { 
  Calendar, ChevronLeft, ChevronRight, 
  Activity, Flame, Utensils, Target, TrendingUp, AlertCircle,
  Plus, X 
} from 'lucide-react';

// --- 1. CẤU HÌNH & INTERFACE ---
const API_BASE = 'https://vietlife-fitness-website-host.onrender.com/api'; // Đảm bảo đúng đường dẫn API

const formatDateLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
interface ChartDataPoint {
  date: string;         // YYYY-MM-DD
  calories_in: number;  // Ăn vào
  calories_out: number; // Tập luyện
  net_calories: number;
  displayDate?: string; // DD/MM
}

interface MetaData {
  tdee: number;
  daily_target: number;
  goal_type: string;
}

const StatisticsCalo: React.FC = () => {
  // --- 2. STATE QUẢN LÝ ---
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [stats, setStats] = useState<ChartDataPoint[]>([]);
  const [meta, setMeta] = useState<MetaData>({ tdee: 2000, daily_target: 2000, goal_type: 'maintain' });
  const [isLoading, setIsLoading] = useState(false);

  // [MỚI] State cho Modal nhập tập luyện (Thêm trường date)
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [workoutForm, setWorkoutForm] = useState({
    date: new Date().toISOString().split('T')[0], // Mặc định là hôm nay
    name: '',
    calories: '',
    duration: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [visibleKeys, setVisibleKeys] = useState({
    food: true,
    workout: true,
    net: true,
  });

  // --- 3. XỬ LÝ THỜI GIAN ---
  const dateRange = useMemo(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (viewMode === 'week') {
      const day = start.getDay(); 
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); 
      start.setDate(diff);
      end.setDate(diff + 6);
    } else {
      start.setDate(1);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
    }

    return {
      startStr: start.toISOString().split('T')[0],
      endStr: end.toISOString().split('T')[0],
      display: viewMode === 'week' 
        ? `Tuần: ${start.getDate()}/${start.getMonth()+1} - ${end.getDate()}/${end.getMonth()+1}`
        : `Tháng ${start.getMonth() + 1}/${start.getFullYear()}`
    };
  }, [currentDate, viewMode]);

  // --- 4. FETCH DATA ---
  // --- 4. FETCH DATA (ĐÃ SỬA LỖI TYPESCRIPT & HIỂN THỊ NGÀY TRỐNG) ---
  const fetchData = async () => {
    setIsLoading(true);
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : { id: 1 };

    try {
      const res = await axios.get(`${API_BASE}/workout-calo/stats`, {
        params: {
          user_id: user.id,
          startDate: dateRange.startStr,
          endDate: dateRange.endStr
        }
      });

      setMeta(res.data.meta);

      // 1. Tạo khung xương: Danh sách đầy đủ các ngày trong khoảng đã chọn
      const fullDateList = getDaysArray(dateRange.startStr, dateRange.endStr);

      // 2. Tạo Map để tra cứu dữ liệu API (Sửa lỗi TS bằng cách khai báo kiểu <string, any>)
      const dataMap = new Map<string, any>(
        res.data.data.map((item: any) => [
            formatDateLocal(new Date(item.date)),
            item
        ])
      );

      // 3. Trộn dữ liệu: Duyệt qua khung xương để điền dữ liệu
      const formattedData = fullDateList.map((dateStr) => {
        const item = dataMap.get(dateStr); // Lấy dữ liệu ngày đó (nếu có)

        // Nếu item tồn tại thì lấy số, không thì bằng 0
        const cIn = item ? Number(item.calories_in) : 0;
        const cOut = item ? Number(item.calories_out) : 0;

        return {
          date: dateStr,
          displayDate: new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
          calories_in: cIn,
          calories_out: cOut,
          net_calories: cIn - cOut 
        };
      });

      setStats(formattedData);

    } catch (error) {
      console.error("Lỗi tải thống kê:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange.startStr, dateRange.endStr]);

  // --- [MỚI] HÀM LƯU BÀI TẬP (CÓ CHỌN NGÀY) ---
  const handleSaveWorkout = async () => {
    // Validate
    if (!workoutForm.name || !workoutForm.calories || !workoutForm.date) {
      alert("Vui lòng nhập đầy đủ: Ngày, Tên bài tập và Số Calo!");
      return;
    }

    setIsSubmitting(true);
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : { id: 1 };
      
      // Gọi API với ngày người dùng chọn
      await axios.post(`https://vietlife-fitness-website-host.onrender.com/api/workout-calo`, {
        user_id: user.id,
        workout_date: workoutForm.date, // Sử dụng ngày từ form
        activity_name: workoutForm.name,
        calories_burned: Number(workoutForm.calories),
        duration_minutes: Number(workoutForm.duration) || 0
      });

      // Reset form (giữ lại ngày hôm nay cho lần nhập sau)
      setShowWorkoutModal(false);
      setWorkoutForm({ 
        date: new Date().toISOString().split('T')[0], 
        name: '', 
        calories: '', 
        duration: '' 
      });
      
      fetchData(); // Reload biểu đồ
      
    } catch (error) {
      console.error(error);
      alert("Lỗi khi lưu bài tập.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 5. ĐIỀU HƯỚNG ---
  const handleNavigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  // --- 6. TÍNH TRUNG BÌNH ---
// --- 6. TÍNH TRUNG BÌNH (ĐÃ SỬA: CHỈ TÍNH NGÀY CÓ DỮ LIỆU) ---
  const averages = useMemo(() => {
    if (stats.length === 0) return { in: 0, out: 0, net: 0 };

    let totalIn = 0;
    let totalOut = 0;
    let countIn = 0;   // Đếm số ngày có ăn > 0
    let countOut = 0;  // Đếm số ngày có tập > 0
    let countActive = 0; // Đếm số ngày có bất kỳ hoạt động nào (để tính Net)

    stats.forEach(item => {
      totalIn += item.calories_in;
      totalOut += item.calories_out;

      // Chỉ đếm những ngày có dữ liệu thực
      if (item.calories_in > 0) countIn++;
      if (item.calories_out > 0) countOut++;
      
      // Ngày "Active" là ngày có ăn HOẶC có tập
      if (item.calories_in > 0 || item.calories_out > 0) countActive++;
    });

    return {
      // Logic: Tổng Calo / Số ngày thực tế có nhập (tránh chia cho 0)
      in: countIn > 0 ? Math.round(totalIn / countIn) : 0,
      
      out: countOut > 0 ? Math.round(totalOut / countOut) : 0,
      
      // Net Calo: Tính trung bình trên những ngày người dùng có tương tác với app
      net: countActive > 0 ? Math.round((totalIn - totalOut) / countActive) : 0
    };
  }, [stats]);

  // [THÊM ĐOẠN NÀY VÀO TRƯỚC return]
const chartDomainMax = useMemo(() => {
    // 1. Tìm giá trị lớn nhất trong dữ liệu thực tế (Ăn hoặc Tập)
    const maxDataVal = Math.max(
        ...stats.map(s => Math.max(s.calories_in, s.calories_out, s.net_calories)), 
        0
    );
    
    // 2. So sánh với TDEE và Target để lấy số lớn nhất
    const highestValue = Math.max(maxDataVal, meta.tdee, meta.daily_target);

    // 3. Nếu chưa có dữ liệu (0), mặc định lấy 2500 để biểu đồ không bị xẹp
    if (highestValue === 0) return 2500;

    // 4. Cộng thêm 15% khoảng trống phía trên cho đẹp
    return Math.round(highestValue * 1.15); 
}, [stats, meta]);
  const getDaysArray = (start: string, end: string) => {
    const arr = [];
    const dt = new Date(start);
    const endDate = new Date(end);

    while (dt <= endDate) {
      arr.push(new Date(dt).toISOString().split('T')[0]); // YYYY-MM-DD
      dt.setDate(dt.getDate() + 1);
    }
  return arr;
};

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans relative">
      <div className="max-w-6xl mx-auto">
        
        {/* === HEADER & CONTROLS === */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
              <Activity size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Thống Kê Năng Lượng</h1>
              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                <button 
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1 rounded-lg transition-all ${viewMode === 'week' ? 'bg-indigo-600 text-white font-semibold' : 'hover:bg-slate-100'}`}
                >
                  Theo Tuần
                </button>
                <button 
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1 rounded-lg transition-all ${viewMode === 'month' ? 'bg-indigo-600 text-white font-semibold' : 'hover:bg-slate-100'}`}
                >
                  Theo Tháng
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {/* NÚT THÊM BÀI TẬP */}
            <button 
              onClick={() => setShowWorkoutModal(true)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold shadow-md shadow-emerald-200 transition-all active:scale-95"
            >
              <Plus size={20} /> <span className="hidden md:inline">Nhập Calo Tập</span>
            </button>

            {/* Date Navigator */}
            <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
              <button onClick={() => handleNavigate('prev')} className="p-1 hover:bg-white rounded-full transition shadow-sm">
                <ChevronLeft size={20} className="text-slate-600"/>
              </button>
              <span className="font-bold text-slate-700 w-32 md:w-48 text-center flex items-center justify-center gap-2 text-sm md:text-base">
                <Calendar size={16} className="text-indigo-500"/> {dateRange.display}
              </span>
              <button onClick={() => handleNavigate('next')} className="p-1 hover:bg-white rounded-full transition shadow-sm">
                <ChevronRight size={20} className="text-slate-600"/>
              </button>
            </div>
          </div>
        </div>

        {/* === SUMMARY CARDS === */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-rose-500 flex justify-between items-center">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-1">
                <Utensils size={14}/> Nạp vào trung bình
              </p>
              <h3 className="text-3xl font-bold text-slate-800">{averages.in} <span className="text-sm font-normal text-slate-400">kcal</span></h3>
            </div>
            <div className="h-10 w-10 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 font-bold">In</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-emerald-500 flex justify-between items-center">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-1">
                <Flame size={14}/> Tiêu hao trung bình
              </p>
              <h3 className="text-3xl font-bold text-slate-800">{averages.out} <span className="text-sm font-normal text-slate-400">kcal</span></h3>
            </div>
            <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 font-bold">Out</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500 flex justify-between items-center">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-1">
                <Target size={14}/> Mục tiêu Hằng ngày
              </p>
              <h3 className="text-3xl font-bold text-slate-800">{meta.daily_target} <span className="text-sm font-normal text-slate-400">kcal</span></h3>
              <p className="text-xs text-blue-500 mt-1">TDEE: {meta.tdee} kcal</p>
            </div>
            <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 font-bold">Goal</div>
          </div>
        </div>

        
        {/* === MAIN CHART SECTION === */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
          <div className="flex flex-wrap justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="text-indigo-500"/> Biểu đồ Cân bằng Năng lượng
            </h3>
            
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${visibleKeys.food ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`}>
                  {visibleKeys.food && <div className="w-2 h-2 bg-white rounded-full"/>}
                </div>
                <input type="checkbox" className="hidden" checked={visibleKeys.food} onChange={() => setVisibleKeys(p => ({...p, food: !p.food}))} />
                <span className={`text-sm font-medium ${visibleKeys.food ? 'text-slate-700' : 'text-slate-400'}`}>Calo Ăn</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${visibleKeys.workout ? 'bg-rose-500 text-white' : 'bg-slate-200'}`}>
                   {visibleKeys.workout && <div className="w-2 h-2 bg-white rounded-full"/>}
                </div>
                <input type="checkbox" className="hidden" checked={visibleKeys.workout} onChange={() => setVisibleKeys(p => ({...p, workout: !p.workout}))} />
                <span className={`text-sm font-medium ${visibleKeys.workout ? 'text-slate-700' : 'text-slate-400'}`}>Calo Tập</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div className={`w-4 h-4 rounded ${visibleKeys.net ? 'bg-orange-500' : 'bg-slate-200'}`}/>
                <input type="checkbox" className="hidden" checked={visibleKeys.net} onChange={() => setVisibleKeys(p => ({...p, net: !p.net}))} />
                <span className="text-sm text-slate-700 font-bold">Calo thực nạp</span>
              </label>
            </div>
          </div>

          <div className="h-[400px] w-full">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-slate-400">Đang tải dữ liệu...</div>
            ) : stats.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <AlertCircle size={48} className="mb-2 opacity-20"/>
                <p>Chưa có dữ liệu trong khoảng thời gian này</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stats} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="displayDate" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 12}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 12}} 
                    label={{ value: 'kcal', angle: -90, position: 'insideLeft', fill: '#cbd5e1', fontSize: 12 }}
                    domain={[0, chartDomainMax]}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <ReferenceLine 
                    y={meta.tdee} 
                    label={{ value: 'TDEE', position: 'right', fill: '#94a3b8', fontSize: 10 }} 
                    stroke="#94a3b8" 
                    strokeDasharray="3 3" 
                  />
                  <ReferenceLine 
                    y={meta.daily_target} 
                    label={{ value: 'Mục tiêu', position: 'right', fill: '#3b82f6', fontSize: 10, fontWeight: 'bold' }} 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                  />
                  {visibleKeys.food && (
                    <Bar dataKey="calories_in" name="Nạp vào"  fill="#10b981" radius={[4, 4, 0, 0]} barSize={viewMode === 'week' ? 20 : 6}/>
                  )}
                  {visibleKeys.workout && (
                    <Bar dataKey="calories_out" name="Tiêu hao (Tập)"  fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={viewMode === 'week' ? 20 : 6}/>
                  )}
                  {/* 3. [MỚI] Cột Thực nạp (Net) - Màu Cam */}
                  {visibleKeys.net && (
                      <Bar 
                          dataKey="net_calories" 
                          name="Thực nạp" 
                          fill="#f97316" // Màu cam
                          radius={[4, 4, 0, 0]} 
                          barSize={viewMode === 'week' ? 20 : 6} 
                      />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
          
          <div className="mt-4 flex justify-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <div className="w-8 h-0.5 bg-blue-500"></div> Đường mục tiêu
            </div>
            <div className="flex items-center gap-1">
              <div className="w-8 h-0.5 bg-slate-400 border-t border-dashed border-slate-400"></div> Đường TDEE
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
          <AIInsightCard 
            startDate={dateRange.startStr} 
            endDate={dateRange.endStr} 
          />
        </div>

      {/* === [MỚI] MODAL NHẬP CALO TẬP LUYỆN === */}
      {showWorkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-emerald-600 p-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Flame size={20} /> Thêm Hoạt Động
              </h3>
              <button 
                onClick={() => setShowWorkoutModal(false)}
                className="p-1 hover:bg-white/20 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-black">
              
              {/* [MỚI] Chọn Ngày */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Ngày tập luyện</label>
                <input 
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={workoutForm.date}
                  onChange={e => setWorkoutForm({...workoutForm, date: e.target.value})}
                  max={new Date().toISOString().split('T')[0]} // Không cho chọn tương lai
                />
              </div>

              {/* Tên Bài Tập */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Môn thể thao / Hoạt động</label>
                <input 
                  type="text"
                  placeholder="VD: Chạy bộ, Gym, Bơi..."
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={workoutForm.name}
                  onChange={e => setWorkoutForm({...workoutForm, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Calo */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Calo đốt (kcal)</label>
                  <input 
                    type="number"
                    placeholder="0"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-emerald-600"
                    value={workoutForm.calories}
                    onChange={e => setWorkoutForm({...workoutForm, calories: e.target.value})}
                  />
                </div>
                {/* Thời gian */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Thời gian (phút)</label>
                  <input 
                    type="number"
                    placeholder="Tùy chọn"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={workoutForm.duration}
                    onChange={e => setWorkoutForm({...workoutForm, duration: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 flex gap-3 justify-end border-t border-gray-100">
              <button 
                onClick={() => setShowWorkoutModal(false)}
                className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveWorkout}
                disabled={isSubmitting}
                className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-md transition disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? 'Đang lưu...' : 'Lưu hoạt động'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StatisticsCalo;