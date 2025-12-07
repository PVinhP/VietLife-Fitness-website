// backend/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/ChatController');

// Middleware xác thực (Giả sử bạn có middleware checkAuth để lấy user.id)
// const checkAuth = require('../middleware/authMiddleware'); 
// Nếu chưa có middleware, bạn có thể bỏ qua tham số thứ 2, nhưng nhớ truyền userId từ body ở frontend

// Định nghĩa các route
// POST: /api/chat/send -> Gửi tin nhắn mới
router.post('/send', chatController.sendMessage); // Thêm checkAuth vào giữa nếu cần

// GET: /api/chat/history -> Lấy lịch sử cũ
// Nếu dùng middleware: router.get('/history', checkAuth, chatController.getChatHistory);
// Nếu test nhanh không middleware, truyền userId qua params
router.get('/history/:userId', chatController.getChatHistory);

module.exports = router;