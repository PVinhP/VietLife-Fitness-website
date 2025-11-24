// ========================================
// FILE: backend/routes/LibraryFoodRoute.js
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
    // Query lấy cả cha và con
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
          id: row.parent_id,
          name: row.parent_name,
          icon: row.parent_icon,
          color_class: row.parent_color_class, 
          items: []
        };
      }
      acc[parentKey].items.push({
        id: row.child_id,
        name: row.child_name,
        nameEn: row.child_name_en,
        desc: row.child_desc,
        healthy: row.health_rating,
        // Kế thừa icon/màu của cha nếu con không có
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
// API 3: LẤY DANH SÁCH TAGS (CẬP NHẬT MỚI CHO 11 NHÓM)
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
      ORDER BY sort_order ASC
    `);

    // Khởi tạo các nhóm chứa (Phải khớp với Frontend Interface)
    const grouped = {
      // 1. Nhóm Ưu tiên (Fitness/Health)
      fitness: [],
      health: [],
      vitamin_mineral: [],
      
      // 2. Nhóm Thói quen & Văn hóa
      cooking: [],
      occasion: [],
      eastern: [],
      taste: [],
      
      // 3. Nhóm An toàn & Kỹ thuật
      allergen: [],
      nutrition: [], // Tương ứng với 'functional' cũ
      diet: [],
      nova: []
    };

    rows.forEach(tag => {
      const displayName = tag.tag_name_display || tag.tag_name;
      
      // Phân loại dựa vào tag_type trong DB
      switch (tag.tag_type) {
        case 'fitness': 
          grouped.fitness.push(displayName); 
          break;
        case 'health': 
          grouped.health.push(displayName); 
          break;
        case 'vitamin_mineral': 
          grouped.vitamin_mineral.push(displayName); 
          break;
        case 'cooking': 
          grouped.cooking.push(displayName); 
          break;
        case 'occasion': 
          grouped.occasion.push(displayName); 
          break;
        case 'eastern': 
          grouped.eastern.push(displayName); 
          break;
        case 'taste': 
          grouped.taste.push(displayName); 
          break;
        case 'allergen': 
          grouped.allergen.push(displayName); 
          break;
        case 'nutrition': 
          grouped.nutrition.push(displayName); 
          break;
        case 'diet': 
          grouped.diet.push(displayName); 
          break;
        case 'nova': 
          grouped.nova.push(displayName); 
          break;
        default:
          // Nếu có tag lạ chưa định nghĩa nhóm, có thể log ra hoặc bỏ qua
          break;
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

    // 1. Xử lý danh sách tags từ query param
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
        -- Lấy danh sách tags hiển thị
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

    // 3. Lọc theo Group ID
    if (groupId) {
      query += ` JOIN food_group_mapping fgm ON n.id = fgm.food_id `;
      conditions.push(`fgm.group_id = ?`);
      params.push(groupId);
    }

    // 4. Lọc theo Tags (Logic AND - Món ăn phải có đủ tất cả tags)
    if (tagArray.length > 0) {
      query += ` 
        JOIN food_tag_mapping ftm ON n.id = ftm.food_id 
        JOIN food_tags ft ON ftm.tag_id = ft.id 
      `;
      conditions.push(`ft.tag_name_display IN (?)`);
      params.push(tagArray);
    }

    // 5. Tìm kiếm theo tên
    if (search) {
      conditions.push(`n.food_name LIKE ?`);
      params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    // 6. Group By & Having
    query += ` GROUP BY n.id`;

    if (tagArray.length > 0) {
      query += ` HAVING COUNT(DISTINCT ft.id) >= ?`;
      params.push(tagArray.length);
    }

    query += ` LIMIT 999`;

    const [foods] = await pool.query(query, params);

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

    const [foods] = await pool.query(`
      SELECT * FROM nutrition_data WHERE id = ?
    `, [id]);

    if (foods.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    }

    const food = foods[0];

    // Lấy nhóm
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
      ORDER BY ft.sort_order
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
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// ========================================
// API 6: THỐNG KÊ
// ========================================
router.get("/stats", async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        fg.id, fg.name, fg.icon,
        COUNT(DISTINCT fgm.food_id) as food_count
      FROM food_groups fg
      LEFT JOIN food_group_mapping fgm ON fg.id = fgm.group_id
      WHERE fg.level = 1
      GROUP BY fg.id
      ORDER BY fg.sort_order
    `);
    res.json({ success: true, stats: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

module.exports = { foodClassificationRouter: router };