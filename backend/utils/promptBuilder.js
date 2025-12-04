// Map dữ liệu sang tiếng Việt dễ hiểu cho AI
const maps = {
    body_type: {
        ectomorph: "Gầy, khó tăng cân (Ectomorph)",
        mesomorph: "Cơ bắp tự nhiên, dễ tăng cơ (Mesomorph)",
        endomorph: "Dễ tích mỡ, khung xương lớn (Endomorph)"
    },
    goal: {
        lose_weight: "Giảm cân",
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

const buildUserContext = (preferences, profile) => {
    // Xử lý nơi tập & dụng cụ
    let locationInfo = "";
    if (preferences.workout_location === 'gym') {
        locationInfo = "Tại phòng GYM (Đầy đủ máy móc, tạ đòn, tạ đơn)";
    } else {
        const equips = preferences.home_equipment?.join(', ') || "Không có";
        locationInfo = `Tại NHÀ. Dụng cụ sẵn có: ${equips || "Chỉ bodyweight"}`;
    }

    // Xử lý các vấn đề sức khỏe
    const limitations = preferences.limitations?.filter(l => l !== 'none').join(', ') || "Không có chấn thương";
    const diet = preferences.diet_preference?.filter(d => d !== 'none').join(', ') || "Ăn uống bình thường";

    // --- TẠO PROMPT ---
    return `
    HỒ SƠ KHÁCH HÀNG (USER PROFILE):
    - Thông tin cơ bản: ${profile.age} tuổi, ${profile.gender}, Cao ${profile.height_cm}cm, Nặng ${profile.weight_kg}kg.
    - Tạng người: ${maps.body_type[preferences.body_type] || preferences.body_type}.
    - Mức độ vận động hiện tại: ${maps.activity[preferences.activity_level] || preferences.activity_level}.
    - Sức mạnh nền tảng (Hít đất): ${maps.pushup[preferences.pushup_count]}.
    
    MỤC TIÊU & ĐIỀU KIỆN:
    - Mục tiêu chính: ${maps.goal[preferences.goal_body] || preferences.goal_body}.
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