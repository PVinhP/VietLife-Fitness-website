import React, { useState, useEffect } from 'react';

const UserManager = () => {
    // Fake data - Sau này thay bằng API fetch
    const [users, setUsers] = useState([
        { id: 1, name: 'Vinh Đẹp Trai', email: 'vinh@gmail.com', role: 'admin', status: 'active' },
        { id: 2, name: 'HLV Tuấn', email: 'tuanpt@gmail.com', role: 'pt', status: 'active' },
        { id: 3, name: 'User Mới', email: 'user@gmail.com', role: 'user', status: 'blocked' },
    ]);

    const handleDelete = (id: number) => {
        if(window.confirm('Xóa user này?')) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Quản lý Tài khoản</h2>
                <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 font-medium">
                    + Thêm mới
                </button>
            </div>

            {/* Search Filter */}
            <div className="flex gap-4 mb-6">
                <input type="text" placeholder="Tìm kiếm theo tên, email..." className="border rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-teal-500 outline-none" />
                <select className="border rounded-lg px-4 py-2 outline-none">
                    <option value="">Tất cả quyền</option>
                    <option value="admin">Admin</option>
                    <option value="pt">PT</option>
                    <option value="user">User</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                            <th className="p-4 border-b">ID</th>
                            <th className="p-4 border-b">Họ tên</th>
                            <th className="p-4 border-b">Email</th>
                            <th className="p-4 border-b">Vai trò</th>
                            <th className="p-4 border-b">Trạng thái</th>
                            <th className="p-4 border-b text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50 transition">
                                <td className="p-4 border-b font-mono text-sm">{user.id}</td>
                                <td className="p-4 border-b font-medium">{user.name}</td>
                                <td className="p-4 border-b">{user.email}</td>
                                <td className="p-4 border-b">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                        user.role === 'pt' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4 border-b">
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
                                        user.status === 'active' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-600' : 'bg-red-600'}`}></span>
                                        {user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                                    </span>
                                </td>
                                <td className="p-4 border-b text-right space-x-2">
                                    <button className="text-blue-600 hover:bg-blue-50 p-2 rounded">✏️</button>
                                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:bg-red-50 p-2 rounded">🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManager;