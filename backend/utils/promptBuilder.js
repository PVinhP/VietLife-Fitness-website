// backend/utils/promptBuilder.js

// Map dữ liệu từ Enum trong DB sang tiếng Việt dễ hiểu cho AI
const maps = {
    body_type: {
        ectomorph: "Gầy, khó tăng cân (Ectomorph)",
        mesomorph: "Cơ bắp tự nhiên, dễ tăng cơ (Mesomorph)",
        endomorph: "Dễ tích mỡ, khung xương lớn (Endomorph)"
    },
    goal: {
        lose_weight: "Giảm cân (Giảm mỡ)",
        maintain: "Duy trì vóc dáng",
        gain_muscle: "Tăng cơ bắp",
        toned: "Săn chắc (Toned Body)"
    },
    activity: {
        sedentary: "Ít vận động (Ngồi văn phòng)",
        lightly_active: "Vận động nhẹ",
        moderately_active: "Vận động vừa phải",
        very_active: "Năng động",
        extra_active: "Vận động viên"
    },
    pushup: {
        under_10: "Rất yếu (Dưới 10 cái)",
        '10_20': "Trung bình (10-20 cái)",
        '21_30': "Khá (21-30 cái)",
        over_30: "Tốt (Trên 30 cái)"
    }
};

/**
 * Hàm xây dựng context (ngữ cảnh) chi tiết về User để gửi cho AI
 * @param {Object} preferences - Dữ liệu từ cột training_preferences (JSON)
 * @param {Object} profile - Dữ liệu từ bảng health_profiles (bao gồm cả target_weight, weekly_goal)
 */
const buildUserContext = (preferences, profile) => {
    
    // 1. Xử lý nơi tập & dụng cụ
    let locationInfo = "";
    if (preferences.workout_location === 'gym') {
        locationInfo = "Tại phòng GYM (Đầy đủ máy móc, tạ đòn, tạ đơn)";
    } else {
        const equips = preferences.home_equipment?.join(', ') || "Không có";
        locationInfo = `Tại NHÀ. Dụng cụ sẵn có: ${equips || "Chỉ bodyweight"}`;
    }

    // 2. Xử lý các vấn đề sức khỏe
    const limitations = preferences.limitations?.filter(l => l !== 'none').join(', ') || "Không có chấn thương";
    const diet = preferences.diet_preference?.filter(d => d !== 'none').join(', ') || "Ăn uống bình thường";

    // 3. [MỚI] Xử lý Mục tiêu Cân nặng & Tốc độ
    let weightGoalInfo = "Chưa thiết lập mục tiêu cụ thể.";
    
    if (profile.weight_kg && profile.target_weight) {
        const current = Number(profile.weight_kg);
        const target = Number(profile.target_weight);
        const diff = target - current; // Âm là giảm, Dương là tăng

        if (diff < -0.1) {
            // Muốn giảm cân
            const lossAmount = Math.abs(diff).toFixed(1);
            const speed = profile.weekly_goal || 0.5; // Mặc định 0.5 nếu null
            
            let speedNote = "";
            if (speed >= 1.0) speedNote = "(Tốc độ NHANH - Cần thâm hụt calo lớn & Cardio nhiều)";
            else if (speed <= 0.5) speedNote = "(Tốc độ CHẬM & CHẮC - Ưu tiên giữ cơ)";
            else speedNote = "(Tốc độ TRUNG BÌNH)";

            weightGoalInfo = `Muốn GIẢM ${lossAmount}kg (Mục tiêu: ${target}kg). Tốc độ mong muốn: ${speed}kg/tuần ${speedNote}.`;
        
        } else if (diff > 0.1) {
            // Muốn tăng cân
            weightGoalInfo = `Muốn TĂNG ${diff.toFixed(1)}kg (Mục tiêu: ${target}kg). Ưu tiên tăng cân tăng cơ, hạn chế mỡ.`;
        } else {
            // Duy trì
            weightGoalInfo = "Muốn DUY TRÌ cân nặng hiện tại, tập trung vào săn chắc cơ thể (Body Recomposition).";
        }
    }

    // 4. Tạo chuỗi Prompt cuối cùng
    return `
    HỒ SƠ KHÁCH HÀNG (USER PROFILE):
    - Thông tin cơ bản: ${profile.age} tuổi, ${profile.gender}, Cao ${profile.height_cm}cm, Nặng ${profile.weight_kg}kg.
    - [QUAN TRỌNG] MỤC TIÊU CÂN NẶNG: ${weightGoalInfo}
    - Tạng người: ${maps.body_type[preferences.body_type] || preferences.body_type}.
    - Mức độ vận động hiện tại: ${maps.activity[preferences.activity_level] || preferences.activity_level}.
    - Sức mạnh nền tảng (Hít đất): ${maps.pushup[preferences.pushup_count]}.
    
    MỤC TIÊU & ĐIỀU KIỆN TẬP LUYỆN:
    - Mục tiêu hình thể chính: ${maps.goal[preferences.goal_body] || preferences.goal_body}.
    - Mục tiêu phụ: ${(preferences.secondary_goals || []).join(', ')}.
    - Nơi tập: ${locationInfo}.
    - Thể thao bổ trợ: ${(preferences.other_sports || []).join(', ')}.
    - Thời gian ngủ: ${preferences.sleep_hours}/ngày.
    
    SỨC KHỎE & DINH DƯỠNG:
    - Hạn chế/Chấn thương: ${limitations}.
    - Chế độ ăn: ${diet}.
    - Dị ứng/Ghét: ${preferences.allergies || "Không có"}.
    `;
};

module.exports = { buildUserContext };