const express = require("express");
const { getAllPlans, getPlanDetail, createPlan, updatePlan } = require('../controllers/PlanController');
const { AuthMiddleware } = require("../middlewares/AuthMiddleware");

const planRouter = express.Router();

// Public routes (Ai cũng xem được)
planRouter.get("/", getAllPlans);       
planRouter.get("/:id", getPlanDetail); 

// Protected routes (Chỉ PT/Admin mới được tạo)
// POST http://localhost:8080/api/plans
planRouter.post("/", AuthMiddleware, createPlan);
// PUT /api/plans/:id
planRouter.put("/:id", AuthMiddleware, updatePlan);

module.exports = { planRouter };