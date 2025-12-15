// File: controllers/DashboardController.js
const { pool } = require("../config/db");

const getDashboardStats = async (req, res) => {
    try {
        // 1. Thực hiện các câu lệnh đếm (COUNT) song song bằng Promise.all để tối ưu tốc độ
        const [
            usersData, 
            exercisesData, 
            plansData, 
            lessonsData, 
            foodsData,
            sportsData
        ] = await Promise.all([
            pool.query("SELECT COUNT(*) as count FROM users"),
            pool.query("SELECT COUNT(*) as count FROM exercises"),
            pool.query("SELECT COUNT(*) as count FROM plans"),
            pool.query("SELECT COUNT(*) as count FROM lesson"), // Chú ý: bảng tên là 'lesson' (số ít) trong code cũ
            pool.query("SELECT COUNT(*) as count FROM nutrition_data"),
            pool.query("SELECT COUNT(*) as count FROM sports")
        ]);

        // 2. Lấy hoạt động gần đây (Ví dụ: 5 người dùng mới nhất đăng ký)
        // Nếu bảng users có cột created_at
        const [recentUsers] = await pool.query(`
            SELECT id, full_name, email, created_at 
            FROM users 
            ORDER BY id DESC 
            LIMIT 5
        `);

        // 3. Trả về kết quả gọn gàng
        res.json({
            stats: {
                users: usersData[0][0].count,
                exercises: exercisesData[0][0].count,
                plans: plansData[0][0].count,
                lessons: lessonsData[0][0].count,
                foods: foodsData[0][0].count,
                sports: sportsData[0][0].count
            },
            recentActivity: recentUsers
        });

    } catch (error) {
        console.error("Lỗi Dashboard:", error);
        res.status(500).json({ message: "Lỗi server lấy dữ liệu thống kê" });
    }
};

module.exports = { getDashboardStats };