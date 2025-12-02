import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getTrackingHistory, addTrackingMetric } from '../../services/trackingService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ChartDataPoint {
  date: string;
  weight?: number;
  waist?: number;
  chest?: number;
}

// Định nghĩa kiểu dữ liệu cho lỗi
interface ValidationErrors {
  weight?: string;
  waist?: string;
  chest?: string;
}

export const ProgressChart: React.FC = () => {
  // --- STATE DỮ LIỆU ---
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'weight' | 'waist' | 'chest'>('weight');
  const today = new Date().toISOString().split('T')[0];
  const minDate = "2020-01-01";

  // --- STATE FORM ---
  const [inputDate, setInputDate] = useState(today);
  const [inputWeight, setInputWeight] = useState('');
  const [inputWaist, setInputWaist] = useState('');
  const [inputChest, setInputChest] = useState('');
  
  // --- STATE LỖI (MỚI) ---
  // Dùng để lưu thông báo đỏ cho từng ô
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = localStorage.getItem('token');

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

  useEffect(() => {
    fetchData();
  }, []);

  // --- HÀM XỬ LÝ KHI NGƯỜI DÙNG NHẬP LIỆU (MỚI) ---
  // Mục đích: Khi người dùng bắt đầu sửa lại, thì phải tắt báo đỏ đi ngay
  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<string>>, 
    field: keyof ValidationErrors, 
    value: string
  ) => {
    setter(value);
    // Nếu đang có lỗi ở ô này, xóa lỗi đi để viền trở lại màu xám
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // --- HÀM VALIDATION & SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Reset lỗi cũ
    setErrors({});
    const newErrors: ValidationErrors = {};
    let hasError = false;

    // Chuyển đổi số
    const weightVal = inputWeight ? parseFloat(inputWeight) : undefined;
    const waistVal = inputWaist ? parseFloat(inputWaist) : undefined;
    const chestVal = inputChest ? parseFloat(inputChest) : undefined;
    // 2. Kiểm tra ít nhất một ô phải có dữ liệu
    if (weightVal === undefined && waistVal === undefined && chestVal === undefined) {
        toast.warning("⚠️ Vui lòng nhập ít nhất một chỉ số để lưu!");
        return; // Dừng hàm ngay lập tức
    }
    // --- LOGIC KIỂM TRA (Sẽ gán vào newErrors thay vì alert/toast) ---

    // Kiểm tra Cân nặng
    // 1. Kiểm tra Cân nặng (20 - 300kg)
    if (weightVal !== undefined) {
      if (weightVal < 20) { 
          newErrors.weight = "cân nặng phải từ 20kg trở lên"; 
          hasError = true; 
      }
      else if (weightVal > 300) { 
          newErrors.weight = "cân nặng phải dưới 300kg"; 
          hasError = true; 
      }
    }

    // 2. Kiểm tra Vòng eo (40 - 200cm)
    if (waistVal !== undefined) {
      if (waistVal < 40) { 
          newErrors.waist = "vòng eo phải từ 40cm trở lên"; 
          hasError = true; 
      }
      else if (waistVal > 200) { 
          newErrors.waist = "vòng eo phải dưới 200cm"; 
          hasError = true; 
      }
    }

    // 3. Kiểm tra Vòng ngực (50 - 200cm)
    if (chestVal !== undefined) {
      if (chestVal < 50) { 
          newErrors.chest = "vòng ngực phải từ 50cm trở lên"; 
          hasError = true; 
      }
      else if (chestVal > 200) { 
          newErrors.chest = "vòng ngực phải dưới 200cm"; 
          hasError = true; 
      }
    }
    
    

    // Nếu có bất kỳ lỗi nào -> Set state để hiện đỏ và dừng hàm
    if (hasError) {
      setErrors(newErrors);
      // Có thể rung nhẹ máy hoặc toast báo chung (tuỳ chọn)
      toast.error("Vui lòng kiểm tra lại các ô báo đỏ!"); 
      return; 
    }

    // --- GỬI DỮ LIỆU ---
    setIsSubmitting(true);
    const payload = {
      date: inputDate,
      weight: weightVal || null, 
      waist: waistVal || null,
      chest: chestVal || null,
    };

    try {
      await addTrackingMetric(payload, token);
      
      // Reset form
      setInputWeight('');
      setInputWaist('');
      setInputChest('');
      await fetchData();
      toast.success("🎉 Đã cập nhật thành công!");
    } catch (error) {
      console.error(error);
      toast.error("❌ Lỗi hệ thống, thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { key: 'weight', label: 'Cân nặng (kg)', color: '#4F46E5' },
    { key: 'waist', label: 'Vòng eo (cm)', color: '#10B981' },
    { key: 'chest', label: 'Vòng ngực (cm)', color: '#F59E0B' },
  ];
  const currentTabConfig = tabs.find(t => t.key === activeTab);

  // --- COMPONENT CON: INPUT CÓ ICON CẢNH BÁO ---
  // Tách ra để code gọn gàng và tái sử dụng
  const renderInputWithValidation = (
    label: string,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    fieldKey: keyof ValidationErrors,
    placeholder: string,
    min: string,
    max: string
  ) => {
    const hasError = !!errors[fieldKey];
    
    return (
      <div className="flex flex-col">
        <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">
          {label}
        </label>
        
        <div className="relative">
          <input 
            type="number" step="0.1" placeholder={placeholder}
            value={value}
            onChange={(e) => handleInputChange(setter, fieldKey, e.target.value)}
            className={`w-full p-2.5 pr-10 rounded-lg text-sm border outline-none transition-all text-black font-medium
              ${hasError
                ? 'border-red-500 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-200 placeholder-red-300' 
                : 'bg-white border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'}`}
          />
          
          {/* ICON CẢNH BÁO (Tuyệt chiêu UX) */}
          {hasError && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* THÔNG BÁO LỖI BÊN DƯỚI */}
        {/* Dùng min-h để giữ layout không bị nhảy lung tung khi lỗi hiện ra */}
        <div className="min-h-[20px] mt-1">
            {hasError && (
                <p className="text-xs text-red-600 flex items-start gap-1 animate-fade-in-down">
                    <span>•</span> {errors[fieldKey]}
                </p>
            )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-full">
      {/* HEADER & CHART */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Theo dõi tiến độ</h2>
          <p className="text-sm text-gray-500">Cập nhật và theo dõi thay đổi cơ thể</p>
        </div>
        <div className="flex bg-gray-50 p-1 rounded-lg">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>{tab.label}</button>
          ))}
        </div>
      </div>

      <div className="p-6 bg-gray-50/50 grow">
        <div className="h-72 w-full bg-white rounded-lg border border-gray-100 p-2 shadow-sm">
             {!loading && (
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} dy={10} />
                    <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} itemStyle={{ color: currentTabConfig?.color, fontWeight: 600 }} />
                    <Line type="monotone" dataKey={activeTab} stroke={currentTabConfig?.color} strokeWidth={3} dot={{ r: 4, fill: '#fff', stroke: currentTabConfig?.color, strokeWidth: 2 }} activeDot={{ r: 6, fill: currentTabConfig?.color, stroke: '#fff', strokeWidth: 2 }} animationDuration={1000} />
                </LineChart>
                </ResponsiveContainer>
             )}
        </div>
      </div>

      {/* --- FORM NHẬP LIỆU (ĐÃ TỐI ƯU HIỂN THỊ) --- */}
      <div className="p-6 bg-white border-t border-gray-100 shrink-0">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-5 flex items-center gap-2">
            <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
            Cập nhật chỉ số hôm nay
        </h3>
        
        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
          
          {/* 1. Chọn ngày (Không cần validate phức tạp nên để riêng) */}
          <div className="flex flex-col">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">Ngày ghi nhận</label>
            <div className="relative">
                <input 
                type="date" 
                value={inputDate}
                max={today}
                min={minDate}
                onChange={(e) => setInputDate(e.target.value)}
                className="w-full p-2.5 rounded-lg text-sm bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-black font-medium transition-all"
                />
            </div>
            {/* Spacer để căn đều với các ô có lỗi bên cạnh */}
            <div className="min-h-[20px] mt-1"></div>
          </div>

          {/* 2. Các ô nhập liệu (Dùng hàm renderInputWithValidation ở trên) */}
          {renderInputWithValidation("Cân nặng (kg)", inputWeight, setInputWeight, 'weight', "0.0", "20", "300")}
          
          {renderInputWithValidation("Vòng eo (cm)", inputWaist, setInputWaist, 'waist', "0.0", "40", "200")}
          
          {renderInputWithValidation("Vòng ngực (cm)", inputChest, setInputChest, 'chest', "0.0", "50", "200")}

          {/* Nút Submit */}
          <div className="pt-6"> {/* Padding top để căn chỉnh với label */}
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[42px] bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                 <>
                   <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   <span>Lưu...</span>
                 </>
              ) : 'Lưu chỉ số'}
            </button>
            <div className="min-h-[20px] mt-1"></div> {/* Spacer đồng bộ layout */}
          </div>
        </form>
      </div>

      
    </div>
  );
};
