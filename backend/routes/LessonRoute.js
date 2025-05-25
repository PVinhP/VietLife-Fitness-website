const express = require('express');
const router = express.Router();
const { pool } = require('../config/db'); // Sử dụng pool từ config/db thay vì db

// Lấy tất cả bài học
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM lesson');
    res.json(rows);
  } catch (error) {
    console.error('Lỗi truy vấn:', error);
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

// Lọc theo loại
router.get('/type/:loai', async (req, res) => {
  const { loai } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM lesson WHERE loai = ? ORDER BY id DESC', [loai]);
    res.json(rows);
  } catch (error) {
    console.error('Lỗi truy vấn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Tìm kiếm theo tiêu đề hoặc tóm tắt
router.get('/search', async (req, res) => {
  const { q } = req.query;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM lesson WHERE tieu_de LIKE ? OR tom_tat LIKE ? ORDER BY id DESC',
      [`%${q}%`, `%${q}%`]
    );
    res.json(rows);
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