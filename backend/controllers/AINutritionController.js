// backend/controllers/AINutritionController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { pool } = require('../config/db');
require('dotenv').config();

// Khởi tạo Gemini
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
            COUNT(id) as meal_count,
            GROUP_CONCAT(food_name SEPARATOR ', ') as menu_items
        FROM meal_logs
        WHERE user_id = ? AND meal_date BETWEEN ? AND ?
        GROUP BY DATE(meal_date)
    `;

    const [rows] = await pool.query(sql, [userId, startDateStr, endDateStr]);

    // Tính trung bình
    let totalCals = 0, totalP = 0, totalF = 0, totalC = 0;
    
    rows.forEach(row => {
        // [QUAN TRỌNG] Ép kiểu sang Number để tránh lỗi nối chuỗi hoặc e+27
        totalCals += Number(row.total_calories || 0);
        totalP += Number(row.total_protein || 0);
        totalF += Number(row.total_fat || 0);
        totalC += Number(row.total_carb || 0);
    });

    const days = rows.length || 1; // Tránh chia cho 0 nếu không có dữ liệu

    return {
        range: { start: startDateStr, end: endDateStr },
        daily_stats: rows, // Dữ liệu chi tiết từng ngày
        logged_days: rows.length, // Số ngày thực tế có nhập liệu
        average: {
            // Làm tròn số để đẹp
            calories: Math.round(totalCals / days),
            protein: Math.round(totalP / days),
            fat: Math.round(totalF / days),
            carbs: Math.round(totalC / days)
        }
    };
};

// --- 2. API Chính: Phân tích dinh dưỡng ---
exports.analyzeNutrition = async (req, res) => {
    const userId = req.user.id;

    try {
        // A. Lấy thông tin User (Profile)
        const [userRows] = await pool.query("SELECT * FROM health_profiles WHERE user_id = ?", [userId]);
        if (userRows.length === 0) return res.status(404).json({ msg: "Chưa có hồ sơ sức khỏe. Vui lòng cập nhật hồ sơ trước." });
        const profile = userRows[0];

        // B. Lấy dữ liệu ăn uống
        const nutritionData = await getWeeklyNutritionStats(userId);
        
        if (nutritionData.daily_stats.length === 0) {
            return res.status(400).json({ msg: "Bạn chưa nhập nhật ký ăn uống nào trong 7 ngày qua." });
        }

        // =========================================================
        // [LOGIC MỚI] KIỂM TRA CACHE (Tránh gọi AI nếu dữ liệu không đổi)
        // =========================================================
        const [existingReviews] = await pool.query(
            "SELECT * FROM nutrition_reviews WHERE user_id = ? ORDER BY id DESC LIMIT 1",
            [userId]
        );

        if (existingReviews.length > 0) {
            const lastReview = existingReviews[0];
            
            // Parse dữ liệu snapshot cũ
            let lastSnapshot = lastReview.input_snapshot;
            if (typeof lastSnapshot === 'string') {
                try { lastSnapshot = JSON.parse(lastSnapshot); } catch(e) {}
            }

            // So sánh dữ liệu trung bình hiện tại với lần trước
            const currentStats = nutritionData.average;
            
            const isDataUnchanged = 
                lastSnapshot &&
                lastSnapshot.calories === currentStats.calories &&
                lastSnapshot.protein === currentStats.protein &&
                lastSnapshot.fat === currentStats.fat;

            if (isDataUnchanged) {
                console.log("♻️ Dữ liệu không đổi, trả về kết quả cũ.");
                
                let oldAiContent = lastReview.ai_content;
                if (typeof oldAiContent === 'string') {
                    try { oldAiContent = JSON.parse(oldAiContent); } catch(e) {}
                }

                return res.json({
                    msg: "Dữ liệu không thay đổi, hiển thị kết quả cũ.",
                    result: oldAiContent,
                    data_snapshot: lastSnapshot,
                    is_cached: true 
                });
            }
        }
        // =========================================================

        // C. Chuẩn bị dữ liệu gửi cho AI
        const goals = {
            lose_weight: "Giảm cân (Giảm mỡ)",
            gain_muscle: "Tăng cơ bắp",
            maintain: "Duy trì cân nặng",
            toned: "Săn chắc cơ thể"
        };
        const userGoal = goals[profile.goal] || profile.goal;

        // [NÂNG CẤP 1] Tự động tính TDEE nếu DB chưa có (Công thức Mifflin-St Jeor)
        let calculatedTDEE = Number(profile.tdee);
        if (!calculatedTDEE) {
            const weight = Number(profile.weight_kg) || 70;
            const height = Number(profile.height_cm) || 170;
            const age = Number(profile.age) || 25;
            const gender = profile.gender || 'male';
            
            // BMR = 10W + 6.25H - 5A + (5 nam / -161 nữ)
            let bmr = (10 * weight) + (6.25 * height) - (5 * age);
            bmr += (gender === 'male') ? 5 : -161;

            // Hệ số vận động (Mapping từ ENUM trong DB)
            const activityMap = {
                'sedentary': 1.2,
                'lightly_active': 1.375,
                'moderately_active': 1.55,
                'very_active': 1.725,
                'extra_active': 1.9
            };
            const multiplier = activityMap[profile.activity_level] || 1.2;
            
            calculatedTDEE = Math.round(bmr * multiplier);
        }

        // [NÂNG CẤP 2] Tính toán chênh lệch để AI biết đường so sánh
        const avgCalories = nutritionData.average.calories;
        const diff = avgCalories - calculatedTDEE;
        const diffStatus = diff > 0 
            ? `Dư thừa ${diff} kcal (Tăng cân)` 
            : `Thâm hụt ${Math.abs(diff)} kcal (Giảm cân)`;

        // [NÂNG CẤP 3] Tạo chuỗi báo cáo chi tiết từng ngày
        let dailyBreakdown = nutritionData.daily_stats.map(day => {
            const dateStr = new Date(day.date).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'});
            return `- Ngày ${dateStr} (${Number(day.total_calories).toFixed(0)} kcal): ${day.menu_items}`;
        }).join('\n');

        const prompt = `
        Đóng vai một Huấn luyện viên dinh dưỡng (PT) chuyên nghiệp. 
        Phong cách: Nghiêm túc, thẳng thắn dựa trên số liệu, nhưng luôn mang tinh thần khích lệ, động viên và "thấu tình đạt lý". 
        Tuyệt đối KHÔNG dùng lời lẽ đe dọa, xúc phạm hay quá gay gắt (như dọa chấm dứt hợp đồng).
        
        THÔNG TIN HỌC VIÊN:
        - Mục tiêu: ${userGoal}
        - Cân nặng hiện tại: ${profile.weight_kg} kg
        - TDEE (Mức tiêu hao năng lượng chuẩn): ${calculatedTDEE} kcal/ngày
        - Thực tế ăn trung bình: ${avgCalories} kcal/ngày
        - Trạng thái hiện tại: Đang ${diffStatus} so với TDEE.

        DỮ LIỆU ĂN UỐNG CHI TIẾT 7 NGÀY QUA:
        - Số ngày có ghi chép: ${nutritionData.logged_days}/7 ngày
        - Macro trung bình: Protein ${nutritionData.average.protein}g, Carbs ${nutritionData.average.carbs}g, Fat ${nutritionData.average.fat}g
        
        CHI TIẾT THỰC ĐƠN TỪNG NGÀY:
        ${dailyBreakdown}

        YÊU CẦU PHÂN TÍCH BẮT BUỘC:
        1. SO SÁNH THỰC TẾ vs MỤC TIÊU:
           - Dựa vào chênh lệch TDEE và Calo nạp vào, hãy phán đoán xem học viên có đang đi đúng hướng với mục tiêu "${userGoal}" không.
           - Nếu mục tiêu là Giảm cân mà đang Dư thừa Calo: Phê bình thẳng thắn.
           - Nếu mục tiêu là Tăng cơ mà đang Thâm hụt Calo hoặc thiếu Protein: Cảnh báo nghiêm trọng.

        2. TÌM "THỦ PHẠM":
            - Dựa vào danh sách món ăn, hãy chỉ ra cụ thể món nào là nguyên nhân gây dư thừa Calo hoặc thiếu Protein.
            - Ví dụ: "Ngày 05/01 bạn nạp quá nhiều vì có món 'Trà sữa trân châu' và 'Cơm chiên'".
            - Nếu thấy ăn quá nhiều tinh bột xấu (Cơm, Bánh mì, Đường), hãy cảnh báo.

        3. LỜI KHUYÊN CỤ THỂ (ACTIONABLE):
           - Không nói chung chung như "hãy ăn đủ chất".
           - Hãy nói cụ thể: "Bạn đang thiếu 40g Protein, hãy ăn thêm 200g ức gà hoặc uống 1 scoop Whey".
           - Đưa ra giải pháp thay thế món ăn. (VD: "Thay vì ăn Cơm Tấm vào bữa sáng, hãy thử Phở Bò ít bánh nhiều thịt").

        OUTPUT FORMAT (JSON ONLY - Tiếng Việt):
        {
            "score": 0-100,
            "headline": "Tiêu đề ngắn, gây ấn tượng mạnh (VD: Cảnh báo: Bạn đang phá hủy cơ bắp!)",
            "analysis": {
                "calories_comment": "Nhận xét về mức năng lượng nạp vào so với TDEE.",
                "macro_comment": "Đánh giá chi tiết tỷ lệ Đạm/Tinh bột/Béo.",
                "habit_warning": "Cảnh báo thói quen xấu cụ thể dựa trên dữ liệu ngày."
            },
            "action_plan": ["Hành động 1", "Hành động 2", "Hành động 3"],
            "pt_message": "Lời nhắn nhủ tâm huyết từ PT..."
        }
        `;

        // D. Gọi Google Gemini
        const model = genAI.getGenerativeModel({ 
            model: process.env.GEMINI_MODEL || "gemini-pro",
            generationConfig: { temperature: 0.3 } // Giảm độ sáng tạo để phân tích chính xác hơn
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // E. Xử lý kết quả JSON từ AI
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return res.status(500).json({ msg: "AI trả về lỗi định dạng." });
        
        const aiResult = JSON.parse(jsonMatch[0]);

        // F. Lưu vào Database
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

        // G. Trả về Client
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