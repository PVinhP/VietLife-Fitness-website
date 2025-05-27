//file mới
const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
 
// API lấy toàn bộ dữ liệu từ bảng blogs
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM cardio ORDER BY ngay_tao ASC");
    res.json(rows); // Trả dữ liệu về dưới dạng JSON
  } catch (error) {
    console.error("Lỗi truy vấn:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});
module.exports = { cardioRouter: router };