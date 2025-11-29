// backend/middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');

// Middleware để xác thực JWT token
const AuthMiddleware = (req, res, next) => {
  // Lấy token từ header 'Authorization'
  const authHeader = req.headers.authorization;

  // Kiểm tra xem header và token có tồn tại không
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'Không có token, quyền truy cập bị từ chối' });
  }

  try {
    // Tách token từ chuỗi "Bearer <token>"
    const token = authHeader.split(' ')[1];

    // Xác thực token với secret key của bạn
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "VietLife");

    // Gắn thông tin user đã giải mã vào đối tượng request
    req.user = { id: decoded.userId };

    next(); // Chuyển sang middleware hoặc controller tiếp theo
  } catch (error) {
    console.error('Lỗi xác thực token:', error.message);
    res.status(401).json({ msg: 'Token không hợp lệ' });
  }
};

// Export cả 2 cách để tương thích
module.exports = AuthMiddleware; // Export mặc định
module.exports.AuthMiddleware = AuthMiddleware; // Export named