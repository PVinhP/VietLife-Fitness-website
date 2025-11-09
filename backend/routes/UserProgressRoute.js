// routes/UserProgressRoute.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const authMiddleware = require('../middlewares/AuthMiddleware'); // Đảm bảo đường dẫn đúng

/**
 * TẤT CẢ CÁC ROUTE DƯỚI ĐÂY ĐỀU YÊU CẦU XÁC THỰC
 */
router.use(authMiddleware); // Áp dụng cho toàn bộ route trong file này

/**
 * 1. LẤY TIẾN ĐỘ HỌC TẬP CỦA USER
 * GET /api/progress
 */
router.get('/', async (req, res) => {
  const { filter } = req.query; // 'completed', 'in-progress', 'bookmarked'
  const userId = req.user.id; // Lấy từ authMiddleware

  try {
    let query = `
      SELECT 
        lup.*,
        l.tieu_de,
        l.hinh_anh,
        l.tom_tat,
        l.loai,
        l.thoi_gian_doc as duration,
        GROUP_CONCAT(lt.ten_tag) as tags
      FROM lesson_user_progress lup
      INNER JOIN lesson l ON lup.lesson_id = l.id
      LEFT JOIN lesson_tag_mapping ltm ON l.id = ltm.lesson_id
      LEFT JOIN lesson_tags lt ON ltm.tag_id = lt.id
      WHERE lup.user_id = ?
    `;

    const params = [userId];

    // Filter theo trạng thái
    if (filter === 'completed') {
      query += ` AND lup.completed = 1`;
    } else if (filter === 'in-progress') {
      query += ` AND lup.completed = 0 AND lup.progress_percent > 0`;
    } else if (filter === 'bookmarked') {
      query += ` AND lup.bookmark = 1`;
    }

    query += ` GROUP BY lup.id ORDER BY lup.ngay_hoan_thanh DESC`;

    const [rows] = await pool.query(query, params);
    res.json(rows);

  } catch (error) {
    console.error('Lỗi lấy tiến độ:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

/**
 * 2. LẤY TIẾN ĐỘ CỦA MỘT BÀI HỌC CỤ THỂ
 * GET /api/progress/:lessonId
 */
router.get('/:lessonId', async (req, res) => {
  const { lessonId } = req.params;
  const userId = req.user.id;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM lesson_user_progress 
       WHERE user_id = ? AND lesson_id = ?`,
      [userId, lessonId]
    );

    if (rows.length === 0) {
      return res.json({ exists: false, progress: null });
    }

    res.json({ exists: true, progress: rows[0] });

  } catch (error) {
    console.error('Lỗi lấy tiến độ bài học:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

/**
 * 3. CẬP NHẬT TIẾN ĐỘ HỌC TẬP
 * POST /api/progress/:lessonId
 */
router.post('/:lessonId', async (req, res) => {
  const { lessonId } = req.params;
  const userId = req.user.id;
  const { 
    progress_percent = 0, 
    completed = false, 
    ghi_chu = '' 
  } = req.body;

  try {
    const [existing] = await pool.query(
      `SELECT id, ngay_hoan_thanh FROM lesson_user_progress 
       WHERE user_id = ? AND lesson_id = ?`,
      [userId, lessonId]
    );

    if (existing.length > 0) {
      // UPDATE
      const updateFields = [];
      const updateValues = [];

      updateFields.push('progress_percent = ?');
      updateValues.push(progress_percent);

      updateFields.push('completed = ?');
      updateValues.push(completed ? 1 : 0);

      updateFields.push('ghi_chu = ?');
      updateValues.push(ghi_chu);

      if (completed) {
        updateFields.push('ngay_hoan_thanh = ?');
        updateValues.push(new Date());
      }

      updateValues.push(userId, lessonId);

      await pool.query(
        `UPDATE lesson_user_progress SET ${updateFields.join(', ')} 
         WHERE user_id = ? AND lesson_id = ?`,
        updateValues
      );

      res.json({ message: 'Cập nhật tiến độ thành công', updated: true });
    } else {
      // INSERT
      await pool.query(
        `INSERT INTO lesson_user_progress 
         (user_id, lesson_id, progress_percent, completed, ghi_chu, ngay_hoan_thanh)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          lessonId,
          progress_percent,
          completed ? 1 : 0,
          ghi_chu,
          completed ? new Date() : null
        ]
      );

      res.status(201).json({ message: 'Tạo tiến độ thành công', created: true });
    }

  } catch (error) {
    console.error('Lỗi cập nhật tiến độ:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

/**
 * 4. BOOKMARK BÀI HỌC
 * POST /api/progress/:lessonId/bookmark
 */
router.post('/:lessonId/bookmark', async (req, res) => {
  const { lessonId } = req.params;
  const userId = req.user.id;
  const { bookmark } = req.body;

  try {
    const [existing] = await pool.query(
      `SELECT id FROM lesson_user_progress WHERE user_id = ? AND lesson_id = ?`,
      [userId, lessonId]
    );

    if (existing.length > 0) {
      await pool.query(
        `UPDATE lesson_user_progress SET bookmark = ? WHERE user_id = ? AND lesson_id = ?`,
        [bookmark ? 1 : 0, userId, lessonId]
      );
    } else {
      await pool.query(
        `INSERT INTO lesson_user_progress (user_id, lesson_id, bookmark, progress_percent, completed)
         VALUES (?, ?, ?, 0, 0)`,
        [userId, lessonId, bookmark ? 1 : 0]
      );
    }

    res.json({ 
      message: bookmark ? 'Đã thêm vào yêu thích' : 'Đã bỏ yêu thích',
      bookmarked: bookmark 
    });

  } catch (error) {
    console.error('Lỗi bookmark:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

/**
 * 5. CẬP NHẬT GHI CHÚ
 * PUT /api/progress/:lessonId/notes
 */
router.put('/:lessonId/notes', async (req, res) => {
  const { lessonId } = req.params;
  const userId = req.user.id;
  const { ghi_chu } = req.body;

  try {
    const [existing] = await pool.query(
      `SELECT id FROM lesson_user_progress WHERE user_id = ? AND lesson_id = ?`,
      [userId, lessonId]
    );

    if (existing.length > 0) {
      await pool.query(
        `UPDATE lesson_user_progress SET ghi_chu = ? WHERE user_id = ? AND lesson_id = ?`,
        [ghi_chu, userId, lessonId]
      );
    } else {
      await pool.query(
        `INSERT INTO lesson_user_progress (user_id, lesson_id, ghi_chu, progress_percent, completed)
         VALUES (?, ?, ?, 0, 0)`,
        [userId, lessonId, ghi_chu]
      );
    }

    res.json({ message: 'Cập nhật ghi chú thành công' });

  } catch (error) {
    console.error('Lỗi cập nhật ghi chú:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

/**
 * 6. THỐNG KÊ TIẾN ĐỘ
 * GET /api/progress/stats/summary
 */
router.get('/stats/summary', async (req, res) => {
  const userId = req.user.id;

  try {
    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) as total_lessons,
        SUM(completed) as completed_count,
        SUM(CASE WHEN progress_percent > 0 AND completed = 0 THEN 1 ELSE 0 END) as in_progress_count,
        SUM(bookmark) as bookmarked_count,
        AVG(progress_percent) as avg_progress
      FROM lesson_user_progress
      WHERE user_id = ?`,
      [userId]
    );

    res.json(stats[0]);

  } catch (error) {
    console.error('Lỗi lấy thống kê:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

/**
 * 7. LỊCH SỬ GẦN ĐÂY
 * GET /api/progress/recent
 */
router.get('/recent', async (req, res) => {
  const userId = req.user.id;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const [rows] = await pool.query(
      `SELECT 
        lup.*,
        l.tieu_de,
        l.hinh_anh,
        l.tom_tat,
        l.loai
      FROM lesson_user_progress lup
      INNER JOIN lesson l ON lup.lesson_id = l.id
      WHERE lup.user_id = ?
      ORDER BY lup.ngay_hoan_thanh DESC
      LIMIT ?`,
      [userId, limit]
    );

    res.json(rows);

  } catch (error) {
    console.error('Lỗi lấy lịch sử:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

/**
 * 8. XÓA TIẾN ĐỘ
 * DELETE /api/progress/:lessonId
 */
router.delete('/:lessonId', async (req, res) => {
  const { lessonId } = req.params;
  const userId = req.user.id;

  try {
    const [result] = await pool.query(
      `DELETE FROM lesson_user_progress WHERE user_id = ? AND lesson_id = ?`,
      [userId, lessonId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tiến độ' });
    }

    res.json({ message: 'Đã xóa tiến độ học tập' });

  } catch (error) {
    console.error('Lỗi xóa tiến độ:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = { userProgressRouter: router };