// ========================================
// FILE: backend/routes/FoodClassificationRoute.js
// ========================================

const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");

// ========================================
// API 1: LẤY NHÓM THỰC PHẨM MỨC CƠ BẢN (LEVEL 1)
// GET /api/food-classification/basic-groups
// ========================================
router.get("/basic-groups", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id, 
        name, 
        name_en, 
        icon, 
        color_class,
        description,
        sort_order
      FROM food_groups
      WHERE level = 1
      ORDER BY sort_order ASC
    `);

    res.json({
      success: true,
      count: rows.length,
      groups: rows
    });

  } catch (error) {
    console.error("Lỗi khi lấy nhóm cơ bản:", error);
    res.status(500).json({ 
      success: false,
      message: "Lỗi server khi lấy dữ liệu nhóm cơ bản" 
    });
  }
});
// ========================================
// API 2: LẤY NHÓM THỰC PHẨM MỨC TRUNG CẤP (LEVEL 2)
// GET /api/food-classification/intermediate-groups
// ========================================
router.get("/intermediate-groups", async (req, res) => {
  try {
    // 1. Thêm p.color_class vào câu Query
    const [rows] = await pool.query(`
      SELECT 
        p.id as parent_id,
        p.name as parent_name,
        p.icon as parent_icon,
        p.color_class as parent_color_class, 
        c.id as child_id,
        c.name as child_name,
        c.name_en as child_name_en,
        c.description as child_desc,
        c.health_rating,
        c.color_class as child_color_class, 
        c.icon as child_icon,
        c.sort_order
      FROM food_groups p
      INNER JOIN food_groups c ON c.parent_id = p.id
      WHERE p.level = 1 AND c.level = 2
      ORDER BY p.sort_order, c.sort_order
    `);

    // Nhóm dữ liệu theo parent
    const grouped = rows.reduce((acc, row) => {
      const parentKey = row.parent_id;
      if (!acc[parentKey]) {
        acc[parentKey] = {
          // 2. Sửa tên Key cho khớp với Interface ở Frontend
          id: row.parent_id,           // Frontend dùng .id (không phải parentId)
          name: row.parent_name,       // Frontend dùng .name (không phải parentName)
          icon: row.parent_icon,
          color_class: row.parent_color_class, // QUAN TRỌNG: Thêm trường này để fix lỗi .split()
          items: []
        };
      }
      acc[parentKey].items.push({
        id: row.child_id,
        name: row.child_name,
        nameEn: row.child_name_en,
        desc: row.child_desc,
        healthy: row.health_rating,
        // Kế thừa icon/màu của cha nếu con không có (để hiển thị modal đẹp)
        icon: row.child_icon || row.parent_icon, 
        color_class: row.child_color_class || row.parent_color_class 
      });
      return acc;
    }, {});

    res.json({
      success: true,
      level: 2,
      groups: Object.values(grouped)
    });

  } catch (error) {
    console.error("Lỗi khi lấy nhóm trung cấp:", error);
    res.status(500).json({ 
      success: false,
      message: "Lỗi server khi lấy dữ liệu nhóm trung cấp" 
    });
  }
});

// ========================================
// API 3: LẤY DANH SÁCH TAGS CHO MỨC NÂNG CAO
// GET /api/food-classification/tags
// ========================================
router.get("/tags", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id, 
        tag_name, 
        tag_name_display, 
        tag_type, 
        description,
        sort_order
      FROM food_tags
      ORDER BY tag_type, sort_order
    `);

    // Nhóm theo tag_type
    const grouped = {
      functional: [],
      diet: [],
      nova: []
    };

    rows.forEach(tag => {
      const displayName = tag.tag_name_display || tag.tag_name;
      if (tag.tag_type === 'nutrition') {
        grouped.functional.push(displayName);
      } else if (tag.tag_type === 'diet') {
        grouped.diet.push(displayName);
      } else if (tag.tag_type === 'processing') {
        grouped.nova.push(displayName);
      }
    });

    res.json({
      success: true,
      filters: grouped
    });

  } catch (error) {
    console.error("Lỗi khi lấy tags:", error);
    res.status(500).json({ 
      success: false,
      message: "Lỗi server khi lấy danh sách tags" 
    });
  }
});

// ========================================
// API 4: TÌM KIẾM THỰC PHẨM ĐA NĂNG (Hỗ trợ Search tên + Filter Tags)
// GET /api/food-classification/foods?tags=High-protein,EatClean&search=gà&groupId=1
// ========================================
router.get("/foods", async (req, res) => {
  try {
    const { tags, search, groupId } = req.query;

    // 1. Xử lý danh sách tags từ query param (ngăn cách bởi dấu phẩy)
    // Ví dụ: tags="High-protein,EatClean" -> array=["High-protein", "EatClean"]
    const tagArray = tags ? tags.split(',').filter(t => t.trim() !== '') : [];

    // 2. Base Query
    let query = `
      SELECT 
        n.id,
        n.food_name as name,
        n.food_group,
        n.calories,
        n.protein_g,
        n.carbs_g,
        n.fats_g,
        n.fiber_g,
        n.description,
        n.image_url,
        -- Lấy danh sách tags của món ăn đó để hiển thị ra UI
        (
          SELECT GROUP_CONCAT(ft_sub.tag_name_display SEPARATOR ', ')
          FROM food_tags ft_sub
          JOIN food_tag_mapping ftm_sub ON ft_sub.id = ftm_sub.tag_id
          WHERE ftm_sub.food_id = n.id
        ) as tags_display
      FROM nutrition_data n
    `;

    const conditions = [];
    const params = [];

    // 3. Xử lý lọc theo Group ID (nếu có - dùng cho Basic/Intermediate View)
    if (groupId) {
      query += ` JOIN food_group_mapping fgm ON n.id = fgm.food_id `;
      conditions.push(`fgm.group_id = ?`);
      params.push(groupId);
    }

    // 4. Xử lý lọc theo Tags (Logic "AND" - Món ăn phải có ĐỦ tất cả tags đã chọn)
    if (tagArray.length > 0) {
      // Join bảng tags
      query += ` 
        JOIN food_tag_mapping ftm ON n.id = ftm.food_id 
        JOIN food_tags ft ON ftm.tag_id = ft.id 
      `;
      
      // Chỉ lấy những dòng có tag nằm trong danh sách chọn
      conditions.push(`ft.tag_name_display IN (?)`);
      params.push(tagArray);
    }

    // 5. Xử lý tìm kiếm theo tên
    if (search) {
      conditions.push(`n.food_name LIKE ?`);
      params.push(`%${search}%`);
    }

    // Gắn điều kiện WHERE
    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    // 6. Group By & Having (Quan trọng cho logic lọc Tags)
    query += ` GROUP BY n.id`;

    // Nếu người dùng chọn 2 tags, thì món ăn tìm thấy phải có số lượng tags khớp >= 2
    if (tagArray.length > 0) {
      query += ` HAVING COUNT(DISTINCT ft.id) >= ?`;
      params.push(tagArray.length);
    }

    // Giới hạn kết quả
    query += ` LIMIT 100`;

    const [foods] = await pool.query(query, params);

    // Format lại dữ liệu tag từ chuỗi sang mảng để Frontend dễ dùng
    const formattedFoods = foods.map(f => ({
      ...f,
      tags: f.tags_display ? f.tags_display.split(', ') : []
    }));

    res.json({
      success: true,
      count: formattedFoods.length,
      foods: formattedFoods
    });

  } catch (error) {
    console.error("Lỗi tìm kiếm thực phẩm:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// ========================================
// API 5: LẤY CHI TIẾT THỰC PHẨM
// GET /api/food-classification/foods/:id
// ========================================
router.get("/foods/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Lấy thông tin thực phẩm
    const [foods] = await pool.query(`
      SELECT 
        id,
        food_name as name,
        food_group,
        description,
        calories,
        water_g,
        protein_g,
        fats_g,
        carbs_g,
        fiber_g
      FROM nutrition_data 
      WHERE id = ?
    `, [id]);

    if (foods.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thực phẩm'
      });
    }

    const food = foods[0];

    // Lấy nhóm thực phẩm
    const [groups] = await pool.query(`
      SELECT fg.id, fg.name, fg.level
      FROM food_groups fg
      INNER JOIN food_group_mapping fgm ON fg.id = fgm.group_id
      WHERE fgm.food_id = ?
      ORDER BY fg.level
    `, [id]);

    // Lấy tags
    const [tags] = await pool.query(`
      SELECT ft.tag_name, ft.tag_name_display, ft.tag_type
      FROM food_tags ft
      INNER JOIN food_tag_mapping ftm ON ft.id = ftm.tag_id
      WHERE ftm.food_id = ?
      ORDER BY ft.tag_type, ft.sort_order
    `, [id]);

    res.json({
      success: true,
      food: {
        ...food,
        groups: groups,
        tags: tags
      }
    });

  } catch (error) {
    console.error("Lỗi khi lấy chi tiết thực phẩm:", error);
    res.status(500).json({ 
      success: false,
      message: "Lỗi server khi lấy chi tiết thực phẩm" 
    });
  }
});

// ========================================
// API 6: THỐNG KÊ - SỐ LƯỢNG THỰC PHẨM THEO NHÓM
// GET /api/food-classification/stats
// ========================================
router.get("/stats", async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        fg.id,
        fg.name,
        fg.icon,
        COUNT(DISTINCT fgm.food_id) as food_count
      FROM food_groups fg
      LEFT JOIN food_group_mapping fgm ON fg.id = fgm.group_id
      WHERE fg.level = 1
      GROUP BY fg.id
      ORDER BY fg.sort_order
    `);

    res.json({
      success: true,
      stats: stats
    });

  } catch (error) {
    console.error("Lỗi khi lấy thống kê:", error);
    res.status(500).json({ 
      success: false,
      message: "Lỗi server khi lấy thống kê" 
    });
  }
});

module.exports = { foodClassificationRouter: router };