// File: routes/DashboardRoutes.js
const express = require("express");
const dashboardController = require("../controllers/DashboardController");
const authMiddleware = require("../middlewares/AuthMiddleware");
const { checkRole } = require("../middlewares/checkRole");

const dashboardRouter = express.Router();

// Chỉ Admin và PT mới xem được Dashboard
dashboardRouter.get("/stats", authMiddleware, checkRole(['admin', 'pt']), dashboardController.getDashboardStats);

module.exports = { dashboardRouter };