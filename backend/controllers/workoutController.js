// backend/controllers/workoutController.js
const { pool } = require('../config/db');

// --- 1. THÊM BÀI TẬP MỚI ---
const addWorkout = async (req, res) => {
    try {
        const { user_id, workout_date, activity_name, calories_burned, duration_minutes } = req.body;

        // Validation cơ bản
        if (!user_id || !workout_date || !activity_name || !calories_burned) {
            return res.status(400).json({ msg: "Thiếu thông tin bắt buộc (Tên hoạt động hoặc Calo)." });
        }

        const sql = `
            INSERT INTO workout_calo 
            (user_id, workout_date, activity_name, calories_burned, duration_minutes) 
            VALUES (?, ?, ?, ?, ?)
        `;

        // Nếu duration không nhập thì mặc định là 0
        const duration = duration_minutes ? parseInt(duration_minutes) : 0;

        await pool.query(sql, [user_id, workout_date, activity_name, calories_burned, duration]);

        res.status(201).json({ msg: "Đã lưu bài tập thành công!" });

    } catch (error) {
        console.error("Lỗi addWorkout:", error);
        res.status(500).json({ msg: "Lỗi server khi lưu bài tập." });
    }
};

// --- 2. LẤY DANH SÁCH BÀI TẬP THEO NGÀY ---
// Dùng để hiển thị trong Nhật ký (NutritionDiary)
const getWorkoutsByDate = async (req, res) => {
    try {
        const { user_id, date } = req.query;

        if (!user_id || !date) {
            return res.status(400).json({ msg: "Thiếu user_id hoặc date." });
        }

        const sql = `
            SELECT * FROM workout_calo 
            WHERE user_id = ? AND workout_date = ?
            ORDER BY created_at DESC
        `;

        const [rows] = await pool.query(sql, [user_id, date]);

        // Tính nhanh tổng calo trong ngày để frontend đỡ phải tính (Optional)
        const totalCalories = rows.reduce((sum, item) => sum + item.calories_burned, 0);

        res.json({
            data: rows,           // Danh sách các môn (Chạy bộ, Gym...)
            total_burned: totalCalories // Tổng cộng dồn (VD: 800 kcal)
        });

    } catch (error) {
        console.error("Lỗi getWorkoutsByDate:", error);
        res.status(500).json({ msg: "Lỗi server lấy danh sách bài tập." });
    }
};

// --- 3. XÓA BÀI TẬP ---
const deleteWorkout = async (req, res) => {
    try {
        const { id } = req.params;

        const sql = "DELETE FROM workout_calo WHERE id = ?";
        const [result] = await pool.query(sql, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: "Không tìm thấy bài tập để xóa." });
        }

        res.json({ msg: "Đã xóa bài tập thành công." });

    } catch (error) {
        console.error("Lỗi deleteWorkout:", error);
        res.status(500).json({ msg: "Lỗi server khi xóa." });
    }
};


// =================================================================
// [MỚI] API 5: LẤY THỐNG KÊ TỔNG HỢP (Calo In/Out + TDEE/Target)
// GET /api/nutrition/stats?user_id=1&startDate=...&endDate=...
// =================================================================
const getStats = async (req, res) => {
  const { user_id, startDate, endDate } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'Thiếu user_id' });
  }

  try {
    // 1. Xác định khoảng thời gian (Mặc định 30 ngày nếu thiếu)
    const end = endDate || new Date().toISOString().split('T')[0];
    const start = startDate || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

    // 2. Lấy thông tin Profile để tính TDEE & Target
    const [profiles] = await pool.query(
      "SELECT * FROM health_profiles WHERE user_id = ?", 
      [user_id]
    );

    let tdee = 2000;   // Giá trị mặc định
    let target = 2000; // Giá trị mặc định
    let goalType = 'maintain';

    if (profiles.length > 0) {
      const p = profiles[0];
      goalType = p.goal;
      
      // A. Tính BMR (Mifflin-St Jeor)
      let bmr = (10 * Number(p.weight_kg)) + (6.25 * Number(p.height_cm)) - (5 * p.age);
      bmr += (p.gender === 'male') ? 5 : -161;

      // B. Chọn hệ số vận động
      const activityMultipliers = {
        'sedentary': 1.2,
        'lightly_active': 1.375,
        'moderately_active': 1.55,
        'very_active': 1.725,
        'extra_active': 1.9
      };
      const multiplier = activityMultipliers[p.activity_level] || 1.2;
      
      // C. Tính TDEE (Năng lượng giữ cân)
      tdee = Math.round(bmr * multiplier);

      // D. Tính Target (Mục tiêu) dựa trên Goal & Weekly Goal
      // 1kg mỡ ~ 7700kcal
      const caloriesPerKg = 7700;
      const weeklySpeed = Number(p.weekly_goal) || 0.5; // VD: 0.5 kg/tuần
      const dailyDeficit = Math.round((weeklySpeed * caloriesPerKg) / 7);

      if (p.goal === 'lose_weight') {
        target = tdee - dailyDeficit;
        // Safety check: Không cho xuống quá thấp (dưới BMR) trừ khi cần thiết
        if (target < bmr) target = Math.max(target, 1200); 
      } else if (p.goal === 'gain_muscle') {
        target = tdee + 300; // Tăng cơ thường cộng thêm 300-500kcal
      } else {
        target = tdee; // Maintain
      }
    }

    // 3. Query Gộp: Lấy tổng Calories In (meal_logs) và Calories Out (workout_calo) theo ngày
    // Sử dụng UNION để đảm bảo lấy được ngày có ăn HOẶC có tập (Full Outer Join giả lập)
    const sql = `
      SELECT 
        date_list.date,
        COALESCE(meals.total_in, 0) as total_calories_in,
        COALESCE(workouts.total_burned, 0) as total_calories_burned
      FROM 
        (
          -- Tạo danh sách các ngày có dữ liệu từ cả 2 bảng
          SELECT DATE(meal_date) as date FROM meal_logs WHERE user_id = ? AND meal_date BETWEEN ? AND ?
          UNION
          SELECT DATE(workout_date) as date FROM workout_calo WHERE user_id = ? AND workout_date BETWEEN ? AND ?
        ) as date_list
      LEFT JOIN (
        SELECT DATE(meal_date) as date, SUM(calories) as total_in 
        FROM meal_logs WHERE user_id = ? GROUP BY date
      ) as meals ON date_list.date = meals.date
      LEFT JOIN (
        SELECT DATE(workout_date) as date, SUM(calories_burned) as total_burned 
        FROM workout_calo WHERE user_id = ? GROUP BY date
      ) as workouts ON date_list.date = workouts.date
      ORDER BY date_list.date ASC;
    `;

    // Tham số lặp lại cho các dấu ? trong SQL
    const params = [
        user_id, start, end, // Cho meal_logs dates
        user_id, start, end, // Cho workout_calo dates
        user_id,             // Cho join meal_logs
        user_id              // Cho join workout_calo
    ];

    const [rows] = await pool.query(sql, params);

    // 4. Format dữ liệu trả về cho Frontend
    const stats = rows.map(row => ({
      date: row.date, // YYYY-MM-DD
      calories_in: Number(row.total_calories_in),
      calories_out: Number(row.total_calories_burned)
    }));

    // 5. Trả về JSON (Meta + Data)
    res.json({
      meta: {
        tdee: tdee,
        daily_target: target,
        goal_type: goalType
      },
      data: stats
    });

  } catch (error) {
    console.error("Lỗi lấy thống kê:", error);
    res.status(500).json({ error: "Lỗi server lấy thống kê" });
  }
};

// ... (module.exports ở cuối file)

module.exports = {
    addWorkout,
    getWorkoutsByDate,
    deleteWorkout,
    getStats
};