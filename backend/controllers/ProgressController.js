const { pool } = require('../config/db');

// 1. Check-in (Hoặc bỏ check) một bài tập
exports.toggleProgress = async (req, res) => {
    // Giả sử bạn đã có middleware lấy user_id từ token
    const userId = req.user.id; 
    const { planId, exerciseId, date } = req.body; // date dạng '2023-11-29'

    try {
        // Kiểm tra xem đã check chưa
        const checkSql = "SELECT id FROM workout_logs WHERE user_id = ? AND plan_id = ? AND exercise_id = ? AND completed_at = ?";
        const [existing] = await pool.query(checkSql, [userId, planId, exerciseId, date]);

        if (existing.length > 0) {
            // Nếu có rồi -> Xóa (Uncheck)
            await pool.query("DELETE FROM workout_logs WHERE id = ?", [existing[0].id]);
            res.json({ status: 'unchecked', message: 'Đã hủy hoàn thành' });
        } else {
            // Chưa có -> Thêm mới (Check)
            await pool.query(
                "INSERT INTO workout_logs (user_id, plan_id, exercise_id, completed_at) VALUES (?, ?, ?, ?)", 
                [userId, planId, exerciseId, date]
            );
            res.json({ status: 'checked', message: 'Đã hoàn thành bài tập!' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// 2. Lấy danh sách các bài đã tập trong ngày (để hiển thị tick xanh)
exports.getDayProgress = async (req, res) => {
    const userId = req.user.id;
    const { planId, date } = req.query;

    try {
        const sql = "SELECT exercise_id FROM workout_logs WHERE user_id = ? AND plan_id = ? AND completed_at = ?";
        const [rows] = await pool.query(sql, [userId, planId, date]);
        
        // Trả về mảng các ID bài tập đã xong: [52, 6, 30...]
        res.json(rows.map(row => row.exercise_id));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};