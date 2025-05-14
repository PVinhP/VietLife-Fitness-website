//file mới
const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");

// API lấy toàn bộ dữ liệu từ bảng nutrition_data
// router.get("/", async (req, res) => {
//   try {
//     const [rows] = await pool.query("SELECT * FROM nutrition_data");
//     res.json(rows); // Trả dữ liệu về dưới dạng JSON
//   } catch (error) {
//     console.error("Lỗi truy vấn:", error);
//     res.status(500).json({ message: "Lỗi server" });
//   }
// });

// API tìm kiếm thực phẩm theo tên
router.get("/search", async (req, res) => {
  const { name } = req.query;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM nutrition_data WHERE food_name LIKE ?",[`%${name}%`]
    );
    res.json(rows);
  } catch (error) {
    console.error("Lỗi truy vấn:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = { nutritionRouter: router };

