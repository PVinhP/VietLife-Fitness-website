// File: utils/mailForgotPassword.js
const { google } = require('googleapis');
require('dotenv').config();

// 1. Lấy biến môi trường (GIỮ NGUYÊN CỦA BẠN)
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const EMAIL_USER = process.env.EMAIL_USER;

// 2. Khởi tạo OAuth2 Client
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const SendMailForgotPassword = async (email, otp) => {
    try {
        console.log(`🚀 Đang gửi mail tới ${email} bằng GMAIL API (HTTP)...`);

        // Lấy Access Token để đảm bảo kết nối
        const { token } = await oAuth2Client.getAccessToken();
        oAuth2Client.setCredentials({ access_token: token });

        // 3. Tự tạo nội dung Email (MIME format) thay vì dùng Nodemailer SMTP
        // Cách này giúp gửi qua cổng HTTP 443 -> Không bao giờ bị chặn cổng
        
        const subject = "Yêu cầu đặt lại mật khẩu - VietLife";
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
        
        const messageParts = [
            `From: VietLife Support <${EMAIL_USER}>`,
            `To: ${email}`,
            `Subject: ${utf8Subject}`,
            `Content-Type: text/html; charset=utf-8`,
            `MIME-Version: 1.0`,
            ``, // Dòng trống ngăn cách Header và Body
            `
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
            </div>
            `
        ];

        // Ghép các phần thành 1 chuỗi
        const message = messageParts.join('\n');

        // Mã hóa chuỗi thành Base64URL (Yêu cầu bắt buộc của Gmail API)
        const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        // 4. Gửi trực tiếp qua Gmail API (Bỏ qua SMTP)
        const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
        const res = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage,
            },
        });

        console.log('✅ Gửi mail thành công qua API! ID:', res.data.id);
        return res.data;

    } catch (error) {
        console.error('❌ Lỗi gửi mail API:', error);
        // In lỗi chi tiết từ Google nếu có
        if (error.response) {
            console.error('Chi tiết lỗi Google:', error.response.data);
        }
        throw error;
    }
};

module.exports = SendMailForgotPassword;