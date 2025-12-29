import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Interface dữ liệu hiển thị (GET)
interface UserData {
    id: number;
    full_name: string;
    email: string;
    role: 'admin' | 'pt' | 'user';
    status: 'active' | 'locked';    // Trạng thái đăng nhập
    is_onboarded: number;           // Trạng thái hồ sơ sức khỏe (0 hoặc 1)
    created_at?: string;
    // Health Info
    gender?: 'Male' | 'Female' | 'Other';
    age?: number;
    weight_kg?: number;
    height_cm?: number;
    goal?: string;
    activity_level?: string;
}

// Interface dữ liệu cho Form (POST/PUT)
interface UserFormData {
    full_name: string;
    email: string;
    password?: string;
    role: string;
    status: string;       // 'active' | 'locked'
    is_onboarded: number; // 0 | 1
}

const UserManager = () => {
    // --- STATE DỮ LIỆU ---
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    
    // --- STATE FILTER & SEARCH ---
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    
    // --- STATE MODAL VIEW (Xem chi tiết) ---
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

    // --- STATE MODAL FORM (Tạo / Sửa) ---
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null); // null = Create Mode
    const [formData, setFormData] = useState<UserFormData>({
        full_name: '',
        email: '',
        password: '',
        role: 'user',
        status: 'active',
        is_onboarded: 0 // Mặc định tạo mới là chưa có hồ sơ
    });

    // 1. Lấy danh sách User
    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get('http://localhost:8080/user', {
                params: { search: searchTerm, role: roleFilter },
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchUsers(), 500);
        return () => clearTimeout(timer);
    }, [searchTerm, roleFilter]);

    // 2. Xử lý Mở Form TẠO MỚI
    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({ 
            full_name: '', email: '', password: '', 
            role: 'user', status: 'active', is_onboarded: 0 
        });
        setIsFormOpen(true);
    };

    // 3. Xử lý Mở Form CHỈNH SỬA
    const handleOpenEdit = (user: UserData) => {
        setEditingId(user.id);
        setFormData({
            full_name: user.full_name,
            email: user.email,
            password: '', 
            role: user.role,
            status: user.status,             // Load đúng status từ DB
            is_onboarded: user.is_onboarded  // Load đúng trạng thái onboarding
        });
        setIsFormOpen(true);
    };

    // 4. Submit Form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            
            if (editingId) {
                // UPDATE
                await axios.put(`http://localhost:8080/user/${editingId}`, formData, { headers });
                toast.success("Cập nhật thông tin thành công!");
            } else {
                // CREATE
                if (!formData.password) return toast.warn("Vui lòng nhập mật khẩu!");
                await axios.post(`http://localhost:8080/user/create`, formData, { headers });
                toast.success("Tạo tài khoản mới thành công!");
            }

            setIsFormOpen(false);
            fetchUsers(); 
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.msg || "Có lỗi xảy ra");
        }
    };

    // 5. Xóa User
    const handleDelete = async (id: number) => {
        if(!window.confirm('CẢNH BÁO: Xóa user sẽ mất hết dữ liệu sức khỏe! Tiếp tục?')) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8080/user/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Đã xóa user.");
            fetchUsers();
        } catch (error) {
            toast.error("Lỗi khi xóa user.");
        }
    };

    const calculateBMI = (w?: number, h?: number) => {
        if (!w || !h) return 'N/A';
        return (w / ((h / 100) ** 2)).toFixed(1);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 min-h-[600px] animate-fadeIn">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Quản lý Hội viên</h2>
                    <p className="text-sm text-gray-500 mt-1">Tổng số: <span className="font-bold text-teal-600">{users.length}</span> tài khoản</p>
                </div>
                
                <button 
                    onClick={handleOpenCreate}
                    className="bg-teal-600 text-white px-5 py-2.5 rounded-lg hover:bg-teal-700 shadow-lg shadow-teal-200 transition flex items-center gap-2 font-medium"
                >
                    <span>➕</span> Tạo tài khoản mới
                </button>
            </div>

            {/* --- FILTER --- */}
            <div className="flex flex-wrap gap-3 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <input 
                    type="text" 
                    placeholder="Tìm tên hoặc email..." 
                    className="px-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-teal-500 outline-none bg-white text-gray-700" 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <select 
                    className="border rounded-lg px-4 py-2 outline-none bg-white text-gray-700"
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                >
                    <option value="">-- Tất cả vai trò --</option>
                    <option value="admin">Admin</option>
                    <option value="pt">PT (HLV)</option>
                    <option value="user">User (Hội viên)</option>
                </select>
            </div>

            {/* --- TABLE --- */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th className="p-4 border-b">Thông tin User</th>
                            <th className="p-4 border-b">Vai trò</th>
                            <th className="p-4 border-b">Trạng thái TK</th> {/* Cột Status riêng */}
                            <th className="p-4 border-b">Hồ sơ sức khỏe</th> {/* Cột Onboarded riêng */}
                            <th className="p-4 border-b text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700 text-sm divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center p-10 text-gray-400">Đang tải dữ liệu...</td></tr>
                        ) : users.map(user => (
                            <tr key={user.id} className="hover:bg-teal-50/30 transition">
                                <td className="p-4">
                                    <div className="font-bold text-gray-900">{user.full_name}</div>
                                    <div className="text-xs text-gray-500">{user.email}</div>
                                </td>
                                
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                                        user.role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                        user.role === 'pt' ? 'bg-orange-100 text-orange-700 border-orange-200' : 
                                        'bg-blue-50 text-blue-600 border-blue-100'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>

                                {/* CỘT TRẠNG THÁI TÀI KHOẢN (Status) */}
                                <td className="p-4">
                                    {/* Logic sửa đổi: Chỉ khi nào status là 'locked' thì mới hiện Đã khóa, còn lại (active, null, undefined) đều hiện Hoạt động */}
                                    {user.status === 'locked' ? (
                                        <span className="flex items-center gap-1 text-red-700 font-semibold bg-red-50 px-2 py-1 rounded-full w-fit">
                                            <span className="w-2 h-2 rounded-full bg-red-500"></span> Đã khóa
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-green-700 font-semibold bg-green-50 px-2 py-1 rounded-full w-fit">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span> Hoạt động
                                        </span>
                                    )}
                                </td>

                                {/* CỘT TRẠNG THÁI HỒ SƠ (Is Onboarded) */}
                                <td className="p-4">
                                    {user.is_onboarded ? (
                                        <div className="text-teal-700">
                                            <div className="font-bold flex items-center gap-1">
                                                ✅ Đã hoàn tất
                                            </div>
                                            {user.goal && <div className="text-xs text-gray-500 mt-1">Mục tiêu: {user.goal}</div>}
                                        </div>
                                    ) : (
                                        <div className="text-orange-600 italic flex items-center gap-1">
                                            ⚠️ Chưa cập nhật
                                        </div>
                                    )}
                                </td>

                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setSelectedUser(user)} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full" title="Xem chi tiết">👁️</button>
                                        <button onClick={() => handleOpenEdit(user)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="Sửa">✏️</button>
                                        <button onClick={() => handleDelete(user.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full" title="Xóa">🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL FORM --- */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="bg-teal-600 px-6 py-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">{editingId ? 'Chỉnh sửa User' : 'Tạo User Mới'}</h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-2xl">&times;</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-black">
                            <input type="text" required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                                value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="Họ và tên" />
                            
                            <input type="email" required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Email" />

                            {!editingId && (
                                <input type="password" required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Mật khẩu" />
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Vai trò</label>
                                    <select className="w-full border rounded-lg px-3 py-2 outline-none"
                                        value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                        <option value="user">User</option>
                                        <option value="pt">PT</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                
                                {/* 1. SELECT RIÊNG CHO TRẠNG THÁI TÀI KHOẢN */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Trạng thái TK</label>
                                    <select className="w-full border rounded-lg px-3 py-2 outline-none"
                                        value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                        <option value="active">✅ Hoạt động</option>
                                        <option value="locked">🔒 Khóa (Ban)</option>
                                    </select>
                                </div>
                            </div>

                            {/* 2. SELECT RIÊNG CHO HỒ SƠ SỨC KHỎE */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Hồ sơ sức khỏe (Onboarding)</label>
                                <select className="w-full border rounded-lg px-3 py-2 outline-none"
                                    value={formData.is_onboarded} onChange={e => setFormData({...formData, is_onboarded: parseInt(e.target.value)})}>
                                    <option value={1}>📋 Đã hoàn tất (User cũ)</option>
                                    <option value={0}>⏳ Chưa cập nhật (User mới)</option>
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2 text-gray-600 bg-gray-100 rounded-lg">Hủy</button>
                                <button type="submit" className="px-5 py-2 bg-teal-600 text-white rounded-lg font-bold">Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL VIEW DETAILS --- */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative">
                         {/* Header */}
                        <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-4 flex justify-between items-center text-white">
                             <h3 className="font-bold text-lg">Hồ sơ thành viên</h3>
                             <button onClick={() => setSelectedUser(null)} className="text-2xl">&times;</button>
                        </div>
                        
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600">
                                    {selectedUser.full_name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">{selectedUser.full_name}</h2>
                                    <p className="text-gray-500">{selectedUser.email}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded font-bold uppercase text-blue-600">{selectedUser.role}</span>
                                        {selectedUser.status === 'locked' && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-bold">LOCKED</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t pt-4 text-gray-700">
                                <div>
                                    <p className="text-sm text-gray-500">Giới tính</p>
                                    <p className="font-semibold">{selectedUser.gender || '---'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Tuổi</p>
                                    <p className="font-semibold">{selectedUser.age || '---'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Cân nặng</p>
                                    <p className="font-semibold">{selectedUser.weight_kg ? `${selectedUser.weight_kg} kg` : '---'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Chiều cao</p>
                                    <p className="font-semibold">{selectedUser.height_cm ? `${selectedUser.height_cm} cm` : '---'}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Mục tiêu</p>
                                    <p className="font-semibold text-teal-600">{selectedUser.goal || 'Chưa đặt mục tiêu'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManager;