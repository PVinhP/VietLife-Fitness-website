// File: routes/UserRoutes.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db"); // Import pool from db.js

const UserRouter = express.Router();

// --- ROUTE ĐĂNG KÝ ĐÃ SỬA LẠI ---
UserRouter.post("/register", async (req, res) => {
  try {
    // 1. CHỈ LẤY NHỮNG DỮ LIỆU CÓ TỪ FRONTEND
    const { email, password, full_name } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!email || !password) {
      return res.status(400).send({ msg: "Email và mật khẩu là bắt buộc" });
    }

    // Kiểm tra xem email đã tồn tại chưa
    const [existingUsers] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUsers.length > 0) {
      return res.status(400).send({ msg: "Email đã được sử dụng" });
    }

    // Mã hóa mật khẩu
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 2. CÂU LỆNH INSERT ĐÃ ĐƯỢC CẬP NHẬT
    // Chỉ chèn các cột tương ứng với dữ liệu nhận được
    const [result] = await pool.query(
      `INSERT INTO users (email, password, full_name) VALUES (?, ?, ?)`,
      [email, hashedPassword, full_name || null] // 3. DỮ LIỆU TRUYỀN VÀO TƯƠNG ỨNG
    );

    // Lấy thông tin người dùng vừa tạo để trả về
    const [newUserRow] = await pool.query("SELECT * FROM users WHERE id = ?", [
      result.insertId,
    ]);
    const newUser = newUserRow[0];

    // Tạo JWT token
    const tokenPayload = {
      userId: newUser.id,
      email: newUser.email,
    };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Trả về response thành công
    res.status(201).send({
      msg: "Đăng ký thành công",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        // Các trường khác sẽ là null vì chúng ta chưa thêm vào
        phone: newUser.phone,
        gender: newUser.gender,
        birth_date: newUser.birth_date,
        height_cm: newUser.height_cm,
        weight_kg: newUser.weight_kg,
        created_at: newUser.created_at,
        updated_at: newUser.updated_at,
      },
    });
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error);
    res.status(500).send({ msg: "Lỗi server khi đăng ký" });
  }
});


// --- ROUTE ĐĂNG NHẬP (GIỮ NGUYÊN) ---
UserRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({ msg: "Email và mật khẩu là bắt buộc" });
    }

    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0) {
      return res.status(401).send({ msg: "Email hoặc mật khẩu không đúng" });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ msg: "Email hoặc mật khẩu không đúng" });
    }

    const payload = {
      userId: user.id,
      email: user.email,
      username: user.full_name || user.email,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).send({
      msg: "Đăng nhập thành công",
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        gender: user.gender,
        birth_date: user.birth_date,
        height_cm: user.height_cm,
        weight_kg: user.weight_kg,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    res.status(500).send({ msg: "Lỗi server khi đăng nhập" });
  }
});

module.exports = { UserRouter };