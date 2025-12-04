const { GoogleGenerativeAI } = require("@google/generative-ai");
const { pool } = require('../config/db');
const { buildUserContext } = require('../utils/promptBuilder');

// Khởi tạo Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generatePlan = async (req, res) => {
    const userId = req.user.id;

    try {
        // 1. Lấy dữ liệu user từ DB
        const [rows] = await pool.query("SELECT * FROM health_profiles WHERE user_id = ?", [userId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ msg: "Chưa có hồ sơ sức khỏe cơ bản (Tuổi, Chiều cao...)." });
        }
        
        const profile = rows[0];
        let preferences = profile.training_preferences;

        // --- BẮT ĐẦU ĐOẠN CODE SỬA LỖI ---

        // Kiểm tra 1: Xử lý trường hợp MySQL trả về chuỗi JSON thay vì Object
        if (typeof preferences === 'string') {
            try {
                preferences = JSON.parse(preferences);
            } catch (e) {
                console.error("Lỗi parse JSON preferences:", e);
                return res.status(500).json({ msg: "Dữ liệu hồ sơ bị lỗi định dạng." });
            }
        }

        // Kiểm tra 2: Nếu preferences vẫn là NULL hoặc thiếu thông tin quan trọng
        // (Lỗi 'Cannot read properties of null' thường do preferences bị null ở đây)
        if (!preferences || !preferences.workout_location) {
            return res.status(400).json({ 
                msg: "Bạn chưa điền thông tin sở thích tập luyện. Vui lòng quay lại bước trước.",
                action: "REDIRECT_TO_WIZARD" // Frontend sẽ bắt signal này để navigate
            });
        }

        // --- KẾT THÚC ĐOẠN CODE SỬA LỖI ---

        // 2. Tạo Prompt (Ngữ cảnh)
        // Giờ thì biến preferences chắc chắn đã an toàn để dùng
        const userContext = buildUserContext(preferences, profile);
        console.log(userContext);
        // 3. Cấu hình Prompt cho Gemini (Yêu cầu trả về JSON chuẩn)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
        
        const prompt = `
        Bạn là PT Gym chuyên nghiệp (VietLife AI). Hãy tạo lộ trình tập luyện và dinh dưỡng cá nhân hóa.
        
        ${userContext}

        YÊU CẦU ĐẦU RA (QUAN TRỌNG: CHỈ TRẢ VỀ JSON THUẦN, KHÔNG DÙNG MARKDOWN):
        {
            "analysis": {
                "bmi": "Tính BMI và nhận xét ngắn",
                "tdee": "Tính TDEE ước tính",
                "advice": "Lời khuyên chiến thuật ngắn gọn (khoảng 3 câu)"
            },
            "schedule": [
                { 
                    "day": "Thứ 2", 
                    "focus": "Ngực & Tay sau", 
                    "exercises": [ 
                        { "name": "Hít đất", "sets": "3", "reps": "12-15", "note": "Xuống chậm" } 
                    ] 
                },
                { 
                    "day": "Thứ 3", 
                    "focus": "Chân & Bụng", 
                    "exercises": [ 
                        { "name": "Squat", "sets": "4", "reps": "12", "note": "Lưng thẳng" } 
                    ] 
                }
                // ... Tiếp tục cho đủ 1 tuần
            ],
            "nutrition": {
                "calories": 2500,
                "menu": [
                    { "meal": "Sáng", "suggestion": "Bánh mì..." },
                    { "meal": "Trưa", "suggestion": "Cơm..." },
                    { "meal": "Tối", "suggestion": "..." }
                ]
            }
        }
        `;

        // 4. Gọi Gemini
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // 5. Làm sạch JSON (AI hay trả về ```json ... ```)
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        
        let aiPlanJson;
        try {
            aiPlanJson = JSON.parse(text);
        } catch (jsonError) {
            console.error("Lỗi parse kết quả từ AI:", text);
            return res.status(500).json({ msg: "AI trả về dữ liệu không đúng định dạng, vui lòng thử lại." });
        }

        // 6. Lưu vào Database (Bảng user_ai_plans)
        // Ẩn plan cũ
        await pool.query("UPDATE user_ai_plans SET status = 'archived' WHERE user_id = ?", [userId]);
        
        // Tạo plan mới
        await pool.query(
            "INSERT INTO user_ai_plans (user_id, ai_data, status) VALUES (?, ?, 'active')",
            [userId, JSON.stringify(aiPlanJson)]
        );

        // 7. Trả về cho Frontend
        res.json({ msg: "Thành công", plan: aiPlanJson });

    } catch (error) {
        console.error("Lỗi tạo lộ trình AI:", error);
        res.status(500).json({ msg: "AI đang bận hoặc có lỗi hệ thống.", error: error.message });
    }
};