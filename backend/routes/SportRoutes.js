const express = require("express");
const sportController = require("../controllers/sportController"); // Dấu hai chấm (..) để nhảy ra ngoài thư mục cha
const authMiddleware = require("../middlewares/AuthMiddleware");
const { checkRole } = require("../middlewares/checkRole");
const sportRouter = express.Router();

// Public
sportRouter.get("/", sportController.getAllSports);       // API: /api/sports
sportRouter.get("/:slug", sportController.getSportDetail); // API: /api/sports/bong-da
sportRouter.get("/:id/detail", authMiddleware, sportController.getSportDetailAdmin); // API lấy chi tiết cho Admin

// Admin Only
// 1. Sport CRUD
sportRouter.post("/", authMiddleware, checkRole(['admin', 'pt']), sportController.createSport);
sportRouter.put("/:id", authMiddleware, checkRole(['admin', 'pt']), sportController.updateSport);
sportRouter.delete("/:id", authMiddleware, checkRole(['admin', 'pt']), sportController.deleteSport);

// 2. Skill Management
sportRouter.post("/skill", authMiddleware, checkRole(['admin', 'pt']), sportController.addSkill);
sportRouter.delete("/skill/:id", authMiddleware, checkRole(['admin', 'pt']), sportController.deleteSkill);

// 3. Exercise Linking
sportRouter.post("/exercise", authMiddleware, checkRole(['admin', 'pt']), sportController.addSportExercise);
sportRouter.delete("/exercise/:sport_id/:exercise_id", authMiddleware, checkRole(['admin', 'pt']), sportController.removeSportExercise);


module.exports = { sportRouter };