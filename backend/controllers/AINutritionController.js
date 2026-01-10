// backend/controllers/AINutritionController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { pool } = require('../config/db');

// Khởi tạo Gemini (giống AIPlanController.js)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- 1. Hàm Hỗ Trợ: Lấy dữ liệu ăn uống tuần qua ---
const getWeeklyNutritionStats = async (userId) => {
    // Tính ngày bắt đầu (7 ngày trước) và hôm nay
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);

    const endDateStr = end.toISOString().split('T')[0];
    const startDateStr = start.toISOString().split('T')[0];

   // Query tổng hợp từ bảng meal_logs
    const sql = `
        SELECT 
            DATE(meal_date) as date,
            SUM(calories) as total_calories,
            SUM(protein_g) as total_protein,
            SUM(fats_g) as total_fat,
            SUM(carbs_g) as total_carb,
            SUM(fiber_g) as total_fiber,
            COUNT(id) as meal_count
        FROM meal_logs
        WHERE user_id = ? AND meal_date BETWEEN ? AND ?
        GROUP BY DATE(meal_date)
    `;

    const [rows] = await pool.query(sql, [userId, startDateStr, endDateStr]);

    // Tính trung bình
    let totalCals = 0, totalP = 0, totalF = 0, totalC = 0;
    
    rows.forEach(row => {
        // [QUAN TRỌNG] Ép kiểu sang Number để tránh lỗi nối chuỗi
        // Nếu database trả về null hoặc chuỗi rỗng thì tính là 0
        totalCals += Number(row.total_calories || 0);
        totalP += Number(row.total_protein || 0);
        totalF += Number(row.total_fat || 0);
        totalC += Number(row.total_carb || 0);
    });

    const days = rows.length || 1; // Tránh chia cho 0

    return {
        range: { start: startDateStr, end: endDateStr },
        daily_stats: rows, 
        average: {
            // Làm tròn số để đẹp
            calories: Math.round(totalCals / days),
            protein: Math.round(totalP / days),
            fat: Math.round(totalF / days),
            carbs: Math.round(totalC / days)
        }
    };
};

exports.analyzeNutrition = async (req, res) => {
    const userId = req.user.id;

    try {
        // 1. Lấy thông tin User
        const [userRows] = await pool.query("SELECT * FROM health_profiles WHERE user_id = ?", [userId]);
        if (userRows.length === 0) return res.status(404).json({ msg: "Chưa có hồ sơ sức khỏe." });
        const profile = userRows[0];

        // 2. Tính toán dữ liệu ăn uống hiện tại
        const nutritionData = await getWeeklyNutritionStats(userId);
        
        if (nutritionData.daily_stats.length === 0) {
            return res.status(400).json({ msg: "Chưa có dữ liệu ăn uống để phân tích." });
        }

        // =========================================================
        // [MỚI] BƯỚC KIỂM TRA TRÙNG LẶP (CACHE LOGIC)
        // =========================================================
        
        // Lấy báo cáo mới nhất của user này
        const [existingReviews] = await pool.query(
            "SELECT * FROM nutrition_reviews WHERE user_id = ? ORDER BY id DESC LIMIT 1",
            [userId]
        );

        if (existingReviews.length > 0) {
            const lastReview = existingReviews[0];
            
            // Parse dữ liệu snapshot cũ từ DB ra object
            // (MySQL lưu JSON đôi khi trả về string, cần parse)
            let lastSnapshot = lastReview.input_snapshot;
            if (typeof lastSnapshot === 'string') {
                lastSnapshot = JSON.parse(lastSnapshot);
            }

            // So sánh dữ liệu hiện tại với dữ liệu lúc tạo báo cáo cũ
            const currentStats = nutritionData.average;
            
            const isDataUnchanged = 
                lastSnapshot.calories === currentStats.calories &&
                lastSnapshot.protein === currentStats.protein &&
                lastSnapshot.fat === currentStats.fat &&
                lastSnapshot.carbs === currentStats.carbs;

            // Nếu dữ liệu Y HỆT nhau -> Trả về kết quả cũ luôn (Không gọi AI)
            if (isDataUnchanged) {
                console.log("♻️ Dữ liệu không đổi, trả về báo cáo cũ.");
                
                // Parse nội dung AI cũ để trả về đúng format JSON
                let oldAiContent = lastReview.ai_content;
                if (typeof oldAiContent === 'string') {
                    oldAiContent = JSON.parse(oldAiContent);
                }

                return res.json({
                    msg: "Dữ liệu không thay đổi, hiển thị kết quả cũ.",
                    result: oldAiContent,
                    data_snapshot: lastSnapshot,
                    is_cached: true // Cờ để Frontend biết đây là data cũ
                });
            }
        }
        // =========================================================
        // HẾT PHẦN KIỂM TRA - NẾU DỮ LIỆU KHÁC THÌ CHẠY TIẾP BÊN DƯỚI
        // =========================================================

        const goals = {
            lose_weight: "Giảm cân (Giảm mỡ)",
            gain_muscle: "Tăng cơ bắp",
            maintain: "Duy trì",
            toned: "Săn chắc"
        };
        const userGoal = goals[profile.goal_body] || profile.goal_body;

        const prompt = `
        Đóng vai một Huấn luyện viên dinh dưỡng (PT) chuyên nghiệp.
        
        THÔNG TIN HỌC VIÊN:
        - Mục tiêu: ${userGoal}
        - Cân nặng: ${profile.weight_kg}kg
        - TDEE: ${profile.tdee || 'Không rõ'}

        DỮ LIỆU TRUNG BÌNH 7 NGÀY:
        - Calo: ${nutritionData.average.calories} kcal
        - Protein: ${nutritionData.average.protein}g
        - Carbs: ${nutritionData.average.carbs}g
        - Fat: ${nutritionData.average.fat}g

        YÊU CẦU:
        Phân tích ngắn gọn, súc tích.
        
        OUTPUT FORMAT (JSON ONLY):
        {
            "score": 0-100,
            "headline": "Tiêu đề ngắn",
            "analysis": {
                "calories_comment": "...",
                "macro_comment": "...",
                "habit_warning": "..."
            },
            "action_plan": ["Hành động 1", "Hành động 2", "Hành động 3"],
            "pt_message": "..."
        }
        `;

        // [MẸO] Set temperature = 0 để giảm tính ngẫu nhiên của AI
        const generationConfig = {
            temperature: 0.2, // Càng thấp càng ổn định (ít sáng tạo bay bổng)
            topP: 0.8,
            topK: 40,
        };

        const model = genAI.getGenerativeModel({ 
            model: process.env.GEMINI_MODEL || "gemini-pro",
            generationConfig: generationConfig 
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return res.status(500).json({ msg: "Lỗi định dạng AI." });
        
        const aiResult = JSON.parse(jsonMatch[0]);

        const sqlInsert = `
            INSERT INTO nutrition_reviews 
            (user_id, start_date, end_date, score, headline, input_snapshot, ai_content)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        await pool.query(sqlInsert, [
            userId,
            nutritionData.range.start,
            nutritionData.range.end,
            aiResult.score,
            aiResult.headline,
            JSON.stringify(nutritionData.average),
            JSON.stringify(aiResult)
        ]);

        res.json({ 
            msg: "Đã tạo phân tích mới.", 
            result: aiResult,
            data_snapshot: nutritionData.average,
            is_cached: false
        });

    } catch (error) {
        console.error("Lỗi AI Controller:", error);
        res.status(500).json({ msg: "Lỗi server.", error: error.message });
    }
};

// --- 3. API Lấy lịch sử báo cáo ---
exports.getReviewHistory = async (req, res) => {
    const userId = req.user.id;
    try {
        const [rows] = await pool.query(
            "SELECT * FROM nutrition_reviews WHERE user_id = ? ORDER BY created_at DESC", 
            [userId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ msg: "Lỗi lấy lịch sử." });
    }
};