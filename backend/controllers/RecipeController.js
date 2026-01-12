// File: controllers/RecipeController.js
const { pool } = require("../config/db");

// ==========================================
// A. KHU VỰC PUBLIC (Dành cho User xem/lọc)
// ==========================================

const getRecipesPublic = async (req, res) => {
    const { search, meal, goal, time, calorie } = req.query;

    try {
        let sql = `
            SELECT 
                r.recipe_id, r.name, r.description, r.image_url, 
                r.prep_time, r.cook_time, r.difficulty,
                n.calories, 
                GROUP_CONCAT(DISTINCT CASE WHEN t.tag_type = 'MEAL' THEN t.tag_name END) AS mealTypes,
                GROUP_CONCAT(DISTINCT CASE WHEN t.tag_type = 'GOAL' THEN t.tag_name END) AS goals
            FROM recipes r
            LEFT JOIN nutrition_data n ON r.nutrition_data_id = n.id
            LEFT JOIN recipe_tags rt ON r.recipe_id = rt.recipe_id
            LEFT JOIN tags t ON rt.tag_id = t.tag_id
            GROUP BY r.recipe_id, r.name, r.description, r.image_url, n.calories, r.prep_time, r.cook_time, r.difficulty 
            HAVING 1=1 
        `;
        
        let conditions = [];

        if (search) conditions.push(`(r.name LIKE '%${search}%' OR r.description LIKE '%${search}%')`);
        if (meal && meal !== 'Tất cả') conditions.push(`FIND_IN_SET('${meal}', mealTypes)`);
        if (goal && goal !== 'Tất cả') conditions.push(`FIND_IN_SET('${goal}', goals)`);
        
        if (calorie && calorie !== 'Tất cả') {
            switch (calorie) {
                case 'Dưới 300 Calo': conditions.push('n.calories < 300'); break;
                case '300-500 Calo': conditions.push('n.calories >= 300 AND n.calories <= 500'); break;
                case 'Trên 500 Calo': conditions.push('n.calories > 500'); break;
            }
        }
        
        if (time && time !== 'Tất cả') {
            switch (time) {
                case 'Dưới 15 phút': conditions.push('(r.prep_time + r.cook_time) < 15'); break;
                case '15-30 phút': conditions.push('(r.prep_time + r.cook_time) >= 15 AND (r.prep_time + r.cook_time) <= 30'); break;
                case 'Trên 30 phút': conditions.push('(r.prep_time + r.cook_time) > 30'); break;
            }
        }

        if (conditions.length > 0) sql += ' AND ' + conditions.join(' AND ');
        
        // [ĐÃ SỬA] Sắp xếp theo ID giảm dần (thay vì created_at)
        sql += ' ORDER BY r.recipe_id DESC;';

        const [recipes] = await pool.query(sql);

        const formattedRecipes = recipes.map(recipe => ({
            ...recipe,
            mealType: recipe.mealTypes ? recipe.mealTypes.split(',')[0] : null, 
            goal: recipe.goals ? recipe.goals.split(',')[0] : null,
            mealTypes: undefined, 
            goals: undefined, 
        }));

        res.json({ success: true, recipes: formattedRecipes });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// B. KHU VỰC ADMIN (Quản lý CRUD)
// ==========================================

const getRecipesAdmin = async (req, res) => {
    try {
        const { search } = req.query;
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
        
        // [ĐÃ SỬA] Sắp xếp theo ID giảm dần
        sql += ` ORDER BY r.recipe_id DESC`;

        const [rows] = await pool.query(sql, params);
        
        res.json({ recipes: rows }); 

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ... (Các hàm create, update, delete giữ nguyên như cũ)
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

const deleteRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM recipes WHERE recipe_id = ?", [id]);
        res.json({ msg: "Đã xóa công thức." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getRecipeByIdPublic = async (req, res) => {
    try {
        const { id } = req.params;

        // SỬA: Liệt kê rõ các cột thay vì r.* để kiểm soát Group By
        // SỬA: Đưa tất cả các cột Select vào Group By để tránh lỗi trên Render
        const sql = `
            SELECT 
                r.recipe_id, r.name, r.description, r.image_url, r.video_url,
                r.prep_time, r.cook_time, r.difficulty, r.instructions, r.serving_size,
                n.calories, n.protein_g, n.fats_g, n.carbs_g,
                GROUP_CONCAT(DISTINCT CASE WHEN t.tag_type = 'MEAL' THEN t.tag_name END) AS mealTypes,
                GROUP_CONCAT(DISTINCT CASE WHEN t.tag_type = 'GOAL' THEN t.tag_name END) AS goals
            FROM recipes r
            LEFT JOIN nutrition_data n ON r.nutrition_data_id = n.id
            LEFT JOIN recipe_tags rt ON r.recipe_id = rt.recipe_id
            LEFT JOIN tags t ON rt.tag_id = t.tag_id
            WHERE r.recipe_id = ?
            GROUP BY 
                r.recipe_id, r.name, r.description, r.image_url, r.video_url,
                r.prep_time, r.cook_time, r.difficulty, r.instructions, r.serving_size,
                n.calories, n.protein_g, n.fats_g, n.carbs_g
        `;

        const [rows] = await pool.query(sql, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy công thức" });
        }

        const recipe = rows[0];
        
        const formattedRecipe = {
            ...recipe,
            mealType: recipe.mealTypes ? recipe.mealTypes.split(',')[0] : null,
            goal: recipe.goals ? recipe.goals.split(',')[0] : null,
            instructionsList: recipe.instructions ? recipe.instructions.split('\n') : []
        };

        res.json({ success: true, recipe: formattedRecipe });

    } catch (error) {
        console.error("Lỗi chi tiết:", error); // Log ra console của Render để dễ debug
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getRecipesPublic, getRecipesAdmin, createRecipe, updateRecipe, deleteRecipe, getRecipeByIdPublic };