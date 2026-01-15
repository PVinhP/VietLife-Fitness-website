// src/services/trackingService.js
import axios from 'axios';

// Giả sử bạn đã cấu hình base URL và interceptor để tự động gắn Token
// Nếu chưa, hãy thêm header Authorization thủ công
const API_URL = 'https://vietlife-fitness-website-host.onrender.com/api/tracking'; 

export const getTrackingHistory = async (token) => {
  const response = await axios.get(`${API_URL}/history`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const addTrackingMetric = async (data, token) => {
  const response = await axios.post(`${API_URL}/add`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};