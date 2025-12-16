const express = require('express');
const { generatePlan, getCurrentPlan, generateNextWeek, regenerateMeal } = require('../controllers/AIPlanController');
const { AuthMiddleware } = require('../middlewares/AuthMiddleware');

const aiPlanRouter = express.Router(); // Đặt tên biến rõ ràng

aiPlanRouter.get('/current', AuthMiddleware, getCurrentPlan);
aiPlanRouter.post('/generate', AuthMiddleware, generatePlan);
aiPlanRouter.post('/next-week', AuthMiddleware, generateNextWeek);
aiPlanRouter.post('/regenerate-meal', AuthMiddleware, regenerateMeal);
// QUAN TRỌNG: Export dạng Object có tên (Named Export)
module.exports = { aiPlanRouter };