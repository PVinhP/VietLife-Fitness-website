const { pool } = require('../config/db'); // Đảm bảo đường dẫn trúng file cấu hình DB của bạn

/**
 * Middleware kiểm tra quyền hạn (Role)
 * @param {Array} allowedRoles - Danh sách các role được phép (VD: ['admin', 'pt'])
 */
const checkRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            // 1. Kiểm tra xem đã qua bước AuthMiddleware chưa
            if (!req.user || !req.user.id) {
                return res.status(401).json({ message: "Chưa đăng nhập hoặc Token không hợp lệ!" });
            }

            // 2. Truy vấn Database để lấy Role mới nhất
            // (Không nên tin hoàn toàn vào role trong token vì user có thể bị hạ quyền sau khi login)
            const [rows] = await pool.query("SELECT role FROM users WHERE id = ?", [req.user.id]);
            
            if (rows.length === 0) {
                return res.status(404).json({ message: "Tài khoản không tồn tại trong hệ thống!" });
            }

            const userRole = rows[0].role;

            // 3. Kiểm tra Role có nằm trong danh sách cho phép không
            if (allowedRoles.includes(userRole)) {
                // Gán role vào req để các controller phía sau dùng nếu cần
                req.user.role = userRole;
                next(); // Cho phép đi tiếp
            } else {
                return res.status(403).json({ message: "Bạn không có quyền thực hiện chức năng này!" });
            }

        } catch (error) {
            console.error("Lỗi tại middleware checkRole:", error);
            return res.status(500).json({ message: "Lỗi Server khi kiểm tra quyền." });
        }
    };
};

module.exports = { checkRole };