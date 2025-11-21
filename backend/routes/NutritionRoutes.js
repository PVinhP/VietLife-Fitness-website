//file mới
const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");

// API lấy toàn bộ dữ liệu từ bảng nutrition_data
// router.get("/", async (req, res) => {
//   try {
//     const [rows] = await pool.query("SELECT * FROM nutrition_data");
//     res.json(rows); // Trả dữ liệu về dưới dạng JSON
//   } catch (error) {
//     console.error("Lỗi truy vấn:", error);
//     res.status(500).json({ message: "Lỗi server" });
//   }
// });

// API tìm kiếm thực phẩm theo tên
router.get("/search", async (req, res) => {
  const { name } = req.query;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM nutrition_data WHERE food_name LIKE ?",[`%${name}%`]
    );
    res.json(rows);
  } catch (error) {
    console.error("Lỗi truy vấn:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});
router.post('/meal-logs', async (req, res) => {
  
  // 1. Lấy dữ liệu từ body của React
  const { user_id, meal_date, meal_type, mealList } = req.body;

  // 2. Kiểm tra dữ liệu
  if (!user_id || !meal_date || !meal_type || !Array.isArray(mealList) || mealList.length === 0) {
    return res.status(400).json({ error: 'Dữ liệu không hợp lệ. Vui lòng cung cấp đủ user_id, meal_date, meal_type và mealList.' });
  }

  // 3. Lấy một kết nối từ pool để dùng transaction
  let connection;
  try {
    connection = await pool.getConnection(); // Sử dụng pool của bạn
    
    // Bắt đầu Transaction
    await connection.beginTransaction();

    // 4. Chuẩn bị câu SQL
    const sql = `
      INSERT INTO meal_logs 
        (user_id, meal_date, meal_type, food_name, input_quantity, input_unit, 
         calories, protein_g, fats_g, carbs_g, fiber_g)
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    // 5. Lặp qua từng món ăn trong mealList và INSERT
    for (const meal of mealList) {
      const values = [
        user_id,
        meal_date,
        meal_type,
        meal.food_name,
        meal.inputQuantity,
        meal.inputUnit,
        meal.calories,
        meal.protein_g,
        meal.fats_g,
        meal.carbs_g,
        meal.fiber_g || 0 // Dùng 0 nếu fiber_g không có
      ];
      
      // Chạy query
      await connection.query(sql, values);
    }

    // 6. Nếu mọi thứ thành công, commit transaction
    await connection.commit();
    
    res.status(201).json({ message: 'Đã lưu thực đơn thành công!' });

  } catch (error) {
    // 7. Nếu có lỗi, rollback transaction
    if (connection) {
      await connection.rollback();
    }
    console.error('Lỗi khi lưu thực đơn:', error);
    res.status(500).json({ error: 'Lỗi máy chủ khi lưu thực đơn.' });
  } finally {
    // 8. Luôn luôn trả kết nối về pool
    if (connection) {
      connection.release();
    }
  }
});


// =================================================================
// [MỚI] API 2: LẤY LỊCH SỬ ĂN UỐNG THEO NGÀY (GET)
// =================================================================
/**
 * @route   GET /api/nutrition/meal-logs
 * @desc    Lấy lịch sử ăn uống theo ngày
 * @query   ?user_id=1&date=2025-11-14
 */
router.get('/meal-logs', async (req, res) => {
  
  // 1. Lấy user_id và date từ query string
  const { user_id, date } = req.query;

  // 2. Kiểm tra
  if (!user_id || !date) {
    return res.status(400).json({ error: 'Thiếu thông tin user_id hoặc date.' });
  }

  try {
    // 3. Chuẩn bị câu SQL
    const sql = `
      SELECT * FROM meal_logs 
      WHERE user_id = ? AND meal_date = ?
      ORDER BY meal_type, id; 
      -- Sắp xếp theo bữa ăn, sau đó theo thứ tự thêm vào
    `;
    
    // 4. Truy vấn CSDL (Sử dụng pool của bạn)
    const [rows] = await pool.query(sql, [user_id, date]);
    
    // 5. Trả về kết quả (là một mảng các món ăn)
    res.status(200).json(rows);

  } catch (error) {
    console.error('Lỗi khi lấy lịch sử:', error);
    res.status(500).json({ error: 'Lỗi máy chủ khi lấy lịch sử.' });
  }

  // =================================================================
// [MỚI] API 3: LẤY CHI TIẾT MỘT MÓN ĂN THEO ID
// GET /api/nutrition/foods/:id
// =================================================================
router.get('/foods/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM nutrition_data WHERE id = ?", 
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy thực phẩm" });
    }

    // Map dữ liệu để khớp với Frontend (nếu cần)
    const food = rows[0];
    res.json({
      success: true,
      food: {
        id: food.id,
        name: food.food_name, // Đổi tên trường cho khớp UI
        calories: food.calories,
        protein_g: food.protein_g,
        fats_g: food.fats_g,
        carbs_g: food.carbs_g,
        fiber_g: food.fiber_g,
        description: food.description,
        // Thêm các trường khác nếu cần
      }
    });

  } catch (error) {
    console.error("Lỗi lấy chi tiết thực phẩm:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});
});
module.exports = { nutritionRouter: router };

