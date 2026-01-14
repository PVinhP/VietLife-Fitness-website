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
    Bạn là PT Gym chuyên nghiệp với 10 năm kinh nghiệm (VietLife AI). Hãy thiết kế một LỘ TRÌNH 4 TUẦN dành riêng cho người dùng.

    Dữ liệu người dùng: ${userContext}

    DANH SÁCH BÀI TẬP CÓ SẴN TRONG KHO (DATABASE):
    --- BẮT ĐẦU DANH SÁCH ---
    ${exerciseMenu}
    --- KẾT THÚC DANH SÁCH ---

    YÊU CẦU QUAN TRỌNG:
    1. Nếu người dùng muốn giảm nhanh (>0.8kg/tuần): Hãy thiết kế mức thâm hụt Calo (Deficit) lớn hơn (nhưng không dưới BMR) và tăng cường bài tập Cardio/HIIT.
    2. Nếu người dùng muốn giảm chậm (0.5kg/tuần): Ưu tiên bảo toàn cơ bắp, thâm hụt vừa phải.
    3. ƯU TIÊN TUYỆT ĐỐI chọn bài tập từ danh sách trên để người dùng có video hướng dẫn.
    4. Khi chọn bài từ danh sách, BẮT BUỘC phải trả về đúng "exercise_id".
    5. Nếu bài tập rất cần thiết mà không có trong danh sách, bạn được phép tự thêm nhưng để "exercise_id": null.
    6. Các món ăn mục nutrition phải quen thuộc với người Việt Nam, dễ tìm nguyên liệu và nấu nướng.
    7. Chỉ trả về JSON thuần, không Markdown, không lời dẫn.

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
            "summary": {
                "total_calories": 2500,
                "macro_ratio": { 
                    "protein": "30%", 
                    "carbs": "45%", 
                    "fat": "25%" 
                },
                "advice": "Lời khuyên dinh dưỡng ngắn gọn..."
            },
            "weekly_menu": [
                {
                    "day": "Thứ 2",
                    "meals": [
                        { 
                            "type": "Sáng", 
                            "name": "Phở bò tái chín", 
                            "calories": "500kcal", 
                            "info": "Nhiều đạm, ít béo" 
                        },
                        { 
                            "type": "Trưa", 
                            "name": "Cơm gạo lứt ức gà", 
                            "calories": "600kcal", 
                            "info": "Giàu xơ" 
                        },
                        { 
                            "type": "Tối", 
                            "name": "Salad cá ngừ", 
                            "calories": "400kcal", 
                            "info": "Nhẹ bụng, dễ tiêu" 
                        },
                        { 
                            "type": "Phụ (trước tập 45 phút)", 
                            "name": "Sữa chua hy lạp", 
                            "calories": "150kcal", 
                            "info": "Probiotic" 
                        }
                    ]
                }
                // ... YÊU CẦU: Tạo đủ 7 ngày (Thứ 2 đến Chủ Nhật)
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

// --- 3. HÀM TẠO TUẦN TIẾP THEO (Adaptive) ---
exports.generateNextWeek = async (req, res) => {
    const userId = req.user.id;
    const { currentWeek, feedback } = req.body; // feedback: "easy", "medium", "hard"

    try {
        // 1. Lấy lộ trình hiện tại từ DB
        const [rows] = await pool.query(
            "SELECT id, ai_data FROM user_ai_plans WHERE user_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1",
            [userId]
        );

        if (rows.length === 0) return res.status(404).json({ msg: "Không tìm thấy lộ trình." });
        
        const planId = rows[0].id;
        let aiData = rows[0].ai_data;
        if (typeof aiData === 'string') aiData = JSON.parse(aiData);

        // 2. Kiểm tra xem tuần tiếp theo đã có chưa (tránh spam)
        const nextWeekIndex = currentWeek + 1;
        const nextWeekKey = `week_${nextWeekIndex}_detail`; // Ví dụ: week_2_detail

        if (aiData[nextWeekKey]) {
            return res.json({ msg: "Tuần này đã được tạo rồi.", plan: aiData });
        }

        if (nextWeekIndex > 4) {
            return res.json({ msg: "Chúc mừng! Bạn đã hoàn thành toàn bộ lộ trình." });
        }

        // 3. Chuẩn bị Menu bài tập (như cũ)
        const exerciseMenu = await getExerciseMenu();

        // 4. Prompt "Thừa kế và Thích ứng"
        const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });
        const prompt = `
        Bạn là PT Gym VietLife AI. 
        Người dùng vừa hoàn thành TUẦN ${currentWeek} và đánh giá: "${feedback}".
        
        Nhiệm vụ: Tạo lịch tập chi tiết cho TUẦN ${nextWeekIndex}.

        CONTEXT CŨ (Tóm tắt):
        - Mục tiêu: ${aiData.analysis.goal_summary}
        - Lộ trình gốc: ${JSON.stringify(aiData.roadmap.find(r => r.week === nextWeekIndex))}

        YÊU CẦU ADAPTIVE:
        - Nếu user kêu "hard" (Khó) -> Giảm nhẹ volume (số sets/reps) hoặc đổi bài dễ hơn.
        - Nếu user kêu "easy" (Dễ) -> Tăng Progressive Overload (thêm sets hoặc note tăng tạ).
        - Nếu "medium" -> Giữ nguyên tiến độ tăng tiến tiêu chuẩn.

        INPUT DATABASE (Ưu tiên dùng ID này):
        ${exerciseMenu}

        OUTPUT JSON (Chỉ trả về chi tiết tuần mới):
        {
            "week_detail": [
                { 
                    "day": "Thứ 2", 
                    "focus": "...", 
                    "exercises": [ 
                        { "exercise_id": 123, "name": "...", "sets": "...", "reps": "...", "note": "..." } 
                    ] 
                }
                // ... đủ 7 ngày
            ]
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Parse JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return res.status(500).json({ msg: "AI lỗi định dạng." });
        let newWeekData = JSON.parse(jsonMatch[0]);

        // Hydrate (Lấy video thật)
        // Lưu ý: Hàm hydrate cũ của bạn đang hardcode 'week_1_detail', cần sửa nhẹ hàm hydrate để nhận mảng generic
        // Nhưng để nhanh, ta làm thủ công ở đây hoặc tái sử dụng logic hydrate:
        const tempObj = { week_1_detail: newWeekData.week_detail }; // Hack nhẹ để dùng lại hàm hydrate cũ
        const hydratedTemp = await hydratePlanWithRealData(tempObj);
        newWeekData.week_detail = hydratedTemp.week_1_detail;

        // 5. Cập nhật vào JSON gốc và Lưu DB
        aiData[nextWeekKey] = newWeekData.week_detail;
        
        // Update DB
        await pool.query(
            "UPDATE user_ai_plans SET ai_data = ? WHERE id = ?",
            [JSON.stringify(aiData), planId]
        );

        res.json({ msg: `Đã mở khóa Tuần ${nextWeekIndex}`, plan: aiData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Lỗi tạo tuần mới" });
    }
};

// --- 4. HÀM ĐỔI MÓN ĂN (Regenerate Meal) ---
exports.regenerateMeal = async (req, res) => {
    try {
        const { oldMealName, mealType, calories } = req.body;

        // Validation cơ bản
        if (!oldMealName || !mealType) {
            return res.status(400).json({ msg: "Thiếu thông tin món ăn cần đổi." });
        }

        const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });

        const prompt = `
        Tôi đang theo chế độ ăn kiêng tập gym.
        Món hiện tại: "${oldMealName}" (${mealType}, khoảng ${calories}).
        Tôi không thích món này hoặc muốn đổi vị.
        
        Hãy gợi ý 1 món ăn khác thay thế (cùng lượng calo và dinh dưỡng tương đương).
        
        OUTPUT JSON ONLY:
        {
            "meal": {
                "name": "Tên món mới",
                "info": "Lý do tốt (VD: Giàu đạm hơn, dễ nấu hơn...)"
            }
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Xử lý JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return res.status(500).json({ msg: "AI lỗi định dạng." });
        
        const data = JSON.parse(jsonMatch[0]);

        return res.json({ 
            msg: "Đổi món thành công", 
            meal: data.meal 
        });

    } catch (error) {
        console.error("Lỗi đổi món:", error);
        return res.status(500).json({ msg: "Lỗi server khi đổi món." });
    }
};

// --- 5. HÀM KÍCH HOẠT LỘ TRÌNH (Bắt đầu tập từ hôm nay) ---
exports.activatePlan = async (req, res) => {
    const userId = req.user.id;
    // Lấy ngày hiện tại (YYYY-MM-DD)
    const today = new Date();
    // Reset giờ về 0 để tránh lỗi múi giờ khi lưu DATE
    const formattedDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000))
        .toISOString()
        .split('T')[0];

    try {
        // Cập nhật ngày bắt đầu cho lộ trình đang ACTIVE
        const [result] = await pool.query(
            "UPDATE user_ai_plans SET start_date = ? WHERE user_id = ? AND status = 'active'",
            [formattedDate, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: "Không tìm thấy lộ trình đang kích hoạt để bắt đầu." });
        }

        res.json({ msg: "Đã kích hoạt lộ trình thành công! Chúc bạn tập luyện tốt." });

    } catch (error) {
        console.error("Lỗi kích hoạt:", error);
        res.status(500).json({ msg: "Lỗi server." });
    }
};

// --- 6. HÀM LẤY BÀI TẬP HÔM NAY (Dựa trên Start Date) ---
exports.getTodayWorkout = async (req, res) => {
    const userId = req.user.id;

    try {
        // 1. Lấy lộ trình Active và Start Date
        const [rows] = await pool.query(
            "SELECT ai_data, start_date FROM user_ai_plans WHERE user_id = ? AND status = 'active' LIMIT 1",
            [userId]
        );

        if (rows.length === 0) {
            return res.json({ hasPlan: false, msg: "Chưa có lộ trình." });
        }

        const planRow = rows[0];

        // Nếu chưa kích hoạt (start_date là null)
        if (!planRow.start_date) {
            return res.json({ hasPlan: true, isStarted: false, msg: "Lộ trình chưa được kích hoạt." });
        }

        // 2. Tính toán ngày hiện tại là ngày thứ mấy
        const startDate = new Date(planRow.start_date);
        const today = new Date();
        
        // Reset giờ về 0h00 để tính chênh lệch ngày chính xác
        startDate.setHours(0,0,0,0);
        today.setHours(0,0,0,0);

        // Tính số mili-giây chênh lệch -> đổi ra ngày
        const diffTime = today - startDate; 
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // Nếu ngày hiện tại < ngày bắt đầu (vô lý nhưng cứ check)
        if (diffDays < 0) {
            return res.json({ hasPlan: true, isStarted: true, msg: "Ngày bắt đầu ở tương lai?" });
        }

        // 3. Xác định Tuần mấy - Ngày mấy
        // diffDays = 0 -> Ngày 1, Tuần 1
        // diffDays = 7 -> Ngày 1, Tuần 2
        const currentWeek = Math.floor(diffDays / 7) + 1; // Tuần 1, 2, 3, 4...
        const currentDayIndex = diffDays % 7; // 0 = Thứ 2 (hoặc ngày đầu tiên), 6 = Chủ nhật

        // 4. Lấy dữ liệu từ JSON
        let aiData = planRow.ai_data;
        if (typeof aiData === 'string') aiData = JSON.parse(aiData);

        const weekKey = `week_${currentWeek}_detail`; // VD: week_1_detail

        // Kiểm tra xem tuần này có trong dữ liệu chưa
        if (!aiData[weekKey]) {
            // Có thể user tập nhanh hơn lộ trình được tạo (chưa generate tuần mới)
            // Hoặc đã hết lộ trình (Tuần > 4)
            return res.json({ 
                hasPlan: true, 
                isStarted: true, 
                finished: currentWeek > 4,
                msg: currentWeek > 4 ? "Bạn đã hoàn thành lộ trình!" : "Chưa có dữ liệu cho tuần này. Hãy tạo tuần mới.",
                week: currentWeek
            });
        }

        const todayExercises = aiData[weekKey][currentDayIndex];

        // 5. Trả về kết quả
        res.json({
            hasPlan: true,
            isStarted: true,
            dayInfo: {
                date: today.toISOString().split('T')[0],
                dayIndex: currentDayIndex,
                week: currentWeek,
                dayLabel: todayExercises.day // VD: "Thứ 2"
            },
            workout: todayExercises // Danh sách bài tập cụ thể của hôm nay
        });

    } catch (error) {
        console.error("Lỗi lấy bài tập hôm nay:", error);
        res.status(500).json({ msg: "Lỗi server." });
    }
};