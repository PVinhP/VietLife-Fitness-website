// File: controllers/WaterController.js
const { pool } = require("../config/db");

// 1. Lấy dữ liệu nước của ngày (GET)
const getDailyWater = async (req, res) => {
    const user_id = req.user.id; // Lấy từ token
    const { date } = req.query;  // Lấy từ URL (?date=2025-12-19)

    try {
        // Chỉ lấy cột water_glasses
        const [rows] = await pool.query(
            'SELECT water_glasses FROM daily_stats WHERE user_id = ? AND date = ?',
            [user_id, date]
        );

        // Mặc định mục tiêu là 8 (hardcode theo ý bạn)
        const target = 8; 

        if (rows.length > 0) {
            // Đã có dữ liệu -> Trả về số đã uống
            res.json({ 
                glasses: rows[0].water_glasses, 
                target: target 
            });
        } else {
            // Chưa có dòng nào -> Trả về 0
            res.json({ 
                glasses: 0, 
                target: target 
            });
        }
    } catch (error) {
        console.error("Lỗi lấy nước:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// 2. Cập nhật nước (POST)
const logWater = async (req, res) => {
    const user_id = req.user.id;
    const { date, amount } = req.body; // amount: 1 (cộng) hoặc -1 (trừ)

    try {
        // Logic: UPSERT (Nếu chưa có thì Insert số 1, Nếu có rồi thì Update cộng dồn)
        // Mặc định insert water_target = 8 luôn cho đúng chuẩn bảng
        const sql = `
            INSERT INTO daily_stats (user_id, date, water_glasses, water_target)
            VALUES (?, ?, ?, 8) 
            ON DUPLICATE KEY UPDATE 
            water_glasses = water_glasses + ?
        `;

        // Tham số thứ 3 là giá trị khởi tạo (amount), tham số cuối là giá trị cộng thêm (amount)
        await pool.query(sql, [user_id, date, amount, amount]);

        res.json({ message: "Đã cập nhật nước thành công" });
    } catch (error) {
        console.error("Lỗi log nước:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

module.exports = { getDailyWater, logWater };