const { pool } = require('../config/db');

// 1. Check-in (Hoặc bỏ check) một bài tập
exports.toggleProgress = async (req, res) => {
    const userId = req.user.id; 
    const { planId, exerciseId, date } = req.body; 

    try {
        const checkSql = "SELECT id FROM workout_logs WHERE user_id = ? AND plan_id = ? AND exercise_id = ? AND completed_at = ?";
        const [existing] = await pool.query(checkSql, [userId, planId, exerciseId, date]);

        if (existing.length > 0) {
            await pool.query("DELETE FROM workout_logs WHERE id = ?", [existing[0].id]);
            res.json({ status: 'unchecked', message: 'Đã hủy hoàn thành' });
        } else {
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
// Sửa getDayProgress để trả về đúng format
exports.getDayProgress = async (req, res) => {
    const userId = req.user.id;
    const { planId, date } = req.query;

    try {
        const sql = "SELECT exercise_id, note FROM workout_logs WHERE user_id = ? AND plan_id = ? AND completed_at = ?";
        const [rows] = await pool.query(sql, [userId, planId, date]);
        
        // Trả về array exercise_id để check, VÀ object notes riêng
        const exerciseIds = rows.map(row => row.exercise_id);
        const notes = rows.reduce((acc, row) => {
            if (row.note) acc[row.exercise_id] = row.note;
            return acc;
        }, {});
        
        res.json({ exerciseIds, notes }); // Format mới
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// 3. Cập nhật Ghi chú
exports.updateNote = async (req, res) => {
    const userId = req.user.id;
    const { planId, exerciseId, date, note } = req.body;

    try {
        // Kiểm tra log tồn tại
        const checkSql = "SELECT id FROM workout_logs WHERE user_id = ? AND plan_id = ? AND exercise_id = ? AND completed_at = ?";
        const [existing] = await pool.query(checkSql, [userId, planId, exerciseId, date]);

        if (existing.length > 0) {
            await pool.query("UPDATE workout_logs SET note = ? WHERE id = ?", [note, existing[0].id]);
        } else {
            // Insert mới: Lưu ý cột note được thêm vào ngay lúc tạo
            await pool.query(
                "INSERT INTO workout_logs (user_id, plan_id, exercise_id, completed_at, note) VALUES (?, ?, ?, ?, ?)", 
                [userId, planId, exerciseId, date, note]
            );
        }
        res.json({ message: 'Đã lưu ghi chú thành công', savedDate: date });
    } catch (error) {
        console.error("Lỗi lưu note:", error);
        res.status(500).json({ error: error.message });
    }
};

// [SỬA]: Thêm định dạng ngày tháng khi lấy lịch sử để Frontend dễ hiển thị
exports.getExerciseNoteHistory = async (req, res) => {
    const userId = req.user.id;
    const { planId, exerciseId } = req.query;

    try {
        // DATE_FORMAT giúp trả về chuỗi ngày đẹp, tránh lỗi format múi giờ ISO ở frontend
        const sql = `
            SELECT DATE_FORMAT(completed_at, '%Y-%m-%d') as date, note 
            FROM workout_logs 
            WHERE user_id = ? AND plan_id = ? AND exercise_id = ? AND note IS NOT NULL
            ORDER BY completed_at DESC 
            LIMIT 7
        `;
        const [rows] = await pool.query(sql, [userId, planId, exerciseId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// [MỚI] API: Lấy danh sách các giáo án user đang tập (Lịch sử)
// ProgressController.js
exports.getHistory = async (req, res) => {
    const userId = req.user.id;

    try {
        const query = `
            SELECT 
                p.id as plan_id, 
                p.name as plan_name, 
                p.image_url,
                
                -- [LOGIC MỚI QUAN TRỌNG]
                -- Đếm tổng bài tập bằng cách nối 3 bảng: plan_exercises -> plan_days -> plans
                (
                    SELECT COUNT(*) 
                    FROM plan_exercises pe 
                    JOIN plan_days pd ON pe.plan_day_id = pd.id 
                    WHERE pd.plan_id = p.id
                ) as total_exercises,

                -- Đếm số bài user đã tập (Dựa vào bảng workout_logs)
                COUNT(DISTINCT wl.exercise_id) as exercises_done, 
                
                -- Lấy ngày tập gần nhất
                MAX(wl.completed_at) as last_workout

            FROM workout_logs wl
            JOIN plans p ON wl.plan_id = p.id 
            WHERE wl.user_id = ?
            GROUP BY p.id
            ORDER BY last_workout DESC
        `;

        const [rows] = await pool.query(query, [userId]);

        // Trả về dữ liệu
        res.status(200).json(rows);

    } catch (error) {
        console.error("Lỗi lấy lịch sử tập luyện:", error);
        res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu lịch sử' });
    }
};
// --- QUAN TRỌNG: Nhớ export hàm mới ---
module.exports = { 
    toggleProgress: exports.toggleProgress, 
    getDayProgress: exports.getDayProgress,
    updateNote: exports.updateNote,
    getHistory: exports.getHistory,
    getExerciseNoteHistory: exports.getExerciseNoteHistory
};