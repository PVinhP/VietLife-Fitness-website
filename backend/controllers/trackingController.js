// trackingController.js
const { pool } = require('../config/db');

// --- HÀM 1: THÊM MỚI HOẶC CẬP NHẬT (UPSERT) ---
exports.addMetric = async (req, res) => {
    const userId = req.user.id; 
    const { weight, waist, chest, date } = req.body;

    const connection = await pool.getConnection(); 

    try {
        await connection.beginTransaction();

        // BƯỚC 1: KIỂM TRA & CẬP NHẬT/THÊM MỚI VÀO LOGS
        const [existingRows] = await connection.execute(
            `SELECT id FROM body_tracking_logs WHERE user_id = ? AND recorded_at = ?`,
            [userId, date]
        );

        if (existingRows.length > 0) {
            // UPDATE
            const logId = existingRows[0].id;
            const updateLogQuery = `
                UPDATE body_tracking_logs 
                SET weight = ?, waist = ?, chest = ?
                WHERE id = ?
            `;
            await connection.execute(updateLogQuery, [weight, waist, chest, logId]);
        } else {
            // INSERT
            const insertQuery = `
                INSERT INTO body_tracking_logs (user_id, weight, waist, chest, recorded_at) 
                VALUES (?, ?, ?, ?, ?)
            `;
            await connection.execute(insertQuery, [
                userId, 
                weight ?? null, 
                waist ?? null, 
                chest ?? null, 
                date
            ]);
        }

        // BƯỚC 2: CẬP NHẬT PROFILE
        const recordDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (recordDate >= today && weight) {
            const updateProfileQuery = `
                UPDATE health_profiles 
                SET weight_kg = ?, updated_at = NOW() 
                WHERE user_id = ?
            `;
            await connection.execute(updateProfileQuery, [weight, userId]);
        }

        await connection.commit(); 
        res.status(200).json({ message: 'Cập nhật chỉ số thành công!' });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi lưu chỉ số' });
    } finally {
        connection.release();
    }
}; 

// --- HÀM 2: LẤY LỊCH SỬ (HÀM BẠN ĐANG THIẾU) ---
exports.getHistory = async (req, res) => {
    const userId = req.user.id;

    try {
        // Dùng pool.query cho gọn vì chỉ là SELECT đơn giản
        const [rows] = await pool.query(`
            SELECT 
                DATE_FORMAT(recorded_at, '%Y-%m-%d') as date,
                weight, 
                waist, 
                chest
            FROM body_tracking_logs 
            WHERE user_id = ? 
            ORDER BY recorded_at ASC
        `, [userId]);

        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy dữ liệu lịch sử' });
    }
};