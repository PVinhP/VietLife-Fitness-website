// backend/controllers/profileController.js

// Bạn không cần import Model ở đây nữa
// vì chúng ta sẽ dùng query trực tiếp để tối ưu
const db = require('../config/db'); // Giả sử bạn có file config kết nối DB

/*
 * @controller  getCurrentProfile
 * (Hàm này còn thiếu trong file cũ của bạn)
 * @desc        Xử lý logic cho route GET /api/profile/me
 */
const getCurrentProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Lấy ID từ authMiddleware

        // Dùng LEFT JOIN để lấy dữ liệu từ cả 2 bảng users và health_profiles
        // Đây là cách tối ưu nhất, chỉ cần 1 lần gọi CSDL
        const sql = `
            SELECT 
                u.email, u.full_name, u.avatar_url,
                h.age, h.gender, h.weight_kg, h.height_cm, 
                h.activity_level, h.medical_history, 
                h.dietary_preferences, h.sleep_quality_rating
            FROM users u
            LEFT JOIN health_profiles h ON u.id = h.user_id
            WHERE u.id = ?;
        `;
        
        const [results] = await db.pool.execute(sql, [userId]);

        if (results.length === 0) {
            return res.status(404).json({ msg: 'Không tìm thấy người dùng' });
        }

        const profileData = results[0];

        // Format lại data cho giống với frontend đang cần
        const response = {
            full_name: profileData.full_name,
            email: profileData.email,
            avatar_url: profileData.avatar_url,
            // Nếu health_profile chưa có (LEFT JOIN trả về null), 
            // thì giá trị này sẽ là null. Frontend đã xử lý việc này.
            health_profile: profileData.age ? { 
                age: profileData.age,
                gender: profileData.gender,
                weight_kg: profileData.weight_kg,
                height_cm: profileData.height_cm,
                activity_level: profileData.activity_level,
                medical_history: profileData.medical_history,
                dietary_preferences: profileData.dietary_preferences,
                sleep_quality_rating: profileData.sleep_quality_rating
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
 * (Đây là phiên bản "UPSERT" của hàm createHealthProfile cũ)
 * @desc        Xử lý logic cho route POST /api/profile
 */
const createOrUpdateHealthProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy user id từ middleware
    
    const {
      age,
      gender,
      weight_kg,
      height_cm,
      activity_level,
      medical_history,
      dietary_preferences,
      sleep_quality_rating
    } = req.body;

    // --- Validation (Giữ lại từ code cũ của bạn) ---
    if (!age || !gender || !weight_kg || !height_cm || !activity_level) {
      return res.status(400).json({ msg: 'Vui lòng điền đầy đủ các trường bắt buộc.' });
    }
    
    // Logic "UPSERT" (Cập nhật hoặc Thêm mới)
    // Query này yêu cầu cột 'user_id' trong 'health_profiles' 
    // phải là UNIQUE (như tôi đã hướng dẫn)
    const sql = `
        INSERT INTO health_profiles (
            user_id, age, gender, weight_kg, height_cm, 
            activity_level, medical_history, dietary_preferences, 
            sleep_quality_rating
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            age = VALUES(age),
            gender = VALUES(gender),
            weight_kg = VALUES(weight_kg),
            height_cm = VALUES(height_cm),
            activity_level = VALUES(activity_level),
            medical_history = VALUES(medical_history),
            dietary_preferences = VALUES(dietary_preferences),
            sleep_quality_rating = VALUES(sleep_quality_rating);
    `;

    const params = [
        userId, 
        parseInt(age, 10), 
        gender, 
        parseFloat(weight_kg), 
        parseFloat(height_cm), 
        activity_level, 
        medical_history, 
        dietary_preferences, 
        parseInt(sleep_quality_rating, 10)
    ];
    
    // Thực thi query
    await db.pool.execute(sql, params);

    // Trả về thành công
    res.status(200).json({ 
      msg: 'Hồ sơ sức khỏe đã được cập nhật thành công!'
    });

  } catch (error) {
    console.error('Lỗi khi tạo/cập nhật hồ sơ:', error.message);
    res.status(500).json({ msg: 'Lỗi máy chủ nội bộ.' });
  }
};

// Export cả hai hàm
module.exports = {
  getCurrentProfile,
  createOrUpdateHealthProfile,
};