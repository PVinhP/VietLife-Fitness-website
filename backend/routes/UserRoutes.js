// File: routes/UserRoutes.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");
const UserController = require("../controllers/UserController");
// Giả sử bạn có một middleware để xác thực token
// Nếu chưa có, bạn cần tạo file này. Nó sẽ giải mã token và lấy user ID.
const authMiddleware = require('../middlewares/AuthMiddleware'); 
const { checkRole } = require('../middlewares/checkRole');
const UserRouter = express.Router();

// --- ROUTE ĐĂNG KÝ ---
// Trả về is_onboarded: false cho người dùng mới
UserRouter.post("/register", async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password) {
      return res.status(400).send({ msg: "Email và mật khẩu là bắt buộc" });
    }

    const [existingUsers] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUsers.length > 0) {
      return res.status(400).send({ msg: "Email đã được sử dụng" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [result] = await pool.query(
      `INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)`,
      [email, hashedPassword, full_name || null, 'user']
    );

    const [newUserRow] = await pool.query("SELECT * FROM users WHERE id = ?", [
      result.insertId,
    ]);
    const newUser = newUserRow[0];

    const tokenPayload = { userId: newUser.id, email: newUser.email };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).send({
      msg: "Đăng ký thành công",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        is_onboarded: newUser.is_onboarded, // <-- ĐÃ THÊM: Sẽ trả về false
      },
    });
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error);
    res.status(500).send({ msg: "Lỗi server khi đăng ký" });
  }
});


// --- ROUTE ĐĂNG NHẬP ---
// Trả về trạng thái is_onboarded của người dùng
UserRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).send({ msg: "Email và mật khẩu là bắt buộc" });
    }

    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(401).send({ msg: "Email hoặc mật khẩu không đúng" });
    }

    const user = users[0];

    // --- [THÊM MỚI] KIỂM TRA TRẠNG THÁI KHÓA ---
    if (user.status === 'locked') {
        return res.status(403).json({ 
            msg: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin để biết thêm chi tiết." 
        });
    }
    // -------------------------------------------

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ msg: "Email hoặc mật khẩu không đúng" });
    }

    const payload = { userId: user.id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).send({
      msg: "Đăng nhập thành công",
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        is_onboarded: user.is_onboarded,
        role: user.role, // <-- ĐÃ THÊM: Trả về true hoặc false
      },
    });
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    res.status(500).send({ msg: "Lỗi server khi đăng nhập" });
  }
});


// --- ROUTE MỚI: HOÀN THÀNH ONBOARDING ---
// Route này sẽ được gọi từ trang OnboardingPage.tsx
// Cần middleware xác thực để biết user nào đang thực hiện
UserRouter.post("/complete-onboarding", /* authMiddleware, */ async (req, res) => {
    try {
        // LƯU Ý: Bạn cần một middleware xác thực (ví dụ: authMiddleware) để lấy userId
        // Middleware sẽ giải mã token và gán thông tin user vào req, ví dụ: req.user
        // Tạm thời, chúng ta sẽ hardcode để bạn dễ hình dung, nhưng bạn phải thay thế nó.
        
        // GIẢ SỬ middleware đã chạy và trả về req.user
        // const userId = req.user.userId;

        // ---- PHẦN GIẢ LẬP ĐỂ TEST ----
        // Lấy token từ header, giải mã để lấy user ID
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).send({ msg: 'Yêu cầu token xác thực' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        // ---- KẾT THÚC PHẦN GIẢ LẬP ----

        // (Tùy chọn) Lưu dữ liệu từ form onboarding vào bảng health_profiles
        // const { age, gender, ... } = req.body;
        // await pool.query('INSERT INTO health_profiles (user_id, age, gender, ...) VALUES (?, ?, ?, ...)', [userId, age, gender, ...]);

        // Cập nhật trạng thái is_onboarded thành TRUE
        await pool.query(
            "UPDATE users SET is_onboarded = TRUE WHERE id = ?",
            [userId]
        );

        res.status(200).send({ msg: "Hoàn thành onboarding thành công." });

    } catch (error) {
        console.error("Lỗi khi hoàn thành onboarding:", error);
        res.status(500).send({ msg: "Lỗi server" });
    }
});

// ==========================================
// CÁC ROUTE MỚI (QUÊN MẬT KHẨU - MVC)
// ==========================================

// 1. Gửi OTP qua Email
UserRouter.post("/forgot-password", UserController.forgotPassword);

// 2. Xác nhận OTP và đặt mật khẩu mới
UserRouter.post("/verify-forgot-password", UserController.verifyForgotPassword);

// --- KHU VỰC ADMIN (Cần đăng nhập & Quyền Admin) ---
// GET /api/users
UserRouter.get(
    '/', 
    authMiddleware,          // 1. Phải đăng nhập
    checkRole(['admin']),    // 2. Phải là Admin
    UserController.getAllUsers
);

// DELETE /api/users/:id
UserRouter.delete(
    '/:id', 
    authMiddleware, 
    checkRole(['admin']), 
    UserController.deleteUser
);
// POST /api/users/create (Tạo mới User - MỚI)
UserRouter.post('/create', authMiddleware, checkRole(['admin']), UserController.createUser);

// PUT /api/users/:id (Cập nhật User - MỚI)
UserRouter.put('/:id', authMiddleware, checkRole(['admin']), UserController.updateUser);

module.exports = { UserRouter };