// backend/routes/ProgressRoutes.js

const express = require("express");
const { toggleProgress, getDayProgress } = require('../controllers/ProgressController');
const { AuthMiddleware } = require("../middlewares/AuthMiddleware");

const progressRouter = express.Router();

// Route để check-in hoặc bỏ check bài tập
progressRouter.post("/toggle", AuthMiddleware, toggleProgress);

// Route để lấy danh sách các bài đã hoàn thành trong ngày
progressRouter.get("/check-status", AuthMiddleware, getDayProgress);

module.exports = { progressRouter };