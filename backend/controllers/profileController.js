// backend/controllers/profileController.js
const db = require('../config/db'); // Giả sử bạn có file config kết nối DB

/*
 * @controller  getCurrentProfile
 * @desc        Xử lý logic cho route GET /api/profile/me
 */
// (Hàm này giữ nguyên, không cần thay đổi)
const getCurrentProfile = async (req, res) => {
    try {
        const userId = req.user.id; 

        const sql = `
            SELECT 
                u.email, u.full_name, u.avatar_url,
                h.age, h.gender, h.weight_kg, h.height_cm, 
                h.activity_level, h.medical_history, 
                h.dietary_preferences, h.sleep_quality_rating,
                h.goal
            FROM users u
            LEFT JOIN health_profiles h ON u.id = h.user_id
            WHERE u.id = ?;
        `;
        
        const [results] = await db.pool.execute(sql, [userId]);

        if (results.length === 0) {
            return res.status(404).json({ msg: 'Không tìm thấy người dùng' });
        }

        const profileData = results[0];

        const response = {
            full_name: profileData.full_name,
            email: profileData.email,
            avatar_url: profileData.avatar_url,
            health_profile: profileData.age ? { 
                age: profileData.age,
                gender: profileData.gender,
                weight_kg: profileData.weight_kg,
                height_cm: profileData.height_cm,
                activity_level: profileData.activity_level,
                medical_history: profileData.medical_history,
                dietary_preferences: profileData.dietary_preferences,
                sleep_quality_rating: profileData.sleep_quality_rating,
                goal: profileData.goal 
            } : null 
        };
        
        res.json(response);
        
    } catch (error) {
        console.error('Lỗi getCurrentProfile:', error.message);
        res.status(500).send('Lỗi máy chủ');
    }
};

/*
 * @controller  createOrUpdateHealthProfile
 * @desc        Xử lý logic cho route POST /api/profile (được gọi từ OnboardingPage)
 * ĐÃ CẬP NHẬT: Thêm Transaction để đánh dấu is_onboarded
 */
const createOrUpdateHealthProfile = async (req, res) => {
  
  // === PHẦN MỚI: Khởi tạo connection cho Transaction ===
  let connection;

  try {
    // Lấy một connection từ pool
    connection = await db.pool.getConnection();
    
    const userId = req.user.id;
    
    // Lấy dữ liệu từ body (Giống code cũ của bạn)
    const {
      age,
      gender,
      weight_kg,
      height_cm,
      activity_level,
      goal 
    } = req.body;

    // Validation (Giống code cũ của bạn)
    if (!age || !gender || !weight_kg || !height_cm || !activity_level || !goal) {
      // Phải giải phóng connection trước khi return
      if (connection) connection.release(); 
      return res.status(400).json({ msg: 'Vui lòng điền đầy đủ các thông tin bắt buộc.' });
    }
    
    // === PHẦN MỚI: Bắt đầu Transaction ===
    await connection.beginTransaction();

    // === Thao tác 1: INSERT/UPDATE bảng health_profiles (Giống code cũ) ===
    const healthProfileSql = `
        INSERT INTO health_profiles (
            user_id, age, gender, weight_kg, height_cm, 
            activity_level, goal 
        )
        VALUES (?, ?, ?, ?, ?, ?, ?) -- 7 giá trị
        ON DUPLICATE KEY UPDATE
            age = VALUES(age),
            gender = VALUES(gender),
            weight_kg = VALUES(weight_kg),
            height_cm = VALUES(height_cm),
            activity_level = VALUES(activity_level),
            goal = VALUES(goal); 
    `;

    const healthProfileParams = [
        userId, 
        parseInt(age, 10), 
        gender, 
        parseFloat(weight_kg), 
        parseFloat(height_cm), 
        activity_level, 
        goal
    ];
    
    // Dùng 'connection.execute' thay vì 'db.pool.execute'
    await connection.execute(healthProfileSql, healthProfileParams);

    // === THAO TÁC 2: ĐÁNH DẤU is_onboarded = 1 TRONG BẢNG users ===
    const updateUserSql = `
        UPDATE users 
        SET is_onboarded = 1 
        WHERE id = ?;
    `;
    
    // Dùng 'connection.execute'
    await connection.execute(updateUserSql, [userId]);

    // === PHẦN MỚI: Commit (Xác nhận) Transaction ===
    // Nếu cả 2 thao tác trên thành công, lưu thay đổi vĩnh viễn
    await connection.commit();

    // Lấy lại hồ sơ vừa cập nhật để trả về (Giống code cũ)
    // Dùng 'connection.execute'
    const [updatedProfile] = await connection.execute(
      `SELECT * FROM health_profiles WHERE user_id = ?`,
      [userId]
    );

    res.status(200).json({ 
      msg: 'Hồ sơ sức khỏe đã được cập nhật thành công!',
      profile: updatedProfile[0] 
    });

  } catch (error) {
    // === PHẦN MỚI: Rollback (Hủy bỏ) Transaction ===
    // Nếu có bất kỳ lỗi nào xảy ra, hủy bỏ tất cả thay đổi
    if (connection) {
        await connection.rollback();
    }
    console.error('Lỗi khi tạo/cập nhật hồ sơ:', error.message);
    res.status(500).json({ msg: 'Lỗi máy chủ nội bộ.' });

  } finally {
    // === PHẦN MỚI: Giải phóng connection ===
    // Luôn luôn trả connection về pool sau khi hoàn tất
    if (connection) {
        connection.release();
    }
  }
};

module.exports = {
  getCurrentProfile,
  createOrUpdateHealthProfile,
};