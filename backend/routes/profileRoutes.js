const express = require('express');
const router = express.Router();

// Import controller và middleware
const { 
    createOrUpdateHealthProfile, // Đổi tên 1 chút cho rõ
    getCurrentProfile,  
    updateTrainingPreferences
} = require('../controllers/profileController');
const authMiddleware = require('../middlewares/AuthMiddleware');



    // @route   GET /api/profile/me
// @desc    Lấy thông tin profile (user + health) của user đang đăng nhập
// @access  Private
// (Frontend cần cái này để tải dữ liệu)
router.get('/me', authMiddleware, getCurrentProfile);
// Route MỚI: Cập nhật sở thích tập luyện
router.put('/preferences', authMiddleware, updateTrainingPreferences);
// @route   POST /api/profile
// @desc    Tạo mới hoặc cập nhật (UPSERT) health profile
// @access  Private
// (Frontend dùng cái này khi nhấn "Lưu thay đổi" ở HealthProfileTab)
router.post('/', authMiddleware, createOrUpdateHealthProfile);

module.exports = router;