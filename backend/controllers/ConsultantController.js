// backend/controllers/ConsultantController.js
const { pool } = require('../config/db');

// --- 1. TẠO YÊU CẦU MỚI (Mở đầu hội thoại) ---
exports.createRequest = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const userId = req.user?.id || req.body.userId;
        const { title, question, image_url } = req.body;

        if (!title || !question) {
            return res.status(400).json({ msg: "Thiếu tiêu đề hoặc nội dung." });
        }

        // 1. Tạo Topic (Request)
        // LƯU Ý: Vẫn lưu 'question' vào đây để tránh lỗi "Field doesn't have default value" ở DB cũ
        const [reqResult] = await connection.query(`
            INSERT INTO consultation_requests (user_id, title, question, status, created_at) 
            VALUES (?, ?, ?, 'pending', NOW())
        `, [userId, title, question]);
        
        const requestId = reqResult.insertId;

        // 2. Tạo tin nhắn đầu tiên (Để hiển thị trong khung chat)
        await connection.query(`
            INSERT INTO consultation_messages (request_id, user_id, message, image_url)
            VALUES (?, ?, ?, ?)
        `, [requestId, userId, question, image_url || null]);

        await connection.commit();
        return res.status(201).json({ msg: "Đã gửi yêu cầu thành công!", id: requestId });

    } catch (error) {
        await connection.rollback();
        console.error("Lỗi tạo yêu cầu:", error);
        return res.status(500).json({ msg: "Lỗi server." });
    } finally {
        connection.release();
    }
};

// --- 2. LẤY DANH SÁCH YÊU CẦU ---
exports.getRequests = async (req, res) => {
    try {
        const userId = req.user?.id || req.query.userId;
        const role = req.user?.role || req.query.role; 

        // SỬA: Bỏ u.avatar để tránh lỗi
        // SỬA: Dùng LEFT JOIN để lỡ user bị xóa thì vẫn hiện request
        let query = `
            SELECT r.*, u.full_name
            FROM consultation_requests r
            LEFT JOIN users u ON r.user_id = u.id
        `;
        
        let params = [];

        // Nếu là User thường, chỉ lấy bài của họ
        if (role !== 'admin' && role !== 'pt') {
            query += ` WHERE r.user_id = ?`;
            params.push(userId);
        }

        // SỬA: Bỏ updated_at, chỉ sắp xếp theo created_at giảm dần (Mới nhất lên đầu)
        query += ` ORDER BY r.created_at DESC`; 

        const [rows] = await pool.query(query, params);
        return res.status(200).json(rows);
    } catch (error) {
        console.error("🔥 LỖI SQL CHI TIẾT:", error); 
        return res.status(500).json({ msg: "Lỗi tải danh sách.", error: error.message });
    }
};

// --- 3. LẤY CHI TIẾT HỘI THOẠI ---
exports.getRequestDetail = async (req, res) => {
    try {
        const { id } = req.params;

        // Lấy thông tin topic
        const [requestRows] = await pool.query(
            "SELECT * FROM consultation_requests WHERE id = ?", [id]
        );
        if (requestRows.length === 0) return res.status(404).json({ msg: "Không tìm thấy." });

        // SỬA: Bỏ u.avatar để tránh lỗi
        const [messages] = await pool.query(`
            SELECT m.*, u.full_name, u.role
            FROM consultation_messages m
            LEFT JOIN users u ON m.user_id = u.id 
            WHERE m.request_id = ?
            ORDER BY m.created_at ASC
        `, [id]);
        
        return res.status(200).json({ 
            info: requestRows[0], 
            messages: messages 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Lỗi server." });
    }
};

// --- 4. GỬI TIN NHẮN TRẢ LỜI ---
exports.replyRequest = async (req, res) => {
    try {
        const { id } = req.params; 
        const userId = req.user?.id || req.body.userId; 
        const { message, image_url } = req.body;
        
        const role = req.user?.role || req.body.role || 'user'; 
        const newStatus = (role === 'admin' || role === 'pt') ? 'answered' : 'pending';

        // Insert tin nhắn
        await pool.query(`
            INSERT INTO consultation_messages (request_id, user_id, message, image_url)
            VALUES (?, ?, ?, ?)
        `, [id, userId, message, image_url || null]);

        // SỬA: Bỏ updated_at = NOW() để tránh lỗi
        await pool.query(`
            UPDATE consultation_requests 
            SET status = ?
            WHERE id = ?
        `, [newStatus, id]);

        return res.status(200).json({ msg: "Đã gửi tin nhắn." });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Lỗi gửi tin nhắn." });
    }
};