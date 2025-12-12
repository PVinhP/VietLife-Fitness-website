// File: routes/ExerciseRoute.js
const express = require("express");
const router = express.Router();
const exerciseController = require("../controllers/ExerciseController");
const authMiddleware = require("../middlewares/AuthMiddleware");
const { checkRole } = require("../middlewares/checkRole");

// --- PUBLIC ROUTES (Ai cũng xem được) ---
router.get("/", exerciseController.getAllExercises);
router.get("/:id", exerciseController.getExerciseById); 

// --- ADMIN ROUTES (Cần đăng nhập & Quyền Admin/PT) ---
router.post("/", authMiddleware, checkRole(['admin', 'pt']), exerciseController.createExercise);
router.put("/:id", authMiddleware, checkRole(['admin', 'pt']), exerciseController.updateExercise);
router.delete("/:id", authMiddleware, checkRole(['admin', 'pt']), exerciseController.deleteExercise);

// Route tìm kiếm cũ (đã được tích hợp vào getAllExercises với query param ?search=...)
// Nhưng nếu frontend cũ đang gọi /search riêng biệt thì có thể giữ lại hoặc redirect về getAllExercises
router.get("/search", exerciseController.getAllExercises); 

module.exports = { exerciseRouter: router };