// backend/routes/workoutRoutes.js
const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
// Import middleware xác thực nếu cần (VD: authMiddleware)
// const authMiddleware = require('../middlewares/authMiddleware');

// @route   POST /api/workouts
// @desc    Thêm bài tập mới (Chấp nhận nhiều bài tập 1 ngày)
router.post('/', workoutController.addWorkout);
router.get('/stats', workoutController.getStats);
// @route   GET /api/workouts
// @desc    Lấy danh sách bài tập theo ngày (kèm tổng calo)
// @params  ?user_id=1&date=2023-10-20
router.get('/', workoutController.getWorkoutsByDate);

// @route   DELETE /api/workouts/:id
// @desc    Xóa một bài tập cụ thể
router.delete('/:id', workoutController.deleteWorkout);

module.exports = router;