// File: routes/WaterRoutes.js
const express = require("express");
const waterController = require("../controllers/WaterController");
const authMiddleware = require("../middlewares/AuthMiddleware");

const router = express.Router();

// 1. Lấy thông tin: GET /api/water?date=2025-12-19
router.get("/", authMiddleware, waterController.getDailyWater);

// 2. Cập nhật: POST /api/water/log
// Body: { "date": "2025-12-19", "amount": 1 }
router.post("/log", authMiddleware, waterController.logWater);

module.exports = router;