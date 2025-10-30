// server/routes/guideRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/AuthMiddleware');
const { getGuideByMuscleGroup } = require('../controllers/guideController');

// @route   GET /api/guides/:groupName
// @desc    Lấy nội dung hướng dẫn cho một nhóm cơ
// @access  Private
router.get('/:groupName', authMiddleware, getGuideByMuscleGroup);

module.exports = router;