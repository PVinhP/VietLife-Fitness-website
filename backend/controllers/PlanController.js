const { pool } = require('../config/db');

// 1. Lấy danh sách tất cả Giáo án
exports.getAllPlans = async (req, res) => {
    try {
        const sql = "SELECT * FROM workout_plans";
        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (error) {
        console.error("Lỗi lấy danh sách giáo án:", error);
        res.status(500).json({ error: error.message });
    }
};

// 2. Lấy chi tiết Giáo án + Danh sách bài tập (Đã nhóm theo ngày)
exports.getPlanDetail = async (req, res) => {
    const { id } = req.params;

    try {
        // A. Lấy thông tin chung của giáo án
        const [planRows] = await pool.query("SELECT * FROM workout_plans WHERE id = ?", [id]);
        if (planRows.length === 0) {
            return res.status(404).json({ message: "Giáo án không tồn tại" });
        }
        const plan = planRows[0];

        // B. Lấy danh sách bài tập (JOIN với bảng exercises để lấy tên, ảnh...)
        const sqlExercises = `
            SELECT 
                wpe.*, 
                e.exercise_name, 
                e.thumbnail_url, 
                e.difficulty,
                e.muscle_group
            FROM workout_plan_exercises wpe
            JOIN exercises e ON wpe.exercise_id = e.id
            WHERE wpe.plan_id = ?
            ORDER BY wpe.day_number ASC, wpe.id ASC
        `;
        
        const [exerciseRows] = await pool.query(sqlExercises, [id]);

        // C. Xử lý dữ liệu: Nhóm bài tập theo từng ngày (Logic quan trọng!)
        // Kết quả sẽ dạng: { 1: [Bài A, Bài B], 2: [Bài C]... }
        const schedule = {};
        
        exerciseRows.forEach(row => {
            const day = row.day_number;
            if (!schedule[day]) {
                schedule[day] = {
                    day_name: row.day_name,
                    exercises: []
                };
            }
            schedule[day].exercises.push(row);
        });

        // Chuyển đổi object schedule thành array để Frontend dễ map
        // Dạng: [{day: 1, info: ...}, {day: 2, info: ...}]
        const scheduleArray = Object.keys(schedule).map(dayNum => ({
            day_number: parseInt(dayNum),
            day_name: schedule[dayNum].day_name,
            exercises: schedule[dayNum].exercises
        }));

        // D. Trả về kết quả cuối cùng
        res.json({
            ...plan,
            schedule: scheduleArray
        });

    } catch (error) {
        console.error("Lỗi lấy chi tiết giáo án:", error);
        res.status(500).json({ error: error.message });
    }
};