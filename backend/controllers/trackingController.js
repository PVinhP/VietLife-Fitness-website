// trackingController.js
const { pool } = require('../config/db');

exports.addMetric = async (req, res) => {
    const userId = req.user.id; 
    const { weight, waist, chest, date } = req.body;

    // Lấy kết nối để dùng Transaction
    const connection = await pool.getConnection(); 

    try {
        await connection.beginTransaction();

        // BƯỚC 1: KIỂM TRA XEM NGÀY NÀY ĐÃ CÓ DỮ LIỆU CHƯA?
        const [existingRows] = await connection.execute(
            `SELECT id FROM body_tracking_logs WHERE user_id = ? AND recorded_at = ?`,
            [userId, date]
        );

        if (existingRows.length > 0) {
            // --- TRƯỜNG HỢP A: ĐÃ CÓ -> THỰC HIỆN UPDATE ---
            // Chỉ cập nhật dòng cũ, không tạo dòng mới
            const logId = existingRows[0].id;
            
            // Logic cập nhật thông minh: Chỉ cập nhật trường nào người dùng có nhập
            // (Nếu gửi lên null/undefined thì giữ nguyên giá trị cũ)
            // Tuy nhiên để đơn giản, ta sẽ update đè tất cả các trường gửi lên
            const updateLogQuery = `
                UPDATE body_tracking_logs 
                SET weight = ?, waist = ?, chest = ?
                WHERE id = ?
            `;
            await connection.execute(updateLogQuery, [weight, waist, chest, logId]);
            
        } else {
            // --- TRƯỜNG HỢP B: CHƯA CÓ -> THỰC HIỆN INSERT ---
            const insertQuery = `
                INSERT INTO body_tracking_logs (user_id, weight, waist, chest, recorded_at) 
                VALUES (?, ?, ?, ?, ?)
            `;
            await connection.execute(insertQuery, [userId, weight, waist, chest, date]);
        }

        // BƯỚC 2: CẬP NHẬT PROFILE HIỆN TẠI (Giữ nguyên logic cũ)
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