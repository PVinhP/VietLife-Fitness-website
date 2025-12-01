// trackingRoutes.js
const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');
const { AuthMiddleware } = require("../middlewares/AuthMiddleware"); // Middleware kiểm tra đăng nhập của bạn

router.post('/add', AuthMiddleware, trackingController.addMetric);


router.get('/history', AuthMiddleware, trackingController.getHistory);

module.exports = {trackingRouter: router};