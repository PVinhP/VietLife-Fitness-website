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

module.exports = { forgotPassword, verifyForgotPassword };