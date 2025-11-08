// FILE: backend/controllers/NutritionController.js

// SỬA LỖI: Nhập đối tượng pool từ config/db
const { pool } = require('../config/db'); 

// Hàm xử lý logic lấy danh sách công thức (Recipes)
exports.getRecipes = async (req, res) => {
    // 1. Lấy tham số truy vấn từ frontend
    const { search, meal, goal, time, calorie } = req.query;

    try {
        // 2. Xây dựng câu truy vấn SQL cơ bản (JOIN recipes với tags)
        let sql = `
            SELECT 
                r.recipe_id, 
                r.name, 
                r.description, 
                r.image_url, 
                r.total_calories, 
                r.prep_time, 
                r.cook_time,
                r.difficulty,
                GROUP_CONCAT(DISTINCT CASE WHEN t.tag_type = 'MEAL' THEN t.tag_name END) AS mealTypes,
                GROUP_CONCAT(DISTINCT CASE WHEN t.tag_type = 'GOAL' THEN t.tag_name END) AS goals
            FROM 
                recipes r
            LEFT JOIN 
                recipe_tags rt ON r.recipe_id = rt.recipe_id
            LEFT JOIN 
                tags t ON rt.tag_id = t.tag_id
            GROUP BY 
                r.recipe_id, 
                r.name, 
                r.description, 
                r.image_url, 
                r.total_calories, 
                r.prep_time, 
                r.cook_time,
                r.difficulty 
            HAVING 
                1=1 
        `;
        let conditions = [];

        // 3. Xử lý các bộ lọc
        
        // --- A. Lọc theo Tìm kiếm (Search) ---
        if (search) {
            conditions.push(`r.name LIKE '%${search}%' OR r.description LIKE '%${search}%'`);
        }

        // --- B. Lọc theo Bữa ăn (Meal Type) ---
        if (meal && meal !== 'Tất cả') {
            conditions.push(`FIND_IN_SET('${meal}', mealTypes)`); 
        }

        // --- C. Lọc theo Mục tiêu (Goal) ---
        if (goal && goal !== 'Tất cả') {
            conditions.push(`FIND_IN_SET('${goal}', goals)`);
        }

        // --- D. Lọc theo Calo (Calorie) ---
        if (calorie && calorie !== 'Tất cả') {
            switch (calorie) {
                case 'Dưới 300 Calo':
                    conditions.push('r.total_calories < 300');
                    break;
                case '300-500 Calo':
                    conditions.push('r.total_calories >= 300 AND r.total_calories <= 500');
                    break;
                case 'Trên 500 Calo':
                    conditions.push('r.total_calories > 500');
                    break;
            }
        }
        
        // --- E. Lọc theo Thời gian (Time) ---
        if (time && time !== 'Tất cả') {
            switch (time) {
                case 'Dưới 15 phút':
                    conditions.push('(r.prep_time + r.cook_time) < 15');
                    break;
                case '15-30 phút':
                    conditions.push('(r.prep_time + r.cook_time) >= 15 AND (r.prep_time + r.cook_time) <= 30');
                    break;
                case 'Trên 30 phút':
                    conditions.push('(r.prep_time + r.cook_time) > 30');
                    break;
            }
        }

        // 4. Áp dụng các điều kiện vào mệnh đề HAVING
        if (conditions.length > 0) {
            sql += ' AND ' + conditions.join(' AND ');
        }
        
        // 5. Thêm sắp xếp và giới hạn
        sql += ' ORDER BY r.recipe_id DESC;'; 

        // 6. Thực thi truy vấn (ĐÃ SỬA: Sử dụng pool.query)
        const [recipes] = await pool.query(sql);

        // 7. Định dạng lại dữ liệu trước khi gửi đi 
        const formattedRecipes = recipes.map(recipe => ({
            ...recipe,
            mealType: recipe.mealTypes ? recipe.mealTypes.split(',')[0] : null, 
            goal: recipe.goals ? recipe.goals.split(',')[0] : null,
            // Xóa các trường tạm thời
            mealTypes: undefined, 
            goals: undefined, 
        }));

        res.json({ success: true, recipes: formattedRecipes });

    } catch (error) {
        // LỖI NÀY BÂY GIỜ SẼ LÀ LỖI SQL THẬT, KHÔNG CÒN LỖI DB.QUERY NỮA
        console.error('LỖI KHI LẤY CÔNG THỨC:', error); 
        res.status(500).json({ success: false, message: 'Lỗi server khi truy vấn công thức' });
    }
};

// ... Các hàm controller khác (getRecipeById, createRecipe, v.v.)