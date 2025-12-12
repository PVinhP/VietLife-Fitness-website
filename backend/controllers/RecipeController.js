// File: controllers/RecipeController.js
const { pool } = require("../config/db");

// 1. Lấy danh sách Recipe (Kèm thông tin dinh dưỡng)
const getAllRecipes = async (req, res) => {
    try {
        const { search, difficulty } = req.query;
        // Join bảng để lấy tên gốc và calo từ nutrition_data
        let sql = `
            SELECT r.*, n.calories, n.protein_g, n.food_name as original_food_name
            FROM recipes r
            LEFT JOIN nutrition_data n ON r.nutrition_data_id = n.id
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            sql += ` AND r.name LIKE ?`;
            params.push(`%${search}%`);
        }
        if (difficulty) {
            sql += ` AND r.difficulty = ?`;
            params.push(difficulty);
        }

        sql += ` ORDER BY r.created_at DESC`;

        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Tạo Recipe mới
const createRecipe = async (req, res) => {
    try {
        const { nutrition_data_id, name, description, image_url, video_url, serving_size, prep_time, cook_time, difficulty, instructions } = req.body;

        await pool.query(
            `INSERT INTO recipes 
            (nutrition_data_id, name, description, image_url, video_url, serving_size, prep_time, cook_time, difficulty, instructions) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [nutrition_data_id || null, name, description, image_url, video_url, serving_size, prep_time, cook_time, difficulty, instructions]
        );

        res.status(201).json({ msg: "Tạo công thức thành công!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Cập nhật Recipe
const updateRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const { nutrition_data_id, name, description, image_url, video_url, serving_size, prep_time, cook_time, difficulty, instructions } = req.body;

        await pool.query(
            `UPDATE recipes SET 
            nutrition_data_id=?, name=?, description=?, image_url=?, video_url=?, 
            serving_size=?, prep_time=?, cook_time=?, difficulty=?, instructions=? 
            WHERE recipe_id=?`,
            [nutrition_data_id, name, description, image_url, video_url, serving_size, prep_time, cook_time, difficulty, instructions, id]
        );

        res.json({ msg: "Cập nhật thành công!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Xóa Recipe
const deleteRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM recipes WHERE recipe_id = ?", [id]);
        res.json({ msg: "Đã xóa công thức." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllRecipes, createRecipe, updateRecipe, deleteRecipe };