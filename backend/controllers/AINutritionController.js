// backend/controllers/AINutritionController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { pool } = require('../config/db');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- CÁC HÀM HỖ TRỢ LẤY DATA (GIỮ NGUYÊN) ---
const getWeeklyNutritionStats = async (userId, startDateStr, endDateStr) => {
    const sql = `
        SELECT 
            DATE(meal_date) as date,
            SUM(calories) as total_calories,
            SUM(protein_g) as total_protein,
            GROUP_CONCAT(DISTINCT food_name SEPARATOR ', ') as menu_items
        FROM meal_logs
        WHERE user_id = ? AND meal_date BETWEEN ? AND ?
        GROUP BY DATE(meal_date)
    `;
    const [rows] = await pool.query(sql, [userId, startDateStr, endDateStr]);
    
    let totalCals = 0, totalP = 0;
    rows.forEach(r => { 
        totalCals += Number(r.total_calories); 
        totalP += Number(r.total_protein);
    });
    const days = rows.length || 1;

    return {
        daily_stats: rows,
        average: { calories: Math.round(totalCals/days), protein: Math.round(totalP/days) }
    };
};

const getWeeklyWorkoutStats = async (userId, startDateStr, endDateStr) => {
    const sql = `
        SELECT 
            DATE(workout_date) as date,
            SUM(calories_burned) as total_burned
        FROM workout_calo
        WHERE user_id = ? AND workout_date BETWEEN ? AND ?
        GROUP BY DATE(workout_date)
    `;
    const [rows] = await pool.query(sql, [userId, startDateStr, endDateStr]);

    let totalBurned = 0;
    rows.forEach(r => totalBurned += Number(r.total_burned));
    
    return {
        daily_stats: rows,
        average_burned_daily: Math.round(totalBurned / 7)
    };
};

// --- API CHÍNH: PHÂN TÍCH NHANH (CÓ CACHING & LOGIC MỚI) ---
exports.getQuickAnalysis = async (req, res) => {
    const userId = req.user.id;
    
    // 0. CẤU HÌNH NGÀY & CACHE
    const today = new Date().toISOString().split('T')[0]; // Key cho Cache
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6); 
    
    const endDateStr = req.query.endDate || end.toISOString().split('T')[0];
    const startDateStr = req.query.startDate || start.toISOString().split('T')[0];
    const forceRefresh = req.query.force === 'true'; // Cờ bắt buộc làm mới

    try {
        // --- BƯỚC 1: KIỂM TRA CACHE (MỚI) ---
        if (!forceRefresh) {
            const [cachedRows] = await pool.query(
                "SELECT ai_response FROM ai_daily_cache WHERE user_id = ? AND log_date = ?", 
                [userId, today]
            );

            if (cachedRows.length > 0) {
                // console.log(`[CACHE HIT] User ${userId}`);
                const cachedData = cachedRows[0].ai_response;
                // Trả về luôn, không chạy code bên dưới
                return res.json(typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData);
            }
        }

        // --- BƯỚC 2: NẾU KHÔNG CÓ CACHE -> TÍNH TOÁN ---
        
        // 2.1. LẤY DỮ LIỆU TỪ DB
        const [userRows] = await pool.query("SELECT * FROM health_profiles WHERE user_id = ?", [userId]);
        if (userRows.length === 0) return res.status(404).json({ msg: "Chưa có hồ sơ." });
        const profile = userRows[0];

        const nutritionData = await getWeeklyNutritionStats(userId, startDateStr, endDateStr);
        const workoutData = await getWeeklyWorkoutStats(userId, startDateStr, endDateStr);

        // 2.2. TÍNH TOÁN TARGET (MỤC TIÊU)
        const weight = Number(profile.weight_kg);
        let bmr = (10 * weight) + (6.25 * Number(profile.height_cm)) - (5 * Number(profile.age)) + ((profile.gender === 'male') ? 5 : -161);
        
        const activityMultipliers = {
            'sedentary': 1.2,
            'lightly_active': 1.375,
            'moderately_active': 1.55,
            'very_active': 1.725,
            'extra_active': 1.9
        };
        const multiplier = activityMultipliers[profile.activity_level] || 1.2;
        const tdee = Math.round(bmr * multiplier);
        
        const weeklyGoal = Number(profile.weekly_goal) || 0.5;
        const dailyDeficit = Math.round((weeklyGoal * 7700) / 7);
        
        let targetCalories = tdee;
        if (profile.goal === 'lose_weight') targetCalories = Math.max(tdee - dailyDeficit, 1200);
        else if (profile.goal === 'gain_muscle') targetCalories = tdee + 300;

        // 2.3. XỬ LÝ DỮ LIỆU CHI TIẾT (MAP DATA)
        let dailyMap = {};
        let currDate = new Date(startDateStr);
        const lastDate = new Date(endDateStr);
        
        while (currDate <= lastDate) {
            const dKey = currDate.toISOString().split('T')[0];
            dailyMap[dKey] = { in: 0, burn: 0, items: '', hasLog: false };
            currDate.setDate(currDate.getDate() + 1);
        }

        nutritionData.daily_stats.forEach(d => {
            const dKey = new Date(d.date).toISOString().split('T')[0];
            if (dailyMap[dKey]) {
                dailyMap[dKey].in = Number(d.total_calories);
                dailyMap[dKey].items = d.menu_items;
                dailyMap[dKey].hasLog = true;
            }
        });

        workoutData.daily_stats.forEach(d => {
            const dKey = new Date(d.date).toISOString().split('T')[0];
            if (dailyMap[dKey]) {
                dailyMap[dKey].burn = Number(d.total_burned);
                if(d.total_burned > 0) dailyMap[dKey].hasLog = true; 
            }
        });

        // 2.4. TÍNH TOÁN METRICS (LOGIC CHÍNH XÁC)
        let totalNet = 0;
        let countDays = 0;
        let totalIn = 0;
        let totalBurn = 0;

        // Chỉ tính trung bình trên những ngày CÓ DỮ LIỆU
        Object.values(dailyMap).forEach(day => {
            if (day.hasLog) { 
                totalNet += (day.in - day.burn);
                totalIn += day.in;
                totalBurn += day.burn; 
                countDays++;
            }
        });

        // Tránh chia cho 0
        const avgNet = countDays > 0 ? Math.round(totalNet / countDays) : 0;
        const avgIn = countDays > 0 ? Math.round(totalIn / countDays) : 0;
        const avgBurn = countDays > 0 ? Math.round(totalBurn / countDays) : 0;
        
        const netDiff = avgNet - targetCalories;
        const proteinPerKg = (nutritionData.average.protein / weight).toFixed(1);
        const workoutDays = workoutData.daily_stats.filter(d => Number(d.total_burned) > 50).length;
        // Đếm số ngày quên log
        let missingCount = 0;
        const todayStr = new Date().toISOString().split('T')[0]; // Lấy ngày hiện tại YYYY-MM-DD

        Object.entries(dailyMap).forEach(([dateKey, day]) => { 
            // Chỉ coi là "Quên" nếu không có log VÀ ngày đó nhỏ hơn ngày hôm nay
            // (Tức là ngày hôm qua trở về trước)
            if (!day.hasLog && dateKey < todayStr) {
                missingCount++; 
            }
        });

        // Tạo log text
        const dailyLogText = Object.entries(dailyMap).map(([date, data]) => {
            const dStr = new Date(date).toLocaleDateString('vi-VN', {weekday: 'short', day:'2-digit', month:'2-digit'});
            if (!data.hasLog) return `- ${dStr}: [QUÊN NHẬP LIỆU]`;
            
            const dailyNet = data.in - data.burn;
            const dailyDiff = dailyNet - targetCalories;
            
            let dayStatus = "OK";
            if (dailyDiff > 250) dayStatus = "DƯ_NHIỀU";
            else if (dailyDiff < -300) dayStatus = "THIẾU_NHIỀU";
            
            const foodInfo = data.items ? `| Món: ${data.items}` : "";
            return `- ${dStr}: Net ${dailyNet} (${dayStatus}) ${foodInfo}`;
        }).join('\n');

        let activityLevel = "ÍT"; 
        if (workoutDays >= 3) activityLevel = "ĐỀU";
        
        let proteinStatus = "THIẾU";
        if (Number(proteinPerKg) >= 1.2) proteinStatus = "ĐỦ";

        let caloStatus = "CHUẨN (Đạt mục tiêu)";
        if (netDiff > 250) caloStatus = "DƯ (Vượt quá mức cho phép)"; 
        else if (netDiff < -250) caloStatus = "THIẾU (Cần nạp thêm)";
        
        // 3. TẠO PROMPT (ĐÃ BỔ SUNG avgIn/avgBurn)
        const prompt = `
            Bạn là PT AI Cá nhân hóa (Phong cách: Thấu hiểu, Động viên, Tích cực, nhưng Thẳng thắn về chất lượng đồ ăn).

            DỮ LIỆU TỔNG QUAN (Quan trọng):
            - Mục tiêu (Target Net): ${targetCalories} kcal
            - Thực tế (Actual Net): ${avgNet} kcal
            --> CHI TIẾT CẤU THÀNH: Ăn vào TB ${avgIn} kcal - Tập luyện TB ${avgBurn} kcal
            --> ĐÁNH GIÁ CALO: ${caloStatus} (Tuyệt đối tin tưởng đánh giá này. Nếu là CHUẨN, không được nói khách hàng ăn dư calo).
            - Tần suất tập: ${workoutDays}/7 ngày (Trạng thái: ${activityLevel})
            - Protein: ${proteinPerKg} g/kg (Trạng thái: ${proteinStatus})
            - Số ngày quên nhập liệu: ${missingCount} ngày (Nếu > 3 ngày, hãy nhắc nhở nhẹ ở cuối lời khuyên).
            NHẬT KÝ CHI TIẾT:
            ${dailyLogText}

            HÃY CHỌN 1 TRONG CÁC KỊCH BẢN SAU ĐỂ TƯ VẤN:

            1. "SKINNY FAT" (Nhịn ăn tiêu cực): Tập ÍT + Calo THIẾU.
            -> Cảnh báo mất cơ, người lỏng lẻo. Khuyên đi tập ngay.
            2. "LƯỜI BIẾNG TÍCH MỠ" (Couch Potato): Tập ÍT + Calo DƯ.
            -> Cảnh báo béo bụng. Khuyên vận động nhẹ ngay (đi bộ).
            3. [DIRTY MAINTAIN] (Tập khỏe ăn bậy): Tập ĐỀU + Calo CHUẨN + Nhưng ăn đồ kém healthy (Cơm chiên, đồ ngọt, nhiều dầu mỡ...).
            -> Nhận xét: "Bạn cân bằng calo rất giỏi nhờ tập luyện chăm chỉ (Net Calorie đã đạt chuẩn). TUY NHIÊN, chất lượng đồ ăn chưa tốt."
            -> Cảnh báo: Ăn đủ calo nhưng toàn đường/mỡ xấu sẽ khó lên cơ, dễ tích mỡ bụng dù cân nặng không đổi.
            4. [CÔNG CỐC]: Tập ĐỀU + Calo DƯ (Vượt quá 250kcal so với target).
            -> Nhận xét: "Tập rất hăng nhưng ăn bù quá đà."
            5. [THIẾU CHẤT]: Tập ĐỀU + Calo CHUẨN/THIẾU + Protein THIẾU.
            -> Khen tập chăm nhưng cảnh báo chai cơ. Khuyên ăn thêm thịt/trứng.
            6. [XUẤT SẮC]: Tập ĐỀU + Calo CHUẨN + Protein ĐỦ + Ăn sạch.
            -> Tôn vinh lối sống lành mạnh hoàn hảo.
            7. [BÌNH THƯỜNG]: Các trường hợp còn lại.
            -> Nhận xét nhẹ nhàng, khuyên duy trì hoặc cải thiện nhẹ.

            YÊU CẦU OUTPUT:
            - Nếu rơi vào [DIRTY MAINTAIN]: Hãy khen ngợi nỗ lực tập luyện đã "cứu" lại được lượng calo nạp vào. Sau đó khuyên thay đổi món ăn để body đẹp hơn (VD: "Calo thì ổn rồi, nhưng thay Cơm chiên bằng Khoai lang thì cơ bắp sẽ nét hơn").
            - **message**: Viết 2-3 câu nhận xét theo giọng văn người bạn. 
                + BẮT BUỘC: Phải nhắc đến **tên món ăn** hoặc **ngày cụ thể** trong log để chứng minh nhận định.
                + Nếu là Kịch bản xấu (1,2,3,4): Đừng mắng, hãy động viên quay lại đường đua.
            - **action**: Một hành động cụ thể cho ngày mai.
            - **footer**: "Nếu có gì thắc mắc cần giải thích thêm, bạn hãy hỏi Trợ lý sức khỏe nhé!"

            OUTPUT FORMAT (JSON ONLY):
            {
                "scenario": "Tên kịch bản",
                "message": "...",
                "action": "...",
                "footer": "..."
            }
        `;

        // 4. GỌI GEMINI
        const model = genAI.getGenerativeModel({model: process.env.GEMINI_MODEL || "gemini-pro"});
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        let aiResult;
        try {
            const jsonMatch = response.text().match(/\{[\s\S]*\}/);
            aiResult = JSON.parse(jsonMatch[0]);
        } catch (e) {
            console.error("Lỗi parse JSON:", e);
            aiResult = {
                scenario: "Lỗi hiển thị",
                message: "Hệ thống đang bận, vui lòng thử lại sau.",
                action: "Kiểm tra lại nhật ký.",
                footer: "..."
            };
        }

        // --- BƯỚC 3: LƯU VÀO CACHE (MỚI) ---
        try {
            // Lưu kết quả vào DB để lần sau dùng lại
            const query = `
                INSERT INTO ai_daily_cache (user_id, log_date, ai_response, created_at) 
                VALUES (?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE ai_response = VALUES(ai_response), created_at = NOW()
            `;
            await pool.query(query, [userId, today, JSON.stringify(aiResult)]);
        } catch (cacheError) {
            console.error("Lỗi lưu Cache:", cacheError);
        }

        // Trả về kết quả
        res.json(aiResult);

    } catch (error) {
        console.error("Lỗi Quick Insight:", error);
        res.status(500).json({ msg: "Lỗi Server" });
    }
};