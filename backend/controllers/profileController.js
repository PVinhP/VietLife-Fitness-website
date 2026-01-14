// backend/controllers/profileController.js
const db = require('../config/db');

// =================================================================
// 1. GET PROFILE (LẤY THÔNG TIN)
// =================================================================
const getCurrentProfile = async (req, res) => {
    try {
        const userId = req.user.id; 

        // [CẬP NHẬT SQL] Thêm target_weight và weekly_goal vào SELECT
        const sql = `
            SELECT 
                u.email, u.full_name, u.avatar_url,
                h.age, h.gender, h.weight_kg, h.height_cm, 
                h.target_weight, h.weekly_goal, -- <--- MỚI
                h.activity_level, h.medical_history, 
                h.dietary_preferences, h.sleep_quality_rating,
                h.goal, h.has_onboarding,
                h.training_preferences
            FROM users u
            LEFT JOIN health_profiles h ON u.id = h.user_id
            WHERE u.id = ?;
        `;
        
        const [results] = await db.pool.execute(sql, [userId]);

        if (results.length === 0) {
            return res.status(404).json({ msg: 'Không tìm thấy người dùng' });
        }

        const profileData = results[0];

        let preferencesParsed = null;
        if (profileData.training_preferences) {
            preferencesParsed = typeof profileData.training_preferences === 'string' 
                ? JSON.parse(profileData.training_preferences) 
                : profileData.training_preferences;
        }

        const response = {
            full_name: profileData.full_name,
            email: profileData.email,
            avatar_url: profileData.avatar_url,
            health_profile: profileData.age ? { 
                age: profileData.age,
                gender: profileData.gender,
                weight_kg: profileData.weight_kg,
                target_weight: profileData.target_weight, // <--- MỚI: Trả về Frontend
                height_cm: profileData.height_cm,
                activity_level: profileData.activity_level,
                medical_history: profileData.medical_history,
                dietary_preferences: profileData.dietary_preferences,
                sleep_quality_rating: profileData.sleep_quality_rating,
                goal: profileData.goal,
                weekly_goal: profileData.weekly_goal,     // <--- MỚI: Trả về Frontend
                has_onboarding: profileData.has_onboarding,
                training_preferences: preferencesParsed 
            } : null 
        };
        
        res.json(response);
        
    } catch (error) {
        console.error('Lỗi getCurrentProfile:', error.message);
        res.status(500).send('Lỗi máy chủ');
    }
};

// =================================================================
// 2. CREATE / UPDATE PROFILE (LƯU THÔNG TIN TỪ ONBOARDING)
// =================================================================
const createOrUpdateHealthProfile = async (req, res) => {
  let connection;
  try {
    connection = await db.pool.getConnection();
    const userId = req.user.id;
    
    // [CẬP NHẬT] Lấy thêm target_weight và weekly_goal từ body
    const {
      age,
      gender,
      weight_kg,
      target_weight, // <--- MỚI
      height_cm,
      activity_level,
      goal,
      weekly_goal    // <--- MỚI
    } = req.body;

    // Validation cơ bản (target_weight và weekly_goal là tùy chọn hoặc có default, nên có thể không cần check strict nếu không muốn)
    if (!age || !gender || !weight_kg || !height_cm || !activity_level || !goal) {
      if (connection) connection.release(); 
      return res.status(400).json({ msg: 'Vui lòng điền đầy đủ các thông tin bắt buộc.' });
    }
    
    await connection.beginTransaction();

    // [CẬP NHẬT SQL] Thêm cột vào câu lệnh INSERT ... ON DUPLICATE KEY UPDATE
    const healthProfileSql = `
        INSERT INTO health_profiles (
            user_id, age, gender, weight_kg, target_weight, height_cm, 
            activity_level, goal, weekly_goal
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) 
        ON DUPLICATE KEY UPDATE
            age = VALUES(age),
            gender = VALUES(gender),
            weight_kg = VALUES(weight_kg),
            target_weight = VALUES(target_weight), -- <--- Update cột này
            height_cm = VALUES(height_cm),
            activity_level = VALUES(activity_level),
            goal = VALUES(goal),
            weekly_goal = VALUES(weekly_goal);     -- <--- Update cột này
    `;

    // [CẬP NHẬT PARAMS]
    const healthProfileParams = [
        userId, 
        parseInt(age, 10), 
        gender, 
        parseFloat(weight_kg), 
        target_weight ? parseFloat(target_weight) : null, // Xử lý null nếu user không gửi
        parseFloat(height_cm), 
        activity_level, 
        goal,
        weekly_goal ? parseFloat(weekly_goal) : 0.5       // Mặc định 0.5 nếu không gửi
    ];
    
    await connection.execute(healthProfileSql, healthProfileParams);

    // Cập nhật trạng thái đã onboarding
    const updateUserSql = `UPDATE users SET is_onboarded = 1 WHERE id = ?;`;
    await connection.execute(updateUserSql, [userId]);

    await connection.commit();

    // Lấy lại data để trả về
    const [updatedProfile] = await connection.execute(
      `SELECT * FROM health_profiles WHERE user_id = ?`,
      [userId]
    );

    res.status(200).json({ 
      msg: 'Hồ sơ sức khỏe đã được cập nhật thành công!',
      profile: updatedProfile[0] 
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Lỗi khi tạo/cập nhật hồ sơ:', error.message);
    res.status(500).json({ msg: 'Lỗi máy chủ nội bộ.' });
  } finally {
    if (connection) connection.release();
  }
};

// ... (Giữ nguyên phần updateTrainingPreferences)
const updateTrainingPreferences = async (req, res) => {
    // Code cũ của bạn giữ nguyên, không cần sửa gì ở đây
    const userId = req.user.id; 
    const preferences = req.body; 

    try {
        const checkSql = "SELECT id FROM health_profiles WHERE user_id = ?";
        const [existing] = await db.pool.query(checkSql, [userId]);

        if (existing.length === 0) {
            return res.status(404).json({ msg: "Vui lòng hoàn thành hồ sơ cơ bản (Onboarding) trước!" });
        }

        const sql = `
            UPDATE health_profiles 
            SET training_preferences = ?, has_onboarding = 1, updated_at = NOW() 
            WHERE user_id = ?
        `;
        
        await db.pool.query(sql, [JSON.stringify(preferences), userId]);
        res.json({ msg: "Đã lưu hồ sơ tập luyện thành công!" });

    } catch (error) {
        console.error("Lỗi lưu preferences:", error);
        res.status(500).json({ msg: "Lỗi server, không lưu được dữ liệu." });
    }
};

module.exports = {
  getCurrentProfile,
  createOrUpdateHealthProfile,
  updateTrainingPreferences
};