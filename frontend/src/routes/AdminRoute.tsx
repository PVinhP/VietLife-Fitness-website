import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Giả sử bạn lưu thông tin user trong localStorage hoặc Context
const AdminRoute = () => {
  const userString = localStorage.getItem('user'); // Hoặc lấy từ Redux/Context
  const user = userString ? JSON.parse(userString) : null;

  // Kiểm tra: Phải đăng nhập VÀ có role là admin
  // Lưu ý: Tùy vào database bạn đặt là 'admin', 'ADMIN' hay số 1
  if (user && user.role === 'admin') {
    return <Outlet />; // Cho phép đi tiếp vào các route con
  }

  // Nếu không phải admin, đá về trang chủ hoặc trang báo lỗi 403
  return <Navigate to="/" replace />;
};

export default AdminRoute;