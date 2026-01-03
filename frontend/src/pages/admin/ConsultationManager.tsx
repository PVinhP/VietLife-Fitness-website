// src/pages/Admin/ConsultationManager.tsx
import React from 'react';
import ConsultationTab from '../../components/Chatbot/ConsultationTab';

const ConsultationManager = () => {
  // Lấy thông tin Admin từ localStorage
  // Lưu ý: Đảm bảo user này có quyền admin/pt trong Database
  const adminUser = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Quản lý Tư vấn & Giải đáp</h1>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[600px] border border-gray-200">
        {/* Gọi component Chat nhưng với vai trò là ADMIN */}
        <ConsultationTab 
          userId={adminUser.id} 
          token={token} 
          role="admin" // <--- QUAN TRỌNG: Kích hoạt chế độ Admin
        />
      </div>
    </div>
  );
};

export default ConsultationManager;