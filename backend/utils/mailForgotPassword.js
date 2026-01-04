// File: utils/mailForgotPassword.js
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
require('dotenv').config();

// GIỮ NGUYÊN CÁC BIẾN CŨ CỦA BẠN
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const EMAIL_USER = process.env.EMAIL_USER;

// Khởi tạo OAuth2 Client
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const SendMailForgotPassword = async (email, otp) => {
    try {
        console.log(`🚀 Đang gửi mail tới ${email} trên môi trường: ${process.env.NODE_ENV || 'local'}`);
        
        // Lấy Access Token
        const accessToken = await oAuth2Client.getAccessToken();

        // --- KHẮC PHỤC LỖI RENDER ---
        // Thay vì dùng service: 'gmail', ta cấu hình thủ công để ép dùng Port 465
        const transport = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,               // <--- ĐÂY LÀ CHÌA KHÓA (Cổng SSL Render không chặn)
            secure: true,            // Bắt buộc true khi dùng port 465
            auth: {
                type: 'OAuth2',      // Vẫn dùng OAuth2 cũ của bạn
                user: EMAIL_USER,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken,
            },
            // Tăng thời gian chờ để tránh mạng lag
            connectionTimeout: 20000, 
            greetingTimeout: 20000,
            socketTimeout: 20000,
        });

        // Nội dung Email
        const info = await transport.sendMail({
            from: `"VietLife Support" <${EMAIL_USER}>`,
            to: email,
            subject: 'Yêu cầu đặt lại mật khẩu - VietLife',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #0d9488; text-align: center;">Yêu cầu đặt lại mật khẩu</h2>
                <p>Xin chào,</p>
                <p>Mã xác nhận (OTP) của bạn là:</p>
                <div style="text-align: center; margin: 20px 0;">
                    <span style="font-size: 24px; font-weight: bold; color: #ffffff; letter-spacing: 5px; background: #0d9488; padding: 15px 30px; border-radius: 8px;">
                        ${otp}
                    </span>
                </div>
                <p style="text-align: center; color: #666;">Mã hết hạn sau 5 phút.</p>
            </div>
            `,
        });

        console.log('✅ Gửi mail thành công:', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Lỗi gửi mail:', error);
        throw error;
    }
};

module.exports = SendMailForgotPassword;