// src/pages/OnboardingPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Activity, CheckCircle, Target, Calendar, TrendingUp } from 'lucide-react'; // Nếu bạn có cài lucide-react, nếu không có thể bỏ icon hoặc dùng text

// === 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU ===
interface OnboardingFormState {
    age: string;
    gender: 'male' | 'female' | 'other' | '';
    weight_kg: string;
    target_weight: string; // [MỚI] Cân nặng mục tiêu
    height_cm: string;
    activity_level: string;
    goal: 'lose_weight' | 'maintain' | 'gain_muscle' | '';
    weekly_goal: number; // [MỚI] Tốc độ giảm cân (kg/tuần)
}

interface FormErrors {
    age?: string;
    gender?: string;
    weight_kg?: string;
    target_weight?: string;
    height_cm?: string;
    activity_level?: string;
    goal?: string;
}

const OnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    
    // === 2. KHỞI TẠO STATE ===
    const [formData, setFormData] = useState<OnboardingFormState>({
        age: '',
        gender: '',
        weight_kg: '',
        target_weight: '',
        height_cm: '',
        activity_level: '',
        goal: '',
        weekly_goal: 0.5, // Mặc định chọn mức an toàn (0.5kg/tuần)
    });
    
    const [errors, setErrors] = useState<FormErrors>({});

    // === 3. HÀM TÍNH TOÁN NGÀY DỰ KIẾN ===
    const calculateEndDate = (speed: number) => {
        const current = parseFloat(formData.weight_kg);
        const target = parseFloat(formData.target_weight);
        
        // Nếu số liệu không hợp lệ hoặc mục tiêu không phải giảm cân
        if (isNaN(current) || isNaN(target) || current <= target) return "...";

        const diff = current - target; // Số kg cần giảm
        const weeksNeeded = diff / speed; // Số tuần
        const daysNeeded = Math.round(weeksNeeded * 7);

        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + daysNeeded);

        // Format ngày kiểu Việt Nam: 20/03/2026
        return futureDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // === 4. HÀM VALIDATE DỮ LIỆU ===
    const validateField = (name: keyof OnboardingFormState, value: any): string | undefined => {
        switch (name) {
            case 'age':
                if (!value) return "Nhập tuổi.";
                const age = parseInt(value);
                if (isNaN(age) || age < 10 || age > 100) return "Tuổi từ 10-100.";
                break;
            case 'weight_kg':
                if (!value) return "Nhập cân nặng.";
                if (parseFloat(value) < 20 || parseFloat(value) > 300) return "Cân nặng không hợp lệ.";
                break;
            case 'target_weight':
                if (!value) return "Vui lòng nhập mục tiêu.";
                
                const tWeight = parseFloat(value);
                const cWeight = parseFloat(formData.weight_kg); // Cân nặng hiện tại
                const heightM = parseFloat(formData.height_cm) / 100; // Chiều cao (m)

                // 1. Chặn nhập số âm hoặc quá bé/quá lớn vô lý
                if (isNaN(tWeight) || tWeight < 30 || tWeight > 300) {
                    return "Cân nặng mục tiêu không hợp lý (30 - 300kg).";
                }

                // 2. [QUAN TRỌNG] Kiểm tra BMI Mục tiêu (Nếu đã nhập chiều cao)
                if (heightM > 0) {
                    const targetBMI = tWeight / (heightM * heightM);
                    
                    // Mức BMI < 16 là Suy dinh dưỡng nặng (Nguy hiểm)
                    if (targetBMI < 16) {
                        return `Mục tiêu quá thấp! (BMI ${targetBMI.toFixed(1)} - Nguy hiểm tính mạng).`;
                    }
                    
                    // Mức BMI < 18.5 là Thiếu cân (Cảnh báo nhẹ - Vẫn cho qua nhưng có thể cảnh báo thêm ở UI nếu muốn)
                    // Nếu muốn chặt chẽ, bạn có thể return lỗi luôn ở đây:
                    // if (targetBMI < 17) return "Mục tiêu quá gầy, không tốt cho sức khỏe.";
                }

                // 3. Chặn trường hợp muốn giảm quá 50% trọng lượng cơ thể (Optional)
                // Ví dụ: 90kg -> 30kg là giảm 60kg (66%), quá nguy hiểm.
                if (cWeight > 0 && tWeight < cWeight * 0.5) {
                    return "Bạn không nên giảm quá 50% trọng lượng cơ thể.";
                }

                break;
            case 'height_cm':
                if (!value) return "Nhập chiều cao.";
                if (parseFloat(value) < 100 || parseFloat(value) > 250) return "Chiều cao từ 100-250cm.";
                break;
            case 'gender': if (!value) return "Chọn giới tính."; break;
            case 'activity_level': if (!value) return "Chọn mức vận động."; break;
            case 'goal': if (!value) return "Chọn mục tiêu."; break;
        }
        return undefined;
    };

    // === 5. XỬ LÝ KHI NGƯỜI DÙNG NHẬP LIỆU ===
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        // Chặn ký tự đặc biệt nếu là số
        let newValue = value;
        if (type === 'number') {
            if (value.includes('e') || value.includes('+') || value.includes('-')) return;
        }

        setFormData(prev => {
            const updated = { ...prev, [name]: newValue };
            
            // --- LOGIC THÔNG MINH: Tự động set Goal ---
            if (name === 'target_weight' || name === 'weight_kg') {
                const currentW = parseFloat(name === 'weight_kg' ? newValue : prev.weight_kg);
                const targetW = parseFloat(name === 'target_weight' ? newValue : prev.target_weight);

                if (!isNaN(currentW) && !isNaN(targetW)) {
                    if (targetW < currentW) updated.goal = 'lose_weight';
                    else if (targetW > currentW) updated.goal = 'gain_muscle'; // Hoặc gain_weight
                    else updated.goal = 'maintain';
                }
            }
            return updated;
        });

        // Xóa lỗi khi người dùng bắt đầu nhập lại
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    // Xử lý khi focus out (Blur)
    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const error = validateField(name as keyof OnboardingFormState, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    // Xử lý khi chọn tốc độ giảm cân
    const handleSpeedSelect = (speed: number) => {
        setFormData(prev => ({ ...prev, weekly_goal: speed }));
    };

    // === 6. XỬ LÝ SUBMIT ===
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate toàn bộ form
        const validationErrors: FormErrors = {};
        let allValid = true;
        (Object.keys(formData) as Array<keyof OnboardingFormState>).forEach(key => {
            if (key === 'weekly_goal') return; // Không validate field này vì nó luôn có giá trị
            const error = validateField(key, formData[key]);
            if (error) {
                validationErrors[key] = error;
                allValid = false;
            }
        });

        setErrors(validationErrors);
        if (!allValid) {
            toast.error("Vui lòng kiểm tra lại thông tin.");
            return;
        }
        
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Vui lòng đăng nhập lại.");
            navigate('/signin');
            return;
        }

        try {
            // Chuẩn bị dữ liệu chuẩn để gửi về Backend
            const dataToSend = {
                ...formData,
                age: parseInt(formData.age, 10),
                weight_kg: parseFloat(formData.weight_kg),
                target_weight: parseFloat(formData.target_weight),
                height_cm: parseFloat(formData.height_cm),
                // weekly_goal đã là number, không cần parse
            };

            // Gọi API
            await axios.post('http://localhost:8080/api/profile', dataToSend, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success("Thiết lập hồ sơ thành công!");
            setTimeout(() => navigate('/'), 1500);

        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.msg || "Lỗi server.";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // Class helper cho input lỗi
    const getErrorClass = (field: keyof FormErrors) => 
        errors[field] ? 'border-red-500 ring-1 ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-green-200 focus:border-green-500';

    // Điều kiện hiển thị bảng chọn tốc độ: Phải là chế độ Giảm cân và Cân hiện tại > Mục tiêu
    const isLosingWeight = formData.goal === 'lose_weight' && 
                           parseFloat(formData.weight_kg) > parseFloat(formData.target_weight);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-10 px-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-2xl border border-white/60 backdrop-blur-sm">
                
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Thiết lập lộ trình</h2>
                    <p className="text-gray-500">Cung cấp thông tin để AI tối ưu hóa kế hoạch cho bạn.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 text-black">
                    
                    {/* --- NHÓM 1: THÔNG TIN CƠ BẢN --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block mb-2 text-sm font-bold text-gray-700">Tuổi</label>
                            <input 
                                type="number" name="age" value={formData.age} onChange={handleChange} onBlur={handleBlur}
                                placeholder="VD: 25"
                                className={`w-full p-3 rounded-xl border outline-none transition-all ${getErrorClass('age')}`}
                            />
                            {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-bold text-gray-700">Giới tính</label>
                            <select 
                                name="gender" value={formData.gender} onChange={handleChange} onBlur={handleBlur}
                                className={`w-full p-3 rounded-xl border outline-none transition-all ${getErrorClass('gender')}`}
                            >
                                <option value="">Chọn giới tính</option>
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                            </select>
                            {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-bold text-gray-700">Chiều cao (cm)</label>
                            <input 
                                type="number" name="height_cm" value={formData.height_cm} onChange={handleChange} onBlur={handleBlur}
                                placeholder="VD: 170"
                                className={`w-full p-3 rounded-xl border outline-none transition-all ${getErrorClass('height_cm')}`}
                            />
                            {errors.height_cm && <p className="text-red-500 text-xs mt-1">{errors.height_cm}</p>}
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-bold text-gray-700">Cân nặng hiện tại (kg)</label>
                            <input 
                                type="number" name="weight_kg" value={formData.weight_kg} onChange={handleChange} onBlur={handleBlur}
                                placeholder="VD: 70"
                                className={`w-full p-3 rounded-xl border outline-none transition-all ${getErrorClass('weight_kg')}`}
                            />
                            {errors.weight_kg && <p className="text-red-500 text-xs mt-1">{errors.weight_kg}</p>}
                        </div>
                    </div>

                    {/* --- NHÓM 2: MỤC TIÊU & LỘ TRÌNH (HIGHLIGHT) --- */}
                    <div className="bg-emerald-50/80 p-6 rounded-2xl border border-emerald-100">
                        <h3 className="text-emerald-800 font-bold mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5"/> Mục tiêu của bạn
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-2">
                            {/* Input Cân nặng mục tiêu */}
                            <div className="relative">
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Cân nặng mong muốn (kg)</label>
                                <input 
                                    type="number" name="target_weight" value={formData.target_weight} onChange={handleChange} onBlur={handleBlur}
                                    placeholder="VD: 65"
                                    className={`w-full p-3 rounded-xl border font-bold text-emerald-700 outline-none transition-all ${getErrorClass('target_weight')}`}
                                />
                                {/* Badge hiển thị chênh lệch */}
                                {formData.target_weight && formData.weight_kg && !isNaN(parseFloat(formData.target_weight)) && !isNaN(parseFloat(formData.weight_kg)) && (
                                    <div className={`absolute right-3 top-[38px] text-xs font-bold px-2 py-1 rounded shadow-sm
                                        ${parseFloat(formData.target_weight) < parseFloat(formData.weight_kg) ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}
                                    `}>
                                        {(parseFloat(formData.target_weight) - parseFloat(formData.weight_kg)).toFixed(1)} kg
                                    </div>
                                )}
                                {errors.target_weight && <p className="text-red-500 text-xs mt-1">{errors.target_weight}</p>}
                            </div>

                            {/* Select Goal (Tự động) */}
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Chế độ (Tự động)</label>
                                <select 
                                    name="goal" value={formData.goal} onChange={handleChange} onBlur={handleBlur}
                                    className={`w-full p-3 rounded-xl border outline-none transition-all ${getErrorClass('goal')}`}
                                >
                                    <option value="">-- Chọn --</option>
                                    <option value="lose_weight">Giảm cân (Giảm mỡ)</option>
                                    <option value="maintain">Duy trì cân nặng</option>
                                    <option value="gain_muscle">Tăng cân / Tăng cơ</option>
                                </select>
                            </div>
                        </div>

                        {/* --- BỘ CHỌN TỐC ĐỘ (CHỈ HIỆN KHI GIẢM CÂN) --- */}
                        {isLosingWeight && (
                            <div className="mt-6 pt-5 border-t border-emerald-200 animate-in fade-in slide-in-from-top-2">
                                <label className="block mb-3 text-sm font-bold text-gray-800 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-600"/> Tốc độ giảm mong muốn
                                </label>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {/* Card 1: Chậm */}
                                    <div 
                                        onClick={() => handleSpeedSelect(0.5)}
                                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all relative group
                                            ${formData.weekly_goal === 0.5 
                                            ? 'border-emerald-500 bg-white shadow-md' 
                                            : 'border-transparent bg-emerald-100/50 hover:bg-emerald-100'}
                                        `}
                                    >
                                        <div className="text-emerald-700 font-bold text-sm mb-1">🟢 Chậm & Chắc</div>
                                        <div className="text-xs text-gray-600">0.5 kg / tuần</div>
                                        <div className="mt-3 pt-2 border-t border-dashed border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center">
                                            <Calendar className="w-3 h-3 mr-1"/> Xong: {calculateEndDate(0.5)}
                                        </div>
                                        {formData.weekly_goal === 0.5 && <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-emerald-500" />}
                                    </div>

                                    {/* Card 2: Trung bình */}
                                    <div 
                                        onClick={() => handleSpeedSelect(0.8)}
                                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all relative group
                                            ${formData.weekly_goal === 0.8 
                                            ? 'border-amber-500 bg-white shadow-md' 
                                            : 'border-transparent bg-amber-100/50 hover:bg-amber-100'}
                                        `}
                                    >
                                        <div className="text-amber-700 font-bold text-sm mb-1">🟡 Trung bình</div>
                                        <div className="text-xs text-gray-600">0.8 kg / tuần</div>
                                        <div className="mt-3 pt-2 border-t border-dashed border-amber-200 text-xs text-amber-800 font-semibold flex items-center">
                                            <Calendar className="w-3 h-3 mr-1"/> Xong: {calculateEndDate(0.8)}
                                        </div>
                                        {formData.weekly_goal === 0.8 && <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-amber-500" />}
                                    </div>

                                    {/* Card 3: Nhanh */}
                                    <div 
                                        onClick={() => handleSpeedSelect(1.0)}
                                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all relative group
                                            ${formData.weekly_goal === 1.0 
                                            ? 'border-rose-500 bg-white shadow-md' 
                                            : 'border-transparent bg-rose-100/50 hover:bg-rose-100'}
                                        `}
                                    >
                                        <div className="text-rose-700 font-bold text-sm mb-1">🔴 Cấp tốc</div>
                                        <div className="text-xs text-gray-600">1.0 kg / tuần</div>
                                        <div className="mt-3 pt-2 border-t border-dashed border-rose-200 text-xs text-rose-800 font-semibold flex items-center">
                                            <Calendar className="w-3 h-3 mr-1"/> Xong: {calculateEndDate(1.0)}
                                        </div>
                                        {formData.weekly_goal === 1.0 && <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-rose-500" />}
                                    </div>
                                </div>
                                
                                {formData.weekly_goal === 1.0 && (
                                    <p className="text-xs text-rose-500 mt-2 italic flex items-center">
                                        ⚠️ Lưu ý: Mức này yêu cầu kỷ luật ăn uống và tập luyện rất cao.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* --- MỨC ĐỘ VẬN ĐỘNG --- */}
                    <div>
                        <label className="block mb-2 text-sm font-bold text-gray-700 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-gray-500"/> Mức độ vận động
                        </label>
                        <select 
                            name="activity_level" value={formData.activity_level} onChange={handleChange} onBlur={handleBlur}
                            className={`w-full p-3 rounded-xl border outline-none transition-all ${getErrorClass('activity_level')}`}
                        >
                            <option value="">-- Chọn mức độ --</option>
                            <option value="sedentary">Ít vận động (NV Văn phòng)</option>
                            <option value="lightly_active">Nhẹ (Tập 1-3 ngày/tuần)</option>
                            <option value="moderately_active">Vừa (Tập 3-5 ngày/tuần)</option>
                            <option value="very_active">Năng động (Tập 6-7 ngày/tuần)</option>
                            <option value="extra_active">Vận động viên (2 buổi/ngày)</option>
                        </select>
                        {errors.activity_level && <p className="text-red-500 text-xs mt-1">{errors.activity_level}</p>}
                    </div>

                    {/* --- SUBMIT BUTTON --- */}
                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={isLoading} 
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-4 px-6 rounded-2xl hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Đang xử lý...' : 'Hoàn tất & Tạo lộ trình ngay'} 
                            {!isLoading && <TrendingUp className="w-5 h-5"/>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};
 
export default OnboardingPage;