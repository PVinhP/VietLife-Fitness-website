// File: utils/mailForgotPassword.js
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const EMAIL_USER = process.env.EMAIL_USER;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const SendMailForgotPassword = async (email, otp) => {
    try {
        const accessToken = await oAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: EMAIL_USER,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken,
            },
        });

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
            </div>
            `,
        });

        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error; // Ném lỗi để Controller bắt được
    }
};

module.exports = SendMailForgotPassword;