// controllers/PlanController.js
const { pool } = require('../config/db');

// 1. Lấy danh sách tất cả Giáo án
exports.getAllPlans = async (req, res) => {
    try {
        const sql = "SELECT * FROM plans ORDER BY id DESC";
        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (error) {
        console.error("Lỗi lấy danh sách giáo án:", error);
        res.status(500).json({ error: error.message });
    }
};

// 2. Lấy chi tiết Giáo án + Lịch tập (Logic mới cho 3 bảng)
exports.getPlanDetail = async (req, res) => {
    const { id } = req.params;

    try {
        // A. Lấy thông tin chung (Bảng plans)
        const [planRows] = await pool.query("SELECT * FROM plans WHERE id = ?", [id]);
        if (planRows.length === 0) {
            return res.status(404).json({ message: "Giáo án không tồn tại" });
        }
        const plan = planRows[0];

        // B. Lấy danh sách bài tập
        // Logic: JOIN từ plan_days -> plan_exercises -> exercises
        const sqlExercises = `
            SELECT 
                pd.day_number,
                pd.day_name,
                pe.id as item_id,
                pe.sets,
                pe.reps,
                e.id as exercise_id,
                e.exercise_name, 
                e.thumbnail_url, 
                e.difficulty,
                e.muscle_group
            FROM plan_days pd
            LEFT JOIN plan_exercises pe ON pd.id = pe.plan_day_id
            LEFT JOIN exercises e ON pe.exercise_id = e.id
            WHERE pd.plan_id = ?
            ORDER BY pd.day_number ASC, pe.id ASC
        `;
        
        const [rows] = await pool.query(sqlExercises, [id]);

        // C. Group dữ liệu (Biến đổi từ danh sách phẳng sang cấu trúc lồng nhau)
        const scheduleMap = new Map();

        rows.forEach(row => {
            // Nếu ngày này chưa có trong Map thì tạo mới
            if (!scheduleMap.has(row.day_number)) {
                scheduleMap.set(row.day_number, {
                    day_number: row.day_number,
                    day_name: row.day_name,
                    exercises: []
                });
            }

            // Nếu dòng này có bài tập (vì dùng LEFT JOIN nên có thể null nếu ngày nghỉ)
            if (row.exercise_id) {
                scheduleMap.get(row.day_number).exercises.push({
                    id: row.item_id,
                    exercise_id: row.exercise_id,
                    exercise_name: row.exercise_name,
                    thumbnail_url: row.thumbnail_url,
                    sets: row.sets,
                    reps: row.reps,
                    difficulty: row.difficulty,
                    muscle_group: row.muscle_group
                });
            }
        });

        // Chuyển Map thành Array
        const schedule = Array.from(scheduleMap.values());

        // D. Trả về
        res.json({
            ...plan,
            schedule: schedule
        });

    } catch (error) {
        console.error("Lỗi lấy chi tiết giáo án:", error);
        res.status(500).json({ error: error.message });
    }
};

// 3. Tạo mới giáo án (Logic transaction cho 3 bảng)
exports.createPlan = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { 
            name, description, level, duration_weeks, days_per_week, image_url, 
            schedule // schedule là mảng: [{dayNumber: 1, dayName: '...', exercises: [...]}, ...]
        } = req.body;

        await connection.beginTransaction();

        // BƯỚC 1: Lưu vào bảng PLANS
        const [planRes] = await connection.query(
            `INSERT INTO plans (name, description, level, duration_weeks, days_per_week, image_url) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, description, level, duration_weeks, days_per_week, image_url]
        );
        const newPlanId = planRes.insertId;

        // BƯỚC 2: Duyệt qua từng ngày trong lịch
        if (schedule && schedule.length > 0) {
            for (const day of schedule) {
                
                // 2.1. Lưu ngày vào bảng PLAN_DAYS
                const [dayRes] = await connection.query(
                    `INSERT INTO plan_days (plan_id, day_number, day_name) VALUES (?, ?, ?)`,
                    [newPlanId, day.dayNumber, day.dayName]
                );
                const newDayId = dayRes.insertId;

                // 2.2. Nếu ngày đó có bài tập, Lưu vào bảng PLAN_EXERCISES
                if (day.exercises && day.exercises.length > 0) {
                    // Chuẩn bị mảng giá trị để insert nhiều dòng 1 lúc (Bulk Insert)
                    const exerciseValues = day.exercises.map(ex => [
                        newDayId,   // plan_day_id (Khóa ngoại trỏ về ngày)
                        ex.id,      // exercise_id (Lấy từ thư viện, chú ý frontend gửi lên là id bài tập)
                        ex.sets,
                        ex.reps
                    ]);

                    await connection.query(
                        `INSERT INTO plan_exercises (plan_day_id, exercise_id, sets, reps) VALUES ?`,
                        [exerciseValues]
                    );
                }
            }
        }

        await connection.commit();
        res.status(201).json({ message: "Tạo giáo án thành công!", planId: newPlanId });

    } catch (error) {
        await connection.rollback();
        console.error("Lỗi tạo giáo án:", error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};

// 4. Cập nhật giáo án (Update Plan Info + Reset Schedule)
exports.updatePlan = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        const { 
            name, description, level, duration_weeks, days_per_week, image_url, 
            schedule 
        } = req.body;

        await connection.beginTransaction();

        // A. Cập nhật thông tin chung (Bảng plans)
        await connection.query(
            `UPDATE plans SET name=?, description=?, level=?, duration_weeks=?, days_per_week=?, image_url=? WHERE id=?`,
            [name, description, level, duration_weeks, days_per_week, image_url, id]
        );

        // B. Cập nhật Lịch tập (Chiến thuật: Xóa cũ -> Thêm mới)
        // Do thiết lập ON DELETE CASCADE, chỉ cần xóa dòng trong plan_days là plan_exercises tự bay màu.
        
        // 1. Xóa tất cả ngày tập cũ của plan này
        await connection.query(`DELETE FROM plan_days WHERE plan_id = ?`, [id]);

        // 2. Thêm lại lịch tập mới (Logic y hệt createPlan)
        if (schedule && schedule.length > 0) {
            for (const day of schedule) {
                const [dayRes] = await connection.query(
                    `INSERT INTO plan_days (plan_id, day_number, day_name) VALUES (?, ?, ?)`,
                    [id, day.dayNumber, day.dayName]
                );
                const newDayId = dayRes.insertId;

                if (day.exercises && day.exercises.length > 0) {
                    const exerciseValues = day.exercises.map(ex => [
                        newDayId, ex.id, ex.sets, ex.reps
                    ]);
                    await connection.query(
                        `INSERT INTO plan_exercises (plan_day_id, exercise_id, sets, reps) VALUES ?`,
                        [exerciseValues]
                    );
                }
            }
        }

        await connection.commit();
        res.json({ message: "Cập nhật giáo án thành công!" });

    } catch (error) {
        await connection.rollback();
        console.error("Lỗi update giáo án:", error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};

// 5. Xóa giáo án
exports.deletePlan = async (req, res) => {
    const { id } = req.params;
    try {
        // Chỉ cần xóa bảng cha plans, MySQL tự Cascade xóa con
        await pool.query("DELETE FROM plans WHERE id = ?", [id]);
        res.json({ message: "Đã xóa giáo án" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};