import React from 'react';

const StatCard = ({ title, value, icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <h4 className="text-2xl font-bold text-gray-800">{value}</h4>
        </div>
    </div>
);

const AdminDashboard = () => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Tổng quan hệ thống</h2>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Tổng người dùng" value="1,234" icon="👥" color="bg-blue-100 text-blue-600" />
                <StatCard title="Bài tập" value="450" icon="💪" color="bg-green-100 text-green-600" />
                <StatCard title="Giáo án" value="89" icon="📋" color="bg-purple-100 text-purple-600" />
                <StatCard title="Bài học" value="120" icon="📚" color="bg-orange-100 text-orange-600" />
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-gray-800 mb-4">Hoạt động gần đây</h3>
                <div className="space-y-4">
                    {[1,2,3].map(i => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                                <span className="text-gray-600">Nguyễn Văn A vừa đăng ký tài khoản mới</span>
                            </div>
                            <span className="text-xs text-gray-400">2 phút trước</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;