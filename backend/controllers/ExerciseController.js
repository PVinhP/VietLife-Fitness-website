// File: controllers/ExerciseController.js
const { pool } = require("../config/db");

// 1. Lấy danh sách bài tập (Hỗ trợ tìm kiếm theo tên)
const getAllExercises = async (req, res) => {
    try {
        const { search } = req.query;
        let sql = "SELECT * FROM exercises WHERE 1=1";
        const params = [];

        if (search) {
            sql += " AND exercise_name LIKE ?";
            params.push(`%${search}%`);
        }

        sql += " ORDER BY id DESC"; // Bài tập mới nhất lên đầu

        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (error) {
        console.error("Lỗi lấy danh sách bài tập:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// 2. Lấy chi tiết một bài tập
const getExerciseById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query("SELECT * FROM exercises WHERE id = ?", [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: "Bài tập không tồn tại" });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error("Lỗi lấy chi tiết bài tập:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// 3. Tạo bài tập mới
const createExercise = async (req, res) => {
    try {
        const { 
            exercise_name, video_urls, thumbnail_url, description, 
            muscle_group, equipment_required, difficulty, steps 
        } = req.body;

        if (!exercise_name) {
            return res.status(400).json({ message: "Tên bài tập là bắt buộc" });
        }

        const [result] = await pool.query(
            `INSERT INTO exercises 
            (exercise_name, video_urls, thumbnail_url, description, muscle_group, equipment_required, difficulty, steps) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [exercise_name, video_urls, thumbnail_url, description, muscle_group, equipment_required, difficulty || 'beginner', steps]
        );

        res.status(201).json({ message: "Tạo bài tập thành công!", id: result.insertId });
    } catch (error) {
        console.error("Lỗi tạo bài tập:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// 4. Cập nhật bài tập
const updateExercise = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            exercise_name, video_urls, thumbnail_url, description, 
            muscle_group, equipment_required, difficulty, steps 
        } = req.body;

        const [result] = await pool.query(
            `UPDATE exercises SET 
            exercise_name=?, video_urls=?, thumbnail_url=?, description=?, 
            muscle_group=?, equipment_required=?, difficulty=?, steps=? 
            WHERE id=?`,
            [exercise_name, video_urls, thumbnail_url, description, muscle_group, equipment_required, difficulty, steps, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Không tìm thấy bài tập để cập nhật" });
        }

        res.json({ message: "Cập nhật bài tập thành công!" });
    } catch (error) {
        console.error("Lỗi cập nhật bài tập:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// 5. Xóa bài tập
const deleteExercise = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query("DELETE FROM exercises WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Không tìm thấy bài tập để xóa" });
        }

        res.json({ message: "Xóa bài tập thành công!" });
    } catch (error) {
        console.error("Lỗi xóa bài tập:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

module.exports = { 
    getAllExercises, 
    getExerciseById, 
    createExercise, 
    updateExercise, 
    deleteExercise 
};