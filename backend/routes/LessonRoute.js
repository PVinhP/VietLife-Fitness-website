const express = require('express');
const router = express.Router();
const { pool } = require('../config/db'); // Sử dụng pool từ config/db

/**
 * API LẤY LESSONS MỚI (THAY THẾ API CŨ)
 * Hỗ trợ filter, search, và sort
 * Đã sửa lỗi bảo mật SQL Injection
 */
router.get('/', async (req, res) => {
  const { loai, search, sort } = req.query;

  try {
    let query = `
      SELECT l.*, 
             GROUP_CONCAT(lt.ten_tag) as tags
      FROM lesson l
      LEFT JOIN lesson_tag_mapping ltm ON l.id = ltm.lesson_id
      LEFT JOIN lesson_tags lt ON ltm.tag_id = lt.id
      WHERE l.trang_thai = 'active'
    `;
    
    const params = [];

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
    res.json(rows);

  } catch (error) {
    console.error('Lỗi truy vấn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

/**
 * API LẤY TẤT CẢ TAGS
 * Phải đặt trước '/:id' để 'tags' không bị nhầm là một 'id'
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

// Lấy bài học theo ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM lesson WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bài học' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Lỗi truy vấn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Thêm bài học mới
router.post('/', async (req, res) => {
  const { tieu_de, hinh_anh, tom_tat, noi_dung, loai } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO lesson (tieu_de, hinh_anh, tom_tat, noi_dung, loai) VALUES (?, ?, ?, ?, ?)',
      [tieu_de, hinh_anh, tom_tat, noi_dung, loai]
    );
    res.status(201).json({
      id: result.insertId,
      message: 'Tạo bài học thành công',
      lesson: { id: result.insertId, tieu_de, hinh_anh, tom_tat, noi_dung, loai }
    });
  } catch (error) {
    console.error('Lỗi truy vấn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

/**
 * API TĂNG LƯỢT XEM
 */
router.post('/:id/view', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE lesson SET luot_xem = luot_xem + 1 WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Lỗi tăng lượt xem:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

/**
 * API TĂNG LƯỢT THÍCH
 */
router.post('/:id/like', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE lesson SET luot_thich = luot_thich + 1 WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Lỗi tăng lượt thích:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Cập nhật bài học
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { tieu_de, hinh_anh, tom_tat, noi_dung, loai } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE lesson SET tieu_de = ?, hinh_anh = ?, tom_tat = ?, noi_dung = ?, loai = ? WHERE id = ?',
      [tieu_de, hinh_anh, tom_tat, noi_dung, loai, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bài học để cập nhật' });
    }
    res.json({ message: 'Cập nhật bài học thành công' });
  } catch (error) {
    console.error('Lỗi truy vấn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Xóa bài học
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM lesson WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bài học để xóa' });
    }
    res.json({ message: 'Xóa bài học thành công' });
  } catch (error) {
    console.error('Lỗi truy vấn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy danh sách loại bài học
router.get('/types/all', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT DISTINCT loai FROM lesson WHERE loai IS NOT NULL ORDER BY loai'
    );
    const types = rows.map(row => row.loai);
    res.json(types);
  } catch (error) {
    console.error('Lỗi truy vấn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = { lessonRouter: router };