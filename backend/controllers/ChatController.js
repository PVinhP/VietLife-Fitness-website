// backend/controllers/ChatController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { pool } = require('../config/db'); // Đảm bảo đường dẫn đúng tới file config db của bạn

// Khởi tạo Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- 1. GỬI TIN NHẮN & NHẬN TƯ VẤN (POST) ---
exports.sendMessage = async (req, res) => {
    // Giả định bạn đã có middleware xác thực gán user vào req.user
    // Nếu chưa có auth, bạn có thể tạm dùng: const userId = req.body.userId;
    const userId = req.user?.id || req.body.userId; 
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ msg: "Vui lòng nhập nội dung tin nhắn." });
    }

    try {
        // A. Lấy thông tin User + Health Profile để làm Context
        // JOIN bảng users và health_profiles dựa trên hình ảnh bạn cung cấp
        const query = `
            SELECT 
                u.full_name, 
                hp.age, hp.gender, hp.weight_kg, hp.height_cm,
                hp.medical_history, hp.activity_level, hp.goal,
                hp.dietary_preferences, hp.training_preferences
            FROM users u
            LEFT JOIN health_profiles hp ON u.id = hp.user_id
            WHERE u.id = ?
        `;

        const [rows] = await pool.query(query, [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ msg: "Không tìm thấy thông tin người dùng." });
        }

        const userProfile = rows[0];

        // B. Xử lý dữ liệu Context (Đặc biệt là cột JSON training_preferences)
        let trainingPrefs = "Chưa cập nhật";
        if (userProfile.training_preferences) {
            // Nếu MySQL trả về object JSON sẵn thì dùng luôn, nếu là string thì parse
            trainingPrefs = typeof userProfile.training_preferences === 'string' 
                ? userProfile.training_preferences 
                : JSON.stringify(userProfile.training_preferences);
        }

        const contextData = `
        THÔNG TIN KHÁCH HÀNG (Dữ liệu thực tế từ Database):
        - Tên: ${userProfile.full_name}
        - Thông số: ${userProfile.age || '?'} tuổi, ${userProfile.gender || '?'}, ${userProfile.height_cm}cm, ${userProfile.weight_kg}kg.
        - Mục tiêu (Goal): ${userProfile.goal || 'Chưa rõ'}
        - Mức độ vận động: ${userProfile.activity_level || 'Chưa rõ'}
        - Tiền sử chấn thương/Bệnh lý: ${userProfile.medical_history || 'Không có'}
        - Sở thích ăn uống: ${userProfile.dietary_preferences || 'Không có'}
        - Sở thích tập luyện: ${trainingPrefs}
        `;

        // C. Tạo Prompt cho AI (System Instruction)
        const systemPrompt = `
        Bạn là PT (Huấn luyện viên) và Chuyên gia dinh dưỡng AI của hệ thống VietLife.
        
        ${contextData}

        NHIỆM VỤ:
        1. Trả lời câu hỏi: "${message}"
        2. Nguyên tắc an toàn: Dựa vào 'Tiền sử chấn thương' ở trên. Nếu khách hàng có chấn thương, HÃY CẢNH BÁO nếu họ hỏi bài tập nguy hiểm.
        3. Cá nhân hóa: Dựa vào 'Mục tiêu' (ví dụ: ${userProfile.goal}) để đưa lời khuyên phù hợp (Tăng cơ thì khuyên ăn nhiều đạm, Giảm cân thì khuyên thâm hụt calo).
        4. Định dạng: Trả lời ngắn gọn, súc tích, sử dụng Markdown (in đậm, gạch đầu dòng).
        5. Giọng điệu: Thân thiện, động viên.
        `;

        // D. Gọi Gemini AI

        const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });
        const result = await model.generateContent(systemPrompt);
        const aiResponse = result.response.text();

        // E. Lưu lịch sử chat vào Database (Transaction không bắt buộc nhưng tốt cho toàn vẹn dữ liệu)
        // Lưu tin nhắn User
        await pool.query(
            "INSERT INTO chat_history (user_id, sender, message) VALUES (?, 'user', ?)",
            [userId, message]
        );
        // Lưu tin nhắn Bot
        await pool.query(
            "INSERT INTO chat_history (user_id, sender, message) VALUES (?, 'bot', ?)",
            [userId, aiResponse]
        );

        // F. Trả kết quả về Client
        return res.status(200).json({ 
            reply: aiResponse,
            sender: 'bot' 
        });

    } catch (error) {
        console.error("Lỗi Chat AI:", error);
        return res.status(500).json({ msg: "Lỗi hệ thống khi xử lý tin nhắn.", error: error.message });
    }
};

// --- 2. LẤY LỊCH SỬ CHAT (GET) ---
exports.getChatHistory = async (req, res) => {
    const userId = req.user?.id || req.params.userId; // Linh hoạt lấy ID

    try {
        const [rows] = await pool.query(
            "SELECT id, sender, message, created_at FROM chat_history WHERE user_id = ? ORDER BY created_at ASC LIMIT 50",
            [userId]
        );

        return res.status(200).json(rows);

    } catch (error) {
        console.error("Lỗi lấy lịch sử chat:", error);
        return res.status(500).json({ msg: "Không thể tải lịch sử chat." });
    }
};