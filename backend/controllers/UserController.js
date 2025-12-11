// File: controllers/UserController.js
const { pool } = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const SendMailForgotPassword = require("../utils/mailForgotPassword");

// --- 1. GỬI OTP ---
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Kiểm tra email tồn tại
        const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (users.length === 0) {
            return res.status(404).json({ msg: "Email không tồn tại trong hệ thống" });
        }

        // Tạo OTP (6 số)
        const otp = otpGenerator.generate(6, {
            digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false
        });

        // Xóa OTP cũ của email này (nếu có) để tránh rác DB
        await pool.query("DELETE FROM otps WHERE email = ?", [email]);

        // Lưu OTP mới vào MySQL (Hết hạn sau 5 phút)
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await pool.query(
            "INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, ?)",
            [email, otp, expiresAt]
        );

        // Tạo token tạm để verify (Cookie) - Giống mẫu
        const tokenForgotPassword = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '5m' });
        
        // Gửi Mail
        await SendMailForgotPassword(email, otp);

        // Trả về Cookie và response
        res.cookie('tokenForgotPassword', tokenForgotPassword, {
            httpOnly: true, secure: false, maxAge: 5 * 60 * 1000 // 5 phút
        });

        return res.status(200).json({ msg: "Mã OTP đã được gửi đến email của bạn." });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        return res.status(500).json({ msg: "Lỗi server khi gửi mail." });
    }
};

// --- 2. XÁC NHẬN OTP & ĐỔI MẬT KHẨU ---
const verifyForgotPassword = async (req, res) => {
    try {
        const { otp, password } = req.body;
        // Lấy token từ header (nếu frontend gửi Bearer) hoặc Cookie (nếu frontend tự động gửi cookie)
        // Ở đây mình ưu tiên lấy từ input hoặc cookie tùy bạn setup frontend
        // Giả sử frontend gửi email kèm theo cho dễ xử lý nếu không dùng cookie
        
        // Cách tốt nhất theo mẫu: Check Cookie hoặc Token gửi kèm
        /* LƯU Ý: Nếu frontend bạn không gửi cookie, bạn có thể gửi email từ form lên.
           Code dưới đây giả định bạn gửi { email, otp, password } từ frontend lên cho chắc ăn.
        */
        const { email } = req.body; // Thêm email vào body request từ frontend cho đơn giản hóa logic

        // Kiểm tra OTP trong DB
        const [otpRecords] = await pool.query(
            "SELECT * FROM otps WHERE email = ? AND otp = ? AND expires_at > NOW()",
            [email, otp]
        );

        if (otpRecords.length === 0) {
            return res.status(400).json({ msg: "Mã OTP không đúng hoặc đã hết hạn" });
        }

        // Hash mật khẩu mới
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Cập nhật mật khẩu User
        await pool.query("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, email]);

        // Dọn dẹp OTP
        await pool.query("DELETE FROM otps WHERE email = ?", [email]);

        return res.status(200).json({ msg: "Đổi mật khẩu thành công. Hãy đăng nhập lại." });

    } catch (error) {
        console.error("Verify Password Error:", error);
        return res.status(500).json({ msg: "Lỗi server khi đổi mật khẩu." });
    }
};
// Admin
// 1. Lấy danh sách User (Kèm thông tin sức khỏe cơ bản)
// Hỗ trợ tìm kiếm theo tên/email và lọc theo role
const getAllUsers = async (req, res) => {
    try {
        const { search, role } = req.query;
        
        let sql = `
            SELECT 
                u.id, 
                u.full_name, 
                u.email, 
                u.avatar_url, 
                u.role, 
                u.status,
                u.is_onboarded, 
                u.created_at,
                hp.gender, 
                hp.age, 
                hp.weight_kg, 
                hp.height_cm, 
                hp.goal,
                hp.activity_level
            FROM users u
            LEFT JOIN health_profiles hp ON u.id = hp.user_id
            WHERE 1=1
        `;

        const params = [];

        // Logic tìm kiếm
        if (search) {
            sql += ` AND (u.full_name LIKE ? OR u.email LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        // Logic lọc quyền
        if (role) {
            sql += ` AND u.role = ?`;
            params.push(role);
        }

        sql += ` ORDER BY u.created_at DESC`;

        const [rows] = await pool.query(sql, params);
        res.json(rows);

    } catch (error) {
        console.error("Lỗi lấy danh sách user:", error);
        res.status(500).json({ error: error.message });
    }
};

// 2. Cập nhật quyền hoặc trạng thái User (Dành cho Admin)
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, is_onboarded } = req.body; // Admin có thể sửa role hoặc trạng thái onboard

        await pool.query(
            `UPDATE users SET role = ?, is_onboarded = ? WHERE id = ?`,
            [role, is_onboarded, id]
        );

        res.json({ message: "Cập nhật tài khoản thành công!" });
    } catch (error) {
        console.error("Lỗi update user:", error);
        res.status(500).json({ error: error.message });
    }
};

// 3. Xóa User (Cần cẩn thận: Xóa user sẽ xóa luôn health_profile và các dữ liệu liên quan)
const deleteUser = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        await connection.beginTransaction();

        // Xóa Health Profile trước (nếu database chưa set ON DELETE CASCADE)
        await connection.query(`DELETE FROM health_profiles WHERE user_id = ?`, [id]);
        
        // Xóa User
        await connection.query(`DELETE FROM users WHERE id = ?`, [id]);

        await connection.commit();
        res.json({ message: "Đã xóa người dùng thành công!" });

    } catch (error) {
        await connection.rollback();
        console.error("Lỗi xóa user:", error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};


// --- MỚI: TẠO USER (Dành cho Admin) ---
const createUser = async (req, res) => {
    try {
        const { full_name, email, password, role } = req.body;

        // 1. Validate cơ bản
        if (!email || !password || !full_name) {
            return res.status(400).json({ msg: "Vui lòng điền đầy đủ thông tin (Email, Pass, Tên)." });
        }

        // 2. Check email tồn tại
        const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.status(400).json({ msg: "Email này đã được sử dụng." });
        }

        // 3. Hash mật khẩu
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 4. Insert vào DB
        // Mặc định tạo bởi Admin thì is_onboarded có thể để 0 hoặc 1 tùy logic của bạn. 
        // Ở đây mình để 1 (coi như active luôn) hoặc 0 để họ tự update profile sau.
        await pool.query(
            `INSERT INTO users (full_name, email, password, role, is_onboarded) VALUES (?, ?, ?, ?, ?)`,
            [full_name, email, hashedPassword, role || 'user', 1] 
        );

        res.status(201).json({ msg: "Tạo tài khoản thành công!" });

    } catch (error) {
        console.error("Lỗi create user:", error);
        res.status(500).json({ error: error.message });
    }
};

// --- CẬP NHẬT: SỬA USER (Update tổng thể) ---
// (Thay thế cho updateUserStatus cũ)
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, email, role, status, is_onboarded } = req.body; 

        // Check xem email mới có bị trùng với user khác không
        const [existing] = await pool.query("SELECT id FROM users WHERE email = ? AND id != ?", [email, id]);
        if (existing.length > 0) {
            return res.status(400).json({ msg: "Email này đã thuộc về người dùng khác." });
        }

        await pool.query(
            `UPDATE users SET full_name = ?, email = ?, role = ?, status = ?, is_onboarded = ? WHERE id = ?`,
            [full_name, email, role, status, is_onboarded, id]
        );

        res.json({ msg: "Cập nhật thông tin thành công!" });
    } catch (error) {
        console.error("Lỗi update user:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { forgotPassword, verifyForgotPassword, getAllUsers, updateUserStatus, deleteUser, createUser, updateUser };