// backend/controllers/AIPlanController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { pool } = require('../config/db');
const { buildUserContext } = require('../utils/promptBuilder');

// Khởi tạo Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- HELPER 1: Lấy menu bài tập từ Database để gửi cho AI ---
const getExerciseMenu = async () => {
    try {
        // Chỉ lấy các trường cần thiết để tiết kiệm Token, tránh gửi video_url dài dòng
        const [rows] = await pool.query("SELECT id, exercise_name, muscle_group, difficulty FROM exercises");
        
        // Format thành chuỗi dễ đọc cho AI
        return rows.map(ex => 
            `ID: ${ex.id} | Name: ${ex.exercise_name} | Group: ${ex.muscle_group} | Level: ${ex.difficulty || 'All'}`
        ).join('\n');
    } catch (error) {
        console.error("Lỗi lấy menu bài tập:", error);
        return ""; // Nếu lỗi thì trả về rỗng, AI sẽ tự bịa (fallback)
    }
};

// --- HELPER 2: "Làm giàu" dữ liệu (Hydration) - Ghép Video/Ảnh thật vào JSON ---
const hydratePlanWithRealData = async (aiJson) => {
    // 1. Thu thập tất cả exercise_id mà AI đã chọn
    let exerciseIds = [];
    
    if (aiJson.week_1_detail) {
        aiJson.week_1_detail.forEach(day => {
            if (day.exercises) {
                day.exercises.forEach(ex => {
                    if (ex.exercise_id) exerciseIds.push(ex.exercise_id);
                });
            }
        });
    }

    // Nếu AI không chọn bài nào trong DB hoặc danh sách rỗng -> Trả về nguyên gốc
    if (exerciseIds.length === 0) return aiJson;

    try {
        // 2. Query Database để lấy thông tin chi tiết (Ảnh, Video) của các ID này
        // Sử dụng cú pháp IN (?) để lấy 1 lần
        const [realExercises] = await pool.query(
            `SELECT id, exercise_name, thumbnail_url, video_urls, difficulty FROM exercises WHERE id IN (?)`,
            [exerciseIds]
        );

        // 3. Tạo Map để tra cứu nhanh (ID -> Data)
        const exerciseMap = {};
        realExercises.forEach(ex => {
            exerciseMap[ex.id] = ex;
        });

        // 4. Gán ngược lại vào JSON của AI
        if (aiJson.week_1_detail) {
            aiJson.week_1_detail.forEach(day => {
                if (day.exercises) {
                    day.exercises.forEach((ex, index) => {
                        const realData = exerciseMap[ex.exercise_id];
                        
                        if (realData) {
                            // CÓ TRONG DB -> Dùng dữ liệu thật
                            day.exercises[index].name = realData.exercise_name; // Ghi đè tên cho chuẩn
                            day.exercises[index].thumbnail_url = realData.thumbnail_url;
                            day.exercises[index].video_url = realData.video_urls;
                            day.exercises[index].difficulty = realData.difficulty;
                            day.exercises[index].is_real = true; // Cờ để Frontend hiện nút Play
                        } else {
                            // KHÔNG CÓ (AI bịa ID hoặc ID đã xóa) -> Đánh dấu là AI generated
                            day.exercises[index].is_real = false; 
                            day.exercises[index].exercise_id = null; // Reset ID sai
                        }
                    });
                }
            });
        }
    } catch (error) {
        console.error("Lỗi khi hydrate dữ liệu:", error);
        // Nếu lỗi query DB thì vẫn trả về JSON gốc của AI (chỉ thiếu video)
    }

    return aiJson;
};

// --- 1. HÀM LẤY LỘ TRÌNH HIỆN TẠI (GET) ---
exports.getCurrentPlan = async (req, res) => {
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
        // A. Kiểm tra User Profile
        const [rows] = await pool.query("SELECT * FROM health_profiles WHERE user_id = ?", [userId]);
        
        if (rows.length === 0) {
            return res.status(400).json({ msg: "Bạn chưa có hồ sơ sức khỏe.", action: "REDIRECT_TO_WIZARD" });
        }
        
        const profile = rows[0];
        let preferences = profile.training_preferences;

        if (typeof preferences === 'string') {
            try { preferences = JSON.parse(preferences); } catch (e) {}
        }

        if (!preferences) {
            return res.status(400).json({ msg: "Thiếu thông tin sở thích tập luyện.", action: "REDIRECT_TO_WIZARD" });
        }

        // --- BƯỚC MỚI: LẤY MENU BÀI TẬP TỪ DB ---
        const exerciseMenu = await getExerciseMenu();

        // B. Xây dựng Prompt
        const userContext = buildUserContext(preferences, profile);
        const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });
        
        const prompt = `
    Bạn là PT Gym chuyên nghiệp (VietLife AI). Hãy thiết kế một LỘ TRÌNH 4 TUẦN dành riêng cho người dùng.

    Dữ liệu người dùng: ${userContext}

    DANH SÁCH BÀI TẬP CÓ SẴN TRONG KHO (DATABASE):
    --- BẮT ĐẦU DANH SÁCH ---
    ${exerciseMenu}
    --- KẾT THÚC DANH SÁCH ---

    YÊU CẦU QUAN TRỌNG:
    1. ƯU TIÊN TUYỆT ĐỐI chọn bài tập từ danh sách trên để người dùng có video hướng dẫn.
    2. Khi chọn bài từ danh sách, BẮT BUỘC phải trả về đúng "exercise_id".
    3. Nếu bài tập rất cần thiết mà không có trong danh sách, bạn được phép tự thêm nhưng để "exercise_id": null.
    4. Chỉ trả về JSON thuần, không Markdown, không lời dẫn.

    CẤU TRÚC JSON OUTPUT (Tuyệt đối tuân thủ):
    {
        "analysis": {
            "bmi": "...",
            "tdee": "...",
            "advice": "...",
            "goal_summary": "..."
        },
        "roadmap": [
            { "week": 1, "phase": "...", "focus": "...", "desc": "..." },
            { "week": 2, "phase": "...", "focus": "...", "desc": "..." },
            { "week": 3, "phase": "...", "focus": "...", "desc": "..." },
            { "week": 4, "phase": "...", "focus": "...", "desc": "..." }
        ],
        "week_1_detail": [
            { 
                "day": "Thứ 2", 
                "focus": "Ngực & Tay sau", 
                "exercises": [ 
                    { 
                        "exercise_id": 15, 
                        "name": "Tên bài tập (Nếu có ID thì dùng tên gốc)", 
                        "sets": "3", 
                        "reps": "10-12", 
                        "note": "Gồng ngực khi đẩy" 
                    },
                    { 
                        "exercise_id": null, 
                        "name": "Bài tập AI tự nghĩ", 
                        "sets": "3", 
                        "reps": "Failure", 
                        "note": "..." 
                    }
                ] 
            }
            // ... (Tiếp tục các ngày còn lại)
        ],
        "nutrition": {
            "calories": 2500,
            "macro_split": "40% Carb - 30% Protein - 30% Fat",
            "menu": [
                { "meal": "Sáng", "suggestion": "..." },
                { "meal": "Trưa", "suggestion": "..." },
                { "meal": "Tối", "suggestion": "..." }
            ]
        }
    }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        console.log("Raw AI response:", text); 

        // Xử lý JSON (Regex)
        const jsonMatch = text.match(/\{[\s\S]*\}/); 
        if (!jsonMatch) {
            console.error("AI Data Error:", text);
            return res.status(500).json({ msg: "AI trả về dữ liệu lỗi." });
        }
        
        let aiPlanJson;
        try {
            aiPlanJson = JSON.parse(jsonMatch[0]);
        } catch (jsonError) {
            return res.status(500).json({ msg: "Lỗi định dạng dữ liệu từ AI." });
        }

        // --- BƯỚC MỚI: HYDRATION (Lấy dữ liệu thật ghép vào) ---
        aiPlanJson = await hydratePlanWithRealData(aiPlanJson);

        // C. Lưu vào Database
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Archive lộ trình cũ
            await connection.query(
                "UPDATE user_ai_plans SET status = 'archived' WHERE user_id = ? AND status = 'active'", 
                [userId]
            );

            // Lưu lộ trình mới (đã có video/ảnh thật)
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