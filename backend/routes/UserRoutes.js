// File: routes/UserRoutes.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db"); // Import pool from db.js

const UserRouter = express.Router();

// Đăng ký người dùng
UserRouter.post("/register", async (req, res) => {
  try {
    const {
      email,
      password,
      full_name,
      phone,
      gender,
      birth_date,
      height_cm,
      weight_kg,
    } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!email || !password) {
      return res
        .status(400)
        .send({ msg: "Email và mật khẩu là bắt buộc" });
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

    // Chèn người dùng mới vào cơ sở dữ liệu
    const [result] = await pool.query(
      `INSERT INTO users (email, password, full_name, phone, gender, birth_date, height_cm, weight_kg)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        email,
        hashedPassword,
        full_name || null,
        phone || null,
        gender || null,
        birth_date || null,
        height_cm || null,
        weight_kg || null,
      ]
    );

    // Tạo JWT token
    const user = {
      userId: result.insertId,
      email,
    };
    const token = jwt.sign(user, "VietLife", { expiresIn: "1h" });

    // Lấy thông tin người dùng vừa tạo để trả về, bao gồm created_at và updated_at
    const [newUser] = await pool.query("SELECT * FROM users WHERE id = ?", [
      result.insertId,
    ]);

    res.status(201).send({
      msg: "Đăng ký thành công",
      token,
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        full_name: newUser[0].full_name,
        phone: newUser[0].phone,
        gender: newUser[0].gender,
        birth_date: newUser[0].birth_date,
        height_cm: newUser[0].height_cm,
        weight_kg: newUser[0].weight_kg,
        created_at: newUser[0].created_at,
        updated_at: newUser[0].updated_at,
      },
    });
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error);
    res.status(500).send({ msg: "Lỗi server khi đăng ký" });
  }
});

// Đăng nhập người dùng
UserRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!email || !password) {
      return res
        .status(400)
        .send({ msg: "Email và mật khẩu là bắt buộc" });
    }

    // Tìm người dùng theo email
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0) {
      return res.status(401).send({ msg: "Email hoặc mật khẩu không đúng" });
    }

    const user = users[0];

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ msg: "Email hoặc mật khẩu không đúng" });
    }

    // Tạo JWT token
    const payload = {
      userId: user.id,
      email: user.email,
      username: user.full_name || user.email, // Sử dụng full_name nếu có, nếu không dùng email
    };
    const token = jwt.sign(payload, "VietLife", { expiresIn: "1h" });

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