// backend/controllers/ChatController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { pool } = require('../config/db');

// Khởi tạo Gemini AI (Lưu ý: Dùng model gemini-1.5-flash hoặc pro để hỗ trợ systemInstruction tốt hơn)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.sendMessage = async (req, res) => {
    const userId = req.user?.id || req.body.userId; 
    const { message } = req.body;

    if (!message) return res.status(400).json({ msg: "Vui lòng nhập nội dung." });

    try {
        // --- BƯỚC 1: LẤY THÔNG TIN HEALTH PROFILE (Giữ nguyên) ---
        const queryProfile = `
            SELECT u.full_name, hp.* FROM users u LEFT JOIN health_profiles hp ON u.id = hp.user_id 
            WHERE u.id = ?
        `;
        const [rowsProfile] = await pool.query(queryProfile, [userId]);
        
        if (rowsProfile.length === 0) return res.status(404).json({ msg: "User not found." });
        const user = rowsProfile[0];
        
        const healthContext = `
        DỮ LIỆU KHÁCH HÀNG:
        - Tên: ${user.full_name}
        - Body: ${user.age}t, ${user.height_cm}cm, ${user.weight_kg}kg.
        - Goal: ${user.goal}
        - Bệnh lý: ${user.medical_history || 'Không'}
        `;

        // --- BƯỚC 2: LẤY LỊCH SỬ CHAT GẦN NHẤT (MỚI) ---
        // Lấy 10 tin nhắn gần nhất để AI nhớ ngữ cảnh
        const queryHistory = `
            SELECT sender, message FROM chat_history 
            WHERE user_id = ? 
            ORDER BY created_at DESC LIMIT 10
        `;
        const [rowsHistory] = await pool.query(queryHistory, [userId]);
        
        // Đảo ngược lại mảng để đúng thứ tự thời gian (Cũ -> Mới)
        const historyData = rowsHistory.reverse().map(row => {
            const role = row.sender === 'user' ? 'User' : 'AI PT';
            return `${role}: ${row.message}`;
        }).join('\n');

        // --- BƯỚC 3: XÂY DỰNG PROMPT THÔNG MINH HƠN ---
        
        const systemInstruction = `
        VAI TRÒ: Bạn là PT (Huấn luyện viên) & Chuyên gia dinh dưỡng cá nhân của VietLife.
        
        ${healthContext}

        NGUYÊN TẮC TRẢ LỜI (QUAN TRỌNG):
        1. **Nhận diện ngữ cảnh:** Dưới đây là lịch sử trò chuyện. Nếu đây là câu hỏi tiếp theo của cùng một chủ đề, HÃY TRẢ LỜI THẲNG VÀO VẤN ĐỀ, KHÔNG chào hỏi lại, KHÔNG giới thiệu lại bản thân.
        2. **An toàn là trên hết:** Cảnh báo nếu bài tập không hợp với tiền sử bệnh lý.
        3. **Phong cách:** Ngắn gọn, thân thiện, dùng Markdown (bold, list).
        4. **Ngôn ngữ:** Tiếng Việt tự nhiên.
        `;

        const finalPrompt = `
        --- LỊCH SỬ TRÒ CHUYỆN (Để AI tham khảo ngữ cảnh) ---
        ${historyData}
        
        --- TIN NHẮN MỚI CỦA USER ---
        User: ${message}
        
        AI PT (Hãy trả lời User dựa trên lịch sử và tin nhắn mới):
        `;

        // --- BƯỚC 4: GỌI GEMINI ---
        const model = genAI.getGenerativeModel({ 
            model: process.env.GEMINI_MODEL,
            systemInstruction: systemInstruction // Gemini 1.5 hỗ trợ cái này tách biệt
        });

        // Nếu dùng model cũ không hỗ trợ systemInstruction, bạn gộp systemInstruction vào finalPrompt cũng được
        const result = await model.generateContent(finalPrompt);
        const aiResponse = result.response.text();

        // --- BƯỚC 5: LƯU DB & TRẢ KẾT QUẢ (Giữ nguyên) ---
        await pool.query("INSERT INTO chat_history (user_id, sender, message) VALUES (?, 'user', ?)", [userId, message]);
        await pool.query("INSERT INTO chat_history (user_id, sender, message) VALUES (?, 'bot', ?)", [userId, aiResponse]);

        return res.status(200).json({ reply: aiResponse, sender: 'bot' });

    } catch (error) {
        console.error("Lỗi Chat AI:", error);
        return res.status(500).json({ msg: "Lỗi hệ thống.", error: error.message });
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