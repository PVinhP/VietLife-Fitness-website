// backend/controllers/AIPlanController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { pool } = require('../config/db');
const { buildUserContext } = require('../utils/promptBuilder');

// Khởi tạo Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- 1. HÀM LẤY LỘ TRÌNH HIỆN TẠI (GET) ---
exports.getCurrentPlan = async (req, res) => {
    // Trong JS không cần khai báo kiểu :Request hay :Response
    const userId = req.user.id; 

    try {
        const [rows] = await pool.query(
            "SELECT ai_data, created_at FROM user_ai_plans WHERE user_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1",
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ msg: "Chưa có lộ trình nào." });
        }

        let planData = rows[0].ai_data;
        // Kiểm tra nếu MySQL trả về string thì parse ra JSON
        if (typeof planData === 'string') {
            planData = JSON.parse(planData);
        }

        return res.status(200).json({ 
            msg: "Lấy lộ trình thành công", 
            plan: planData,
            created_at: rows[0].created_at 
        });

    } catch (error) {
        console.error("Lỗi lấy lộ trình:", error);
        return res.status(500).json({ msg: "Lỗi server khi lấy lộ trình." });
    }
};

// --- 2. HÀM TẠO LỘ TRÌNH MỚI (POST) ---
exports.generatePlan = async (req, res) => {
    const userId = req.user.id;

    try {
        // A. Kiểm tra User đã có Profile chưa
        const [rows] = await pool.query("SELECT * FROM health_profiles WHERE user_id = ?", [userId]);
        
        if (rows.length === 0) {
            return res.status(400).json({ 
                msg: "Bạn chưa có hồ sơ sức khỏe.", 
                action: "REDIRECT_TO_WIZARD" 
            });
        }
        
        const profile = rows[0];
        let preferences = profile.training_preferences;

        if (typeof preferences === 'string') {
            try {
                preferences = JSON.parse(preferences);
            } catch (e) {
                return res.status(500).json({ msg: "Dữ liệu hồ sơ bị lỗi định dạng." });
            }
        }

        if (!preferences) {
            return res.status(400).json({ 
                msg: "Thiếu thông tin sở thích tập luyện.",
                action: "REDIRECT_TO_WIZARD"
            });
        }

        // B. Xây dựng Prompt & Gọi AI
        const userContext = buildUserContext(preferences, profile);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
        
        const prompt = `
        Bạn là PT Gym chuyên nghiệp (VietLife AI). Hãy tạo lộ trình tập luyện và dinh dưỡng cá nhân hóa.
        
        ${userContext}

        YÊU CẦU ĐẦU RA (JSON THUẦN):
        {
            "analysis": {
                "bmi": "Số liệu BMI",
                "tdee": "Số liệu TDEE",
                "advice": "Lời khuyên ngắn gọn"
            },
            "schedule": [
                { 
                    "day": "Thứ 2", 
                    "focus": "Nhóm cơ", 
                    "exercises": [ 
                        { "name": "Tên bài", "sets": "3", "reps": "12", "note": "Lưu ý" } 
                    ] 
                }
            ],
            "nutrition": {
                "calories": 2500,
                "menu": [
                    { "meal": "Sáng", "suggestion": "Món ăn" }
                ]
            }
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        
        let aiPlanJson;
        try {
            aiPlanJson = JSON.parse(text);
        } catch (jsonError) {
            console.error("AI JSON Parse Error:", text);
            return res.status(500).json({ msg: "AI trả về lỗi định dạng. Vui lòng thử lại." });
        }

        // C. Database Transaction
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            await connection.query(
                "UPDATE user_ai_plans SET status = 'archived' WHERE user_id = ? AND status = 'active'", 
                [userId]
            );

            await connection.query(
                "INSERT INTO user_ai_plans (user_id, ai_data, status) VALUES (?, ?, 'active')",
                [userId, JSON.stringify(aiPlanJson)]
            );

            await connection.commit();
        } catch (dbError) {
            await connection.rollback();
            throw dbError;
        } finally {
            connection.release();
        }

        res.json({ msg: "Tạo lộ trình thành công", plan: aiPlanJson });

    } catch (error) {
        console.error("Lỗi tạo lộ trình:", error);
        res.status(500).json({ msg: "Hệ thống đang bận.", error: error.message });
    }
};