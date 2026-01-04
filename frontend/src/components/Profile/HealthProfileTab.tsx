// src/components/Profile/HealthProfileTab.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Lấy lại kiểu dữ liệu từ trang Onboarding, nhưng có thể cho phép null
interface HealthProfileState {
    age: number | '';
    gender: 'male' | 'female' | 'other' | '';
    weight_kg: number | '';
    height_cm: number | '';
    activity_level: string;
    medical_history: string;
    dietary_preferences: string;
    sleep_quality_rating: number;
}

const HealthProfileTab: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<HealthProfileState>({
        age: '',
        gender: '',
        weight_kg: '',
        height_cm: '',
        activity_level: '',
        medical_history: '',
        dietary_preferences: '',
        sleep_quality_rating: 3,
    });

    // Hàm gọi API để lấy dữ liệu profile HIỆN TẠI
    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            try {
                // API này bạn đã tạo ở Phần 1: GET /api/profile/me
                const res = await axios.get('https://vietlife-fitness-website-host.onrender.com/api/profile/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Chỉ điền dữ liệu từ health_profile (nếu có)
                if (res.data.health_profile) {
                    setFormData(res.data.health_profile);
                }
            } catch (error) {
                toast.error("Không thể tải thông tin sức khỏe.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Hàm gửi dữ liệu CẬP NHẬT
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const token = localStorage.getItem('token');
        try {
            // API này bạn đã tạo ở Phần 1: POST /api/profile
            await axios.post('https://vietlife-fitness-website-host.onrender.com/api/profile', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Đã cập nhật thông tin sức khỏe!");
        } catch (error) {
            toast.error("Cập nhật thất bại. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };
    
    if (isLoading && !formData.age) {
        return <div>Đang tải dữ liệu...</div>;
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin Sức khỏe</h2>
            <p className="text-gray-500 mb-6">Cập nhật các chỉ số của bạn để nhận được gợi ý chính xác nhất.</p>

            {/* Dùng grid của Tailwind để chia cột */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">Tuổi</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full p-3 border rounded-lg text-gray-800" />
                </div>
                <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">Giới tính</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-3 border rounded-lg text-gray-800">
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                    </select>
                </div>
                <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">Cân nặng (kg)</label>
                    <input type="number" name="weight_kg" value={formData.weight_kg} onChange={handleChange} className="w-full p-3 border rounded-lg text-gray-800" />
                </div>
                <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">Chiều cao (cm)</label>
                    <input type="number" name="height_cm" value={formData.height_cm} onChange={handleChange} className="w-full p-3 border rounded-lg text-gray-800" />
                </div>
                <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-semibold text-gray-700">Mức độ hoạt động</label>
                    <select name="activity_level" value={formData.activity_level} onChange={handleChange} className="w-full p-3 border rounded-lg text-gray-800">
                        <option value="sedentary">Ít vận động (chỉ ngồi một chỗ)</option>
                        <option value="lightly_active">Vận động nhẹ (đi bộ, việc nhà)</option>
                        <option value="moderately_active">Vận động vừa (tập 3-5 ngày/tuần)</option>
                        <option value="very_active">Vận động nhiều (tập 6-7 ngày/tuần)</option>
                        <option value="extra_active">Rất nhiều vận động (vận động viên)</option>
                    </select>
                </div>
                {/* Bạn có thể thêm các trường khác như medical_history, dietary_preferences... */}
            </div>

            <div className="mt-8 text-right">
                <button type="submit" disabled={isLoading} className="bg-teal-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-600 transition disabled:opacity-50">
                    {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
            </div>
        </form>
    );
};

export default HealthProfileTab;