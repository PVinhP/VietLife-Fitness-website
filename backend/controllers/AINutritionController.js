// backend/controllers/AINutritionController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { pool } = require('../config/db');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- CÁC HÀM HỖ TRỢ LẤY DATA (Copy từ code cũ hoặc dùng lại) ---
// Hàm 1: Lấy dữ liệu ăn uống (Kèm tên món ăn)
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
    
    // Tính trung bình (cho phần tổng quan)
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

// Hàm 2: Lấy dữ liệu tập luyện
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
        average_burned_daily: Math.round(totalBurned / 7) // Chia 7 để lấy trung bình tuần
    };
};

// --- API CHÍNH: PHÂN TÍCH NHANH (7 KỊCH BẢN) ---
exports.getQuickAnalysis = async (req, res) => {
    const userId = req.user.id;
    // Mặc định lấy 7 ngày gần nhất
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6); 
    
    const endDateStr = req.query.endDate || end.toISOString().split('T')[0];
    const startDateStr = req.query.startDate || start.toISOString().split('T')[0];

    try {
        // 1. LẤY DỮ LIỆU TỪ DB
        const [userRows] = await pool.query("SELECT * FROM health_profiles WHERE user_id = ?", [userId]);
        if (userRows.length === 0) return res.status(404).json({ msg: "Chưa có hồ sơ." });
        const profile = userRows[0];

        const nutritionData = await getWeeklyNutritionStats(userId, startDateStr, endDateStr);
        const workoutData = await getWeeklyWorkoutStats(userId, startDateStr, endDateStr);

        // 2. TÍNH TOÁN TARGET (MỤC TIÊU)
        const weight = Number(profile.weight_kg);
        // Công thức Mifflin-St Jeor
        let bmr = (10 * weight) + (6.25 * Number(profile.height_cm)) - (5 * Number(profile.age)) + ((profile.gender === 'male') ? 5 : -161);
        //const tdee = Math.round(bmr * 1.2); // Base TDEE (ít vận động)
        const activityMultipliers = {
            'sedentary': 1.2,
            'lightly_active': 1.375,
            'moderately_active': 1.55,
            'very_active': 1.725,
            'extra_active': 1.9
        };
        // Lấy level từ profile, nếu không có thì mặc định 1.2
        const multiplier = activityMultipliers[profile.activity_level] || 1.2;
        const tdee = Math.round(bmr * multiplier);
        // Tính Target dựa trên Goal
        const weeklyGoal = Number(profile.weekly_goal) || 0.5;
        const dailyDeficit = Math.round((weeklyGoal * 7700) / 7);
        
        let targetCalories = tdee;
        if (profile.goal === 'lose_weight') targetCalories = Math.max(tdee - dailyDeficit, 1200);
        else if (profile.goal === 'gain_muscle') targetCalories = tdee + 300;

        // 3. XỬ LÝ DỮ LIỆU CHI TIẾT (Lấp đầy ngày trống & Map món ăn)
        let dailyMap = {};
        let currDate = new Date(startDateStr);
        const lastDate = new Date(endDateStr);
        
        // Tạo khung ngày liên tục
        while (currDate <= lastDate) {
            const dKey = currDate.toISOString().split('T')[0];
            dailyMap[dKey] = { in: 0, burn: 0, items: '', hasLog: false };
            currDate.setDate(currDate.getDate() + 1);
        }

        // Fill dữ liệu Ăn
        nutritionData.daily_stats.forEach(d => {
            const dKey = new Date(d.date).toISOString().split('T')[0];
            if (dailyMap[dKey]) {
                dailyMap[dKey].in = Number(d.total_calories);
                dailyMap[dKey].items = d.menu_items;
                dailyMap[dKey].hasLog = true;
            }
        });

        // Fill dữ liệu Tập
        workoutData.daily_stats.forEach(d => {
            const dKey = new Date(d.date).toISOString().split('T')[0];
            if (dailyMap[dKey]) {
                dailyMap[dKey].burn = Number(d.total_burned);
                if(d.total_burned > 0) dailyMap[dKey].hasLog = true; 
            }
        });

        // 4. TÍNH TOÁN CÁC CHỈ SỐ PHÂN LOẠI (METRICS)
        // 4. TÍNH TOÁN CÁC CHỈ SỐ PHÂN LOẠI (METRICS) - ĐÃ SỬA
        
        // -- [CODE CŨ BỊ LỖI] --
        // const avgIn = nutritionData.average.calories || 0;
        // const avgBurn = workoutData.average_burned_daily || 0;
        // const avgNet = avgIn - avgBurn;

        // -- [CODE MỚI CHÍNH XÁC HƠN] --
        // 4. TÍNH TOÁN CÁC CHỈ SỐ PHÂN LOẠI (METRICS)
        let totalNet = 0;
        let countDays = 0;
        let totalIn = 0;
        let totalBurn = 0; // <--- Thêm biến này

        // Duyệt qua dailyMap
        Object.values(dailyMap).forEach(day => {
            if (day.hasLog) { 
                totalNet += (day.in - day.burn);
                totalIn += day.in;
                totalBurn += day.burn; // <--- Cộng dồn calo tập
                countDays++;
            }
        });

        // Tính trung bình
        const avgNet = countDays > 0 ? Math.round(totalNet / countDays) : 0;
        const avgIn = countDays > 0 ? Math.round(totalIn / countDays) : 0;
        const avgBurn = countDays > 0 ? Math.round(totalBurn / countDays) : 0; // <--- Tính trung bình tập
        
        // Các chỉ số còn lại giữ nguyên
        const netDiff = avgNet - targetCalories;
        const proteinPerKg = (nutritionData.average.protein / weight).toFixed(1);
        
        
        // Đếm số ngày tập (Chỉ tính ngày tập > 50kcal)
        const workoutDays = workoutData.daily_stats.filter(d => Number(d.total_burned) > 50).length;
        
        // Đếm số ngày quên log
        let missingCount = 0;
        Object.values(dailyMap).forEach(d => { if(!d.hasLog) missingCount++; });

        // Tạo chuỗi Log text chi tiết để gửi AI
        const dailyLogText = Object.entries(dailyMap).map(([date, data]) => {
            const dStr = new Date(date).toLocaleDateString('vi-VN', {weekday: 'short', day:'2-digit', month:'2-digit'});
            
            if (!data.hasLog) return `- ${dStr}: [QUÊN NHẬP LIỆU]`;

            const dailyNet = data.in - data.burn;
            const dailyDiff = dailyNet - targetCalories;
            
            // Tag trạng thái từng ngày để AI dễ soi
            let dayStatus = "OK";
            if (dailyDiff > 250) dayStatus = "DƯ_NHIỀU";
            else if (dailyDiff < -300) dayStatus = "THIẾU_NHIỀU";
            
            const foodInfo = data.items ? `| Món: ${data.items}` : "";
            return `- ${dStr}: Net ${dailyNet} (${dayStatus}) ${foodInfo}`;
        }).join('\n');

        // Xác định sơ bộ trạng thái để gửi vào Prompt (Gợi ý cho AI)
        let activityLevel = "ÍT"; 
        if (workoutDays >= 3) activityLevel = "ĐỀU";
        
        let proteinStatus = "THIẾU";
        if (Number(proteinPerKg) >= 1.2) proteinStatus = "ĐỦ";

        let caloStatus = "CHUẨN (Đạt mục tiêu)";
        if (netDiff > 250) caloStatus = "DƯ (Vượt quá mức cho phép)"; // Nới lỏng lên 250
        else if (netDiff < -250) caloStatus = "THIẾU (Cần nạp thêm)";
        

        const prompt = `
            Bạn là PT AI Cá nhân hóa (Phong cách: Thấu hiểu, Động viên, Tích cực, nhưng Thẳng thắn về chất lượng đồ ăn).

            DỮ LIỆU TỔNG QUAN (Quan trọng):
            - Mục tiêu (Target Net): ${targetCalories} kcal
            - Thực tế (Actual Net): ${avgNet} kcal
            --> CHI TIẾT CẤU THÀNH: Ăn vào TB ${avgIn} kcal - Tập luyện TB ${avgBurn} kcal
            --> ĐÁNH GIÁ CALO: ${caloStatus} (Tuyệt đối tin tưởng đánh giá này. Nếu là CHUẨN, không được nói khách hàng ăn dư calo).
            - Tần suất tập: ${workoutDays}/7 ngày (Trạng thái: ${activityLevel})
            - Protein: ${proteinPerKg} g/kg (Trạng thái: ${proteinStatus})

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
                + BẮT BUỘC: Phải nhắc đến **tên món ăn** hoặc **ngày cụ thể** trong log để chứng minh nhận định (VD: "Thứ 3 ăn Bún đậu hơi lố nè", "Thứ 5 quên log uổng quá").
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
           /*} 
        // 5. PROMPT: KẾT HỢP MA TRẬN 7 KỊCH BẢN & SOI MÓN ĂN
        const prompt = `
        Bạn là PT AI Cá nhân hóa (Phong cách: Thấu hiểu, Động viên, Tích cực).
        
        DỮ LIỆU TỔNG QUAN:
        - Mục tiêu: ${profile.goal}
        - Target Net Calorie: ${targetCalories} kcal
        - Thực tế Net Calorie: ${avgNet} kcal (Trạng thái: ${caloStatus})
        - Tần suất tập: ${workoutDays}/7 ngày (Trạng thái: ${activityLevel})
        - Protein: ${proteinPerKg} g/kg (Trạng thái: ${proteinStatus})
        - Số ngày quên log: ${missingCount} ngày.

        NHẬT KÝ CHI TIẾT (Đọc kỹ để tìm nguyên nhân):
        ${dailyLogText}

        HÃY XÁC ĐỊNH TÌNH TRẠNG CỦA KHÁCH HÀNG DỰA TRÊN 7 KỊCH BẢN SAU:
        1. "SKINNY FAT" (Nhịn ăn tiêu cực): Tập ÍT + Calo THIẾU.
           -> Cảnh báo mất cơ, người lỏng lẻo. Khuyên đi tập ngay.
        2. "LƯỜI BIẾNG TÍCH MỠ" (Couch Potato): Tập ÍT + Calo DƯ.
           -> Cảnh báo béo bụng. Khuyên vận động nhẹ ngay (đi bộ).
        3. "CÔNG CỐC" (Tập khỏe ăn bậy): Tập ĐỀU + Calo DƯ.
           -> Khen tập tốt nhưng nhắc nhở cái miệng hại cái thân. Soi món ăn gây béo trong log.
        4. "THIẾU CHẤT" (Cơ đói): Tập ĐỀU + Protein THIẾU.
           -> Khen tập chăm nhưng cảnh báo chai cơ. Khuyên ăn thêm thịt/trứng.
        5. "SIẾT CƠ CHUẨN" (Pro Cutting): Tập ĐỀU + Calo THIẾU + Protein ĐỦ.
           -> Khen ngợi nhiệt liệt. Đây là chế độ giảm mỡ chuyên nghiệp.
        6. "XUẤT SẮC" (High Flux): Tập ĐỀU + Calo CHUẨN + Protein ĐỦ.
           -> Tôn vinh lối sống lành mạnh hoàn hảo.
        7. "BÌNH THƯỜNG" (Duy trì thụ động): Các trường hợp còn lại.
           -> Nhận xét nhẹ nhàng, khuyên duy trì hoặc cải thiện nhẹ.

        YÊU CẦU OUTPUT (Cần sự tinh tế và cụ thể):
        - **message**: Viết 2-3 câu nhận xét theo giọng văn người bạn. 
          + BẮT BUỘC: Phải nhắc đến **tên món ăn** hoặc **ngày cụ thể** trong log để chứng minh nhận định (VD: "Thứ 3 ăn Bún đậu hơi lố nè", "Thứ 5 quên log uổng quá").
          + Nếu là Kịch bản xấu (1,2,3,4): Đừng mắng, hãy động viên quay lại đường đua.
        - **action**: Một hành động cụ thể cho ngày mai.
        - **footer**: "Nếu có gì thắc mắc cần giải thích thêm, bạn hãy hỏi Trợ lý sức khỏe nhé!"

        OUTPUT FORMAT (JSON ONLY):
        {
            "scenario": "Tên kịch bản (VD: CÔNG CỐC)",
            "message": "...",
            "action": "...",
            "footer": "..."
        }
        `;
        /*/ 

        // Gọi Gemini
        const model = genAI.getGenerativeModel({model: process.env.GEMINI_MODEL });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        let aiResult;
        try {
            const jsonMatch = response.text().match(/\{[\s\S]*\}/);
            aiResult = JSON.parse(jsonMatch[0]);
        } catch (e) {
            aiResult = {
                scenario: "Cần thêm dữ liệu",
                message: "Hệ thống cần bạn nhập liệu đầy đủ hơn để phân tích chính xác.",
                action: "Hãy nhớ log lại các bữa ăn hôm nay nhé.",
                footer: "Nếu có gì thắc mắc cần giải thích thêm, bạn hãy hỏi Trợ lý sức khỏe nhé!"
            };
        }

        res.json(aiResult);

    } catch (error) {
        console.error("Lỗi Quick Insight:", error);
        res.status(500).json({ msg: "Lỗi Server" });
    }
};

