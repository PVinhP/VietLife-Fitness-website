const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const authMiddleware = require("../middlewares/AuthMiddleware");
const { checkRole } = require("../middlewares/checkRole");
const jwt = require('jsonwebtoken');

// Helper: Lấy User ID từ token
const getUserIdFromRequest = (req) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return null;
        const token = authHeader.split(' ')[1];
        if (!token) return null;
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret'); 
        return decoded.id;
    } catch (err) {
        return null;
    }
};

// ==========================================
// 👇 ĐÃ SỬA LỖI TẠI ĐÂY (API my-progress)
// ==========================================
router.get('/my-progress', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    
    try {
        // Thay đổi ORDER BY lup.updated_at -> ORDER BY lup.id
        const query = `
            SELECT 
                l.id as lesson_id,
                l.tieu_de,
                l.hinh_anh,
                l.tom_tat,
                l.loai,
                lup.progress_percent,
                lup.completed,
                lup.bookmark,
                lup.ngay_hoan_thanh
            FROM lesson_user_progress lup
            JOIN lesson l ON lup.lesson_id = l.id
            WHERE lup.user_id = ?
            ORDER BY lup.id DESC 
        `;
        
        const [rows] = await pool.query(query, [userId]);
        
        const data = rows.map(row => ({
            ...row,
            completed: !!row.completed,
            bookmark: !!row.bookmark
        }));

        res.json(data);
    } catch (error) {
        console.error('Lỗi lấy tiến độ:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// ... CÁC API KHÁC GIỮ NGUYÊN ...

/**
 * API LẤY DANH SÁCH BÀI HỌC
 */
router.get('/', async (req, res) => {
  const { loai, search, sort } = req.query;
  const userId = getUserIdFromRequest(req); 

  try {
    let query = `
      SELECT 
        l.*, 
        GROUP_CONCAT(lt.ten_tag) as tags,
        COALESCE(lup.progress_percent, 0) as user_progress,
        COALESCE(lup.bookmark, 0) as user_bookmarked,
        COALESCE(lup.completed, 0) as user_completed
      FROM lesson l
      LEFT JOIN lesson_tag_mapping ltm ON l.id = ltm.lesson_id
      LEFT JOIN lesson_tags lt ON ltm.tag_id = lt.id
      LEFT JOIN lesson_user_progress lup ON l.id = lup.lesson_id AND lup.user_id = ?
      WHERE l.trang_thai = 'active'
    `;
    
    const params = [userId];

    if (loai) {
      query += ` AND l.loai = ?`;
      params.push(loai);
    }
    
    if (search) {
      query += ` AND (l.tieu_de LIKE ? OR l.tom_tat LIKE ?)`;
      params.push(`%${search}%`);
      params.push(`%${search}%`);
    }
    
    query += ` GROUP BY l.id`;
    
    if (sort === 'popular') {
      query += ` ORDER BY l.luot_xem DESC`;
    } else if (sort === 'liked') {
      query += ` ORDER BY l.luot_thich DESC`;
    } else {
      query += ` ORDER BY l.ngay_tao DESC`;
    }

    const [rows] = await pool.query(query, params);
    
    const formattedRows = rows.map(row => ({
        ...row,
        user_bookmarked: !!row.user_bookmarked,
        user_completed: !!row.user_completed
    }));

    res.json(formattedRows);

  } catch (error) {
    console.error('Lỗi truy vấn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

/**
 * API LẤY CHI TIẾT BÀI HỌC THEO ID
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = getUserIdFromRequest(req);

  try {
    const query = `
        SELECT l.*, 
               COALESCE(lup.progress_percent, 0) as user_progress,
               COALESCE(lup.bookmark, 0) as user_bookmarked,
               COALESCE(lup.completed, 0) as user_completed
        FROM lesson l
        LEFT JOIN lesson_user_progress lup ON l.id = lup.lesson_id AND lup.user_id = ?
        WHERE l.id = ?
    `;
    const [rows] = await pool.query(query, [userId, id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bài học' });
    }
    
    const lesson = rows[0];
    
    lesson.user_bookmarked = !!lesson.user_bookmarked;
    lesson.user_completed = !!lesson.user_completed;

    res.json(lesson);
  } catch (error) {
    console.error('Lỗi truy vấn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

/**
 * API CẬP NHẬT TIẾN ĐỘ
 */
router.post('/:id/progress', authMiddleware, async (req, res) => {
    const lessonId = req.params.id;
    const userId = req.user.id;
    const { progress_percent } = req.body; 
    let reqCompleted = req.body.completed;

    try {
        const [check] = await pool.query(
            'SELECT id, progress_percent, completed FROM lesson_user_progress WHERE user_id = ? AND lesson_id = ?',
            [userId, lessonId]
        );

        let isCompleted = (reqCompleted || progress_percent >= 90) ? 1 : 0;
        const now = new Date();
        
        if (check.length > 0) {
            if (check[0].completed === 1) isCompleted = 1;

            await pool.query(
                `UPDATE lesson_user_progress 
                 SET 
                    progress_percent = GREATEST(progress_percent, ?), 
                    completed = ?,
                    ngay_hoan_thanh = IF(ngay_hoan_thanh IS NULL AND ? = 1, ?, ngay_hoan_thanh)
                 WHERE id = ?`,
                [progress_percent, isCompleted, isCompleted, now, check[0].id]
            );
        } else {
            await pool.query(
                `INSERT INTO lesson_user_progress 
                 (user_id, lesson_id, progress_percent, completed, ngay_hoan_thanh, bookmark) 
                 VALUES (?, ?, ?, ?, ?, 0)`,
                [userId, lessonId, progress_percent, isCompleted, isCompleted ? now : null]
            );
        }
        
        res.json({ success: true, message: "Đã cập nhật tiến độ" });

    } catch (error) {
        console.error('Lỗi update progress:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

/**
 * API BOOKMARK
 */
router.post('/:id/bookmark', authMiddleware, async (req, res) => {
    const lessonId = req.params.id;
    const userId = req.user.id;
  
    try {
      const [check] = await pool.query(
        'SELECT id, bookmark FROM lesson_user_progress WHERE user_id = ? AND lesson_id = ?',
        [userId, lessonId]
      );
  
      if (check.length > 0) {
        const newStatus = !check[0].bookmark;
        await pool.query(
          'UPDATE lesson_user_progress SET bookmark = ? WHERE id = ?',
          [newStatus, check[0].id]
        );
        res.json({ success: true, bookmarked: newStatus });
      } else {
        await pool.query(
          'INSERT INTO lesson_user_progress (user_id, lesson_id, bookmark, progress_percent, completed) VALUES (?, ?, 1, 0, 0)',
          [userId, lessonId]
        );
        res.json({ success: true, bookmarked: true });
      }
    } catch (error) {
      console.error('Lỗi bookmark:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
});

/**
 * API TĂNG LƯỢT XEM
 */
router.post('/:id/view', async (req, res) => {
    try {
        await pool.query('UPDATE lesson SET luot_xem = luot_xem + 1 WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

/**
 * API TĂNG LƯỢT THÍCH
 */
router.post('/:id/like', async (req, res) => {
    try {
        await pool.query('UPDATE lesson SET luot_thich = luot_thich + 1 WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

/**
 * API LẤY TẤT CẢ TAGS
 */
router.get('/tags', async (req, res) => {
  try {
    const [tags] = await pool.query('SELECT * FROM lesson_tags ORDER BY ten_tag');
    res.json(tags);
  } catch (error) {
    console.error('Lỗi truy vấn tags:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// ADMIN ROUTES (Giữ nguyên)
router.post('/', authMiddleware, checkRole(['admin', 'pt']), async (req, res) => {
  const { tieu_de, hinh_anh, tom_tat, noi_dung, loai, thoi_gian_doc, do_kho } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO lesson (tieu_de, hinh_anh, tom_tat, noi_dung, loai, thoi_gian_doc, do_kho, trang_thai) VALUES (?, ?, ?, ?, ?, ?, ?, "active")',
      [tieu_de, hinh_anh, tom_tat, noi_dung, loai, thoi_gian_doc || 5, do_kho || 'trung-binh']
    );
    res.status(201).json({ message: 'Tạo bài học thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.put('/:id', authMiddleware, checkRole(['admin', 'pt']), async (req, res) => {
  const { id } = req.params;
  const { tieu_de, hinh_anh, tom_tat, noi_dung, loai, thoi_gian_doc, do_kho } = req.body;
  try {
    await pool.query(
      'UPDATE lesson SET tieu_de = ?, hinh_anh = ?, tom_tat = ?, noi_dung = ?, loai = ?, thoi_gian_doc = ?, do_kho = ? WHERE id = ?',
      [tieu_de, hinh_anh, tom_tat, noi_dung, loai, thoi_gian_doc, do_kho, id]
    );
    res.json({ message: 'Cập nhật thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.delete('/:id', authMiddleware, checkRole(['admin', 'pt']), async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM lesson WHERE id = ?', [id]);
    res.json({ message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = { lessonRouter: router };