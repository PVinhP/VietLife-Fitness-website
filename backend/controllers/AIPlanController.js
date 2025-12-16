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
        const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });
        
        const prompt = `
    Bạn là PT Gym chuyên nghiệp (VietLife AI). Hãy thiết kế một LỘ TRÌNH 4 TUẦN dành riêng cho người dùng này.

    Dữ liệu người dùng: ${userContext}

    YÊU CẦU CẤU TRÚC JSON (Tuyệt đối tuân thủ):
    {
        "analysis": {
            "bmi": "Số liệu (VD: 22.5)",
            "tdee": "Số liệu (VD: 2200 kcal)",
            "advice": "Lời khuyên chiến lược cho 4 tuần",
            "goal_summary": "Ví dụ: Tăng cơ nạc, giảm mỡ bụng"
        },
        "roadmap": [
            { "week": 1, "phase": "Giai đoạn 1", "focus": "Làm quen & Kích hoạt cơ", "desc": "Tập trung vào form chuẩn, cường độ vừa phải." },
            { "week": 2, "phase": "Giai đoạn 2", "focus": "Tăng cường độ (Progressive Overload)", "desc": "Tăng tạ hoặc số reps." },
            { "week": 3, "phase": "Giai đoạn 3", "focus": "Tối đa hóa Hypertrophy", "desc": "Kỹ thuật Drop-set hoặc Super-set." },
            { "week": 4, "phase": "Giai đoạn 4", "focus": "Deload & Phục hồi", "desc": "Giảm khối lượng để cơ thể hồi phục." }
        ],
        "week_1_detail": [
            { 
                "day": "Thứ 2", 
                "focus": "Ngực & Tay sau", 
                "exercises": [ 
                    { "name": "Đẩy ngực tạ đòn", "sets": "3", "reps": "10-12", "note": "Gồng ngực khi đẩy lên" },
                    { "name": "Hít đất", "sets": "3", "reps": "Failure", "note": "Xuống chậm" }
                ] 
            },
            {
                "day": "Thứ 3",
                "focus": "Nghỉ ngơi / Cardio nhẹ",
                "exercises": []
            }
            // ... Tiếp tục cho đủ 7 ngày
        ],
        "nutrition": {
            "calories": 2500,
            "macro_split": "40% Carb - 30% Protein - 30% Fat",
            "menu": [
                { "meal": "Sáng", "suggestion": "Yến mạch + 2 trứng luộc" },
                { "meal": "Trưa", "suggestion": "Cơm gạo lứt + Ức gà áp chảo + Bông cải xanh" },
                { "meal": "Trước tập", "suggestion": "1 quả chuối" },
                { "meal": "Tối", "suggestion": "Salad cá ngừ" }
            ]
        }
    }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // --- ĐOẠN CODE MỚI: DÙNG REGEX ĐỂ TRÍCH XUẤT JSON ---
        console.log("Raw AI response:", text); // Log ra để debug nếu cần

        // Tìm vị trí bắt đầu '{' và kết thúc '}'
        const jsonMatch = text.match(/\{[\s\S]*\}/); 
        
        if (!jsonMatch) {
            console.error("AI không trả về JSON hợp lệ:", text);
            return res.status(500).json({ msg: "AI trả về dữ liệu lỗi. Vui lòng thử lại." });
        }

        // Lấy đúng phần chuỗi JSON sạch
        const jsonString = jsonMatch[0];
        
        let aiPlanJson;
        try {
            aiPlanJson = JSON.parse(jsonString);
        } catch (jsonError) {
            console.error("JSON Parse Error:", jsonError);
            // Fallback: Đôi khi AI thêm dấu phẩy thừa ở cuối danh sách, có thể dùng thư viện json5 để parse nếu cần
            return res.status(500).json({ msg: "Lỗi định dạng dữ liệu từ AI." });
        }
        // --- KẾT THÚC ĐOẠN CODE MỚI ---

        // C. Database Transaction (Giữ nguyên phần dưới)
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