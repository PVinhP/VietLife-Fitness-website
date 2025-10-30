// src/components/Profile/AccountTab.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface AccountState {
    full_name: string;
    email: string;
    avatar_url: string; // Giả sử bạn có trường này
}

const AccountTab: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ full_name: '', email: '' });
    const [avatarPreview, setAvatarPreview] = useState<string>('/default-avatar.png'); // Ảnh mặc định

    // Hàm gọi API để lấy dữ liệu user (tên, email)
    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            try {
                // Dùng lại API GET /api/profile/me để lấy cả thông tin user
                const res = await axios.get('http://localhost:8080/api/profile/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFormData({
                    full_name: res.data.full_name,
                    email: res.data.email
                });
                if (res.data.avatar_url) {
                    setAvatarPreview(res.data.avatar_url);
                }
            } catch (error) {
                toast.error("Không thể tải thông tin tài khoản.");
            }
        };
        fetchUser();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Hàm xử lý khi chọn file ảnh
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Hiển thị ảnh xem trước
            setAvatarPreview(URL.createObjectURL(file));
            
            // TODO: Upload file này lên backend (vd: Cloudinary, S3)
            // và nhận về một URL, sau đó mới submit URL đó
            toast.info("Tính năng upload ảnh đang được phát triển!");
        }
    };

    // Hàm submit (chỉ submit full_name)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const token = localStorage.getItem('token');
        try {
            // Bạn cần tạo một API MỚI, ví dụ: PUT /api/users/me
            // để cập nhật bảng 'users'
            await axios.put('http://localhost:8080/api/users/me', 
                { full_name: formData.full_name }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Đã cập nhật tên hiển thị!");
        } catch (error) {
            toast.error("Cập nhật thất bại.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Tài khoản</h2>

            {/* Phần Avatar */}
            <div className="flex items-center space-x-4 mb-6">
                <img 
                    src={avatarPreview} 
                    alt="Avatar" 
                    className="w-20 h-20 rounded-full object-cover" 
                />
                <div>
                    <label htmlFor="avatar-upload" className="cursor-pointer bg-gray-200 text-gray-800 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-300">
                        Đổi ảnh
                    </label>
                    <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
            </div>

            {/* Phần Form */}
            <div className="space-y-4">
                 <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">Họ và tên</label>
                    <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full p-3 border rounded-lg text-gray-800" />
                </div>
                <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">Email</label>
                    <input type="email" name="email" value={formData.email} disabled className="w-full p-3 border rounded-lg text-gray-800 bg-gray-100 cursor-not-allowed" />
                </div>
            </div>
            
             <div className="mt-8 text-right">
                <button type="submit" disabled={isLoading} className="bg-teal-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-600 transition disabled:opacity-50">
                    {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
            </div>
        </form>
    );
};

export default AccountTab;