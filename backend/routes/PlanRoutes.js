const express = require("express");
const { getAllPlans, getPlanDetail } = require('../controllers/PlanController');

const planRouter = express.Router();

planRouter.get("/", getAllPlans);       // API: /api/plans
planRouter.get("/:id", getPlanDetail);  // API: /api/plans/1

module.exports = { planRouter };