//file mới
const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
 
// API lấy toàn bộ dữ liệu từ bảng blogs
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM blogs ORDER BY ngay_tao DESC");
    res.json(rows); // Trả dữ liệu về dưới dạng JSON
  } catch (error) {
    console.error("Lỗi truy vấn:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// API tìm kiếm blog theo tiêu đề
router.get("/search", async (req, res) => {
  const { title } = req.query;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM blogs WHERE tieu_de LIKE ? ORDER BY ngay_tao DESC",
      [`%${title}%`]
    );
    res.json(rows);
  } catch (error) {
    console.error("Lỗi truy vấn:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// API lấy blog theo danh mục
router.get("/category/:category", async (req, res) => {
  const { category } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM blogs WHERE danh_muc = ? ORDER BY ngay_tao DESC",
      [category]
    );
    res.json(rows);
  } catch (error) {
    console.error("Lỗi truy vấn:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// API lấy blog theo ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM blogs WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy blog" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Lỗi truy vấn:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// API tạo blog mới - ĐÃ SỬA LỖI
router.post("/", async (req, res) => {
  const { tieu_de, tom_tat, noi_dung, danh_muc } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO blogs (tieu_de, tom_tat, noi_dung, danh_muc, ngay_tao) VALUES (?, ?, ?, ?, NOW())",
      [tieu_de, tom_tat, noi_dung, danh_muc]
    );
    res.status(201).json({ 
      id: result.insertId, 
      message: "Tạo blog thành công",
      blog: { id: result.insertId, tieu_de, tom_tat, noi_dung, danh_muc}
    });
  } catch (error) {
    console.error("Lỗi truy vấn:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// API cập nhật blog - ĐÃ SỬA THÊM hinh_anh
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { tieu_de, tom_tat, noi_dung, danh_muc, hinh_anh } = req.body;
  try {
    const [result] = await pool.query(
      "UPDATE blogs SET tieu_de = ?, tom_tat = ?, noi_dung = ?, danh_muc = ?, hinh_anh = ? WHERE id = ?",
      [tieu_de, tom_tat, noi_dung, danh_muc, hinh_anh, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy blog để cập nhật" });
    }
    
    res.json({ message: "Cập nhật blog thành công" });
  } catch (error) {
    console.error("Lỗi truy vấn:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// API xóa blog
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM blogs WHERE id = ?", [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy blog để xóa" });
    }
    
    res.json({ message: "Xóa blog thành công" });
  } catch (error) {
    console.error("Lỗi truy vấn:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// API lấy danh sách danh mục
router.get("/categories/all", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT DISTINCT danh_muc FROM blogs WHERE danh_muc IS NOT NULL ORDER BY danh_muc"
    );
    const categories = rows.map(row => row.danh_muc);
    res.json(categories);
  } catch (error) {
    console.error("Lỗi truy vấn:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = { blogRouter: router };