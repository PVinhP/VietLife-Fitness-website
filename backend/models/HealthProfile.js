// backend/models/HealthProfile.js

const { pool } = require('../config/db'); // Import kết nối database

// Hàm tạo một health profile mới
const HealthProfile = {
  create: async (profileData) => {
    const {
      user_id,
      age,
      gender,
      weight_kg,
      height_cm,
      medical_history,
      activity_level,
      dietary_preferences,
      sleep_quality_rating,
    } = profileData;

    // Câu lệnh SQL để chèn dữ liệu
    const sql = `
      INSERT INTO health_profiles 
      (user_id, age, gender, weight_kg, height_cm, medical_history, activity_level, dietary_preferences, sleep_quality_rating) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Thực thi câu lệnh với mảng giá trị để chống SQL Injection
    const [result] = await pool.execute(sql, [
      user_id,
      age,
      gender,
      weight_kg,
      height_cm,
      medical_history || null, // Nếu không có thì chèn NULL
      activity_level,
      dietary_preferences || null,
      sleep_quality_rating,
    ]);

    return { id: result.insertId, ...profileData };
  },

  // (Tùy chọn) Hàm tìm profile bằng user_id để kiểm tra tồn tại
  findByUserId: async (userId) => {
    const sql = 'SELECT * FROM health_profiles WHERE user_id = ?';
    const [rows] = await pool.execute(sql, [userId]);
    return rows[0];
  }
};

module.exports = HealthProfile;
