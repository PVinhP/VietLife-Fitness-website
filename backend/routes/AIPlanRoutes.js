const express = require('express');
const { generatePlan } = require('../controllers/AIPlanController');
const { AuthMiddleware } = require('../middlewares/AuthMiddleware');

const aiPlanRouter = express.Router(); // Đặt tên biến rõ ràng

aiPlanRouter.post('/generate', AuthMiddleware, generatePlan);

// QUAN TRỌNG: Export dạng Object có tên (Named Export)
module.exports = { aiPlanRouter };