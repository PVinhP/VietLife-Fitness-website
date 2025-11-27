// 1. Import pool từ thư mục config (Lên 1 cấp cha ../ rồi vào config/db)
const { pool } = require('../config/db');

// API lấy danh sách môn
exports.getAllSports = async (req, res) => {
    try {
        const sql = "SELECT * FROM sports";
        // Dùng pool.query thay vì db.query
        const [rows] = await pool.query(sql); 
        res.json(rows);
    } catch (error) {
        console.error("Lỗi lấy danh sách môn:", error);
        res.status(500).json({ error: error.message });
    }
};
exports.getSportDetail = async (req, res) => {
    const { slug } = req.params;
    
    try {
        // 1. Lấy thông tin môn
        const sportSql = "SELECT * FROM sports WHERE slug = ?";
        // ... (đoạn này giữ nguyên, dùng pool.query) ...
        const [sportRows] = await pool.query(sportSql, [slug]);
        if (sportRows.length === 0) return res.status(404).json({ message: "Không tìm thấy" });
        const sport = sportRows[0];

        // 2. Lấy bài tập Gym + LÝ DO (Thêm cột se.reason)
        const exerciseSql = `
            SELECT e.*, se.reason 
            FROM exercises e
            JOIN sport_exercises se ON e.id = se.exercise_id
            WHERE se.sport_id = ?
        `;
        const [exerciseRows] = await pool.query(exerciseSql, [sport.id]);

        // 3. Lấy Kỹ năng chuyên môn (MỚI)
        const skillSql = "SELECT * FROM sport_skills WHERE sport_id = ?";
        const [skillRows] = await pool.query(skillSql, [sport.id]);

        // 4. Trả về kết quả gộp
        res.json({
            ...sport,
            exercises: exerciseRows,
            skills: skillRows // Trả thêm mảng skills
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};