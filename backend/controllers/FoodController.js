// File: controllers/FoodController.js
const { pool } = require("../config/db");

// 1. Lấy danh sách thực phẩm (Có tìm kiếm & lọc nhóm)
const getAllFoods = async (req, res) => {
    try {
        const { search, group } = req.query;
        let sql = `SELECT * FROM nutrition_data WHERE 1=1`;
        const params = [];

        if (search) {
            sql += ` AND food_name LIKE ?`;
            params.push(`%${search}%`);
        }
        if (group) {
            sql += ` AND food_group = ?`;
            params.push(group);
        }

        sql += ` ORDER BY id DESC`; // Mới nhất lên đầu

        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// 2. Thêm thực phẩm mới
const createFood = async (req, res) => {
    try {
        const { food_name, food_group, description, image_url, unit, calories, water_g, protein_g, fats_g, carbs_g, fiber_g } = req.body;

        if (!food_name) return res.status(400).json({ msg: "Tên thực phẩm là bắt buộc!" });

        await pool.query(
            `INSERT INTO nutrition_data 
            (food_name, food_group, description, image_url, unit, calories, water_g, protein_g, fats_g, carbs_g, fiber_g) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [food_name, food_group, description, image_url, unit || 'gram', calories || 0, water_g || 0, protein_g || 0, fats_g || 0, carbs_g || 0, fiber_g || 0]
        );

        res.status(201).json({ msg: "Thêm thực phẩm thành công!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Cập nhật thực phẩm
const updateFood = async (req, res) => {
    try {
        const { id } = req.params;
        const { food_name, food_group, description, image_url, unit, calories, water_g, protein_g, fats_g, carbs_g, fiber_g } = req.body;

        await pool.query(
            `UPDATE nutrition_data SET 
            food_name=?, food_group=?, description=?, image_url=?, unit=?, 
            calories=?, water_g=?, protein_g=?, fats_g=?, carbs_g=?, fiber_g=? 
            WHERE id=?`,
            [food_name, food_group, description, image_url, unit, calories, water_g, protein_g, fats_g, carbs_g, fiber_g, id]
        );

        res.json({ msg: "Cập nhật thành công!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Xóa thực phẩm
const deleteFood = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM nutrition_data WHERE id = ?", [id]);
        res.json({ msg: "Đã xóa thực phẩm." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getFoodGroups = async (req, res) => {
    try {
        // Chỉ lấy các nhóm cấp 1 (level = 1) để hiển thị trong dropdown chính
        // Nếu muốn lấy hết thì bỏ "WHERE level = 1"
        const [rows] = await pool.query("SELECT id, name, color_class FROM food_groups WHERE level = 1 ORDER BY sort_order ASC");
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllFoods, createFood, updateFood, deleteFood, getFoodGroups };