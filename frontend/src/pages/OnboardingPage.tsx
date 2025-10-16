import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

// Kiểu dữ liệu cho toàn bộ form, khớp với bảng health_profiles
interface OnboardingFormState {
    age: string;
    gender: 'male' | 'female' | 'other' | '';
    weight_kg: string;
    height_cm: string;
    activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active' | '';
    medical_history: string;
    dietary_preferences: string;
    sleep_quality_rating: number;
}

const OnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState<OnboardingFormState>({
        age: '',
        gender: '',
        weight_kg: '',
        height_cm: '',
        activity_level: '',
        medical_history: '',
        dietary_preferences: '',
        sleep_quality_rating: 3,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    // Xác thực dữ liệu ở bước 1
    const validateStep1 = () => {
        if (!formData.age || !formData.gender || !formData.weight_kg || !formData.height_cm) {
            toast.error("Vui lòng điền đầy đủ thông tin ở bước này.");
            return false;
        }
        if (parseInt(formData.age, 10) < 10 || parseInt(formData.age, 10) > 100) {
            toast.error("Tuổi không hợp lệ (10-100).");
            return false;
        }
        return true;
    };
    
    // Xác thực dữ liệu ở bước 2
    const validateStep2 = () => {
        if (!formData.activity_level) {
            toast.error("Vui lòng chọn mức độ hoạt động của bạn.");
            return false;
        }
        return true;
    }

    // Gửi dữ liệu khi hoàn thành
    const handleSubmit = async () => {
    if(!validateStep1() || !validateStep2()) return;
    
    setIsLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        setIsLoading(false);
        navigate('/signin');
        return;
    }

    try {
        await axios.post('http://localhost:8080/api/profile', formData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        toast.success("Chào mừng bạn! Hồ sơ đã được thiết lập.");

        // Chuyển hướng đến trang chính sau khi thành công
        setTimeout(() => {
            // THAY ĐỔI Ở ĐÂY: Sửa '/dashboard' thành '/'
            navigate('/'); 
        }, 2000);

    } catch (error: any) {
        const errorMsg = error.response?.data?.msg || "Đã có lỗi xảy ra, không thể lưu hồ sơ.";
        toast.error(errorMsg);
        console.error("Lỗi khi hoàn thành hồ sơ:", error);
    } finally {
        setIsLoading(false);
    }
};
    
    // Hàm render nội dung cho từng bước
    const renderStepContent = () => {
        switch(step) {
            case 1:
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Thông tin cơ bản của bạn</h2>
                        <p className="text-gray-500 mb-6">Những chỉ số này là nền tảng cho kế hoạch của bạn.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Tuổi</label>
                                <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full p-3 border rounded-lg text-gray-800"/>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Giới tính</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-3 border rounded-lg text-gray-800">
                                    <option value="">Chọn giới tính</option>
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Cân nặng (kg)</label>
                                <input type="number" name="weight_kg" value={formData.weight_kg} onChange={handleChange} placeholder="Ví dụ: 70" className="w-full p-3 border rounded-lg text-gray-800"/>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Chiều cao (cm)</label>
                                <input type="number" name="height_cm" value={formData.height_cm} onChange={handleChange} placeholder="Ví dụ: 175" className="w-full p-3 border rounded-lg text-gray-800"/>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                 return (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Lối sống của bạn</h2>
                        <p className="text-gray-500 mb-6">Điều này giúp chúng tôi đề xuất các bài tập phù hợp.</p>
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">Mức độ hoạt động</label>
                            <select name="activity_level" value={formData.activity_level} onChange={handleChange} className="w-full p-3 border rounded-lg text-gray-800">
                                <option value="">Chọn mức độ</option>
                                <option value="sedentary">Ít vận động (chỉ ngồi một chỗ)</option>
                                <option value="lightly_active">Vận động nhẹ (đi bộ, việc nhà)</option>
                                <option value="moderately_active">Vận động vừa (tập 3-5 ngày/tuần)</option>
                                <option value="very_active">Vận động nhiều (tập 6-7 ngày/tuần)</option>
                                <option value="extra_active">Rất nhiều vận động (vận động viên)</option>
                            </select>
                        </div>
                        <div className="mt-4">
                            <label className="block mb-2 text-sm font-semibold text-gray-700">Chất lượng giấc ngủ (1-5)</label>
                            <div className="flex items-center gap-4">
                                <input type="range" name="sleep_quality_rating" min="1" max="5" value={formData.sleep_quality_rating} onChange={handleChange} className="w-full" />
                                <span className="font-bold text-teal-500 text-xl">{formData.sleep_quality_rating}</span>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Thông tin bổ sung</h2>
                        <p className="text-gray-500 mb-6">Các thông tin này là tùy chọn nhưng rất hữu ích.</p>
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">Tiền sử bệnh lý (nếu có)</label>
                            <textarea name="medical_history" value={formData.medical_history} onChange={handleChange} placeholder="Ví dụ: Huyết áp cao, tiểu đường..." className="w-full p-3 border rounded-lg h-24 text-gray-800"></textarea>
                        </div>
                        <div className="mt-4">
                            <label className="block mb-2 text-sm font-semibold text-gray-700">Sở thích/Chế độ ăn uống</label>
                            <textarea name="dietary_preferences" value={formData.dietary_preferences} onChange={handleChange} placeholder="Ví dụ: Ăn chay, không ăn hải sản..." className="w-full p-3 border rounded-lg h-24 text-gray-800"></textarea>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
                <ToastContainer position="top-center" autoClose={3000} />
                <div className="mb-8">
                    <div className="relative pt-1">
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-teal-200">
                            <div style={{ width: `${(step / 3) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-teal-500 transition-all duration-500"></div>
                        </div>
                        <p className="text-center text-sm text-gray-600 font-semibold">Bước {step} trên 3</p>
                    </div>
                </div>

                <div className="min-h-[350px]">
                    {renderStepContent()}
                </div>

                <div className="flex justify-between mt-8">
                    {step > 1 ? (
                        <button onClick={prevStep} className="bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-400 transition">
                            Quay lại
                        </button>
                    ) : <div></div>}
                    
                    {step < 3 ? (
                        <button onClick={() => {
                            if (step === 1 && validateStep1()) nextStep();
                            if (step === 2 && validateStep2()) nextStep();
                        }} className="bg-teal-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-600 transition">
                            Tiếp theo
                        </button>
                    ) : (
                        <button onClick={handleSubmit} disabled={isLoading} className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition disabled:opacity-50">
                            {isLoading ? 'Đang lưu...' : 'Hoàn thành'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
 
export default OnboardingPage;