// File: routes/FoodRoutes.js
const express = require("express");
const FoodController = require("../controllers/FoodController");
const authMiddleware = require("../middlewares/AuthMiddleware");
const { checkRole } = require("../middlewares/checkRole");

const FoodRouter = express.Router();

// Tất cả các route này đều yêu cầu đăng nhập và quyền Admin (hoặc PT nếu bạn muốn PT thêm món ăn)
FoodRouter.get("/", authMiddleware, FoodController.getAllFoods);
FoodRouter.post("/create", authMiddleware, checkRole(['admin']), FoodController.createFood);
FoodRouter.put("/:id", authMiddleware, checkRole(['admin']), FoodController.updateFood);
FoodRouter.delete("/:id", authMiddleware, checkRole(['admin']), FoodController.deleteFood);
FoodRouter.get("/groups", authMiddleware, FoodController.getFoodGroups);

module.exports = { FoodRouter };