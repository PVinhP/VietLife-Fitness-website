import axios from 'axios';

// Đổi port nếu backend của bạn khác (3000 hoặc 8080)
const API_URL = 'http://localhost:8080/api/checkin'; 

// Lấy lịch sử ảnh
export const getCheckInPhotos = async (token) => {
  const response = await axios.get(`${API_URL}/history`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Upload ảnh mới
export const uploadCheckInPhotos = async (formData, token) => {
  // Lưu ý: Khi gửi FormData, axios tự động set Content-Type là multipart/form-data
  const response = await axios.post(`${API_URL}/upload`, formData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};