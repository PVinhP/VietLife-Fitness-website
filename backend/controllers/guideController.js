// server/controllers/guideController.js
const db = require('../config/db');

exports.getGuideByMuscleGroup = async (req, res) => {
    try {
        const { groupName } = req.params;

        const sql = 'SELECT title, content FROM muscle_group_guides WHERE muscle_group_name = ?';
        const [results] = await db.pool.execute(sql, [groupName]);

        if (results.length === 0) {
            // Không tìm thấy guide, không phải là lỗi, chỉ là không có
            return res.status(404).json({ msg: 'Không tìm thấy hướng dẫn' });
        }

        res.json(results[0]); // Trả về { title: "...", content: "..." }

    } catch (error) {
        console.error('Lỗi getGuideByMuscleGroup:', error.message);
        res.status(500).send('Lỗi máy chủ');
    }
};