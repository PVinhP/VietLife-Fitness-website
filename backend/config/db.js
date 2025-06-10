const mysql = require('mysql2/promise');
require('dotenv').config();

// Tạo pool connection để quản lý kết nối hiệu quả
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mydb.crgyamum0k6a.ap-southeast-1.rds.amazonaws.com',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'Vinh2003#',
  database: process.env.DB_NAME || 'workout',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
  // host: process.env.DB_HOST || '127.0.0.1',
  // user: process.env.DB_USER || 'root',
  // password: process.env.DB_PASSWORD || '1234',
  // database: process.env.DB_NAME || 'workout',
// Kiểm tra kết nối
const connectToDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Kết nối thành công đến MySQL');
    connection.release(); // Giải phóng kết nối
  } catch (error) {
    console.error('Lỗi kết nối đến MySQL:', error);
  }
};

// Gọi hàm khi khởi động ứng dụng
connectToDatabase();

module.exports = {
  pool,
  connectToDatabase
};
