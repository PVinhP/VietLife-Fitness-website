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

// API lấy chi tiết môn + bài tập
exports.getSportDetail = async (req, res) => {
    const slug = req.params.slug;
    try {
        // 1. Lấy thông tin môn
        // Lưu ý: pool.query trả về [rows, fields], nên ta dùng destructuring [sportRows]
        const [sportRows] = await pool.query("SELECT * FROM sports WHERE slug = ?", [slug]);
        
        if (sportRows.length === 0) {
            return res.status(404).json({ message: "Môn này không tồn tại" });
        }
        
        const sport = sportRows[0];

        // 2. Lấy các bài tập liên quan qua bảng trung gian
        const sqlExercises = `
            SELECT e.* FROM exercises e
            JOIN sport_exercises se ON e.id = se.exercise_id
            WHERE se.sport_id = ?
        `;
        
        const [exerciseRows] = await pool.query(sqlExercises, [sport.id]);

        // 3. Trả về kết quả gộp
        res.json({
            ...sport,       
            exercises: exerciseRows 
        });

    } catch (error) {
        console.error("Lỗi lấy chi tiết môn:", error);
        res.status(500).json({ error: error.message });
    }
};