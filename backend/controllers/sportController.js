// 1. Import pool từ thư mục config (Lên 1 cấp cha ../ rồi vào config/db)
const { pool } = require('../config/db');

// API lấy danh sách môn
 const getAllSports = async (req, res) => {
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
const getSportDetail = async (req, res) => {
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
// 2. Lấy chi tiết môn (bao gồm Skills và Exercises đã liên kết) - Dùng cho trang Edit
const getSportDetailAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        // Lấy info
        const [sportRows] = await pool.query("SELECT * FROM sports WHERE id = ?", [id]);
        if (sportRows.length === 0) return res.status(404).json({ message: "Không tìm thấy" });
        const sport = sportRows[0];

        // Lấy skills
        const [skills] = await pool.query("SELECT * FROM sport_skills WHERE sport_id = ?", [id]);

        // Lấy linked exercises (kèm thông tin từ bảng exercises)
        const [exercises] = await pool.query(`
            SELECT se.sport_id, se.exercise_id, se.reason, e.exercise_name, e.thumbnail_url 
            FROM sport_exercises se
            JOIN exercises e ON se.exercise_id = e.id
            WHERE se.sport_id = ?
        `, [id]);

        res.json({ ...sport, skills, exercises });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// 3. Tạo môn thể thao mới
const createSport = async (req, res) => {
    const { name, slug, description, image_url } = req.body;
    try {
        const [result] = await pool.query(
            "INSERT INTO sports (name, slug, description, image_url) VALUES (?, ?, ?, ?)",
            [name, slug, description, image_url]
        );
        res.status(201).json({ message: "Tạo thành công", id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Cập nhật thông tin cơ bản
const updateSport = async (req, res) => {
    const { id } = req.params;
    const { name, slug, description, image_url } = req.body;
    try {
        await pool.query(
            "UPDATE sports SET name=?, slug=?, description=?, image_url=? WHERE id=?",
            [name, slug, description, image_url, id]
        );
        res.json({ message: "Cập nhật thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. Xóa môn thể thao (Cascade xóa skills và exercises liên quan)
const deleteSport = async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        // Xóa skills
        await connection.query("DELETE FROM sport_skills WHERE sport_id = ?", [id]);
        // Xóa liên kết bài tập
        await connection.query("DELETE FROM sport_exercises WHERE sport_id = ?", [id]);
        // Xóa môn
        await connection.query("DELETE FROM sports WHERE id = ?", [id]);
        
        await connection.commit();
        res.json({ message: "Đã xóa môn thể thao" });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: error.message });
    } finally {
        connection.release();
    }
};

// --- QUẢN LÝ SKILLS ---

const addSkill = async (req, res) => {
    const { sport_id, name, description, video_url, difficulty } = req.body;
    try {
        await pool.query(
            "INSERT INTO sport_skills (sport_id, name, description, video_url, difficulty) VALUES (?, ?, ?, ?, ?)",
            [sport_id, name, description, video_url, difficulty]
        );
        res.json({ message: "Thêm kỹ năng thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteSkill = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM sport_skills WHERE id = ?", [id]);
        res.json({ message: "Đã xóa kỹ năng" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- QUẢN LÝ LINK BÀI TẬP (Exercises) ---

const addSportExercise = async (req, res) => {
    const { sport_id, exercise_id, reason } = req.body;
    try {
        // Check trùng
        const [exist] = await pool.query("SELECT * FROM sport_exercises WHERE sport_id=? AND exercise_id=?", [sport_id, exercise_id]);
        if(exist.length > 0) return res.status(400).json({message: "Bài tập này đã được thêm rồi"});

        await pool.query(
            "INSERT INTO sport_exercises (sport_id, exercise_id, reason) VALUES (?, ?, ?)",
            [sport_id, exercise_id, reason]
        );
        res.json({ message: "Liên kết bài tập thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const removeSportExercise = async (req, res) => {
    const { sport_id, exercise_id } = req.params;
    try {
        await pool.query("DELETE FROM sport_exercises WHERE sport_id = ? AND exercise_id = ?", [sport_id, exercise_id]);
        res.json({ message: "Đã gỡ bỏ bài tập khỏi môn này" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    getAllSports, getSportDetail, getSportDetailAdmin, createSport, updateSport, deleteSport,
    addSkill, deleteSkill, addSportExercise, removeSportExercise
};