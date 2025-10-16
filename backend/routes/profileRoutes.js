const express = require('express');
const router = express.Router();

// Import controller và middleware
const { createHealthProfile } = require('../controllers/profileController');
const authMiddleware = require('../middlewares/AuthMiddleware');

// @route   POST /api/profile
// @desc    Tạo hồ sơ sức khỏe
// @access  Private
// Khi có request tới '/', nó sẽ chạy qua authMiddleware trước, sau đó tới createHealthProfile
router.post('/', authMiddleware, createHealthProfile);
//router.post('/', createHealthProfile);
module.exports = router;
