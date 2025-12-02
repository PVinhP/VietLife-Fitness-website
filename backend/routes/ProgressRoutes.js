// backend/routes/ProgressRoutes.js

const express = require("express");
const { toggleProgress, getDayProgress, updateNote, getExerciseNoteHistory } = require('../controllers/ProgressController');
const { AuthMiddleware } = require("../middlewares/AuthMiddleware");
const { getHistory } = require('../controllers/ProgressController');
const progressRouter = express.Router();

// Route để check-in hoặc bỏ check bài tập

progressRouter.post("/toggle", AuthMiddleware, toggleProgress);
progressRouter.get('/note-history', AuthMiddleware, getExerciseNoteHistory);
// Route để lấy danh sách các bài đã hoàn thành trong ngày
progressRouter.get("/check-status", AuthMiddleware, getDayProgress);
progressRouter.post("/note", AuthMiddleware, updateNote);
progressRouter.get("/history", AuthMiddleware, getHistory);
module.exports = { progressRouter };