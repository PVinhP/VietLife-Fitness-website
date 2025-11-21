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
    const [rows] = await pool.query(`
      SELECT 
        p.id as parent_id,
        p.name as parent_name,
        p.icon as parent_icon,
        c.id as child_id,
        c.name as child_name,
        c.name_en as child_name_en,
        c.description as child_desc,
        c.health_rating,
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
          parentId: row.parent_id,
          parentName: row.parent_name,
          icon: row.parent_icon,
          items: []
        };
      }
      acc[parentKey].items.push({
        id: row.child_id,
        name: row.child_name,
        nameEn: row.child_name_en,
        desc: row.child_desc,
        healthy: row.health_rating
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
// API 4: TÌM KIẾM THỰC PHẨM (CẬP NHẬT)
// GET /api/food-classification/foods?groupId=1&search=...
// ========================================
router.get("/foods", async (req, res) => {
  try {
    const { tags, search, groupId } = req.query; // Thêm groupId
    const tagArray = tags ? tags.split(',').map(t => t.trim()) : [];

    let query = `
      SELECT DISTINCT
        n.id,
        n.food_name as name,
        n.food_group,
        n.calories,
        n.protein_g,
        n.carbs_g,
        n.fats_g,
        n.fiber_g,
        n.description
      FROM nutrition_data n
    `;

    // Join bảng mapping nếu lọc theo groupId
    if (groupId) {
      query += ` INNER JOIN food_group_mapping fgm ON n.id = fgm.food_id `;
    }

    const conditions = [];
    const params = [];

    // Filter theo Group ID
    if (groupId) {
      conditions.push(`fgm.group_id = ?`);
      params.push(groupId);
    }

    // Filter theo Tags (Logic cũ giữ nguyên)
    if (tagArray.length > 0) {
      // ... (Code xử lý tags như cũ)
    }

    // Search theo tên
    if (search) {
      conditions.push(`n.food_name LIKE ?`);
      params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` LIMIT 100`;

    const [foods] = await pool.query(query, params);

    res.json({
      success: true,
      count: foods.length,
      foods: foods
    });

  } catch (error) {
    console.error("Lỗi khi tìm kiếm thực phẩm:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

/*
// ========================================
// API 4: TÌM KIẾM THỰC PHẨM VỚI BỘ LỌC (MỨC NÂNG CAO)
// GET /api/food-classification/foods?tags=high-protein,low-carb&search=gà
// ========================================
router.get("/foods", async (req, res) => {
  try {
    const { tags, search } = req.query;
    const tagArray = tags ? tags.split(',').map(t => t.trim()) : [];

    let query = `
      SELECT DISTINCT
        n.id,
        n.food_name as name,
        n.food_group,
        n.calories,
        n.protein_g,
        n.carbs_g,
        n.fats_g,
        n.fiber_g,
        n.description,
        GROUP_CONCAT(DISTINCT ft.tag_name_display ORDER BY ft.sort_order SEPARATOR ',') as tags
      FROM nutrition_data n
    `;

    const conditions = [];
    const params = [];

    // Nếu có tags filter
    if (tagArray.length > 0) {
      query += `
        INNER JOIN food_tag_mapping ftm ON n.id = ftm.food_id
        INNER JOIN food_tags ft ON ftm.tag_id = ft.id
      `;

      // Lấy tag IDs
      const [tagRows] = await pool.query(
        `SELECT id FROM food_tags WHERE tag_name_display IN (?)`,
        [tagArray]
      );
      const tagIds = tagRows.map(t => t.id);

      if (tagIds.length > 0) {
        conditions.push(`ftm.tag_id IN (?)`);
        params.push(tagIds);
      }
    } else {
      // Không có filter tags, vẫn JOIN để lấy tags của thực phẩm
      query += `
        LEFT JOIN food_tag_mapping ftm ON n.id = ftm.food_id
        LEFT JOIN food_tags ft ON ftm.tag_id = ft.id
      `;
    }

    // Search by name
    if (search) {
      conditions.push(`n.food_name LIKE ?`);
      params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` GROUP BY n.id`;

    // Nếu có nhiều tags, chỉ lấy thực phẩm có ĐỦ tất cả tags
    if (tagArray.length > 0) {
      query += ` HAVING COUNT(DISTINCT ftm.tag_id) >= ?`;
      params.push(tagArray.length);
    }

    query += ` LIMIT 100`; // Giới hạn kết quả

    const [foods] = await pool.query(query, params);

    // Format kết quả
    const formattedFoods = foods.map(food => ({
      id: food.id,
      name: food.name,
      desc: food.description || `Nhóm: ${food.food_group}`,
      calo: food.calories,
      protein: food.protein_g,
      carbs: food.carbs_g,
      fats: food.fats_g,
      fiber: food.fiber_g,
      tags: food.tags ? food.tags.split(',') : []
    }));

    res.json({
      success: true,
      count: formattedFoods.length,
      foods: formattedFoods
    });

  } catch (error) {
    console.error("Lỗi khi tìm kiếm thực phẩm:", error);
    res.status(500).json({ 
      success: false,
      message: "Lỗi server khi tìm kiếm thực phẩm" 
    });
  }
});
*/

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