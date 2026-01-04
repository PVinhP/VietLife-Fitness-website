// File: utils/mailForgotPassword.js
const nodemailer = require('nodemailer');
require('dotenv').config();

// Lấy thông tin từ .env
const EMAIL_USER = process.env.EMAIL_USER; // Email của bạn (vinhpham...@gmail.com)
const EMAIL_PASS = process.env.EMAIL_PASS; // Mật khẩu ứng dụng 16 ký tự

const SendMailForgotPassword = async (email, otp) => {
    try {
        // Cấu hình Transporter đơn giản với App Password
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS, 
            },
        });

        // Gửi email
        const info = await transport.sendMail({
            from: `"VietLife Support" <${EMAIL_USER}>`,
            to: email,
            subject: 'Yêu cầu đặt lại mật khẩu - VietLife',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #0d9488; text-align: center;">Yêu cầu đặt lại mật khẩu</h2>
                <p>Xin chào,</p>
                <p>Hệ thống nhận được yêu cầu khôi phục mật khẩu cho tài khoản: <b>${email}</b></p>
                <p>Mã xác nhận (OTP) của bạn là:</p>
                <div style="text-align: center; margin: 20px 0;">
                    <span style="font-size: 24px; font-weight: bold; color: #0d9488; letter-spacing: 5px; background: #f0fdfa; padding: 10px 20px; border-radius: 5px; border: 1px dashed #0d9488;">
                        ${otp}
                    </span>
                </div>
                <p>Mã này sẽ hết hạn sau <b>5 phút</b>.</p>
                <p style="font-size: 12px; color: #666;">Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #999; text-align: center;">VietLife - Đồng hành cùng sức khỏe của bạn</p>
            </div>
            `,
        });

        console.log('✅ Email OTP sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Error sending OTP email:', error);
        throw error;
    }
};

module.exports = SendMailForgotPassword;