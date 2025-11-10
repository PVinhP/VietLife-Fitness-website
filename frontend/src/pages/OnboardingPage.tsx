// src/pages/OnboardingPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Kiểu dữ liệu cho form
interface OnboardingFormState {
    age: string;
    gender: 'male' | 'female' | 'other' | '';
    weight_kg: string;
    height_cm: string;
    activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active' | '';
    goal: 'lose_weight' | 'maintain' | 'gain_muscle' | '';
}

// Kiểu dữ liệu MỚI: Dành cho state chứa lỗi
interface FormErrors {
    age?: string;
    gender?: string;
    weight_kg?: string;
    height_cm?: string;
    activity_level?: string;
    goal?: string;
}

const OnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<OnboardingFormState>({
        age: '',
        gender: '',
        weight_kg: '',
        height_cm: '',
        activity_level: '',
        goal: '',
    });
    
    // State MỚI: Để lưu lỗi của từng trường
    const [errors, setErrors] = useState<FormErrors>({});

    // === 1. HÀM VALIDATE MỚI (VALIDATE TỪNG TRƯỜNG) ===
    const validateField = (name: keyof OnboardingFormState, value: string): string | undefined => {
        
        switch (name) {
            case 'age':
                if (!value) return "Vui lòng nhập tuổi của bạn.";
                const ageNum = parseInt(value, 10);
                if (isNaN(ageNum) || ageNum < 10 || ageNum > 100) {
                    return "Tuổi phải từ 10 - 100.";
                }
                break;
            case 'weight_kg':
                if (!value) return "Vui lòng nhập cân nặng.";
                const weightNum = parseFloat(value);
                if (isNaN(weightNum) || weightNum < 20 || weightNum > 300) {
                    return "Cân nặng phải từ 20 - 300 kg.";
                }
                break;
            case 'height_cm':
                if (!value) return "Vui lòng nhập chiều cao.";
                const heightNum = parseFloat(value);
                if (isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
                    return "Chiều cao phải từ 100 - 250 cm.";
                }
                break;
            case 'gender':
                if (!value) return "Vui lòng chọn giới tính.";
                break;
            case 'activity_level':
                if (!value) return "Vui lòng chọn mức độ hoạt động.";
                break;
            case 'goal':
                if (!value) return "Vui lòng chọn mục tiêu.";
                break;
        }
        return undefined; // Hợp lệ
    };

    // === 2. CẢI TIẾN HÀM XỬ LÝ ===

    // Khi người dùng gõ, cập nhật state và XÓA LỖI
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        // Logic cũ của bạn để chặn ký tự 'e', '+', '-' (rất tốt)
        if (type === 'number') {
            if (value.includes('e') || value.includes('+') || value.includes('-')) {
                return;
            }
            if (value === '' || parseFloat(value) > 0) {
                 setFormData(prev => ({ ...prev, [name]: value }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Khi người dùng bắt đầu sửa, xóa thông báo lỗi
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    // Khi người dùng rời khỏi ô (blur), KÍCH HOẠT VALIDATE
    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const error = validateField(name as keyof OnboardingFormState, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    // Khi nhấn submit, validate tất cả
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate tất cả các trường một lần nữa
        const validationErrors: FormErrors = {};
        let allValid = true;

        (Object.keys(formData) as Array<keyof OnboardingFormState>).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) {
                validationErrors[key] = error;
                allValid = false;
            }
        });

        setErrors(validationErrors);

        if (!allValid) {
            toast.error("Vui lòng kiểm tra lại các thông tin bị lỗi.");
            return;
        }
        
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            setIsLoading(false);
            navigate('/signin');
            return;
        }

        try {
            const dataToSend = {
                ...formData,
                age: parseInt(formData.age, 10),
                weight_kg: parseFloat(formData.weight_kg),
                height_cm: parseFloat(formData.height_cm),
            };

            await axios.post('http://localhost:8080/api/profile', dataToSend, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success("Chào mừng bạn! Hồ sơ đã được thiết lập.");

            setTimeout(() => {
                navigate('/');
            }, 2000);

        } catch (error: any) {
            const errorMsg = error.response?.data?.msg || "Đã có lỗi, không thể lưu hồ sơ."; // Đã đổi sang Tiếng Việt
            toast.error(errorMsg);
            console.error("Lỗi khi hoàn thành hồ sơ:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    // === 3. CẬP NHẬT JSX ĐỂ HIỂN THỊ LỖI ===
    
    // Hàm helper để thêm class cho ô bị lỗi
    const getErrorClass = (field: keyof FormErrors) => {
        return errors[field] ? 'border-red-500' : 'border-gray-300';
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
                
                
                <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Chào mừng bạn!</h2>
                <p className="text-gray-500 mb-8 text-center">Chỉ cần một vài thông tin để bắt đầu lộ trình của bạn.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Tuổi */}
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">Tuổi</label>
                            <input 
                                type="number" 
                                name="age" 
                                value={formData.age} 
                                onChange={handleChange}
                                onBlur={handleBlur} // Thêm onBlur
                                placeholder="Ví dụ: 25 tuổi"
                                className={`w-full p-3 border rounded-lg text-gray-800 ${getErrorClass('age')}`}
                                min="10" max="100" 
                            />
                            {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                        </div>

                        {/* Giới tính */}
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">Giới tính</label>
                            <select 
                                name="gender" 
                                value={formData.gender} 
                                onChange={handleChange}
                                onBlur={handleBlur} // Thêm onBlur
                                className={`w-full p-3 border rounded-lg text-gray-800 ${getErrorClass('gender')}`}
                            >
                                <option value="">Chọn giới tính</option>
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                                <option value="other">Khác</option>
                            </select>
                            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                        </div>

                        {/* Cân nặng */}
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">Cân nặng (kg)</label>
                            <input 
                                type="number" 
                                name="weight_kg" 
                                value={formData.weight_kg} 
                                onChange={handleChange}
                                onBlur={handleBlur} // Thêm onBlur
                                placeholder="Ví dụ: 70 kg" 
                                className={`w-full p-3 border rounded-lg text-gray-800 ${getErrorClass('weight_kg')}`}
                                min="20" 
                            />
                            {errors.weight_kg && <p className="text-red-500 text-sm mt-1">{errors.weight_kg}</p>}
                        </div>

                        {/* Chiều cao */}
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">Chiều cao (cm)</label>
                            <input 
                                type="number" 
                                name="height_cm" 
                                value={formData.height_cm} 
                                onChange={handleChange}
                                onBlur={handleBlur} // Thêm onBlur
                                placeholder="Ví dụ: 175 cm" 
                                className={`w-full p-3 border rounded-lg text-gray-800 ${getErrorClass('height_cm')}`}
                                min="100" 
                            />
                            {errors.height_cm && <p className="text-red-500 text-sm mt-1">{errors.height_cm}</p>}
                        </div>
                    </div>
                    
                    {/* Mức độ hoạt động */}
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-gray-700">Mức độ hoạt động</label>
                        <select 
                            name="activity_level" 
                            value={formData.activity_level} 
                            onChange={handleChange}
                            onBlur={handleBlur} // Thêm onBlur
                            className={`w-full p-3 border rounded-lg text-gray-800 ${getErrorClass('activity_level')}`}
                        >
                            <option value="">Chọn mức độ</option>
                            <option value="sedentary">Ít vận động (chỉ ngồi một chỗ)</option>
                            <option value="lightly_active">Vận động nhẹ (đi bộ, việc nhà)</option>
                            <option value="moderately_active">Vận động vừa (tập 3-5 ngày/tuần)</option>
                            <option value="very_active">Vận động nhiều (tập 6-7 ngày/tuần)</option>
                            <option value="extra_active">Rất nhiều vận động (vận động viên)</option>
                        </select>
                        {errors.activity_level && <p className="text-red-500 text-sm mt-1">{errors.activity_level}</p>}
                    </div>

                    {/* Mục tiêu */}
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-gray-700">Mục tiêu của bạn</label>
                        <select 
                            name="goal" 
                            value={formData.goal} 
                            onChange={handleChange}
                            onBlur={handleBlur} // Thêm onBlur
                            className={`w-full p-3 border rounded-lg text-gray-800 ${getErrorClass('goal')}`}
                        >
                            <option value="">Chọn mục tiêu</option>
                            <option value="lose_weight">Giảm cân</option>
                            <option value="maintain">Duy trì cân nặng</option>
                            <option value="gain_muscle">Tăng cơ / Tăng cân</option>
                        </select>
                        {errors.goal && <p className="text-red-500 text-sm mt-1">{errors.goal}</p>}
                    </div>

                    {/* Nút Submit */}
                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={isLoading} className="w-full md:w-auto bg-green-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-600 transition disabled:opacity-50">
                            {isLoading ? 'Đang lưu...' : 'Hoàn thành & Bắt đầu'}
                        </button>
                    </div>
                </form>
                
            </div>
        </div>
    );
};
 
export default OnboardingPage;