// src/components/Profile/HealthProfileTab.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Calendar, TrendingUp, Activity, Target } from 'lucide-react';

// 1. INTERFACES
interface HealthProfileState {
    age: number | '';
    gender: 'male' | 'female' | 'other' | '';
    weight_kg: number | '';
    height_cm: number | '';
    target_weight: number | '';
    weekly_goal: number;
    goal: 'lose_weight' | 'maintain' | 'gain_muscle' | '';
    activity_level: string;
    medical_history: string;
    dietary_preferences: string;
    sleep_quality_rating: number;
}

// Interface cho lỗi
interface FormErrors {
    age?: string;
    gender?: string;
    weight_kg?: string;
    height_cm?: string;
    target_weight?: string;
    activity_level?: string;
}

const HealthProfileTab: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    
    // State dữ liệu
    const [formData, setFormData] = useState<HealthProfileState>({
        age: '',
        gender: '',
        weight_kg: '',
        height_cm: '',
        target_weight: '', 
        weekly_goal: 0.5,
        goal: '',
        activity_level: '',
        medical_history: '',
        dietary_preferences: '',
        sleep_quality_rating: 3,
    });

    // [MỚI] State lưu lỗi
    const [errors, setErrors] = useState<FormErrors>({});

    // 2. TẢI DỮ LIỆU TỪ API
    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get('http://localhost:8080/api/profile/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data.health_profile) {
                    const data = res.data.health_profile;
                    setFormData({
                        ...data,
                        weekly_goal: data.weekly_goal || 0.5,
                        target_weight: data.target_weight || ''
                    });
                }
            } catch (error) {
                toast.error("Không thể tải thông tin sức khỏe.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // 3. [MỚI] HÀM VALIDATE CHI TIẾT
    const validateField = (name: keyof FormErrors, value: any): string | undefined => {
        switch (name) {
            case 'age':
                if (!value) return "Vui lòng nhập tuổi.";
                const age = Number(value);
                if (isNaN(age) || age < 10 || age > 100) return "Tuổi từ 10 - 100.";
                break;
            case 'weight_kg':
                if (!value) return "Vui lòng nhập cân nặng.";
                const w = Number(value);
                if (isNaN(w) || w < 20 || w > 300) return "Cân nặng không hợp lệ (20-300kg).";
                break;
            case 'height_cm':
                if (!value) return "Vui lòng nhập chiều cao.";
                const h = Number(value);
                if (isNaN(h) || h < 100 || h > 250) return "Chiều cao không hợp lệ (100-250cm).";
                break;
            case 'target_weight':
                if (!value) return "Vui lòng nhập mục tiêu.";
                const t = Number(value);
                if (isNaN(t) || t < 20 || t > 300) return "Mục tiêu không hợp lệ.";
                
                // Check BMI mục tiêu (chặn nếu quá gầy)
                const heightM = Number(formData.height_cm) / 100;
                if (heightM > 0) {
                    const bmi = t / (heightM * heightM);
                    if (bmi < 16) return `Mục tiêu quá thấp (BMI ${bmi.toFixed(1)} - Nguy hiểm).`;
                }
                break;
            case 'activity_level':
                if (!value) return "Vui lòng chọn mức độ hoạt động.";
                break;
            case 'gender':
                if (!value) return "Vui lòng chọn giới tính.";
                break;
        }
        return undefined;
    };

    // 4. HÀM HELPER TÍNH NGÀY
    const calculateEndDate = () => {
        const current = Number(formData.weight_kg);
        const target = Number(formData.target_weight);
        const speed = Number(formData.weekly_goal);

        if (!current || !target || !speed || current <= target) return null;

        const diff = current - target;
        const weeksNeeded = diff / speed;
        const daysNeeded = Math.round(weeksNeeded * 7);

        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + daysNeeded);

        return futureDate.toLocaleDateString('vi-VN');
    };

    // 5. XỬ LÝ CHANGE & BLUR
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        let newValue: any = value;
        
        // Chặn ký tự lạ cho input số
        if (type === 'number') {
            if (value.includes('e') || value.includes('+') || value.includes('-')) return;
        }

        setFormData(prev => {
            const updated = { ...prev, [name]: newValue };
            
            // Logic tự động set Goal
            if (name === 'target_weight' || name === 'weight_kg') {
                const currentW = parseFloat(name === 'weight_kg' ? newValue : String(prev.weight_kg));
                const targetW = parseFloat(name === 'target_weight' ? newValue : String(prev.target_weight));

                if (!isNaN(currentW) && !isNaN(targetW)) {
                    if (targetW < currentW) updated.goal = 'lose_weight';
                    else if (targetW > currentW) updated.goal = 'gain_muscle';
                    else updated.goal = 'maintain';
                }
            }
            return updated;
        });

        // Xóa lỗi khi người dùng bắt đầu sửa
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    // [MỚI] Validate khi rời chuột khỏi ô input
    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // Chỉ validate các trường có trong FormErrors
        if (Object.keys(errors).includes(name) || ['age', 'weight_kg', 'height_cm', 'target_weight', 'gender', 'activity_level'].includes(name)) {
             const error = validateField(name as keyof FormErrors, value);
             setErrors(prev => ({ ...prev, [name]: error }));
        }
    };

    // 6. XỬ LÝ SUBMIT
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // [MỚI] Validate toàn bộ trước khi gửi
        const newErrors: FormErrors = {};
        let hasError = false;
        
        // Danh sách các field cần check
        const fieldsToCheck: (keyof FormErrors)[] = ['age', 'gender', 'weight_kg', 'height_cm', 'target_weight', 'activity_level'];
        
        fieldsToCheck.forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) {
                newErrors[field] = error;
                hasError = true;
            }
        });

        setErrors(newErrors);
        if (hasError) {
            toast.error("Vui lòng kiểm tra lại thông tin màu đỏ.");
            return;
        }

        setIsLoading(true);
        const token = localStorage.getItem('token');
        try {
            const payload = {
                ...formData,
                age: Number(formData.age),
                weight_kg: Number(formData.weight_kg),
                height_cm: Number(formData.height_cm),
                target_weight: formData.target_weight ? Number(formData.target_weight) : null,
                weekly_goal: Number(formData.weekly_goal),
                sleep_quality_rating: Number(formData.sleep_quality_rating)
            };

            await axios.post('http://localhost:8080/api/profile', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Đã cập nhật hồ sơ sức khỏe!");
        } catch (error) {
            toast.error("Cập nhật thất bại. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    const isLosingWeight = formData.goal === 'lose_weight' && 
                           Number(formData.weight_kg) > Number(formData.target_weight);
    
    // Helper class để hiển thị viền đỏ
    const getErrorClass = (name: keyof FormErrors) => 
        errors[name] ? 'border-red-500 ring-1 ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-teal-500';

    return (
        <form onSubmit={handleSubmit} className="animate-in fade-in duration-500 text-black">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Hồ sơ Sức khỏe</h2>
                    <p className="text-gray-500 text-sm">Cập nhật chỉ số để AI điều chỉnh lộ trình.</p>
                </div>
                {/* BMI Badge */}
                {formData.height_cm && formData.weight_kg && (
                    <div className="bg-blue-50 px-4 py-2 rounded-lg text-blue-700 font-bold text-sm">
                        BMI: {(Number(formData.weight_kg) / ((Number(formData.height_cm)/100)**2)).toFixed(1)}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* --- NHÓM 1: CƠ BẢN --- */}
                <div className="space-y-5">
                    <h3 className="font-bold text-gray-700 border-b pb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4"/> Chỉ số cơ thể
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 text-sm font-semibold text-gray-600">Tuổi</label>
                            <input 
                                type="number" name="age" value={formData.age} 
                                onChange={handleChange} onBlur={handleBlur}
                                className={`w-full p-2.5 border rounded-lg outline-none ${getErrorClass('age')}`} 
                            />
                            {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-semibold text-gray-600">Giới tính</label>
                            <select 
                                name="gender" value={formData.gender} 
                                onChange={handleChange} onBlur={handleBlur}
                                className={`w-full p-2.5 border rounded-lg outline-none ${getErrorClass('gender')}`}
                            >
                                <option value="">--Chọn--</option>
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                                <option value="other">Khác</option>
                            </select>
                            {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-semibold text-gray-600">Chiều cao (cm)</label>
                        <input 
                            type="number" name="height_cm" value={formData.height_cm} 
                            onChange={handleChange} onBlur={handleBlur}
                            className={`w-full p-2.5 border rounded-lg outline-none ${getErrorClass('height_cm')}`} 
                        />
                        {errors.height_cm && <p className="text-red-500 text-xs mt-1">{errors.height_cm}</p>}
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-semibold text-gray-600">Cân nặng hiện tại (kg)</label>
                        <input 
                            type="number" name="weight_kg" value={formData.weight_kg} 
                            onChange={handleChange} onBlur={handleBlur}
                            className={`w-full p-2.5 border rounded-lg outline-none font-bold text-gray-800 ${getErrorClass('weight_kg')}`} 
                        />
                        {errors.weight_kg && <p className="text-red-500 text-xs mt-1">{errors.weight_kg}</p>}
                    </div>
                </div>

                {/* --- NHÓM 2: MỤC TIÊU --- */}
                <div className="space-y-5">
                    <h3 className="font-bold text-gray-700 border-b pb-2 flex items-center gap-2">
                        <Target className="w-4 h-4"/> Mục tiêu & Lộ trình
                    </h3>

                    <div className="relative">
                        <label className="block mb-1 text-sm font-semibold text-gray-600">Cân nặng mong muốn (kg)</label>
                        <input 
                            type="number" name="target_weight" value={formData.target_weight} 
                            onChange={handleChange} onBlur={handleBlur}
                            className={`w-full p-2.5 border rounded-lg outline-none font-bold text-teal-600 ${getErrorClass('target_weight')}`} 
                        />
                        {/* Hiển thị lỗi ngay dưới input */}
                        {errors.target_weight && <p className="text-red-500 text-xs mt-1">{errors.target_weight}</p>}

                        {/* Badge chênh lệch */}
                        {!errors.target_weight && formData.target_weight && formData.weight_kg && (
                            <div className={`absolute right-3 top-8 text-xs font-bold px-2 py-1 rounded 
                                ${Number(formData.target_weight) < Number(formData.weight_kg) ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}
                            `}>
                                {(Number(formData.target_weight) - Number(formData.weight_kg)).toFixed(1)} kg
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-semibold text-gray-600">Chế độ (Tự động)</label>
                        <select 
                            name="goal" value={formData.goal} onChange={handleChange} 
                            className="w-full p-2.5 border rounded-lg bg-gray-50 outline-none cursor-not-allowed opacity-80"
                        >
                            <option value="lose_weight">Giảm cân</option>
                            <option value="maintain">Duy trì</option>
                            <option value="gain_muscle">Tăng cân/cơ</option>
                        </select>
                    </div>

                    {/* Hiển thị Tốc độ giảm cân */}
                    {isLosingWeight && (
                        <div className="bg-teal-50 p-4 rounded-lg border border-teal-100 animate-fade-in">
                            <label className="block mb-2 text-sm font-bold text-teal-800 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3"/> Tốc độ giảm (kg/tuần)
                            </label>
                            <select 
                                name="weekly_goal" value={formData.weekly_goal} onChange={handleChange} 
                                className="w-full p-2 border border-teal-200 rounded text-sm mb-3 focus:ring-2 focus:ring-teal-500 outline-none"
                            >
                                <option value={0.5}>0.5 kg (Chậm & Chắc)</option>
                                <option value={0.8}>0.8 kg (Trung bình)</option>
                                <option value={1.0}>1.0 kg (Nhanh - Cân nhắc)</option>
                            </select>
                            
                            <div className="text-xs text-teal-700 flex items-center gap-1 font-semibold border-t border-teal-200 pt-2">
                                <Calendar className="w-3 h-3"/> Dự kiến hoàn thành: {calculateEndDate()}
                            </div>
                        </div>
                    )}
                </div>

                {/* --- NHÓM 3: MỨC ĐỘ HOẠT ĐỘNG --- */}
                <div className="md:col-span-2 space-y-4">
                    <div>
                        <label className="block mb-1 text-sm font-semibold text-gray-600">Mức độ hoạt động</label>
                        <select 
                            name="activity_level" value={formData.activity_level} 
                            onChange={handleChange} onBlur={handleBlur}
                            className={`w-full p-2.5 border rounded-lg outline-none ${getErrorClass('activity_level')}`}
                        >
                            <option value="">--Chọn--</option>
                            <option value="sedentary">Ít vận động (chỉ ngồi một chỗ)</option>
                            <option value="lightly_active">Vận động nhẹ (đi bộ, việc nhà)</option>
                            <option value="moderately_active">Vận động vừa (tập 3-5 ngày/tuần)</option>
                            <option value="very_active">Vận động nhiều (tập 6-7 ngày/tuần)</option>
                            <option value="extra_active">Rất nhiều vận động (vận động viên)</option>
                        </select>
                        {errors.activity_level && <p className="text-red-500 text-xs mt-1">{errors.activity_level}</p>}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t pt-6">
                <button type="button" className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition">
                    Hủy bỏ
                </button>
                <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="bg-teal-600 text-white font-bold py-2 px-8 rounded-lg hover:bg-teal-700 shadow-md transition disabled:opacity-50 transform hover:-translate-y-0.5"
                >
                    {isLoading ? 'Đang lưu...' : 'Lưu Hồ Sơ'}
                </button>
            </div>
        </form>
    );
};

export default HealthProfileTab;