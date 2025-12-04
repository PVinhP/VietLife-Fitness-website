const express = require('express');
const { generatePlan, getCurrentPlan } = require('../controllers/AIPlanController');
const { AuthMiddleware } = require('../middlewares/AuthMiddleware');

const aiPlanRouter = express.Router(); // Đặt tên biến rõ ràng

aiPlanRouter.get('/current', AuthMiddleware, getCurrentPlan);
aiPlanRouter.post('/generate', AuthMiddleware, generatePlan);

// QUAN TRỌNG: Export dạng Object có tên (Named Export)
module.exports = { aiPlanRouter };