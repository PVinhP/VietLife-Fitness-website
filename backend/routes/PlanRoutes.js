// routes/PlanRoutes.js
const express = require("express");
const planController = require('../controllers/PlanController');
const authMiddleware = require("../middlewares/AuthMiddleware");
const { checkRole } = require("../middlewares/checkRole");

const planRouter = express.Router();

// Public routes (Ai cũng xem được danh sách và chi tiết)
planRouter.get("/", planController.getAllPlans);       
planRouter.get("/:id", planController.getPlanDetail); 

// Protected routes (Chỉ PT/Admin mới được tạo/sửa/xóa)
planRouter.post("/", authMiddleware, checkRole(['admin', 'pt']), planController.createPlan);
planRouter.put("/:id", authMiddleware, checkRole(['admin', 'pt']), planController.updatePlan);
planRouter.delete("/:id", authMiddleware, checkRole(['admin', 'pt']), planController.deletePlan);

module.exports = { planRouter };