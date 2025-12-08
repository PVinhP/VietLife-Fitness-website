// backend/routes/consultantRoutes.js
const express = require('express');
const router = express.Router();
const ConsultantController = require('../controllers/ConsultantController');

// Giả sử bạn có middleware checkAuth để xác thực user
// const { checkAuth, checkRole } = require('../middleware/authMiddleware');

// 1. User gửi yêu cầu mới
// POST /api/consultant
router.post('/', ConsultantController.createRequest);

// 2. Lấy danh sách yêu cầu
// GET /api/consultant?userId=...
router.get('/', ConsultantController.getRequests);

// 3. Xem chi tiết (nếu cần)
// GET /api/consultant/:id
router.get('/:id', ConsultantController.getRequestDetail);

// 4. PT trả lời (Cần quyền Admin/PT)
// PUT /api/consultant/:id/reply
router.put('/:id/reply', ConsultantController.replyRequest);

module.exports = router;