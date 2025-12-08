// backend/controllers/ConsultantController.js
const { pool } = require('../config/db');

// --- 1. GỬI YÊU CẦU TƯ VẤN (User) ---
exports.createRequest = async (req, res) => {
    try {
        // Lấy ID từ token (req.user) hoặc body (nếu chưa có middleware auth)
        const userId = req.user?.id || req.body.userId; 
        const { title, question, image_url } = req.body;

        // Validate cơ bản
        if (!title || !question) {
            return res.status(400).json({ msg: "Vui lòng nhập tiêu đề và nội dung câu hỏi." });
        }

        const query = `
            INSERT INTO consultation_requests (user_id, title, question, image_url) 
            VALUES (?, ?, ?, ?)
        `;

        await pool.query(query, [userId, title, question, image_url || null]);

        return res.status(201).json({ 
            msg: "Gửi yêu cầu thành công! Chuyên gia sẽ phản hồi sớm." 
        });

    } catch (error) {
        console.error("Lỗi tạo yêu cầu:", error);
        return res.status(500).json({ msg: "Lỗi server khi tạo yêu cầu." });
    }
};

// --- 2. LẤY DANH SÁCH YÊU CẦU (User xem của mình, Admin xem tất cả) ---
exports.getRequests = async (req, res) => {
    try {
        const userId = req.user?.id || req.query.userId;
        const role = req.user?.role || req.query.role; // 'user', 'admin', hoặc 'pt'

        let query = "";
        let params = [];

        if (role === 'admin' || role === 'pt') {
            // Nếu là Admin/PT: Lấy tất cả + Thông tin người hỏi (Avatar, Tên)
            query = `
                SELECT r.*, u.full_name, u.avatar 
                FROM consultation_requests r
                JOIN users u ON r.user_id = u.id
                ORDER BY 
                    CASE WHEN r.status = 'pending' THEN 1 ELSE 2 END, -- Ưu tiên 'pending' lên đầu
                    r.created_at DESC
            `;
        } else {
            // Nếu là User thường: Chỉ lấy yêu cầu của chính họ
            query = `
                SELECT * FROM consultation_requests 
                WHERE user_id = ? 
                ORDER BY created_at DESC
            `;
            params.push(userId);
        }

        const [rows] = await pool.query(query, params);
        return res.status(200).json(rows);

    } catch (error) {
        console.error("Lỗi lấy danh sách:", error);
        return res.status(500).json({ msg: "Không thể tải danh sách tư vấn." });
    }
};

// --- 3. XEM CHI TIẾT MỘT YÊU CẦU (Optional) ---
exports.getRequestDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(
            "SELECT * FROM consultation_requests WHERE id = ?", 
            [id]
        );
        
        if (rows.length === 0) return res.status(404).json({ msg: "Không tìm thấy yêu cầu." });
        
        return res.status(200).json(rows[0]);
    } catch (error) {
        return res.status(500).json({ msg: "Lỗi server." });
    }
};

// --- 4. TRẢ LỜI YÊU CẦU (Chỉ dành cho Admin/PT) ---
exports.replyRequest = async (req, res) => {
    try {
        const { id } = req.params; // ID của request
        const { response } = req.body;
        const trainerId = req.user?.id || req.body.trainerId; // ID người trả lời

        if (!response) {
            return res.status(400).json({ msg: "Nội dung phản hồi không được để trống." });
        }

        const query = `
            UPDATE consultation_requests 
            SET 
                response = ?, 
                status = 'answered', 
                responded_at = NOW(), 
                trainer_id = ?
            WHERE id = ?
        `;

        const [result] = await pool.query(query, [response, trainerId, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: "Không tìm thấy yêu cầu cần trả lời." });
        }

        return res.status(200).json({ msg: "Đã gửi phản hồi thành công." });

    } catch (error) {
        console.error("Lỗi trả lời:", error);
        return res.status(500).json({ msg: "Lỗi server khi trả lời." });
    }
};